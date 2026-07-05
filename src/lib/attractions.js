import { db } from '../firebase';
import { collection, addDoc, onSnapshot, orderBy, query } from 'firebase/firestore';

export function subscribeToAttractions(callback, onError) {
  const q = query(collection(db, 'attractions'), orderBy('suggestedDay'));
  return onSnapshot(
    q,
    (snapshot) => {
      const attractions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(attractions);
    },
    (error) => {
      console.error('subscribeToAttractions failed:', error);
      if (onError) onError(error);
    }
  );
}

export async function addAttraction({ name, category, note, suggestedDay }) {
  await addDoc(collection(db, 'attractions'), { name, category, note, suggestedDay });
}
