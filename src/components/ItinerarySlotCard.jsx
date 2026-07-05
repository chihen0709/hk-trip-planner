import { useState } from 'react';
import AttractionLinkPicker from './AttractionLinkPicker';

export default function ItinerarySlotCard({
  slot,
  onUpdate,
  dragHandleProps,
  attractions,
  votesByAttraction,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    time: slot.time,
    title: slot.title,
    location: slot.location || '',
    note: slot.note || '',
    linkedAttractionId: slot.linkedAttractionId || null,
  });

  function handleSave() {
    onUpdate(slot.id, draft);
    setEditing(false);
  }

  const linkedAttraction = attractions.find((a) => a.id === slot.linkedAttractionId);

  if (editing) {
    return (
      <div className="itinerary-card editing">
        <input
          value={draft.time}
          onChange={(e) => setDraft({ ...draft, time: e.target.value })}
          placeholder="時間"
        />
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="標題"
        />
        <input
          value={draft.location}
          onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          placeholder="地點"
        />
        <textarea
          value={draft.note}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          placeholder="備註"
        />
        <AttractionLinkPicker
          attractions={attractions}
          votesByAttraction={votesByAttraction}
          linkedAttractionId={draft.linkedAttractionId}
          onChange={(id) => setDraft({ ...draft, linkedAttractionId: id })}
        />
        <button onClick={handleSave}>儲存</button>
      </div>
    );
  }

  return (
    <div className="itinerary-card">
      {dragHandleProps && (
        <span className="drag-handle" {...dragHandleProps}>⋮⋮</span>
      )}
      <span className="time">{slot.time}</span>
      <h3>{slot.title}</h3>
      {slot.location && <p className="location">{slot.location}</p>}
      {slot.note && <p className="note">{slot.note}</p>}
      {linkedAttraction && (
        <p className="linked-attraction">
          🔗 {linkedAttraction.name}({(votesByAttraction[linkedAttraction.id] || []).length} 票)
        </p>
      )}
      <button onClick={() => setEditing(true)}>編輯</button>
    </div>
  );
}
