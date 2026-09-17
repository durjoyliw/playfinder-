import {
  Heart, MessageCircle, Share2, MoreHorizontal, BadgeCheck,
} from 'lucide-react';
import { useState } from 'react';
import { type SocialPost, type ArenaPost, SPORT_EMOJI, SPORT_COLOURS } from '@/data';
import { Avatar, StatusBadge } from './shared';

export function SocialPostCard({ post }: { post: SocialPost }) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <article className="social-post">
      <div className="post-head">
        <Avatar initials={post.author.initials} colour={post.author.avatarColour} size="md" />
        <div className="meta">
          <div className="name">
            {post.author.name}
            {post.author.verified && <BadgeCheck size={14} className="verified" />}
          </div>
          <div className="sub">
            <span className="sport-tag" style={{ color: SPORT_COLOURS[post.sport] }}>
              {SPORT_EMOJI[post.sport]} {post.sport}
            </span>
            <span className="dot-sep">·</span>
            <span>{post.city}</span>
            <span className="dot-sep">·</span>
            <span>{post.timestamp} ago</span>
          </div>
        </div>
        <button className="more"><MoreHorizontal size={18} /></button>
      </div>

      <p className="post-text">{post.text}</p>

      {post.image && (
        <div className="post-image">
          <img src={post.image} alt="" loading="lazy" />
        </div>
      )}

      <div className="post-actions">
        <button className={`post-action ${liked ? 'liked' : ''}`} onClick={toggleLike}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          {likeCount}
        </button>
        <button className="post-action">
          <MessageCircle size={18} />
          {post.comments}
        </button>
        <button className="post-action share" style={{ marginLeft: 'auto' }}>
          <Share2 size={18} />
        </button>
      </div>
    </article>
  );
}

export function ArenaPostCard({ post }: { post: ArenaPost }) {
  const spotsLeft = post.spotsTotal - post.spotsFilled;
  const fillPercent = (post.spotsFilled / post.spotsTotal) * 100;
  const isFull = spotsLeft === 0;
  const sportColour = SPORT_COLOURS[post.sport];
  const isUrgent = post.timeLabel === '19:00' || post.schedule === 'Tonight';

  const emptySlots = Array.from({ length: spotsLeft > 3 ? 3 : spotsLeft });

  return (
    <article className="arena-card" style={{ ['--sport-colour' as string]: sportColour }}>
      <div className="accent-bar" />
      {isUrgent && (
        <div className="arena-urgent-tag">
          ● LIVE SOON
        </div>
      )}
      <div className="body">
        <div className="head">
          <div className="info">
            <div className="title">{post.title}</div>
            <div className="by">by <b>{post.author.name}</b> · {post.timestamp} ago</div>
          </div>
          <div className="sport-chip">
            {SPORT_EMOJI[post.sport]} {post.sport}
          </div>
        </div>

        <p className="desc">{post.description}</p>

        <div className="arena-meta-grid">
          <div className="arena-meta-cell">
            <div className="label">
              <span>📅</span> WHEN
            </div>
            <div className="value">{post.schedule}</div>
          </div>
          <div className="arena-meta-cell">
            <div className="label">
              <span>⏰</span> TIME
            </div>
            <div className="value time">{post.timeLabel}</div>
          </div>
        </div>

        <div className="arena-spots">
          <div className="spots-info">
            <div className="spots-label">
              <b>{spotsLeft}</b> {spotsLeft === 1 ? 'spot' : 'spots'} available
            </div>
            <div className="progress">
              <div className="fill" style={{ width: `${fillPercent}%` }} />
            </div>
          </div>
          <div className="participants">
            {post.participants.map((p, i) => (
              <Avatar key={i} initials={p.initials} colour={p.colour} size="sm" />
            ))}
            {emptySlots.map((_, i) => (
              <div key={`empty-${i}`} className="empty-slot">+</div>
            ))}
          </div>
        </div>

        <button className={`arena-join ${isFull ? 'full' : ''}`}>
          {isFull ? 'Game Full' : `Join Game — ${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`}
        </button>
      </div>
    </article>
  );
}
