import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

export function subscribeToAttractions(callback) {
  const q = query(collection(db, 'attractions'), orderBy('suggestedDay'));
  return onSnapshot(q, (snapshot) => {
    const attractions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(attractions);
  });
}
