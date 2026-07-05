import { db } from '../firebase';
import {
  addDoc,
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
import { withTimeout } from './asyncTimeout';
import { deleteFirestoreDocument } from './firestoreRest';

const LOCAL_SLOTS_KEY = 'hk-trip-planner:local-itinerary-slots';
const DELETED_SLOTS_KEY = 'hk-trip-planner:deleted-itinerary-slots';

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

function readDeletedSlots() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_SLOTS_KEY) || '{"ids":[],"signatures":[]}');
  } catch {
    return { ids: [], signatures: [] };
  }
}

function writeDeletedSlots(deleted) {
  localStorage.setItem(DELETED_SLOTS_KEY, JSON.stringify({
    ids: [...new Set(deleted.ids || [])],
    signatures: [...new Set(deleted.signatures || [])],
  }));
}

function slotSignature(slot) {
  return [
    slot.day,
    String(slot.time || '').trim().toLowerCase(),
    String(slot.title || '').trim().toLowerCase(),
    String(slot.location || '').trim().toLowerCase(),
  ].join('|');
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
  const deleted = readDeletedSlots();
  const deletedIds = new Set(deleted.ids || []);
  const deletedSignatures = new Set(deleted.signatures || []);
  const bySignature = new Map();
  [...byId.values()].forEach((item) => {
    const signature = slotSignature(item);
    if (deletedIds.has(item.id) || deletedSignatures.has(signature)) return;
    const existing = bySignature.get(signature);
    const shouldReplaceSeed = existing && String(existing.id).startsWith('seed-') && !String(item.id).startsWith('seed-');
    if (!existing || shouldReplaceSeed) {
      bySignature.set(signature, item);
    }
  });

  return [...bySignature.values()].sort((a, b) => {
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

  await withTimeout(
    updateDoc(doc(db, 'itinerarySlots', slotId), fields),
    'Firebase 儲存行程逾時，請檢查網路後再試一次。'
  );
}

export async function addSlot(fields) {
  const slot = {
    day: Number(fields.day),
    order: Number(fields.order),
    time: fields.time,
    title: fields.title,
    location: fields.location || '',
    note: fields.note || '',
    linkedAttractionId: fields.linkedAttractionId || null,
  };

  try {
    const ref = await withTimeout(
      addDoc(collection(db, 'itinerarySlots'), slot),
      'Firebase 新增行程逾時，請檢查網路後再試一次。'
    );
    return { id: ref.id, ...slot };
  } catch (error) {
    const id = `local-${Date.now()}`;
    const localSlot = { id, ...slot };
    writeLocalSlots(mergeSlots(readLocalSlots(), [localSlot]));
    throw Object.assign(error, { localSlot });
  }
}

export async function reorderDaySlots(day, orderedSlotIds) {
  const batch = writeBatch(db);
  orderedSlotIds.forEach((slotId, index) => {
    if (!slotId.startsWith('seed-')) {
      batch.update(doc(db, 'itinerarySlots', slotId), { order: index });
    }
  });
  await withTimeout(
    batch.commit(),
    'Firebase 排序行程逾時，請檢查網路後再試一次。'
  );

  const localSlots = readLocalSlots();
  const fallbackById = new Map(fallbackSlots().map((slot) => [slot.id, slot]));
  const seedOrderOverrides = orderedSlotIds
    .filter((slotId) => slotId.startsWith('seed-'))
    .map((slotId, index) => ({
      ...fallbackById.get(slotId),
      id: slotId,
      day,
      order: index,
    }));

  const updatedLocalSlots = localSlots.map((slot) => {
    if (slot.day !== day) return slot;
    const index = orderedSlotIds.indexOf(slot.id);
    return index >= 0 ? { ...slot, order: index } : slot;
  });
  writeLocalSlots(mergeSlots(updatedLocalSlots, seedOrderOverrides));
}

export function deleteSlot(slot) {
  const deleted = readDeletedSlots();
  writeDeletedSlots({
    ids: [...(deleted.ids || []), slot.id],
    signatures: [...(deleted.signatures || []), slotSignature(slot)],
  });

  writeLocalSlots(readLocalSlots().filter((item) => (
    item.id !== slot.id && slotSignature(item) !== slotSignature(slot)
  )));

  if (!String(slot.id).startsWith('seed-') && !String(slot.id).startsWith('local-')) {
    void deleteFirestoreDocument('itinerarySlots', slot.id).catch((error) => {
      console.error('deleteSlot background sync failed:', error);
    });
  }
}
