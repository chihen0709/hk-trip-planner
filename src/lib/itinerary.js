import { db } from '../firebase';
import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';

export function subscribeToItinerarySlots(callback) {
  const q = query(
    collection(db, 'itinerarySlots'),
    orderBy('day'),
    orderBy('order')
  );
  return onSnapshot(q, (snapshot) => {
    const slots = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(slots);
  });
}

export async function updateSlot(slotId, fields) {
  await updateDoc(doc(db, 'itinerarySlots', slotId), fields);
}

export async function reorderDaySlots(day, orderedSlotIds) {
  const batch = writeBatch(db);
  orderedSlotIds.forEach((slotId, index) => {
    batch.update(doc(db, 'itinerarySlots', slotId), { order: index });
  });
  await batch.commit();
}
