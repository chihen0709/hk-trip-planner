import { useState, useEffect } from 'react';
import { subscribeToAttractions } from '../lib/attractions';
import { subscribeToAllVotes, toggleVote } from '../lib/votes';
import VoteCard from '../components/VoteCard';

export default function VotePage({ nickname }) {
  const [attractions, setAttractions] = useState([]);
  const [votesByAttraction, setVotesByAttraction] = useState({});

  useEffect(() => subscribeToAttractions(setAttractions), []);
  useEffect(() => subscribeToAllVotes(setVotesByAttraction), []);

  const grouped = attractions.reduce((acc, a) => {
    acc[a.category] = acc[a.category] || [];
    acc[a.category].push(a);
    return acc;
  }, {});

  return (
    <div className="vote-page">
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h2>{category}</h2>
          <div className="card-grid">
            {items.map((attraction) => {
              const voters = votesByAttraction[attraction.id] || [];
              const hasVoted = voters.includes(nickname);
              return (
                <VoteCard
                  key={attraction.id}
                  attraction={attraction}
                  voteCount={voters.length}
                  hasVoted={hasVoted}
                  onToggle={() => toggleVote(attraction.id, nickname, hasVoted)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
