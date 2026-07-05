import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toPng } from 'html-to-image';
import { CalendarDays, Download, Save, Trash2, Plus } from 'lucide-react';
import {
  addSlot,
  deleteSlot,
  reorderDaySlots,
  subscribeToItinerarySlots,
  updateSlot,
} from '../lib/itinerary';
import { subscribeToAttractions } from '../lib/attractions';
import { subscribeToAllVotes } from '../lib/votes';
import AttractionLinkPicker from '../components/AttractionLinkPicker';
import ItinerarySlotCard from '../components/ItinerarySlotCard';

function SortableSlot({ slot, onUpdate, onDelete, attractions, votesByAttraction }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slot.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.62 : 1,
    zIndex: isDragging ? 2 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ItinerarySlotCard
        slot={slot}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        attractions={attractions}
        votesByAttraction={votesByAttraction}
      />
    </div>
  );
}

function slotSignature(slot) {
  return [
    slot.day,
    String(slot.time || '').trim().toLowerCase(),
    String(slot.title || '').trim().toLowerCase(),
    String(slot.location || '').trim().toLowerCase(),
  ].join('|');
}

function ItineraryOverview({ days, selectedSlot, onSelectSlot, onUpdateSlot, onDeleteSlot }) {
  const [draft, setDraft] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setDraft(selectedSlot ? {
      time: selectedSlot.time || '',
      title: selectedSlot.title || '',
      location: selectedSlot.location || '',
      note: selectedSlot.note || '',
    } : null);
  }, [selectedSlot]);

  const totalSlots = Object.values(days).reduce((sum, daySlots) => sum + daySlots.length, 0);

  async function handleSave(e) {
    e.preventDefault();
    if (!selectedSlot || !draft.time.trim() || !draft.title.trim()) return;
    await onUpdateSlot(selectedSlot.id, {
      time: draft.time.trim(),
      title: draft.title.trim(),
      location: draft.location.trim(),
      note: draft.note.trim(),
    });
  }

  function handleSelectAndScroll(slot) {
    onSelectSlot(slot);
    const target = document.getElementById(`slot-${slot.id}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function handleDownload() {
    const node = document.getElementById('itinerary-overview-card');
    if (!node) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(node, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = '香港行程總覽.png';
      link.href = dataUrl;
      link.click();
    } catch (exportError) {
      console.error('匯出圖片失敗:', exportError);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="itinerary-overview" id="itinerary-overview-card" aria-label="行程總覽">
      <div className="overview-header">
        <div>
          <p className="overview-eyebrow">
            <CalendarDays size={16} aria-hidden="true" />
            行程總覽
          </p>
          <h2>{Object.keys(days).length} 天 / {totalSlots} 個時段</h2>
        </div>
        <button
          type="button"
          className="overview-download-button"
          onClick={handleDownload}
          disabled={isExporting}
        >
          <Download size={16} aria-hidden="true" />
          {isExporting ? '產生中…' : '下載圖片'}
        </button>
      </div>

      <div className="overview-grid">
        <div className="overview-days">
          {Object.entries(days).map(([day, daySlots]) => (
            <div className="overview-day" key={day}>
              <h3>Day {day}</h3>
              <div className="overview-slot-list">
                {daySlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`overview-slot ${selectedSlot?.id === slot.id ? 'active' : ''}`}
                    onClick={() => handleSelectAndScroll(slot)}
                  >
                    <span>{slot.time}</span>
                    {slot.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <form className="overview-editor" onSubmit={handleSave}>
          {draft && selectedSlot ? (
            <>
              <label className="field-label" htmlFor="overview-time">時間</label>
              <input
                id="overview-time"
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              />
              <label className="field-label" htmlFor="overview-title">標題</label>
              <input
                id="overview-title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
              <label className="field-label" htmlFor="overview-location">地點</label>
              <input
                id="overview-location"
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              />
              <label className="field-label" htmlFor="overview-note">備註</label>
              <textarea
                id="overview-note"
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
              <div className="overview-actions">
                <button type="submit">
                  <Save size={16} aria-hidden="true" />
                  更新
                </button>
                <button type="button" className="danger" onClick={() => onDeleteSlot(selectedSlot)}>
                  <Trash2 size={16} aria-hidden="true" />
                  刪除
                </button>
              </div>
            </>
          ) : (
            <p className="overview-empty">選一個時段，就可以在這裡快速修改。</p>
          )}
        </form>
      </div>
    </section>
  );
}

function NewSlotForm({ day, nextOrder, attractions, votesByAttraction, onSubmit, onCancel }) {
  const [draft, setDraft] = useState({
    day: Number(day),
    order: nextOrder,
    time: '',
    title: '',
    location: '',
    note: '',
    linkedAttractionIds: [],
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!draft.time.trim() || !draft.title.trim()) {
      setError('請填寫時間與標題。');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSubmit({
        ...draft,
        time: draft.time.trim(),
        title: draft.title.trim(),
        location: draft.location.trim(),
        note: draft.note.trim(),
      });
    } catch (submitError) {
      setError(submitError.message || '新增失敗，請稍後再試。');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="itinerary-card editing" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor={`new-time-${day}`}>時間</label>
      <input
        id={`new-time-${day}`}
        value={draft.time}
        onChange={(e) => setDraft({ ...draft, time: e.target.value })}
        placeholder="例如：14:00-15:30"
      />

      <label className="field-label" htmlFor={`new-title-${day}`}>標題</label>
      <input
        id={`new-title-${day}`}
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder="例如：下午茶"
      />

      <label className="field-label" htmlFor={`new-location-${day}`}>地點</label>
      <input
        id={`new-location-${day}`}
        value={draft.location}
        onChange={(e) => setDraft({ ...draft, location: e.target.value })}
        placeholder="例如：中環"
      />

      <label className="field-label" htmlFor={`new-note-${day}`}>備註</label>
      <textarea
        id={`new-note-${day}`}
        value={draft.note}
        onChange={(e) => setDraft({ ...draft, note: e.target.value })}
        placeholder="補充交通、必吃、集合時間等"
      />

      <label className="field-label">連結候選景點</label>
      <AttractionLinkPicker
        attractions={attractions}
        votesByAttraction={votesByAttraction}
        linkedAttractionIds={draft.linkedAttractionIds}
        onChange={(ids) => setDraft({ ...draft, linkedAttractionIds: ids })}
      />

      {error && <p className="error" role="alert">{error}</p>}
      <div className="slot-edit-actions">
        <button type="button" className="secondary" onClick={onCancel} disabled={isSaving}>
          取消
        </button>
        <button type="submit" disabled={isSaving}>
          {isSaving ? '新增中…' : '新增時段'}
        </button>
      </div>
    </form>
  );
}

export default function ItineraryPage() {
  const [slots, setSlots] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [votesByAttraction, setVotesByAttraction] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [addingDay, setAddingDay] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  useEffect(() => subscribeToItinerarySlots(setSlots, setLoadError), []);
  useEffect(() => subscribeToAttractions(setAttractions), []);
  useEffect(() => subscribeToAllVotes(setVotesByAttraction), []);

  const days = useMemo(() => {
    return slots.reduce((acc, slot) => {
      acc[slot.day] = acc[slot.day] || [];
      acc[slot.day].push(slot);
      acc[slot.day].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      return acc;
    }, {});
  }, [slots]);

  const selectedSlot = useMemo(() => {
    return slots.find((slot) => slot.id === selectedSlotId) || slots[0] || null;
  }, [selectedSlotId, slots]);

  async function handleUpdateSlot(slotId, fields) {
    setSlots((current) =>
      current.map((slot) => (slot.id === slotId ? { ...slot, ...fields } : slot))
    );
    await updateSlot(slotId, fields);
  }

  function handleDeleteSlot(slot) {
    const shouldDelete = window.confirm(`確定要刪除「${slot.title}」這個行程時段嗎？`);
    if (!shouldDelete) return;

    deleteSlot(slot);
    setSlots((current) => current.filter((item) => (
      item.id !== slot.id && slotSignature(item) !== slotSignature(slot)
    )));
    if (selectedSlotId === slot.id) setSelectedSlotId(null);
  }

  function handleDragEnd(day, daySlots) {
    return async (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = daySlots.findIndex((slot) => slot.id === active.id);
      const newIndex = daySlots.findIndex((slot) => slot.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = arrayMove(daySlots, oldIndex, newIndex).map((slot, index) => ({
        ...slot,
        order: index,
      }));

      setSlots((current) =>
        current.map((slot) => reordered.find((item) => item.id === slot.id) || slot)
      );

      try {
        await reorderDaySlots(Number(day), reordered.map((slot) => slot.id));
      } catch (error) {
        setLoadError(error);
      }
    };
  }

  async function handleAddSlot(day, daySlots, fields) {
    try {
      const created = await addSlot(fields);
      setSlots((current) => [...current, created]);
      setAddingDay(null);
    } catch (error) {
      if (error.localSlot) {
        setSlots((current) => [...current, error.localSlot]);
        setAddingDay(null);
        return;
      }
      throw error;
    }
  }

  return (
    <div className="itinerary-page">
      {loadError && (
        <p className="load-error">
          讀取或儲存行程失敗: {loadError.code || loadError.message}。請檢查網路後再試一次。
        </p>
      )}
      {!loadError && slots.length === 0 && <p className="load-empty">行程載入中…</p>}

      {slots.length > 0 && (
        <ItineraryOverview
          days={days}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => setSelectedSlotId(slot.id)}
          onUpdateSlot={handleUpdateSlot}
          onDeleteSlot={handleDeleteSlot}
        />
      )}

      {Object.entries(days).map(([day, daySlots]) => (
        <section key={day}>
          <div className="day-heading">
            <h2>Day {day}</h2>
            <button className="add-slot-button" type="button" onClick={() => setAddingDay(day)}>
              <Plus size={17} aria-hidden="true" />
              新增時段
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd(day, daySlots)}
          >
            <SortableContext
              items={daySlots.map((slot) => slot.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="card-list">
                {daySlots.map((slot) => (
                  <SortableSlot
                    key={slot.id}
                    slot={slot}
                    onUpdate={handleUpdateSlot}
                    onDelete={handleDeleteSlot}
                    attractions={attractions}
                    votesByAttraction={votesByAttraction}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {addingDay === day && (
            <NewSlotForm
              day={day}
              nextOrder={daySlots.length}
              attractions={attractions}
              votesByAttraction={votesByAttraction}
              onSubmit={(fields) => handleAddSlot(day, daySlots, fields)}
              onCancel={() => setAddingDay(null)}
            />
          )}
        </section>
      ))}
    </div>
  );
}
