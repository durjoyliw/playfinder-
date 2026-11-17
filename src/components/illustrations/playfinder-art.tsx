/**
 * On-brand illustrations used instead of stock photos (landing page and the
 * onboarding side panel). Pure SVG drawn with the theme tokens, so they follow
 * the chosen base (dark/light) and accent colour automatically.
 */

const ACCENT = "var(--pf-volt)";
const LINE = "var(--pf-c-line-2a2a2a)";
const SURFACE = "var(--pf-c-fill-161616)";
const SURFACE_2 = "var(--pf-c-fill-1f1f1f)";
const INK = "var(--pf-c-ink-ffffff)";
const MUTED = "var(--pf-c-ink-a3a3a3)";

interface ArtProps {
  className?: string;
  title?: string;
}

function Frame({
  className,
  title,
  viewBox,
  children,
}: ArtProps & { viewBox: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Soft accent glow + faint dot grid behind every scene. */
function Backdrop({ w, h, id }: { w: number; h: number; id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-glow`} cx="30%" cy="15%" r="80%">
          <stop style={{ stopColor: ACCENT }} offset="0%" stopOpacity="0.22" />
          <stop style={{ stopColor: ACCENT }} offset="60%" stopOpacity="0" />
        </radialGradient>
        <pattern
          id={`${id}-dots`}
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <circle style={{ fill: LINE }} cx="2" cy="2" r="1.1" />
        </pattern>
      </defs>
      <rect style={{ fill: SURFACE }} width={w} height={h} />
      <rect
        style={{ fill: `url(#${id}-dots)` }}
        width={w}
        height={h}
        opacity="0.7"
      />
      <rect style={{ fill: `url(#${id}-glow)` }} width={w} height={h} />
    </>
  );
}

/** A player marker: filled = in, dashed ring with "+" = open spot. */
function Player({
  x,
  y,
  open = false,
  label,
}: {
  x: number;
  y: number;
  open?: boolean;
  label?: string;
}) {
  if (open) {
    return (
      <g>
        <circle
          style={{ fill: "none", stroke: ACCENT }}
          cx={x}
          cy={y}
          r="17"
          strokeWidth="2.5"
          strokeDasharray="5 5"
        />
        <path
          style={{ stroke: ACCENT }}
          d={`M${x - 6} ${y}h12M${x} ${y - 6}v12`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    );
  }
  return (
    <g>
      <circle style={{ fill: ACCENT }} cx={x} cy={y} r="17" />
      {label ? (
        <text
          style={{ fill: "var(--pf-on-accent)" }}
          x={x}
          y={y + 5}
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fontFamily="inherit"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

/** Hero: top-down five-a-side pitch with two open spots. */
export function PitchArt({ className, title }: ArtProps) {
  const W = 600;
  const H = 720;
  return (
    <Frame className={className} title={title} viewBox={`0 0 ${W} ${H}`}>
      <Backdrop w={W} h={H} id="pitch" />
      <g
        transform="translate(90 90)"
        style={{ fill: "none", stroke: LINE }}
        strokeWidth="3"
      >
        <rect
          style={{ stroke: ACCENT }}
          width="420"
          height="540"
          rx="28"
          strokeOpacity="0.55"
        />
        <line x1="0" y1="270" x2="420" y2="270" />
        <circle cx="210" cy="270" r="62" />
        <circle style={{ fill: LINE }} cx="210" cy="270" r="5" />
        <path d="M120 0v70a20 20 0 0 0 20 20h140a20 20 0 0 0 20-20V0" />
        <path d="M120 540v-70a20 20 0 0 1 20-20h140a20 20 0 0 1 20 20v70" />
        <rect
          style={{ stroke: INK }}
          x="170"
          y="-14"
          width="80"
          height="14"
          rx="4"
          strokeOpacity="0.5"
        />
        <rect
          style={{ stroke: INK }}
          x="170"
          y="540"
          width="80"
          height="14"
          rx="4"
          strokeOpacity="0.5"
        />
      </g>
      {/* Your side: three in, two open */}
      <Player x={300} y={575} label="GK" />
      <Player x={190} y={480} label="J" />
      <Player x={410} y={480} label="R" />
      <Player x={235} y={395} open />
      <Player x={365} y={395} open />
      {/* Ball */}
      <g transform="translate(300 360)">
        <circle style={{ fill: INK }} r="11" />
        <path style={{ fill: SURFACE }} d="M-4 -3l4-3 4 3-1.5 5h-5z" />
      </g>
      {/* Opposition (muted) */}
      {[
        [300, 165],
        [200, 250],
        [400, 250],
        [250, 320],
        [350, 320],
      ].map(([x, y]) => (
        <circle
          style={{ fill: SURFACE_2, stroke: LINE }}
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="15"
          strokeWidth="2.5"
        />
      ))}
    </Frame>
  );
}

/** Feature: a broadcast pinging out to nearby players. */
export function BroadcastArt({ className, title }: ArtProps) {
  const W = 640;
  const H = 960;
  const cx = 320;
  const cy = 420;
  return (
    <Frame className={className} title={title} viewBox={`0 0 ${W} ${H}`}>
      <Backdrop w={W} h={H} id="broadcast" />
      {[90, 170, 250, 330].map((r, i) => (
        <circle
          style={{ fill: "none", stroke: ACCENT }}
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          strokeOpacity={0.5 - i * 0.1}
          strokeWidth="2.5"
          strokeDasharray={i % 2 ? "2 10" : undefined}
          strokeLinecap="round"
        />
      ))}
      {/* Players being reached */}
      {[
        [cx + 150, cy - 120, "A"],
        [cx - 190, cy - 60, "S"],
        [cx + 230, cy + 140, "K"],
        [cx - 120, cy + 230, "M"],
        [cx + 60, cy - 300, "T"],
      ].map(([x, y, l]) => (
        <Player key={String(l)} x={Number(x)} y={Number(y)} label={String(l)} />
      ))}
      {/* The broadcaster: a pin */}
      <g transform={`translate(${cx} ${cy})`}>
        <circle style={{ fill: ACCENT }} r="54" opacity="0.18" />
        <path
          style={{ fill: ACCENT }}
          d="M0 34C0 34 -30 2 -30 -16a30 30 0 1 1 60 0C30 2 0 34 0 34z"
        />
        <circle style={{ fill: "var(--pf-on-accent)" }} cy="-16" r="11" />
      </g>
    </Frame>
  );
}

/** Feature: an athlete profile card. */
export function ProfileArt({ className, title }: ArtProps) {
  const W = 640;
  const H = 480;
  return (
    <Frame className={className} title={title} viewBox={`0 0 ${W} ${H}`}>
      <Backdrop w={W} h={H} id="profile" />
      <g transform="translate(150 70)">
        <rect
          style={{ fill: SURFACE_2, stroke: LINE }}
          width="340"
          height="300"
          rx="26"
          strokeWidth="2"
        />
        <circle style={{ fill: ACCENT }} cx="70" cy="74" r="36" />
        <text
          style={{ fill: "var(--pf-on-accent)" }}
          x="70"
          y="84"
          textAnchor="middle"
          fontSize="28"
          fontWeight="800"
          fontFamily="inherit"
        >
          JV
        </text>
        <rect
          style={{ fill: INK }}
          x="124"
          y="54"
          width="150"
          height="14"
          rx="7"
          opacity="0.85"
        />
        <rect
          style={{ fill: MUTED }}
          x="124"
          y="80"
          width="96"
          height="10"
          rx="5"
          opacity="0.6"
        />
        {[
          [32, 140, 120],
          [164, 140, 140],
          [32, 186, 150],
        ].map(([x, y, w], i) => (
          <g key={i}>
            <rect
              style={{ fill: i === 0 ? ACCENT : "none", stroke: ACCENT }}
              x={x}
              y={y}
              width={w}
              height="32"
              rx="16"
              strokeWidth="2"
              opacity={i === 0 ? 1 : 0.8}
            />
            <rect
              style={{ fill: i === 0 ? "var(--pf-on-accent)" : ACCENT }}
              x={Number(x) + 18}
              y={Number(y) + 12}
              width={Number(w) - 36}
              height="8"
              rx="4"
              opacity="0.8"
            />
          </g>
        ))}
        <line
          style={{ stroke: LINE }}
          x1="32"
          y1="246"
          x2="308"
          y2="246"
          strokeWidth="2"
        />
        <circle style={{ fill: ACCENT }} cx="44" cy="272" r="6" />
        <rect
          style={{ fill: MUTED }}
          x="60"
          y="267"
          width="130"
          height="10"
          rx="5"
          opacity="0.6"
        />
      </g>
    </Frame>
  );
}

/** Glasgow-flavoured map: the Clyde and a few neighbourhood pins. */
export function CityArt({ className, title }: ArtProps) {
  const W = 800;
  const H = 700;
  const pins: Array<[number, number, string]> = [
    [190, 250, "Partick"],
    [330, 200, "West End"],
    [520, 300, "Dennistoun"],
    [420, 520, "Southside"],
    [230, 470, "Govan"],
  ];
  return (
    <Frame className={className} title={title} viewBox={`0 0 ${W} ${H}`}>
      <Backdrop w={W} h={H} id="city" />
      {/* Street grid */}
      <g style={{ stroke: LINE }} strokeWidth="2" opacity="0.8">
        {[120, 220, 320, 420, 520, 620].map((x) => (
          <line key={`v${x}`} x1={x} y1="60" x2={x + 40} y2="660" />
        ))}
        {[140, 260, 560, 620].map((y) => (
          <line key={`h${y}`} x1="60" y1={y} x2="760" y2={y - 30} />
        ))}
      </g>
      {/* The Clyde */}
      <path
        style={{ fill: "none", stroke: ACCENT }}
        d="M-20 420C120 360 190 430 300 390S470 300 560 360 720 420 840 380"
        strokeOpacity="0.35"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        style={{ fill: "none", stroke: ACCENT }}
        d="M-20 420C120 360 190 430 300 390S470 300 560 360 720 420 840 380"
        strokeOpacity="0.7"
        strokeWidth="3"
        strokeDasharray="10 12"
      />
      {pins.map(([x, y, name]) => (
        <g key={name} transform={`translate(${x} ${y})`}>
          <path
            style={{ fill: ACCENT }}
            d="M0 22C0 22 -20 1 -20 -11a20 20 0 1 1 40 0C20 1 0 22 0 22z"
          />
          <circle style={{ fill: "var(--pf-on-accent)" }} cy="-11" r="7" />
          <rect
            style={{ fill: SURFACE_2, stroke: LINE }}
            x="28"
            y="-26"
            width={name.length * 11 + 22}
            height="30"
            rx="15"
            strokeWidth="1.5"
          />
          <text
            style={{ fill: INK }}
            x="39"
            y="-6"
            fontSize="15"
            fontWeight="600"
            fontFamily="inherit"
          >
            {name}
          </text>
        </g>
      ))}
    </Frame>
  );
}

/** Sports picker: a loose grid of sport chips. */
export function SportsArt({ className, title }: ArtProps) {
  const W = 600;
  const H = 720;
  const chips: Array<[number, number, number, boolean]> = [
    [70, 200, 200, true],
    [290, 200, 230, false],
    [100, 280, 170, false],
    [290, 280, 210, true],
    [60, 360, 240, false],
    [320, 360, 190, false],
    [120, 440, 210, true],
    [350, 440, 160, false],
  ];
  return (
    <Frame className={className} title={title} viewBox={`0 0 ${W} ${H}`}>
      <Backdrop w={W} h={H} id="sports" />
      {chips.map(([x, y, w, on], i) => (
        <g key={i}>
          <rect
            style={{
              fill: on ? ACCENT : SURFACE_2,
              stroke: on ? ACCENT : LINE,
            }}
            x={x}
            y={y}
            width={w}
            height="54"
            rx="27"
            strokeWidth="2"
          />
          <circle
            style={{ fill: on ? "var(--pf-on-accent)" : MUTED }}
            cx={x + 30}
            cy={y + 27}
            r="10"
            opacity="0.85"
          />
          <rect
            style={{ fill: on ? "var(--pf-on-accent)" : MUTED }}
            x={x + 52}
            y={y + 22}
            width={w - 80}
            height="10"
            rx="5"
            opacity="0.7"
          />
        </g>
      ))}
    </Frame>
  );
}

/** Skill levels: four rising bars. */
export function LevelsArt({ className, title }: ArtProps) {
  const W = 600;
  const H = 720;
  return (
    <Frame className={className} title={title} viewBox={`0 0 ${W} ${H}`}>
      <Backdrop w={W} h={H} id="levels" />
      {[120, 200, 290, 400].map((h, i) => (
        <rect
          style={{
            fill: i === 2 ? ACCENT : SURFACE_2,
            stroke: i === 2 ? ACCENT : LINE,
          }}
          key={h}
          x={110 + i * 105}
          y={540 - h}
          width="70"
          height={h}
          rx="14"
          strokeWidth="2"
        />
      ))}
      <line
        style={{ stroke: LINE }}
        x1="80"
        y1="560"
        x2="520"
        y2="560"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Frame>
  );
}
