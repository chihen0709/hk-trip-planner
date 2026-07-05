import {
  Beef,
  Binoculars,
  CakeSlice,
  Coffee,
  CupSoda,
  Landmark,
  MapPin,
  Martini,
  Ship,
  Utensils,
} from 'lucide-react';

export const CATEGORY_OPTIONS = [
  '燒味與正餐',
  '茶餐廳與點心',
  '烘焙與甜品',
  '咖啡與茶飲',
  '美式餐點',
  '酒吧與夜生活',
  '經典體驗',
  '餐廳',
  '景點',
  '酒吧',
  '甜點',
  '咖啡廳',
];

const CATEGORY_META = {
  燒味與正餐: { label: '燒味與正餐', color: '#0F766E', Icon: Beef },
  茶餐廳與點心: { label: '茶餐廳與點心', color: '#0E7490', Icon: Utensils },
  烘焙與甜品: { label: '烘焙與甜品', color: '#EA580C', Icon: CakeSlice },
  咖啡與茶飲: { label: '咖啡與茶飲', color: '#7C2D12', Icon: Coffee },
  美式餐點: { label: '美式餐點', color: '#2563EB', Icon: CupSoda },
  酒吧與夜生活: { label: '酒吧與夜生活', color: '#7C3AED', Icon: Martini },
  經典體驗: { label: '經典體驗', color: '#0F4C81', Icon: Ship },
  餐廳: { label: '餐廳', color: '#0F766E', Icon: Utensils },
  景點: { label: '景點', color: '#2563EB', Icon: Binoculars },
  酒吧: { label: '酒吧', color: '#7C3AED', Icon: Martini },
  甜點: { label: '甜點', color: '#EA580C', Icon: CakeSlice },
  咖啡廳: { label: '咖啡廳', color: '#7C2D12', Icon: Coffee },
};

export function CategoryIcon({ category, size = 18, className = '' }) {
  const meta = CATEGORY_META[category] || { Icon: MapPin, color: '#64748B' };
  const Icon = meta.Icon || Landmark;
  return (
    <Icon
      aria-hidden="true"
      className={className}
      size={size}
      strokeWidth={2.2}
      color="currentColor"
    />
  );
}

export function getCategoryLabel(category) {
  return CATEGORY_META[category]?.label || category || '景點';
}

export function getCategoryColor(category) {
  return CATEGORY_META[category]?.color || '#64748B';
}

export function getCategoryIcon(category) {
  return getCategoryLabel(category);
}
