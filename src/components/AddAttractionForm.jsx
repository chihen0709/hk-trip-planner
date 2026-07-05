import { useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORY_OPTIONS, getCategoryLabel } from '../lib/categoryIcons';

export default function AddAttractionForm({ onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [note, setNote] = useState('');
  const [station, setStation] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('請輸入景點名稱');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSubmit({
        name: trimmedName,
        category,
        note: note.trim(),
        station: station.trim(),
        suggestedDay: 99,
      });
    } catch {
      setError('Firebase 回寫失敗，已先保存在這台裝置。');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-overlay" role="presentation">
      <form className="modal" onSubmit={handleSubmit} aria-labelledby="add-attraction-title">
        <div className="modal-header">
          <h2 id="add-attraction-title">新增候選景點</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="關閉">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">
          <label className="field-label" htmlFor="attraction-name">景點名稱</label>
          <input
            id="attraction-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：澳洲牛奶公司"
            autoFocus
          />

          <label className="field-label" htmlFor="attraction-category">分類</label>
          <select
            id="attraction-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {getCategoryLabel(option)}
              </option>
            ))}
          </select>

          <label className="field-label" htmlFor="attraction-note">推薦原因</label>
          <textarea
            id="attraction-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="推薦原因或必吃/必去重點（選填）"
          />

          <label className="field-label" htmlFor="attraction-station">鄰近地鐵站/區域</label>
          <input
            id="attraction-station"
            type="text"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            placeholder="例如：佐敦站"
          />

          {error && <p className="error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" disabled={isSaving}>
              {isSaving ? '儲存中…' : '新增'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
