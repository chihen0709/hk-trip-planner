import { getCategoryColor, getCategoryIcon } from '../lib/categoryIcons';

export default function CategoryDonutChart({ attractions }) {
  const counts = attractions.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
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
    .map((s) => `${getCategoryColor(s.category)} ${s.start}% ${s.end}%`)
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
        {segments.map((s) => (
          <li key={s.category}>
            <span className="donut-legend-dot" style={{ background: getCategoryColor(s.category) }} />
            {getCategoryIcon(s.category)} {s.category}({s.count})
          </li>
        ))}
      </ul>
    </div>
  );
}
