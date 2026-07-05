export default function AttractionLinkPicker({
  attractions,
  votesByAttraction,
  linkedAttractionId,
  onChange,
}) {
  return (
    <select
      value={linkedAttractionId || ''}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">不連結候選景點</option>
      {attractions.map((attraction) => (
        <option key={attraction.id} value={attraction.id}>
          {attraction.name} ({(votesByAttraction[attraction.id] || []).length} 票)
        </option>
      ))}
    </select>
  );
}
