"use client";

import { formatDistanceMiles, type DiscoverPlace } from "@/lib/discover-places";
import { getDisplayArea } from "@/lib/location";

interface SearchClubRowProps {
  club: DiscoverPlace;
}

export function SearchClubRow({ club }: SearchClubRowProps) {
  const area = club.address ? getDisplayArea(club.address) : "Glasgow";
  const visitHref =
    club.website ??
    `https://maps.google.com/?q=${club.lat},${club.lng}`;

  return (
    <div className="flex items-center gap-3 border-b border-[var(--pf-c-line-111111)] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[var(--pf-c-ink-ffffff)]">{club.name}</p>
        <p className="mt-0.5 text-xs text-[var(--pf-c-ink-666666)]">
          {area} · {formatDistanceMiles(club.distanceMiles)}
        </p>
      </div>
      <a
        href={visitHref}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-xs font-semibold text-[var(--pf-volt-text)] hover:underline"
      >
        Visit →
      </a>
    </div>
  );
}
