import { Heart, MapPin, Trash2 } from 'lucide-react';
import { CategoryIcon } from '../lib/categoryIcons';

function buildMapUrl(name) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} 香港`)}`;
}

export default function VoteCard({ attraction, voteCount, onVote, onDelete, highlighted }) {
  return (
    <div id={`attraction-${attraction.id}`} className={`vote-card ${highlighted ? 'highlighted' : ''}`}>
      <div className="vote-card-top">
        <h3>
          <CategoryIcon category={attraction.category} size={18} />
          {attraction.name}
        </h3>
        {attraction.station && (
          <span className="station-badge">
            <MapPin size={13} aria-hidden="true" />
            {attraction.station}
          </span>
        )}
      </div>
      {attraction.note && <p className="note">{attraction.note}</p>}
      <div className="vote-row">
        <button className="vote-button" onClick={onVote} type="button">
          <Heart size={18} aria-hidden="true" />
          投票
        </button>
        <span className="vote-count">{voteCount} 票</span>
        <a
          className="map-button"
          href={buildMapUrl(attraction.name)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MapPin size={15} aria-hidden="true" />
          Google Map
        </a>
        <button
          className="icon-danger-button"
          onClick={onDelete}
          type="button"
          aria-label={`刪除 ${attraction.name}`}
          title="刪除景點"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
