import { useState } from 'react';
import { CATEGORY_OPTIONS } from '../lib/categoryIcons';

export default function AddAttractionForm({ onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('請輸入景點名稱');
      return;
    }
    onSubmit({ name: trimmedName, category, note: note.trim(), suggestedDay: 99 });
  }

  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit}>
        <h2>➕ 新增候選景點</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如:澳洲牛奶公司"
          autoFocus
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="推薦原因或必吃/必去重點(選填)"
        />
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            取消
          </button>
          <button type="submit">新增</button>
        </div>
      </form>
    </div>
  );
}
