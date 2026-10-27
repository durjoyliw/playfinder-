"use client";

import {
  DISCOVER_SPORT_FILTERS,
  type DiscoverSportFilterId,
} from "@/lib/discover";
import { cn } from "@/lib/utils";

interface SportPillSelectorProps {
  selectedSport: DiscoverSportFilterId;
  onSelectSport: (sport: DiscoverSportFilterId) => void;
  activeCount?: number;
}

export function SportPillSelector({
  selectedSport,
  onSelectSport,
  activeCount = 0,
}: SportPillSelectorProps) {
  return (
    <div className="border-b border-[var(--pf-c-line-2a2a2a)] bg-[var(--pf-c-fill-0d0d0d)] px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-c-ink-666666)]">
          Filter Active Hotspots
        </span>
        <span className="text-[10px] font-medium text-[var(--pf-c-ink-666666)]">
          {activeCount} Venues Active
        </span>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DISCOVER_SPORT_FILTERS.map((sport) => (
          <button
            key={sport.id}
            type="button"
            onClick={() => onSelectSport(sport.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200",
              selectedSport === sport.id
                ? "bg-[var(--pf-volt)] text-[var(--pf-on-accent)] shadow-md shadow-[rgb(var(--pf-volt-rgb)/0.3)]"
                : "border border-[var(--pf-c-line-2a2a2a)] bg-[var(--pf-c-fill-161616)] text-[var(--pf-c-ink-f0f0f0)] active:scale-95",
            )}
          >
            {sport.id === "all" && (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  selectedSport === sport.id ? "bg-black" : "bg-[var(--pf-volt)]",
                )}
              />
            )}
            {sport.label}
          </button>
        ))}
      </div>
    </div>
  );
}
