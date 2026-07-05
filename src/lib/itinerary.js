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

export function subscribeToItinerarySlots(callback, onError) {
  const q = query(
    collection(db, 'itinerarySlots'),
    orderBy('day'),
    orderBy('order')
  );

  // 一次性讀取當保底,避免即時監聽連不上時畫面一直卡在載入中。
  getDocs(q)
    .then((snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    })
    .catch((error) => {
      console.error('subscribeToItinerarySlots initial fetch failed:', error);
      if (onError) onError(error);
    });

  return onSnapshot(
    q,
    (snapshot) => {
      const slots = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(slots);
    },
    (error) => {
      console.error('subscribeToItinerarySlots listener failed:', error);
      if (onError) onError(error);
    }
  );
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
