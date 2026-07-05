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
      <option value="">(未引用景點)</option>
      {attractions.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}({(votesByAttraction[a.id] || []).length} 票)
        </option>
      ))}
    </select>
  );
}
