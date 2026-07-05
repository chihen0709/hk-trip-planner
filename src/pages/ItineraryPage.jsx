import { useState, useEffect } from 'react';
import { subscribeToItinerarySlots, updateSlot } from '../lib/itinerary';
import ItinerarySlotCard from '../components/ItinerarySlotCard';

export default function ItineraryPage() {
  const [slots, setSlots] = useState([]);

  useEffect(() => subscribeToItinerarySlots(setSlots), []);

  const days = slots.reduce((acc, slot) => {
    acc[slot.day] = acc[slot.day] || [];
    acc[slot.day].push(slot);
    return acc;
  }, {});

  return (
    <div className="itinerary-page">
      {Object.entries(days).map(([day, daySlots]) => (
        <section key={day}>
          <h2>Day {day}</h2>
          <div className="card-list">
            {daySlots.map((slot) => (
              <ItinerarySlotCard key={slot.id} slot={slot} onUpdate={updateSlot} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
