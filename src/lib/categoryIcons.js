export const CATEGORY_OPTIONS = ['餐廳', '景點', '酒吧', '甜點', '咖啡廳'];

const CATEGORY_ICONS = {
  餐廳: '🍽️',
  景點: '🏞️',
  酒吧: '🍸',
  甜點: '🍰',
  咖啡廳: '☕',
};

const CATEGORY_COLORS = {
  餐廳: '#FF6B6B',
  景點: '#4ECDC4',
  酒吧: '#A78BFA',
  甜點: '#FFB86B',
  咖啡廳: '#8B5E3C',
};

export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || '📍';
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#9CA3AF';
}
