import { useEffect, useState } from 'react';
import { GripVertical, Link as LinkIcon, Trash2 } from 'lucide-react';
import AttractionLinkPicker from './AttractionLinkPicker';

export default function ItinerarySlotCard({
  slot,
  onUpdate,
  onDelete,
  dragHandleProps,
  attractions,
  votesByAttraction,
}) {
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({
    time: slot.time,
    title: slot.title,
    location: slot.location || '',
    note: slot.note || '',
    linkedAttractionId: slot.linkedAttractionId || null,
  });

  useEffect(() => {
    if (!editing) {
      setDraft({
        time: slot.time,
        title: slot.title,
        location: slot.location || '',
        note: slot.note || '',
        linkedAttractionId: slot.linkedAttractionId || null,
      });
    }
  }, [editing, slot]);

  async function handleSave() {
    if (!draft.time.trim() || !draft.title.trim()) {
      setError('請填寫時間與標題。');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onUpdate(slot.id, {
        time: draft.time.trim(),
        title: draft.title.trim(),
        location: draft.location.trim(),
        note: draft.note.trim(),
        linkedAttractionId: draft.linkedAttractionId || null,
      });
      setEditing(false);
    } catch (saveError) {
      setError(saveError.message || '儲存失敗，請稍後再試。');
    } finally {
      setIsSaving(false);
    }
  }

  const linkedAttraction = attractions.find((attraction) => attraction.id === slot.linkedAttractionId);

  if (editing) {
    return (
      <div className="itinerary-card editing">
        <label className="field-label" htmlFor={`slot-time-${slot.id}`}>時間</label>
        <input
          id={`slot-time-${slot.id}`}
          value={draft.time}
          onChange={(e) => setDraft({ ...draft, time: e.target.value })}
          placeholder="例如：20:30以後"
        />

        <label className="field-label" htmlFor={`slot-title-${slot.id}`}>標題</label>
        <input
          id={`slot-title-${slot.id}`}
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="例如：廟街夜市"
        />

        <label className="field-label" htmlFor={`slot-location-${slot.id}`}>地點</label>
        <input
          id={`slot-location-${slot.id}`}
          value={draft.location}
          onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          placeholder="例如：油麻地站"
        />

        <label className="field-label" htmlFor={`slot-note-${slot.id}`}>備註</label>
        <textarea
          id={`slot-note-${slot.id}`}
          value={draft.note}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          placeholder="補充交通、必吃、集合時間等"
        />

        <label className="field-label">連結候選景點</label>
        <AttractionLinkPicker
          attractions={attractions}
          votesByAttraction={votesByAttraction}
          linkedAttractionId={draft.linkedAttractionId}
          onChange={(id) => setDraft({ ...draft, linkedAttractionId: id })}
        />

        {error && <p className="error" role="alert">{error}</p>}
        <div className="slot-edit-actions">
          <button type="button" className="secondary" onClick={() => setEditing(false)} disabled={isSaving}>
            取消
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? '儲存中…' : '儲存'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="itinerary-card">
      {dragHandleProps && (
        <button className="drag-handle" type="button" aria-label="拖曳排序" {...dragHandleProps}>
          <GripVertical size={18} aria-hidden="true" />
        </button>
      )}
      <span className="time">{slot.time}</span>
      <h3>{slot.title}</h3>
      {slot.location && <p className="location">{slot.location}</p>}
      {slot.note && <p className="note">{slot.note}</p>}
      {linkedAttraction && (
        <p className="linked-attraction">
          <LinkIcon size={14} aria-hidden="true" />
          {linkedAttraction.name} ({(votesByAttraction[linkedAttraction.id] || []).length} 票)
        </p>
      )}
      <button className="slot-edit-button" type="button" onClick={() => setEditing(true)}>
        編輯
      </button>
      <button className="slot-delete-button" type="button" onClick={() => onDelete(slot)}>
        <Trash2 size={15} aria-hidden="true" />
        刪除
      </button>
    </div>
  );
}
