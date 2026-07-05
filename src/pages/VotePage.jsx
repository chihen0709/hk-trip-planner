import { useEffect, useState } from 'react';
import { subscribeToAttractions, addAttraction, deleteAttraction } from '../lib/attractions';
import { submitVote, subscribeToAllVotes } from '../lib/votes';
import { CategoryIcon, getCategoryLabel } from '../lib/categoryIcons';
import VoteCard from '../components/VoteCard';
import NicknamePrompt from '../components/NicknamePrompt';
import AddAttractionForm from '../components/AddAttractionForm';
import CategoryDonutChart from '../components/CategoryDonutChart';

export default function VotePage() {
  const [attractions, setAttractions] = useState([]);
  const [votesByAttraction, setVotesByAttraction] = useState({});
  const [pendingAttraction, setPendingAttraction] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => subscribeToAttractions(setAttractions, setLoadError), []);
  useEffect(() => subscribeToAllVotes(setVotesByAttraction, setLoadError), []);

  const categories = [...new Set(attractions.map((a) => a.category))];

  const filtered = attractions.filter((a) => {
    const matchesCategory = activeCategory === 'all' || a.category === activeCategory;
    const matchesSearch = a.name.toLowerCase().includes(searchText.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const grouped = filtered.reduce((acc, attraction) => {
    acc[attraction.category] = acc[attraction.category] || [];
    acc[attraction.category].push(attraction);
    return acc;
  }, {});

  async function handleNicknameConfirm(name) {
    if (!pendingAttraction) return;

    const existingVoters = votesByAttraction[pendingAttraction.id] || [];
    if (existingVoters.includes(name)) {
      throw new Error('這個暱稱已經投過這個景點了，票數不會重複計算。');
    }

    await submitVote(pendingAttraction.id, name);
    setVotesByAttraction((current) => ({
      ...current,
      [pendingAttraction.id]: [...(current[pendingAttraction.id] || []), name],
    }));
    setPendingAttraction(null);
  }

  async function handleAddAttraction(data) {
    const created = await addAttraction(data);
    setAttractions((current) => [
      ...current.filter((item) => item.id !== created.id),
      created,
    ]);
    setShowAddForm(false);
  }

  function handleDeleteAttraction(attraction) {
    const shouldDelete = window.confirm(`確定要刪除「${attraction.name}」嗎？同名重複項目也會一起從畫面移除。`);
    if (!shouldDelete) return;

    deleteAttraction(attraction);
    setAttractions((current) => current.filter((item) => item.name !== attraction.name));
  }

  return (
    <div className="vote-page">
      <div className="vote-page-header">
        <CategoryDonutChart attractions={attractions} />
        <button className="add-attraction-button" onClick={() => setShowAddForm(true)}>
          新增候選景點
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="search"
          className="search-input"
          aria-label="搜尋景點名稱"
          placeholder="搜尋名稱"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          className={`filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          全部
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-pill ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            <CategoryIcon category={category} size={16} />
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {loadError && (
        <p className="load-error">
          Firebase 讀取暫時失敗，畫面先顯示內建備份資料。錯誤: {loadError.code || loadError.message}
        </p>
      )}
      {!loadError && attractions.length === 0 && <p className="load-empty">景點載入中…</p>}

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h2 className="section-title">
            <CategoryIcon category={category} size={22} />
            {getCategoryLabel(category)}
          </h2>
          <div className="card-grid">
            {items.map((attraction) => (
              <VoteCard
                key={attraction.id}
                attraction={attraction}
                voteCount={(votesByAttraction[attraction.id] || []).length}
                onVote={() => {
                  setPendingAttraction(attraction);
                }}
                onDelete={() => handleDeleteAttraction(attraction)}
              />
            ))}
          </div>
        </section>
      ))}

      {pendingAttraction && (
        <NicknamePrompt
          title="留下您的投票足跡"
          description={`您正在投給「${pendingAttraction.name}」。請輸入暱稱，讓大家知道是誰推薦了這間好店！`}
          submitLabel="確認投票"
          onSubmit={handleNicknameConfirm}
          onCancel={() => setPendingAttraction(null)}
        />
      )}
      {showAddForm && (
        <AddAttractionForm onSubmit={handleAddAttraction} onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}
