import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';
import seedSlots from '../../scripts/itinerarySlots.seed.json';

const LOCAL_SLOTS_KEY = 'hk-trip-planner:local-itinerary-slots';

function readLocalSlots() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SLOTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalSlots(slots) {
  localStorage.setItem(LOCAL_SLOTS_KEY, JSON.stringify(slots));
}

function seedWithIds() {
  return seedSlots.map((slot, index) => ({
    id: `seed-day${slot.day}-${index}`,
    ...slot,
  }));
}

function mergeSlots(...lists) {
  const byId = new Map();
  lists.flat().forEach((item) => {
    if (item?.id) byId.set(item.id, item);
  });
  return [...byId.values()].sort((a, b) => {
    const dayDiff = (a.day ?? 99) - (b.day ?? 99);
    if (dayDiff !== 0) return dayDiff;
    return (a.order ?? 999) - (b.order ?? 999);
  });
}

function fallbackSlots() {
  return mergeSlots(seedWithIds(), readLocalSlots());
}

export function subscribeToItinerarySlots(callback, onError) {
  const q = query(
    collection(db, 'itinerarySlots'),
    orderBy('day'),
    orderBy('order')
  );

  callback(fallbackSlots());

  getDocs(q)
    .then((snapshot) => {
      const remote = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(mergeSlots(seedWithIds(), readLocalSlots(), remote));
    })
    .catch((error) => {
      console.error('subscribeToItinerarySlots initial fetch failed:', error);
      if (onError) onError(error);
    });

  return onSnapshot(
    q,
    (snapshot) => {
      const remote = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(mergeSlots(seedWithIds(), readLocalSlots(), remote));
    },
    (error) => {
      console.error('subscribeToItinerarySlots listener failed:', error);
      if (onError) onError(error);
    }
  );
}

export async function updateSlot(slotId, fields) {
  if (slotId.startsWith('seed-')) {
    const current = readLocalSlots();
    const existing = fallbackSlots().find((slot) => slot.id === slotId);
    const updated = { ...existing, ...fields, id: slotId };
    writeLocalSlots(mergeSlots(current, [updated]));
    return;
  }

  await updateDoc(doc(db, 'itinerarySlots', slotId), fields);
}

export async function reorderDaySlots(day, orderedSlotIds) {
  const batch = writeBatch(db);
  orderedSlotIds.forEach((slotId, index) => {
    if (!slotId.startsWith('seed-')) {
      batch.update(doc(db, 'itinerarySlots', slotId), { order: index });
    }
  });
  await batch.commit();
}
