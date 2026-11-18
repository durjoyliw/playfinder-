"use client";

import { safeHttpUrl } from "@/lib/safe-url";
import {
  formatDistanceMiles,
  type DiscoverPlace,
  type DiscoverTabType,
  type OpenStatus,
} from "@/lib/discover-places";
import { getSportIcon } from "@/lib/discover-sport-icons";
import { getSportEmoji } from "@/lib/sports";
import { getSportColour } from "@/lib/sport-visuals";
import { getSportDisplay } from "@/lib/onboarding-sports";
import { cn } from "@/lib/utils";
import Link from "next/link";
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
            ? "bg-[var(--pf-status-danger-bg)] text-[var(--pf-status-danger-fg)]"
            : "bg-[var(--pf-status-success-bg)] text-[var(--pf-status-success-fg)]",
        )}
      >
        {status}
      </span>
    );
  }

  const normalized = status as OpenStatus;
  if (normalized === "open") {
    return (
      <span className="rounded bg-[var(--pf-status-success-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--pf-status-success-fg)]">
        Open
      </span>
    );
  }
  if (normalized === "closes_soon") {
    return (
      <span className="rounded bg-[var(--pf-status-danger-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--pf-status-danger-fg)]">
        Closes soon
      </span>
    );
  }
  return (
    <span className="rounded bg-[var(--pf-status-danger-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--pf-status-danger-fg)]">
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
  const sportName = getSportDisplay(sportKey).name;
  // The API widens to 10 miles when nothing is within 5.
  const radiusMiles = places.some((p) => p.distanceMiles > 5) ? 10 : 5;

  if (loading) {
    return (
      <div>
        <div className="mb-3.5 px-4">
          <div className="text-[12px] font-medium text-[var(--pf-c-ink-7e8a7e)]">
            Glasgow · within 5 mi
          </div>
          <div className="mt-1 text-[22px] font-bold leading-tight tracking-[-0.03em] text-[var(--pf-c-ink-f2f5ef)]">
            {isVenues ? "Play near you" : "Local clubs"}
          </div>
        </div>
        <div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="pf-card mx-4 mb-2.5 h-[96px] animate-pulse rounded-2xl bg-[var(--pf-c-fill-131614)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    // Compact, so it fits above the bottom bar when the sheet is lowered.
    return (
      <div className="px-4 pb-2">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] px-3.5 py-3 pf-card">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold leading-snug text-[var(--pf-c-ink-f2f5ef)]">
              No {sportName.toLowerCase()} {isVenues ? "venues" : "clubs"} on
              the map yet
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--pf-c-ink-7e8a7e)]">
              Know one? Tell us and we&apos;ll add it.
            </p>
          </div>
          <Link
            href={`/settings/feedback?from=${encodeURIComponent("/discover")}&message=${encodeURIComponent(
              `Missing ${isVenues ? "venue" : "club"} for ${sportName}: `,
            )}`}
            className="pf-hit inline-flex h-10 shrink-0 items-center rounded-xl bg-[var(--pf-volt)] px-4 text-sm font-bold text-[var(--pf-on-accent)]"
          >
            Tell us
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3.5 px-4">
        <div className="text-[12px] font-medium text-[var(--pf-c-ink-7e8a7e)]">
          Glasgow · within {radiusMiles} mi
        </div>
        <div className="mt-1 text-[22px] font-bold leading-tight tracking-[-0.03em] text-[var(--pf-c-ink-f2f5ef)]">
          {isVenues ? "Play near you" : "Local clubs"}
        </div>
      </div>

      <div className="px-4">
        {places.map((place) => (
          <div
            key={place.id}
            className="pf-card mb-2.5 flex gap-3 rounded-2xl border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] p-3 transition-transform active:scale-[0.98]"
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
                    <IconUsers
                      className="h-6 w-6 text-[#56ccf2]"
                      stroke={1.75}
                    />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-sm font-semibold leading-tight text-[var(--pf-c-ink-f2f5ef)]">
                  {place.name}
                </p>
                {place.address && (
                  <p className="mt-1 truncate text-xs text-[var(--pf-c-ink-7e8a7e)]">
                    {place.address}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-2">
                  <span className="font-dm-mono text-xs font-medium text-[var(--pf-volt-text)]">
                    {formatDistanceMiles(place.distanceMiles)}
                  </span>
                  {place.openStatus != null && place.openStatus !== "" && (
                    <OpenStatusBadge status={place.openStatus} />
                  )}
                  {place.bookable && (
                    <span className="ml-auto rounded-md border border-[#56ccf2]/20 bg-[rgba(86,204,242,0.1)] px-2 py-1 text-[11px] font-semibold text-[#56ccf2]">
                      Bookable
                    </span>
                  )}
                </div>
              </div>
            </a>

            {safeHttpUrl(place.website) && (
              <a
                href={safeHttpUrl(place.website) ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-hit-lg shrink-0 self-center text-xs font-semibold text-[var(--pf-volt-text)] hover:underline"
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
