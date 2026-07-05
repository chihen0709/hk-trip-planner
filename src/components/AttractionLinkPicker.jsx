import { useState } from 'react';
import { getCategoryIcon } from '../lib/categoryIcons';

const MAX_LINKS = 3;

export default function AttractionLinkPicker({ attractions, votesByAttraction, linkedAttractionIds, onChange }) {
  const [filter, setFilter] = useState('');
  const selected = linkedAttractionIds || [];

  const visible = attractions.filter((a) => a.name.toLowerCase().includes(filter.trim().toLowerCase()));

  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter((existingId) => existingId !== id));
    } else if (selected.length < MAX_LINKS) {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="attraction-link-picker">
      <input
        type="text"
        className="link-picker-search"
        placeholder="搜尋景點來連結"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <p className="link-picker-hint">最多可連結 {MAX_LINKS} 個候選景點({selected.length}/{MAX_LINKS})</p>
      <div className="link-picker-list">
        {visible.map((attraction) => {
          const isChecked = selected.includes(attraction.id);
          const isDisabled = !isChecked && selected.length >= MAX_LINKS;
          return (
            <label
              key={attraction.id}
              className={`link-picker-item ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => toggle(attraction.id)}
              />
              {getCategoryIcon(attraction.category)} {attraction.name}
              <span className="link-picker-votes">
                {(votesByAttraction[attraction.id] || []).length} 票
              </span>
            </label>
          );
        })}
        {visible.length === 0 && <p className="link-picker-empty">找不到符合的景點</p>}
      </div>
    </div>
  );
}
