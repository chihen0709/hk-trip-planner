import { getCategoryIcon } from '../lib/categoryIcons';

function buildMapUrl(name) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} 香港`)}`;
}

export default function VoteCard({ attraction, voteCount, hasVoted, onToggle }) {
  return (
    <div className="vote-card">
      <div className="vote-card-top">
        <h3>
          {getCategoryIcon(attraction.category)} {attraction.name}
        </h3>
        {attraction.station && <span className="station-badge">📍 {attraction.station}</span>}
      </div>
      {attraction.note && <p className="note">{attraction.note}</p>}
      <div className="vote-row">
        <button
          className={`heart-button ${hasVoted ? 'voted' : ''}`}
          onClick={onToggle}
          aria-label={hasVoted ? '取消投票' : '投票'}
          title={hasVoted ? '取消投票' : '投票'}
        >
          {hasVoted ? '❤️' : '🤍'}
        </button>
        <span className="vote-count">{voteCount} 票</span>
        <a
          className="map-button"
          href={buildMapUrl(attraction.name)}
          target="_blank"
          rel="noopener noreferrer"
        >
          📍 Google Map
        </a>
      </div>
    </div>
  );
}
