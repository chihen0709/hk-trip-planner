import { db } from './firebaseAdmin.mjs';

// 這些地鐵站是根據景點實際地理位置的常識推斷,不是從任何網站抓取的資料。
// 「manual-紅茶冰室」因為不確定是哪一間分店,刻意不填,避免亂猜。
const stations = {
  'aqua-luna-junk-boat': '中環站',
  'bakehouse-central': '中環站',
  'bakehouse-tsimshatsui': '尖沙咀站',
  'cupping-room': '中環站',
  'darkside-bar': '尖東站',
  'ding-dim-1968': '中環站',
  'hashtag-b-egg-tart': '尖沙咀站',
  'ifc-mall-dinner': '中環站/香港站',
  'iron-fairies-lkf': '中環站',
  'liangcao-tsimshatsui': '尖沙咀站',
  'mak-man-kee': '佐敦站',
  'mongkok-shopping': '旺角站',
  'ngong-ping-360': '東涌站',
  'sui-kee-coffee': '上環站',
  'sun-kwong-tai-tang-tsimshatsui': '尖沙咀站',
  'temple-street-night-market': '油麻地站',
  'victoria-peak-sky-terrace-428': '中環站',
  'wong-chun-chun-tsimshatsui': '尖沙咀站',
  'yat-dim-sum-prince-edward': '太子站',
};

for (const [id, station] of Object.entries(stations)) {
  await db.collection('attractions').doc(id).update({ station });
  console.log(`已更新: ${id} -> ${station}`);
}

console.log(`完成,共更新 ${Object.keys(stations).length} 筆地鐵站資料`);
