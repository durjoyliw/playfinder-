import { SPORT_ICONS, SPORT_EMOJI, SPORT_COLOURS, STATUS_INFO, type Status } from '@/data';

export function Avatar({ initials, colour, size = 'md', ring = false }: {
  initials: string;
  colour: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
}) {
  return (
    <div className={`avatar ${size}`} style={{ background: colour }}>
      {initials}
      {ring && <span className="ring" style={{ color: colour }} />}
    </div>
  );
}

export function StatusBadge({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' | 'lg' }) {
  const info = STATUS_INFO[status];
  return (
    <span className={`status-badge ${size}`} style={{ color: info.colour, borderColor: `${info.colour}33` }}>
      <span className="dot" style={{ background: info.colour, boxShadow: `0 0 8px ${info.colour}` }} />
      {info.label}
    </span>
  );
}

export function SportPills({ selected, onSelect, sports }: {
  selected: string;
  onSelect: (sport: string) => void;
  sports: readonly string[];
}) {
  return (
    <div className="sport-pills">
      {sports.map((sport) => {
        const Icon = SPORT_ICONS[sport as keyof typeof SPORT_ICONS];
        return (
          <button
            key={sport}
            className={`sport-pill ${selected === sport ? 'active' : ''}`}
            onClick={() => onSelect(sport)}
          >
            {Icon && <Icon size={16} />}
            {sport}
          </button>
        );
      })}
    </div>
  );
}

export function SportTag({ sport }: { sport: string }) {
  const colour = SPORT_COLOURS[sport];
  const emoji = SPORT_EMOJI[sport];
  return (
    <span className="sport-tag" style={{ color: colour }}>
      {emoji} {sport}
    </span>
  );
}
