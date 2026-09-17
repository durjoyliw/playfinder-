import { useState } from 'react';
import { MapPin, CalendarDays, Pencil, Share2 } from 'lucide-react';
import {
  CURRENT_USER, STATUS_INFO, SPORT_EMOJI, SPORT_COLOURS, type Status, type Skill,
} from '@/data';
import { Avatar } from '@/components/shared';

const SKILL_LEVELS: Skill[] = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

function skillPipCount(level: Skill): number {
  return SKILL_LEVELS.indexOf(level) + 1;
}

export function ProfileScreen() {
  const [status, setStatus] = useState<Status>(CURRENT_USER.status);
  const statuses = Object.entries(STATUS_INFO);

  return (
    <div className="profile-screen fade-in">
      <div className="profile-cover">
        {CURRENT_USER.coverImage && <img src={CURRENT_USER.coverImage} alt="" />}
        <div className="cover-actions">
          <button className="cover-btn"><Share2 size={17} /></button>
          <button className="cover-btn"><Pencil size={17} /></button>
        </div>
      </div>

      <div className="profile-header">
        <div className="avatar-wrap">
          <Avatar
            initials={CURRENT_USER.initials}
            colour={CURRENT_USER.avatarColour}
            size="xl"
          />
          <div className="status-float">
            <span className="status-badge sm" style={{ color: STATUS_INFO[status].colour, borderColor: `${STATUS_INFO[status].colour}44`, background: 'var(--bg)' }}>
              <span className="dot" style={{ background: STATUS_INFO[status].colour, boxShadow: `0 0 8px ${STATUS_INFO[status].colour}` }} />
            </span>
          </div>
        </div>

        <div className="name">
          {CURRENT_USER.name}
        </div>
        <div className="handle">{CURRENT_USER.handle}</div>
        <div className="location">
          <MapPin size={13} /> {CURRENT_USER.city}, {CURRENT_USER.postcode}
          <span style={{ color: 'var(--text-4)', margin: '0 6px' }}>·</span>
          <CalendarDays size={13} /> Joined {CURRENT_USER.joinDate}
        </div>

        <div className="status-section">
          <div className="label">CURRENT STATUS</div>
          <div className="status-picker">
            {statuses.map(([key, info]) => (
              <button
                key={key}
                className={`status-option ${status === key ? 'selected' : ''}`}
                style={{ ['--option-colour' as string]: info.colour }}
                onClick={() => setStatus(key as Status)}
              >
                <span className="dot" style={{ background: info.colour }} />
                {info.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <div className="num">{CURRENT_USER.stats.games}</div>
          <div className="lbl">Games</div>
        </div>
        <div className="stat">
          <div className="num">{CURRENT_USER.stats.broadcasts}</div>
          <div className="lbl">Broadcasts</div>
        </div>
        <div className="stat">
          <div className="num">{CURRENT_USER.stats.teammates}</div>
          <div className="lbl">Teammates</div>
        </div>
      </div>

      <div className="resume-section">
        <div className="section-head">
          <div className="left">
            <p className="eyebrow">ATHLETE ID</p>
            <div className="h2">Sports Resume</div>
          </div>
          <button style={{ color: 'var(--text-3)', display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Pencil size={17} />
          </button>
        </div>

        <div className="resume-grid">
          {CURRENT_USER.sports.map(({ sport, level }) => {
            const colour = SPORT_COLOURS[sport] || 'var(--volt)';
            const pips = skillPipCount(level);
            return (
              <div key={sport} className="resume-card" style={{ ['--sport-colour' as string]: colour }}>
                <div className="bg-glow" />
                <div>
                  <div className="sport-emoji">{SPORT_EMOJI[sport] || '🏆'}</div>
                  <div className="sport-name">{sport}</div>
                </div>
                <div>
                  <div className="skill-bar">
                    {SKILL_LEVELS.map((_, i) => (
                      <div key={i} className={`skill-pip ${i < pips ? 'filled' : ''}`} />
                    ))}
                  </div>
                  <div className="skill-label">{level}</div>
                </div>
              </div>
            );
          })}
          <button className="resume-add">
            <span className="plus">+</span>
            Add a sport
          </button>
        </div>
      </div>

      <div className="story-section">
        <div className="section-head">
          <div className="left">
            <p className="eyebrow">IN MY OWN WORDS</p>
            <div className="h2">Athlete Story</div>
          </div>
        </div>
        <div className="story-card">
          <div className="quote-mark">"</div>
          <p className="text">{CURRENT_USER.bio}</p>
          <div className="meta">Last updated 2 days ago</div>
        </div>
      </div>
    </div>
  );
}
