import { Routes, Route, NavLink } from 'react-router-dom';
import VotePage from './pages/VotePage';
import ItineraryPage from './pages/ItineraryPage';
import './firebase';

export default function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <NavLink to="/vote">投票</NavLink>
        <NavLink to="/itinerary">行程</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<VotePage />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
      </Routes>
    </div>
  );
}
