import { getCategoryIcon } from '../lib/categoryIcons';

export default function VoteCard({ attraction, voteCount, hasVoted, onToggle }) {
  return (
    <div className="vote-card">
      <h3>
        {getCategoryIcon(attraction.category)} {attraction.name}
      </h3>
      {attraction.note && <p className="note">{attraction.note}</p>}
      <div className="vote-row">
        <span className="vote-count">{voteCount} 票</span>
        <button className={hasVoted ? 'voted' : ''} onClick={onToggle}>
          {hasVoted ? '取消投票' : '投票'}
        </button>
      </div>
    </div>
  );
}
