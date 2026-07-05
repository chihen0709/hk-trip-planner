export const CATEGORY_OPTIONS = ['餐廳', '景點', '酒吧', '甜點', '咖啡廳'];

const CATEGORY_ICONS = {
  餐廳: '🍽️',
  景點: '🏞️',
  酒吧: '🍸',
  甜點: '🍰',
  咖啡廳: '☕',
};

const CATEGORY_COLORS = {
  餐廳: '#2F9E8F',
  景點: '#57B8AC',
  酒吧: '#1F6E63',
  甜點: '#7FD1C5',
  咖啡廳: '#134A42',
};

export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || '📍';
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#9CA3AF';
}
