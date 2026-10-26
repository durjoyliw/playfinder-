"use client";

import type { FeedSportTab } from "@/lib/feed-sport-tabs";
import { getSportIcon } from "@/lib/discover-sport-icons";
import { getSportColour } from "@/lib/sport-visuals";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface SportTabsProps {
  tabs: FeedSportTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SportTabs({ tabs, activeTab, onTabChange }: SportTabsProps) {
  const { scrollRef, onMouseDown, wasDragged } =
    useHorizontalScroll<HTMLDivElement>();

  return (
    <div className="min-w-0">
      <div
        ref={scrollRef}
        id="sport-tabs-scroll"
        role="tablist"
        aria-label="Filter by sport"
        onMouseDown={onMouseDown}
        className="flex cursor-grab select-none gap-[7px] overflow-x-auto px-4 pb-3.5 pt-2.5 [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((sport) => {
          const isActive = activeTab === sport.id;
          const SportIcon = getSportIcon(sport.id);
          // "All" follows the accent; sport chips keep their own fixed colours.
          const isAllChip = sport.id === "all";
          const chipColour = isAllChip
            ? "var(--pf-volt)"
            : getSportColour(sport.id);
          const chipGlow = isAllChip
            ? "rgb(var(--pf-volt-rgb) / 0.3)"
            : `${chipColour}4d`;

          return (
            <button
              key={sport.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                if (wasDragged()) return;
                onTabChange(sport.id);
              }}
              className={cn(
                "ease-[cubic-bezier(.2,.8,.2,1)] flex min-h-[34px] shrink-0 items-center gap-[5px] whitespace-nowrap rounded-full border px-[13px] py-2 text-xs font-semibold transition-all duration-200 active:scale-95",
                isActive
                  ? cn(
                      "border-transparent",
                      isAllChip
                        ? "text-[var(--pf-on-accent)]"
                        : "text-[#0a0b0a]",
                    )
                  : "border-[#2a2f2a] bg-[#131614] text-[#7e8a7e] hover:-translate-y-0.5 hover:border-[#353c34]",
              )}
              style={
                isActive
                  ? {
                      background: chipColour,
                      boxShadow: `0 2px 12px ${chipGlow}`,
                    }
                  : undefined
              }
            >
              {sport.id === "all" ? (
                <Zap className="h-[15px] w-[15px]" />
              ) : (
                <SportIcon className="h-[15px] w-[15px]" />
              )}
              <span>{sport.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
