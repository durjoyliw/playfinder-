import {
  House, Compass, MessageCircle, CircleUserRound, Plus,
  Zap, Bell, MapPin, Search,
} from 'lucide-react';
import { type Screen } from '@/App';

export function BottomNav({ screen, go, onCompose }: {
  screen: Screen;
  go: (s: Screen) => void;
  onCompose: () => void;
}) {
  return (
    <nav className="bottom-nav">
      <button className={`nav-item ${screen === 'home' ? 'active' : ''}`} onClick={() => go('home')}>
        <House size={24} /><span className="label">Home</span>
      </button>
      <button className={`nav-item ${screen === 'discover' ? 'active' : ''}`} onClick={() => go('discover')}>
        <Compass size={24} /><span className="label">Discover</span>
      </button>
      <button className="compose-fab" onClick={onCompose} aria-label="Create post">
        <Plus size={26} />
      </button>
      <button className={`nav-item ${screen === 'messages' ? 'active' : ''}`} onClick={() => go('messages')}>
        <MessageCircle size={24} /><span className="label">Messages</span>
      </button>
      <button className={`nav-item ${screen === 'profile' ? 'active' : ''}`} onClick={() => go('profile')}>
        <CircleUserRound size={24} /><span className="label">Profile</span>
      </button>
    </nav>
  );
}

export function TopBar({ onSearch }: { onSearch: () => void }) {
  return (
    <header className="topbar">
      <span className="topbar-logo"><Zap size={20} fill="currentColor" /></span>
      <div className="spacer" />
      <button className="icon-btn" onClick={onSearch} aria-label="Search">
        <Search size={20} />
      </button>
      <button className="icon-btn" aria-label="Change location">
        <MapPin size={20} />
      </button>
      <button className="icon-btn" style={{ position: 'relative' }} aria-label="Notifications">
        <Bell size={20} /><span className="badge-dot" />
      </button>
    </header>
  );
}
