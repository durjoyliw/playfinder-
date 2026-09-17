"use client";

import {
  formatDistanceMiles,
  type DiscoverPlace,
  type DiscoverTabType,
  type OpenStatus,
} from "@/lib/discover-places";
import { getSportIcon } from "@/lib/discover-sport-icons";
import { getSportEmoji } from "@/lib/sports";
import { getSportColour } from "@/lib/sport-visuals";
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
  const SportIcon = getSportIcon(sportKey);
  const sportColour = getSportColour(sportKey);
  const sportEmoji = getSportEmoji(sportKey);

  if (loading) {
    return (
      <div>
        <div className="mb-3.5 px-4">
          <div className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
            Glasgow · within 5 mi
          </div>
          <div className="mt-1 text-[22px] font-bold leading-tight tracking-[-0.03em] text-[#f2f5ef]">
            {isVenues ? "Play near you" : "Local clubs"}
          </div>
        </div>
        <div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="mx-4 mb-2.5 h-[96px] animate-pulse rounded-2xl bg-[#131614]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="px-4">
        <div className="mb-3.5">
          <div className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
            Glasgow · within 5 mi
          </div>
          <div className="mt-1 text-[22px] font-bold leading-tight tracking-[-0.03em] text-[#f2f5ef]">
            {isVenues ? "Play near you" : "Local clubs"}
          </div>
        </div>
        <p className="py-5 text-center text-sm text-[#7e8a7e]">
          Try a different sport or check back later
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3.5 px-4">
        <div className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
          Glasgow · within 5 mi
        </div>
        <div className="mt-1 text-[22px] font-bold leading-tight tracking-[-0.03em] text-[#f2f5ef]">
          {isVenues ? "Play near you" : "Local clubs"}
        </div>
      </div>

      <div className="px-4">
        {places.map((place) => (
          <div
            key={place.id}
            className="mb-2.5 flex gap-3 rounded-2xl border border-[#2a2f2a] bg-[#131614] p-3 transition-transform active:scale-[0.98]"
          >
            <a
              href={`https://maps.google.com/?q=${place.lat},${place.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 gap-3"
            >
              <div
                className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px]"
                style={{
                  background: isVenues
                    ? `${sportColour}1f`
                    : "rgba(86,204,242,0.12)",
                }}
              >
                {isVenues ? (
                  <>
                    <div className="grid h-full w-full place-items-center">
                      <SportIcon
                        className="h-7 w-7"
                        color={sportColour}
                        stroke={1.75}
                      />
                    </div>
                    <span className="absolute bottom-1 left-1 text-base drop-shadow">
                      {sportEmoji}
                    </span>
                  </>
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <IconUsers className="h-6 w-6 text-[#56ccf2]" stroke={1.75} />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-sm font-semibold leading-tight text-[#f2f5ef]">
                  {place.name}
                </p>
                {place.address && (
                  <p className="mt-1 truncate text-xs text-[#7e8a7e]">
                    {place.address}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-2">
                  <span className="font-dm-mono text-xs font-medium text-[#c9f31d]">
                    {formatDistanceMiles(place.distanceMiles)}
                  </span>
                  {place.openStatus != null && place.openStatus !== "" && (
                    <OpenStatusBadge status={place.openStatus} />
                  )}
                  {place.bookable && (
                    <span className="ml-auto rounded-md border border-[#56ccf2]/20 bg-[rgba(86,204,242,0.1)] px-2 py-1 font-dm-mono text-[8px] font-semibold tracking-[0.08em] text-[#56ccf2]">
                      BOOKABLE
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
                className="self-center shrink-0 text-xs font-semibold text-[#c9f31d] hover:underline"
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
