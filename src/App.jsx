import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { getNickname, setNickname } from './lib/nickname';
import VotePage from './pages/VotePage';
import ItineraryPage from './pages/ItineraryPage';
import './firebase';

export default function App() {
  const [nickname, setNicknameState] = useState(() => getNickname());

  function handleSetNickname(name) {
    setNickname(name);
    setNicknameState(name);
  }

  return (
    <div className="app">
      <nav className="navbar">
        <NavLink to="/vote">投票</NavLink>
        <NavLink to="/itinerary">行程</NavLink>
        {nickname && <span className="nickname-badge">{nickname}</span>}
      </nav>
      <Routes>
        <Route path="/" element={<VotePage nickname={nickname} onSetNickname={handleSetNickname} />} />
        <Route path="/vote" element={<VotePage nickname={nickname} onSetNickname={handleSetNickname} />} />
        <Route path="/itinerary" element={<ItineraryPage nickname={nickname} />} />
      </Routes>
    </div>
  );
}
