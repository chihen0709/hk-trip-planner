import { db } from './firebaseAdmin.mjs';

const snap = await db.collection('itinerarySlots').get();
let migrated = 0;

for (const doc of snap.docs) {
  const data = doc.data();
  if (data.linkedAttractionIds) continue;
  if (!data.linkedAttractionId) continue;

  await doc.ref.update({
    linkedAttractionIds: [data.linkedAttractionId],
  });
  migrated += 1;
  console.log(`已轉換: ${doc.id} (${data.title}) -> [${data.linkedAttractionId}]`);
}

console.log(`完成,共轉換 ${migrated} 筆時段的連結景點欄位`);
