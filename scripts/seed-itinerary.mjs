import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './firebaseAdmin.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const slots = JSON.parse(
  readFileSync(join(__dirname, 'itinerarySlots.seed.json'), 'utf-8')
);

for (const slot of slots) {
  const ref = await db.collection('itinerarySlots').add(slot);
  console.log(`已寫入時段: Day${slot.day} ${slot.time} ${slot.title} (${ref.id})`);
}

console.log(`完成,共寫入 ${slots.length} 筆行程時段`);
