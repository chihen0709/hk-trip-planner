import { db } from '../firebase';
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import seedAttractions from '../../scripts/attractions.seed.json';
import referenceAttractions from '../data/reference-attractions.json';
import { createFirestoreDocument } from './firestoreRest';

const LOCAL_ATTRACTIONS_KEY = 'hk-trip-planner:local-attractions';

function readLocalAttractions() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ATTRACTIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalAttraction(attraction) {
  const existing = readLocalAttractions().filter((item) => item.id !== attraction.id);
  localStorage.setItem(LOCAL_ATTRACTIONS_KEY, JSON.stringify([...existing, attraction]));
}

function mergeAttractions(...lists) {
  const byId = new Map();
  lists.flat().forEach((item) => {
    if (item?.id) byId.set(item.id, item);
  });
  return [...byId.values()].sort((a, b) => {
    const dayDiff = (a.suggestedDay ?? 99) - (b.suggestedDay ?? 99);
    if (dayDiff !== 0) return dayDiff;
    return String(a.name).localeCompare(String(b.name), 'zh-Hant');
  });
}

function fallbackAttractions() {
  return mergeAttractions(seedAttractions, referenceAttractions, readLocalAttractions());
}

function attractionDocId(name) {
  return `manual-${name
    .trim()
    .toLowerCase()
    .replace(/[/.#$[\]]/g, '-')
    .replace(/\s+/g, '-')}`;
}

async function upsertAttraction(id, attraction) {
  try {
    await createFirestoreDocument('attractions', id, attraction);
  } catch (error) {
    if (error.status !== 403 && error.status !== 409) throw error;
    await createFirestoreDocument('attractions', `${id}-${Date.now()}`, attraction);
  }
}

export function subscribeToAttractions(callback, onError) {
  const q = query(collection(db, 'attractions'), orderBy('suggestedDay'));

  callback(fallbackAttractions());

  getDocs(q)
    .then((snapshot) => {
      const remote = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(mergeAttractions(seedAttractions, referenceAttractions, readLocalAttractions(), remote));
    })
    .catch((error) => {
      console.error('subscribeToAttractions initial fetch failed:', error);
      if (onError) onError(error);
    });

  return onSnapshot(
    q,
    (snapshot) => {
      const remote = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(mergeAttractions(seedAttractions, referenceAttractions, readLocalAttractions(), remote));
    },
    (error) => {
      console.error('subscribeToAttractions listener failed:', error);
      if (onError) onError(error);
    }
  );
}

export async function addAttraction({ name, category, note, suggestedDay, station }) {
  const id = attractionDocId(name);
  const attraction = {
    id,
    name,
    category,
    note,
    station,
    suggestedDay,
  };

  writeLocalAttraction(attraction);
  void syncAttractionToFirebase(attraction).catch((error) => {
    console.error('addAttraction background sync failed:', error);
  });
  return attraction;
}

export async function syncAttractionToFirebase(attraction) {
  const { id, ...data } = attraction;
  await upsertAttraction(id, data);
}
