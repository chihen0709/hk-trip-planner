import { useState } from 'react';

export default function NicknamePrompt({
  onSubmit,
  onCancel,
  title = '歡迎!請輸入你的暱稱',
  submitLabel = '開始使用',
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('請輸入暱稱');
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit}>
        <h2>{title}</h2>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="例如:小明"
          autoFocus
        />
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          {onCancel && (
            <button type="button" className="secondary" onClick={onCancel}>
              取消
            </button>
          )}
          <button type="submit">{submitLabel}</button>
        </div>
      </form>
    </div>
  );
}
