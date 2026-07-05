import { CategoryIcon, getCategoryColor, getCategoryLabel } from '../lib/categoryIcons';

export default function CategoryDonutChart({ attractions }) {
  const counts = attractions.reduce((acc, attraction) => {
    acc[attraction.category] = (acc[attraction.category] || 0) + 1;
    return acc;
  }, {});
  const total = attractions.length;
  const categories = Object.keys(counts);

  let cumulative = 0;
  const segments = categories.map((category) => {
    const count = counts[category];
    const percent = total > 0 ? (count / total) * 100 : 0;
    const start = cumulative;
    cumulative += percent;
    return { category, count, start, end: cumulative };
  });

  const gradient = segments
    .map((segment) => `${getCategoryColor(segment.category)} ${segment.start}% ${segment.end}%`)
    .join(', ');

  return (
    <div className="donut-chart-wrap">
      <div
        className="donut-chart"
        style={{ background: total > 0 ? `conic-gradient(${gradient})` : '#e0e0e0' }}
      >
        <div className="donut-chart-hole">{total}</div>
      </div>
      <ul className="donut-legend">
        {segments.map((segment) => (
          <li key={segment.category}>
            <span
              className="donut-legend-dot"
              style={{ background: getCategoryColor(segment.category) }}
            />
            <CategoryIcon category={segment.category} size={14} />
            {getCategoryLabel(segment.category)}({segment.count})
          </li>
        ))}
      </ul>
    </div>
  );
}
