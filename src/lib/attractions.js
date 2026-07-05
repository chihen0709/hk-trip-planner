import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import seedAttractions from '../../scripts/attractions.seed.json';
import { withTimeout } from './asyncTimeout';

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
  return mergeAttractions(seedAttractions, readLocalAttractions());
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
    await withTimeout(
      setDoc(doc(db, 'attractions', id), attraction),
      'Firebase 寫入逾時，請檢查網路後再試一次。'
    );
  } catch (error) {
    if (error.code !== 'permission-denied') throw error;

    await withTimeout(
      setDoc(doc(db, 'attractions', `${id}-${Date.now()}`), attraction),
      'Firebase 寫入逾時，請檢查網路後再試一次。'
    );
  }
}

export function subscribeToAttractions(callback, onError) {
  const q = query(collection(db, 'attractions'), orderBy('suggestedDay'));

  callback(fallbackAttractions());

  getDocs(q)
    .then((snapshot) => {
      const remote = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(mergeAttractions(seedAttractions, readLocalAttractions(), remote));
    })
    .catch((error) => {
      console.error('subscribeToAttractions initial fetch failed:', error);
      if (onError) onError(error);
    });

  return onSnapshot(
    q,
    (snapshot) => {
      const remote = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(mergeAttractions(seedAttractions, readLocalAttractions(), remote));
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

  try {
    const { id: _id, ...data } = attraction;
    await upsertAttraction(id, data);
  } catch (error) {
    console.error('addAttraction Firestore write failed, saved locally:', error);
    writeLocalAttraction(attraction);
    throw error;
  }

  writeLocalAttraction(attraction);
  return attraction;
}
