"use client";

import {
  formatDistanceMiles,
  type DiscoverPlace,
  type DiscoverTabType,
  type OpenStatus,
} from "@/lib/discover-places";
import { getSportIcon } from "@/lib/discover-sport-icons";
import { cn } from "@/lib/utils";
import { IconUsers } from "@tabler/icons-react";

interface DiscoverPlaceListProps {
  places: DiscoverPlace[];
  tabType: DiscoverTabType;
  sportKey: string;
  loading: boolean;
  error: string | null;
}

function OpenStatusBadge({ status }: { status: OpenStatus }) {
  if (status === "open") {
    return (
      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#1a2a1a] text-[#4ade80]">
        Open
      </span>
    );
  }
  if (status === "closes_soon") {
    return (
      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#2a1a1a] text-[#f87171]">
        Closes soon
      </span>
    );
  }
  return (
    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#2a1a1a] text-[#f87171]">
      Closed
    </span>
  );
}

export function DiscoverPlaceList({
  places,
  tabType,
  sportKey,
  loading,
  error,
}: DiscoverPlaceListProps) {
  const isVenues = tabType === "venues";
  const sectionTitle = isVenues ? "Nearby venues" : "Nearby clubs";
  const SportIcon = getSportIcon(sportKey);

  if (loading) {
    return (
      <div className="mt-4 px-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[15px] font-bold text-white">{sectionTitle}</span>
        </div>
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl bg-[#1a1a1a]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || places.length === 0) {
    return (
      <div className="mt-4 px-4">
        <p className="text-center text-[13px] text-[#555555]">
          Try a different sport or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between px-4">
        <span className="text-[15px] font-bold text-white">{sectionTitle}</span>
        <span className="text-[13px] font-bold text-[#C9F31D]">
          {places.length} found
        </span>
      </div>

      <div className="space-y-2.5">
        {places.map((place) => (
          <a
            key={place.id}
            href={`https://maps.google.com/?q=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-4 flex gap-3 rounded-xl border border-[#222222] bg-[#161616] p-3.5 transition-colors active:bg-[#1c1c1c]"
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]",
                isVenues ? "bg-[rgba(201,243,29,0.1)]" : "bg-[rgba(55,138,221,0.1)]",
              )}
            >
              {isVenues ? (
                <SportIcon className="h-5 w-5 text-[#C9F31D]" stroke={1.75} />
              ) : (
                <IconUsers className="h-5 w-5 text-[#378ADD]" stroke={1.75} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{place.name}</p>
              {place.address && (
                <p className="mt-0.5 truncate text-xs text-[#888888]">
                  {place.address}
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-[#C9F31D]">
                  {formatDistanceMiles(place.distanceMiles)}
                </span>
                {place.openStatus && (
                  <OpenStatusBadge status={place.openStatus} />
                )}
                {place.bookable && (
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#1a1a2a] text-[#60a5fa]">
                    Bookable
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
