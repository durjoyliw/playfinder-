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
}

const KNOWN_OPEN_STATUSES: OpenStatus[] = ["open", "closed", "closes_soon"];

function OpenStatusBadge({ status }: { status: OpenStatus | string }) {
  if (
    typeof status === "string" &&
    !KNOWN_OPEN_STATUSES.includes(status as OpenStatus)
  ) {
    const lower = status.toLowerCase();
    const isOpen = lower.includes("open");
    const isCloses = lower.includes("close");
    return (
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] font-semibold",
          isCloses && !isOpen
            ? "bg-[#2a1a1a] text-[#f87171]"
            : "bg-[#1a2a1a] text-[#4ade80]",
        )}
      >
        {status}
      </span>
    );
  }

  const normalized = status as OpenStatus;
  if (normalized === "open") {
    return (
      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#1a2a1a] text-[#4ade80]">
        Open
      </span>
    );
  }
  if (normalized === "closes_soon") {
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
}: DiscoverPlaceListProps) {
  const isVenues = tabType === "venues";
  const sectionTitle = isVenues ? "Nearby venues" : "Nearby clubs";
  const SportIcon = getSportIcon(sportKey);

  if (loading) {
    return (
      <div>
        <div
          className="mb-3 flex items-center justify-between"
          style={{ margin: "0 16px 12px" }}
        >
          <span className="text-[15px] font-bold text-white">{sectionTitle}</span>
        </div>
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="mx-4 h-[72px] animate-pulse rounded-xl bg-[#1a1a1a]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="px-4">
        <p className="text-center text-[13px] text-[#555555]">
          Try a different sport or check back later
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center justify-between"
        style={{ margin: "0 16px 12px" }}
      >
        <span className="text-[15px] font-bold text-white">{sectionTitle}</span>
        <span className="text-[13px] font-bold text-[#C9F31D]">
          {places.length} found
        </span>
      </div>

      <div>
        {places.map((place) => (
          <div
            key={place.id}
            className="mx-4 mb-2.5 flex items-center gap-3 rounded-xl border border-[#222222] bg-[#161616]"
            style={{ padding: 14 }}
          >
            <a
              href={`https://maps.google.com/?q=${place.lat},${place.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 items-center gap-3 transition-colors active:opacity-80"
            >
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-[10px]",
                  isVenues
                    ? "bg-[rgba(201,243,29,0.1)]"
                    : "bg-[rgba(55,138,221,0.1)]",
                )}
                style={{ width: 44, height: 44 }}
              >
                {isVenues ? (
                  <SportIcon className="h-5 w-5 text-[#C9F31D]" stroke={1.75} />
                ) : (
                  <IconUsers className="h-5 w-5 text-[#378ADD]" stroke={1.75} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-white">{place.name}</p>
                {place.address && (
                  <p
                    className="truncate text-[#888888]"
                    style={{ fontSize: 12, marginTop: 2 }}
                  >
                    {place.address}
                  </p>
                )}
                <div
                  className="flex flex-wrap items-center gap-1.5"
                  style={{ marginTop: 6 }}
                >
                  <span className="text-[12px] font-bold text-[#C9F31D]">
                    {formatDistanceMiles(place.distanceMiles)}
                  </span>
                  {place.openStatus != null && place.openStatus !== "" && (
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

            {place.website != null && place.website !== "" && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[12px] font-semibold text-[#C9F31D] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Visit →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
