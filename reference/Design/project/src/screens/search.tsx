import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MessageCircle, UserPlus, Check, ChevronLeft } from 'lucide-react';
import { OTHER_PLAYERS, SOCIAL_POSTS, ARENA_POSTS, VENUES, SPORT_EMOJI, STATUS_INFO } from '@/data';
import { Avatar, StatusBadge } from '@/components/shared';
import { SocialPostCard } from '@/components/post-cards';

type FilterTab = 'profiles' | 'posts' | 'arena' | 'venues' | 'clubs';

const FILTERS: { id: FilterTab; label: string; count: number }[] = [
  { id: 'profiles', label: 'People', count: OTHER_PLAYERS.length },
  { id: 'posts', label: 'Posts', count: SOCIAL_POSTS.length },
  { id: 'arena', label: 'Arena', count: ARENA_POSTS.length },
  { id: 'venues', label: 'Venues', count: VENUES.length },
  { id: 'clubs', label: 'Clubs', count: 0 },
];

export function SearchScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('profiles');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const results = useMemo(() => {
    const q = query.toLowerCase();
    if (activeFilter === 'profiles') {
      return OTHER_PLAYERS.filter(p =>
        !q || p.name.toLowerCase().includes(q) || p.handle.includes(q)
      );
    }
    return [];
  }, [query, activeFilter]);

  const toggleAdd = (id: string) => {
    setAddedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="search-screen fade-in">
      <div className="search-bar">
        <button className="search-back" onClick={onBack}><ChevronLeft size={22} /></button>
        <div className="search-input-wrap">
          <Search size={20} className="search-icon" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search players, games, venues..."
          />
        </div>
      </div>

      <div className="search-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`search-filter ${activeFilter === f.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
            {f.count > 0 && <span className="count">{f.count}</span>}
          </button>
        ))}
      </div>

      <div className="search-results">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div className="eyebrow">GLASGOW · NEAR YOU</div>
            <div className="h2" style={{ marginTop: '4px' }}>
              {activeFilter === 'profiles' ? `${results.length} profiles` : FILTERS.find(f => f.id === activeFilter)?.label}
            </div>
          </div>
          <button style={{ color: 'var(--text-3)', display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {activeFilter === 'profiles' && results.map(player => (
          <div key={player.id} className="search-result-card">
            <Avatar initials={player.initials} colour={player.avatarColour} size="lg" />
            <div className="info">
              <div className="name">
                {player.name}
                {player.verified && <span style={{ color: 'var(--volt)' }}>✓</span>}
              </div>
              <div className="handle">{player.handle}</div>
              <div style={{ marginTop: '8px' }}>
                <StatusBadge status={player.status} size="sm" />
              </div>
              <div className="tags">
                {player.sports.map(s => (
                  <span key={s.sport} className="tag">{SPORT_EMOJI[s.sport]} {s.sport}</span>
                ))}
                <span className="tag">{player.city}</span>
              </div>
            </div>
            <div className="actions">
              <button className="dm-btn"><MessageCircle size={20} /></button>
              <button
                className={`add-btn ${addedIds.has(player.id) ? 'added' : ''}`}
                onClick={() => toggleAdd(player.id)}
              >
                {addedIds.has(player.id) ? (<><Check size={15} /> Added</>) : (<><UserPlus size={15} /> Add</>)}
              </button>
            </div>
          </div>
        ))}

        {activeFilter === 'posts' && (
          <div className="social-feed" style={{ padding: 0 }}>
            {SOCIAL_POSTS.filter(p => !query || p.text.toLowerCase().includes(query.toLowerCase())).map(post => (
              <SocialPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {activeFilter === 'arena' && (
          <div style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center', padding: '40px 20px' }}>
            Arena results appear here.
          </div>
        )}
        {activeFilter === 'venues' && (
          <div style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center', padding: '40px 20px' }}>
            Venue results appear here.
          </div>
        )}
        {activeFilter === 'clubs' && (
          <div style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center', padding: '40px 20px' }}>
            Club results appear here.
          </div>
        )}
      </div>
    </div>
  );
}
