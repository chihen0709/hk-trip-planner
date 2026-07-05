import {
  Binoculars,
  CakeSlice,
  Coffee,
  Landmark,
  MapPin,
  Martini,
  Utensils,
} from 'lucide-react';

export const CATEGORY_OPTIONS = ['餐廳', '景點', '酒吧', '甜點', '咖啡廳'];

const CATEGORY_META = {
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
