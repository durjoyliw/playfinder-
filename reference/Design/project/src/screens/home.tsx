import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  SOCIAL_POSTS, ARENA_POSTS, SPORTS_LIST, CURRENT_USER,
} from '@/data';
import { SportPills } from '@/components/shared';
import { SocialPostCard, ArenaPostCard } from '@/components/post-cards';

export function HomeScreen() {
  const [feedTab, setFeedTab] = useState<'social' | 'arena'>('social');
  const [selectedSport, setSelectedSport] = useState('All');

  const filteredSocial = selectedSport === 'All'
    ? SOCIAL_POSTS
    : SOCIAL_POSTS.filter(p => p.sport === selectedSport);

  const filteredArena = selectedSport === 'All'
    ? ARENA_POSTS
    : ARENA_POSTS.filter(p => p.sport === selectedSport);

  return (
    <div className="fade-in">
      <div className="home-hero">
        <div className="greeting">Good evening, {CURRENT_USER.name.split(' ')[0]}</div>
        <h1>Who's <span className="accent">playing?</span></h1>
      </div>

      <div style={{ padding: '18px 16px 0' }}>
        <SportPills selected={selectedSport} onSelect={setSelectedSport} sports={SPORTS_LIST} />
      </div>

      <div className="activity-strip">
        <div>
          <div className="count">127</div>
          <div className="label"><strong>athletes active</strong> nearby</div>
        </div>
        <div className="live-orb" />
      </div>

      <div className="feed-tabs">
        <button
          className={`feed-tab ${feedTab === 'social' ? 'active' : ''}`}
          data-tone="social"
          onClick={() => setFeedTab('social')}
        >
          Social <span className="count">{filteredSocial.length}</span>
        </button>
        <button
          className={`feed-tab ${feedTab === 'arena' ? 'active' : ''}`}
          data-tone="arena"
          onClick={() => setFeedTab('arena')}
        >
          Arena <span className="count">{filteredArena.length}</span>
        </button>
      </div>

      {feedTab === 'social' ? (
        <div className="social-feed">
          {filteredSocial.map(post => (
            <SocialPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="arena-feed">
          {filteredArena.map(post => (
            <ArenaPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
