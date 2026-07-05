import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './firebaseAdmin.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const attractions = JSON.parse(
  readFileSync(join(__dirname, 'attractions.seed.json'), 'utf-8')
);

for (const attraction of attractions) {
  const { id, ...data } = attraction;
  await db.collection('attractions').doc(id).set(data);
  console.log(`已寫入景點: ${data.name}`);
}

console.log(`完成,共寫入 ${attractions.length} 筆景點資料`);
