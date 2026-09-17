import { useState } from 'react';
import { Plus, MapPin, Clock3, Send, X, Zap, Users } from 'lucide-react';
import { CURRENT_USER, SPORTS_LIST, SPORT_EMOJI } from '@/data';
import { Avatar } from './shared';

export function Composer({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'broadcast' | 'arena'>('broadcast');
  const [text, setText] = useState('');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="composer-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <div className="head">
          <h2>Create</h2>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="mode-toggle">
          <button className={`mode-btn ${mode === 'broadcast' ? 'active' : ''}`} onClick={() => setMode('broadcast')}>
            <div className="mode-title">Broadcast</div>
            <div className="mode-desc">Share something with the community</div>
          </button>
          <button className={`mode-btn ${mode === 'arena' ? 'active' : ''}`} onClick={() => setMode('arena')}>
            <div className="mode-title">Arena Invite</div>
            <div className="mode-desc">Find players. Create a game.</div>
          </button>
        </div>

        <div className="user-row">
          <Avatar initials={CURRENT_USER.initials} colour={CURRENT_USER.avatarColour} size="sm" />
          <span>Posting as <b>{CURRENT_USER.name}</b></span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mode === 'broadcast'
            ? "What's happening in your sports world?"
            : "What are you looking for? Describe the game..."}
        />

        {mode === 'arena' && (
          <div className="arena-fields fade-in">
            <div className="field">
              <label>Sport</label>
              <select defaultValue="Football">
                {SPORTS_LIST.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s}>{SPORT_EMOJI[s]} {s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label><Clock3 size={14} /></label>
              <input type="text" placeholder="e.g. Tonight at 19:00" />
            </div>
            <div className="field">
              <label><MapPin size={14} /></label>
              <input type="text" placeholder="Location, e.g. Powerleague Townhead" />
            </div>
            <div className="field">
              <label><Users size={14} /></label>
              <input type="number" placeholder="Players needed" min={1} max={20} />
            </div>
          </div>
        )}

        <div className="footer">
          <span className="chip"><MapPin size={13} /> Glasgow</span>
          {mode === 'broadcast' && <span className="chip"><Zap size={13} /> Sport tag</span>}
          <button className="publish-btn">
            {mode === 'broadcast' ? 'Broadcast' : 'Post Arena'}
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
