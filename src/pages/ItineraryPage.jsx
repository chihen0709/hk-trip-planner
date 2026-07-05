import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { subscribeToItinerarySlots, updateSlot, reorderDaySlots } from '../lib/itinerary';
import ItinerarySlotCard from '../components/ItinerarySlotCard';

function SortableSlot({ slot, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: slot.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <ItinerarySlotCard
        slot={slot}
        onUpdate={onUpdate}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function ItineraryPage() {
  const [slots, setSlots] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => subscribeToItinerarySlots(setSlots), []);

  const days = slots.reduce((acc, slot) => {
    acc[slot.day] = acc[slot.day] || [];
    acc[slot.day].push(slot);
    return acc;
  }, {});

  function handleDragEnd(day, daySlots) {
    return (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = daySlots.findIndex((s) => s.id === active.id);
      const newIndex = daySlots.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(daySlots, oldIndex, newIndex);
      reorderDaySlots(Number(day), reordered.map((s) => s.id));
    };
  }

  return (
    <div className="itinerary-page">
      {Object.entries(days).map(([day, daySlots]) => (
        <section key={day}>
          <h2>Day {day}</h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd(day, daySlots)}
          >
            <SortableContext
              items={daySlots.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="card-list">
                {daySlots.map((slot) => (
                  <SortableSlot key={slot.id} slot={slot} onUpdate={updateSlot} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      ))}
    </div>
  );
}
