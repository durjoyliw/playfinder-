import { useState } from 'react';
import {
  SOCIAL_POSTS, ARENA_POSTS, SPORTS_LIST, CURRENT_USER,
} from '@/data';
import { SportPills } from '@/components/shared';
import { SocialPostCard, ArenaPostCard } from '@/components/post-cards';

export function HomeScreen({ onCompose }: { onCompose: () => void }) {
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
      <div className="home-sticky-header">
        <div className="home-filter-row">
          <SportPills selected={selectedSport} onSelect={setSelectedSport} sports={SPORTS_LIST} />
        </div>

        <button className="broadcast-prompt" onClick={onCompose}>
          <span className="broadcast-avatar" style={{ background: CURRENT_USER.avatarColour }}>
            {CURRENT_USER.initials.slice(0, 1)}
          </span>
          <span className="broadcast-copy">Need players or a game?</span>
          <span className="broadcast-action">Broadcast</span>
        </button>

        <div className="segmented-control">
          <button
            className={`segment ${feedTab === 'social' ? 'active' : ''}`}
            onClick={() => setFeedTab('social')}
          >
            Social
            <span className="count">{filteredSocial.length}</span>
          </button>
          <button
            className={`segment ${feedTab === 'arena' ? 'active' : ''}`}
            onClick={() => setFeedTab('arena')}
          >
            Arena
            <span className="count">{filteredArena.length}</span>
          </button>
          <div className={`segment-indicator ${feedTab}`} />
        </div>
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
