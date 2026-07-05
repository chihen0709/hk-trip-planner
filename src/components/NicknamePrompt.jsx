import { useState } from 'react';

export default function NicknamePrompt({ onSubmit }) {
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
        <h2>歡迎!請輸入你的暱稱</h2>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="例如:小明"
          autoFocus
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">開始使用</button>
      </form>
    </div>
  );
}
