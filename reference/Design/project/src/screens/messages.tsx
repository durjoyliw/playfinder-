import { CONVERSATIONS } from '@/data';
import { Avatar } from '@/components/shared';

export function MessagesScreen() {
  return (
    <div className="messages-screen fade-in">
      <div className="messages-header">
        <div className="eyebrow">INBOX</div>
        <div className="h2" style={{ marginTop: '4px' }}>Messages</div>
      </div>
      <div className="messages-list">
        {CONVERSATIONS.map(conv => (
          <div key={conv.id} className="message-row">
            <div style={{ position: 'relative' }}>
              <Avatar initials={conv.initials} colour={conv.avatarColour} size="md" />
              {conv.online && <span className="online-dot" style={{ position: 'absolute', bottom: 0, right: 0 }} />}
            </div>
            <div className="info">
              <div className="name">{conv.name}</div>
              <div className="preview">{conv.lastMessage}</div>
            </div>
            <div className="right">
              <span className="time">{conv.timestamp}</span>
              {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
