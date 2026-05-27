"use client";

import { formatDistanceMiles, type DiscoverPlace } from "@/lib/discover-places";
import { getDisplayArea } from "@/lib/location";

interface SearchVenueRowProps {
  venue: DiscoverPlace;
}

export function SearchVenueRow({ venue }: SearchVenueRowProps) {
  const area = venue.address ? getDisplayArea(venue.address) : "Glasgow";
  const visitHref =
    venue.website ??
    `https://maps.google.com/?q=${venue.lat},${venue.lng}`;

  return (
    <div className="flex items-center gap-3 border-b border-[#111] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-bold text-white">{venue.name}</p>
        <p className="mt-0.5 text-xs text-[#666666]">
          {area} · {formatDistanceMiles(venue.distanceMiles)}
        </p>
      </div>
      <a
        href={visitHref}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-xs font-semibold text-[#C9F31D] hover:underline"
      >
        Visit →
      </a>
    </div>
  );
}
