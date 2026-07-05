import { db } from './firebaseAdmin.mjs';

const items = [
  {
    id: 'reference-yung-kee-chan-pei-roast-goose',
    name: '榕記陳皮燒鵝',
    category: '餐廳',
    note: '尖沙咀人氣名店，招牌陳皮燒鵝皮脆肉嫩，帶有獨特陳皮幽香。',
    station: '尖沙咀站',
    suggestedDay: 99,
  },
  {
    id: 'reference-chuk-fu-tai-pan-siu-mei',
    name: '竹扶大班燒味',
    category: '餐廳',
    note: '以高質素燒臘著稱，脆皮燒肉與叉燒深受好評。',
    station: '灣仔站',
    suggestedDay: 99,
  },
  {
    id: 'reference-kam-s-roast-goose',
    name: '甘牌燒鵝',
    category: '餐廳',
    note: '連續多年榮獲米其林一星，招牌燒鵝皮脆肉嫩。',
    station: '灣仔站',
    suggestedDay: 99,
  },
  {
    id: 'reference-kau-kee-beef-brisket',
    name: '九記牛腩',
    category: '餐廳',
    note: '中環排隊名店，清湯牛腩與咖喱牛腩都很入味。',
    station: '上環站/中環站',
    suggestedDay: 99,
  },
  {
    id: 'reference-mak-man-kee-noodle-shop',
    name: '麥文記麵家',
    category: '餐廳',
    note: '佐敦老字號麵家，全蝦雲吞皮薄透光，湯頭鮮甜。',
    station: '佐敦站',
    suggestedDay: 99,
  },
  {
    id: 'reference-kam-wah-cafe',
    name: '金華冰廳',
    category: '餐廳',
    note: '以得獎菠蘿油聞名，外皮酥脆，適合加入甜點或早餐候選。',
    station: '太子站/旺角站',
    suggestedDay: 99,
  },
];

for (const { id, ...data } of items) {
  await db.collection('attractions').doc(id).set(data, { merge: true });
  console.log(`已寫入/更新景點: ${data.name} (${id})`);
}

console.log(`完成，共寫入/更新 ${items.length} 筆參考景點資料`);
