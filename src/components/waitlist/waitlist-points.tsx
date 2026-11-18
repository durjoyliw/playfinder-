import { Hash, ImageIcon, MapPin, UsersRound } from "lucide-react";

/** What's coming after the beta. Kept short and concrete. */
export const COMING_NEXT = [
  {
    icon: UsersRound,
    title: "Groups",
    body: "For your club, your area or your sport.",
  },
  {
    icon: Hash,
    title: "Hashtags and @mentions",
    body: "Follow a conversation and pull your mates into it.",
  },
  {
    icon: ImageIcon,
    title: "Photos in posts",
    body: "Share the match, the view from the hill, the scoreboard.",
  },
  {
    icon: MapPin,
    title: "More cities",
    body: "Opening up beyond the beta, one city at a time.",
  },
] as const;

export function WaitlistPoints({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-2.5" : "space-y-4"}>
      {COMING_NEXT.map(({ icon: Icon, title, body }) => (
        <li key={title} className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--pf-volt-rgb)/0.12)] text-[var(--pf-volt-text)]">
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <span className="min-w-0 pt-0.5">
            <span className="block text-sm font-semibold text-[var(--pf-c-ink-ffffff)]">
              {title}
            </span>
            {!compact && (
              <span className="block text-sm text-[var(--pf-c-ink-a3a3a3)]">
                {body}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
