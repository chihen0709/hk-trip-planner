import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';

export default function NicknamePrompt({
  onSubmit,
  onCancel,
  title = '留下暱稱',
  description = '請輸入您的暱稱，讓大家知道是誰推薦了這個景點。',
  submitLabel = '確認',
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('請輸入暱稱');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(trimmed);
    } catch (submitError) {
      setError(submitError.message || '投票失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="presentation">
      <form className="modal vote-modal" onSubmit={handleSubmit} aria-labelledby="vote-modal-title">
        <div className="vote-modal-icon">
          <Heart size={30} aria-hidden="true" />
        </div>
        <div className="modal-body">
          <h2 id="vote-modal-title">{title}</h2>
          <p className="modal-description">{description}</p>
          <label className="field-label" htmlFor="nickname-input">
            您的暱稱
          </label>
          <input
            ref={inputRef}
            id="nickname-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="輸入您的暱稱"
            autoComplete="nickname"
            disabled={isSubmitting}
          />
          {error && <p className="error" role="alert">{error}</p>}
          <div className="modal-actions">
            {onCancel && (
              <button type="button" className="secondary" onClick={onCancel}>
                取消
              </button>
            )}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '投票中…' : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
