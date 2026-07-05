import { useState, useEffect } from 'react';
import { subscribeToAttractions, addAttraction } from '../lib/attractions';
import { subscribeToAllVotes, toggleVote } from '../lib/votes';
import { getCategoryIcon } from '../lib/categoryIcons';
import VoteCard from '../components/VoteCard';
import NicknamePrompt from '../components/NicknamePrompt';
import AddAttractionForm from '../components/AddAttractionForm';
import CategoryDonutChart from '../components/CategoryDonutChart';

export default function VotePage({ nickname, onSetNickname }) {
  const [attractions, setAttractions] = useState([]);
  const [votesByAttraction, setVotesByAttraction] = useState({});
  const [pendingVoteId, setPendingVoteId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => subscribeToAttractions(setAttractions, setLoadError), []);
  useEffect(() => subscribeToAllVotes(setVotesByAttraction), []);

  const categories = [...new Set(attractions.map((a) => a.category))];

  const filtered = attractions.filter((a) => {
    const matchesCategory = activeCategory === 'all' || a.category === activeCategory;
    const matchesSearch = a.name.toLowerCase().includes(searchText.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const grouped = filtered.reduce((acc, a) => {
    acc[a.category] = acc[a.category] || [];
    acc[a.category].push(a);
    return acc;
  }, {});

  async function handleToggle(attraction, hasVoted) {
    if (!nickname) {
      setPendingVoteId(attraction.id);
      return;
    }

    setVotesByAttraction((current) => {
      const voters = new Set(current[attraction.id] || []);
      if (hasVoted) voters.delete(nickname);
      else voters.add(nickname);
      return { ...current, [attraction.id]: [...voters] };
    });
    await toggleVote(attraction.id, nickname, hasVoted);
  }

  async function handleNicknameConfirm(name) {
    onSetNickname(name);
    if (pendingVoteId) {
      setVotesByAttraction((current) => {
        const voters = new Set(current[pendingVoteId] || []);
        voters.add(name);
        return { ...current, [pendingVoteId]: [...voters] };
      });
      await toggleVote(pendingVoteId, name, false);
    }
    setPendingVoteId(null);
  }

  async function handleAddAttraction(data) {
    setSaveError(null);
    try {
      const created = await addAttraction(data);
      setAttractions((current) => [
        ...current.filter((item) => item.id !== created.id),
        created,
      ]);
      setShowAddForm(false);
    } catch {
      setSaveError('Firebase 目前沒有成功回寫，已先存到這台裝置；請稍後重整確認是否同步到大家的清單。');
      setShowAddForm(false);
    }
  }

  return (
    <div className="vote-page">
      <div className="vote-page-header">
        <CategoryDonutChart attractions={attractions} />
        <button className="add-attraction-button" onClick={() => setShowAddForm(true)}>
          ➕ 新增候選景點
        </button>
      </div>
      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 搜尋名稱"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          className={`filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          全部
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`filter-pill ${activeCategory === c ? 'active' : ''}`}
            onClick={() => setActiveCategory(c)}
          >
            {getCategoryIcon(c)} {c}
          </button>
        ))}
      </div>
      {loadError && (
        <p className="load-error">
          ⚠️ Firebase 讀取暫時失敗，畫面先顯示內建備份資料。錯誤:{loadError.code || loadError.message}
        </p>
      )}
      {saveError && <p className="load-error">{saveError}</p>}
      {!loadError && attractions.length === 0 && <p className="load-empty">景點載入中…</p>}
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h2>
            {getCategoryIcon(category)} {category}
          </h2>
          <div className="card-grid">
            {items.map((attraction) => {
              const voters = votesByAttraction[attraction.id] || [];
              const hasVoted = nickname ? voters.includes(nickname) : false;
              return (
                <VoteCard
                  key={attraction.id}
                  attraction={attraction}
                  voteCount={voters.length}
                  hasVoted={hasVoted}
                  onToggle={() => handleToggle(attraction, hasVoted)}
                />
              );
            })}
          </div>
        </section>
      ))}
      {pendingVoteId && (
        <NicknamePrompt
          title="留下您的投票足跡"
          submitLabel="確認投票"
          onSubmit={handleNicknameConfirm}
          onCancel={() => setPendingVoteId(null)}
        />
      )}
      {showAddForm && (
        <AddAttractionForm onSubmit={handleAddAttraction} onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}
