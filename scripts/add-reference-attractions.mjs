import { db } from './firebaseAdmin.mjs';

const items = [
  {
    name: '榕記陳皮燒鵝',
    category: '餐廳',
    note: '尖沙咀人氣名店,招牌陳皮燒鵝皮脆肉嫩,帶有獨特陳皮幽香',
    station: '尖沙咀站',
    suggestedDay: 99,
  },
  {
    name: '竹扶大班燒味',
    category: '餐廳',
    note: '以高質素燒臘著稱,脆皮燒肉與叉燒深受好評',
    station: '灣仔站',
    suggestedDay: 99,
  },
  {
    name: '甘牌燒鵝',
    category: '餐廳',
    note: '連續多年榮獲米其林一星,招牌燒鵝皮脆肉嫩',
    station: '灣仔站',
    suggestedDay: 99,
  },
  {
    name: '九記牛腩',
    category: '餐廳',
    note: '中環排隊名店,清湯牛腩與咖喱牛腩極其入味',
    station: '上環站/中環站',
    suggestedDay: 99,
  },
  {
    name: '麥文記麵家',
    category: '餐廳',
    note: '佐敦老字號麵家,全蝦雲吞皮薄透光,湯頭鮮甜',
    station: '佐敦站',
    suggestedDay: 99,
  },
  {
    name: '金華冰廳',
    category: '餐廳',
    note: '號稱全港第一的得獎菠蘿油,外皮酥脆',
    station: '太子站/旺角站',
    suggestedDay: 99,
  },
];

for (const item of items) {
  const ref = await db.collection('attractions').add(item);
  console.log(`已寫入景點: ${item.name} (${ref.id})`);
}

console.log(`完成,共寫入 ${items.length} 筆景點資料`);
