import { db } from './firebaseAdmin.mjs';

const items = [
  { id: 'reference-yung-kee-chan-pei-roast-goose', name: '榕記陳皮燒鵝', category: '燒味與正餐', note: '尖沙咀人氣名店，招牌陳皮燒鵝皮脆肉嫩，帶有獨特陳皮幽香', station: '尖沙咀站', suggestedDay: 99 },
  { id: 'reference-chuk-fu-tai-pan-siu-mei', name: '竺扶大班燒味', category: '燒味與正餐', note: '以高質素燒臘著稱，脆皮燒肉與叉燒深受好評', station: '灣仔站', suggestedDay: 99 },
  { id: 'reference-kam-s-roast-goose', name: '甘牌燒鵝', category: '燒味與正餐', note: '連續多年榮獲米其林一星，招牌燒鵝皮脆肉嫩', station: '灣仔站', suggestedDay: 99 },
  { id: 'reference-kau-kee-beef-brisket', name: '九記牛腩', category: '燒味與正餐', note: '中環排隊名店，清湯牛腩與咖喱牛腩極其入味', station: '上環站 / 中環站', suggestedDay: 99 },
  { id: 'reference-mak-man-kee-noodle-shop', name: '麥文記麵家', category: '燒味與正餐', note: '佐敦老字號麵家，全蝦雲吞皮薄透光、湯頭鮮甜', station: '佐敦站', suggestedDay: 99 },
  { id: 'reference-kam-wah-cafe', name: '金華冰廳', category: '茶餐廳與點心', note: '號稱全港第一的得獎菠蘿油，外皮酥碎', station: '太子站 / 旺角站', suggestedDay: 99 },
  { id: 'australia-dairy-company', name: '澳洲牛奶公司', category: '茶餐廳與點心', note: '超滑嫩神級炒蛋、蛋白燉鮮奶與極速點餐服務', station: '佐敦站', suggestedDay: 99 },
  { id: 'hkya-wah-sao-ice-room', name: '華嫂冰室', category: '茶餐廳與點心', note: '明星熱愛，招牌菠蘿包、番茄豬扒雞翼湯通粉', station: '尖沙咀/灣仔/元朗', suggestedDay: 99 },
  { id: 'hkya-lan-fong-yuen', name: '蘭芳園', category: '茶餐廳與點心', note: '絲襪奶茶始祖，傳統鐵皮檔風味，蔥油雞扒撈丁', station: '中環站 / 尖沙咀', suggestedDay: 99 },
  { id: 'hkya-one-dim-sum', name: '一點心', category: '茶餐廳與點心', note: '平價高水準米其林推薦港點，蝦餃、燒賣現點現蒸', station: '太子站', suggestedDay: 99 },
  { id: 'hkya-cheung-hing-kee', name: '祥興記上海生煎包', category: '茶餐廳與點心', note: '米其林必比登推薦，生煎包底層焦脆、頂部皮薄多汁', station: '尖沙咀/中環', suggestedDay: 99 },
  { id: 'hkya-wong-kee-ice-room', name: '旺記冰室', category: '茶餐廳與點心', note: '主打無敵滑蛋系列的摩登冰室，滑蛋叉燒飯必吃', station: '尖沙咀站 / 灣仔', suggestedDay: 99 },
  { id: 'hkya-shun-hing-cha-chaan-teng', name: '順興茶餐廳', category: '茶餐廳與點心', note: '大坑著名滑蛋飯名店，大牌檔風味滑蛋三寶飯', station: '天后站 (大坑)', suggestedDay: 99 },
  { id: 'hkya-tsui-wah-restaurant', name: '翠華餐廳', category: '茶餐廳與點心', note: '老牌連鎖茶餐廳，奶油豬仔包與香滑奶茶品質穩定', station: '中環站 / 各區皆有', suggestedDay: 99 },
  { id: 'hkya-wah-lok-cafe', name: 'Wah Lok Cafe', category: '茶餐廳與點心', note: '華樂冰室，隱藏在中環上環交界的高評價懷舊老字號冰室', station: '上環站', suggestedDay: 99 },
  { id: 'hkya-bakehouse', name: 'bakehouse', category: '烘焙與甜品', note: '全港爆紅的招牌酸種蛋撻必買，酥皮極具層次', station: '中環/尖沙咀/灣仔', suggestedDay: 99 },
  { id: 'hkya-mobile-softee', name: '富豪雪糕', category: '烘焙與甜品', note: '經典紅色移動雪糕車，播放音樂，必吃香滑軟雪糕', station: '尖沙咀/中環碼頭等', suggestedDay: 99 },
  { id: 'hkya-kai-kai-dessert', name: '佳佳甜品', category: '烘焙與甜品', note: '米其林推薦傳統糖水，芝麻糊、香滑核桃露極細緻', station: '佐敦站', suggestedDay: 99 },
  { id: 'hkya-yan-heung-dessert', name: '研香甜品', category: '烘焙與甜品', note: '主打傳統與新式創意結合的濃郁開心果糊、焙茶糊', station: '尖沙咀站', suggestedDay: 99 },
  { id: 'hkya-messina', name: 'MESSINA', category: '烘焙與甜品', note: '來自澳洲高人氣手工義式冰淇淋，常推香港限定口味', station: '中環站 (石板街)', suggestedDay: 99 },
  { id: 'hkya-lemon-king', name: '檸檬王', category: '烘焙與甜品', note: '上環知名必買伴手禮，加入甘草粉的甘草檸檬清爽生津', station: '上環站', suggestedDay: 99 },
  { id: 'hkya-midnight-bread-club', name: '午夜麵包俱樂部', category: '烘焙與甜品', note: '主打特色精緻手工烘焙與高質感麵包點心', station: '市區 / 多點寄賣', suggestedDay: 99 },
  { id: 'hkya-arabica', name: '% Arabica', category: '咖啡與茶飲', note: '堅尼地城分店坐擁絕美海景窗，咖啡香濃、拍照極美', station: '堅尼地城站', suggestedDay: 99 },
  { id: 'hkya-fineprint', name: 'FINEPRINT', category: '咖啡與茶飲', note: '知名質感精品咖啡，全天候早午餐與酸種麵包極受歡迎', station: '中環站 / 蘇豪區', suggestedDay: 99 },
  { id: 'hkya-noc-coffee-co', name: 'NOC Coffee Co.', category: '咖啡與茶飲', note: '極簡純白風格的在地精品咖啡，兼具極佳採光與輕食', station: '上環/西營盤等', suggestedDay: 99 },
  { id: 'hkya-on-the-hill-coffee-bar', name: 'ON THE HILL COFFEE BAR', category: '咖啡與茶飲', note: '具備獨特美學與文青氛圍的咖啡店 (大館等皆有分店)', station: '中環站 (大館)', suggestedDay: 99 },
  { id: 'hkya-rootdown', name: 'ROOTDOWN', category: '咖啡與茶飲', note: '充滿設計感與音樂氛圍的特色咖啡與餐酒空間', station: '西營盤站', suggestedDay: 99 },
  { id: 'hkya-a1-lemon-tea', name: '阿一檸檬茶', category: '咖啡與茶飲', note: '主打手打香水檸檬茶的清爽系飲品，解膩推薦', station: '尖沙咀站', suggestedDay: 99 },
  { id: 'hkya-shake-shack-tung-chung', name: 'Shake Shack', category: '美式餐點', note: '來自紐約的經典漢堡，空間寬敞，適合前往大嶼山前充飢', station: '東涌站 (東薈城)', suggestedDay: 99 },
  { id: 'hkya-bar-leone', name: 'Bar Leone', category: '酒吧與夜生活', note: '榮獲亞洲 50 最佳酒吧第一名！主打義式風格雞尾酒', station: '中環站', suggestedDay: 99 },
  { id: 'hkya-darkside', name: 'DarkSide', category: '酒吧與夜生活', note: '瑰麗酒店內的頂級酒吧，主打黑巧克力調酒與現場爵士樂', station: '尖東站 (瑰麗酒店)', suggestedDay: 99 },
  { id: 'hkya-the-iron-fairies', name: 'The Iron Fairies', category: '酒吧與夜生活', note: '魔幻鐵匠主題吧，天花板掛滿萬隻手工蝴蝶，氛圍神祕', station: '中環站', suggestedDay: 99 },
  { id: 'hkya-the-diplomat', name: 'The Diplomat', category: '酒吧與夜生活', note: '高級美式經典酒吧，頂級和牛漢堡被譽為全港第一', station: '中環站', suggestedDay: 99 },
  { id: 'hkya-lan-kwai-fong', name: '蘭桂坊', category: '酒吧與夜生活', note: '香港最富盛名的夜生活與酒吧聚集街區，異國風情濃厚', station: '中環站', suggestedDay: 99 },
  { id: 'hkya-star-ferry', name: '天星小輪', category: '經典體驗', note: '橫跨維多利亞港的百年渡輪，欣賞兩岸天際線最佳方式', station: '尖沙咀碼頭/中環碼頭', suggestedDay: 99 },
];

for (const { id, ...data } of items) {
  await db.collection('attractions').doc(id).set(data, { merge: true });
  console.log(`已寫入/更新景點: ${data.name} (${id})`);
}

console.log(`完成，共寫入/更新 ${items.length} 筆參考景點資料`);
