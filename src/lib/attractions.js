import { db } from '../firebase';
import { collection, addDoc, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';

export function subscribeToAttractions(callback, onError) {
  const q = query(collection(db, 'attractions'), orderBy('suggestedDay'));

  // 有些網路環境會擋掉即時監聽用的串流連線,先用一次性讀取確保畫面
  // 至少能顯示資料,不會一直卡在「載入中」。
  getDocs(q)
    .then((snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    })
    .catch((error) => {
      console.error('subscribeToAttractions initial fetch failed:', error);
      if (onError) onError(error);
    });

  return onSnapshot(
    q,
    (snapshot) => {
      const attractions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(attractions);
    },
    (error) => {
      console.error('subscribeToAttractions listener failed:', error);
      if (onError) onError(error);
    }
  );
}

export async function addAttraction({ name, category, note, suggestedDay, station }) {
  await addDoc(collection(db, 'attractions'), { name, category, note, suggestedDay, station });
}
