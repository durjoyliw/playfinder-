"use client";

import type { FeedSportTab } from "@/lib/feed-sport-tabs";
import { getSportIcon } from "@/lib/discover-sport-icons";
import { getSportColour } from "@/lib/sport-visuals";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface SportTabsProps {
  tabs: FeedSportTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SportTabs({ tabs, activeTab, onTabChange }: SportTabsProps) {
  return (
    <div className="min-w-0">
      <div
        id="sport-tabs-scroll"
        role="tablist"
        aria-label="Filter by sport"
        className="flex gap-[7px] overflow-x-auto px-4 pb-1.5 pt-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((sport) => {
          const isActive = activeTab === sport.id;
          const SportIcon = getSportIcon(sport.id);
          const chipColour =
            sport.id === "all" ? "#c9f31d" : getSportColour(sport.id);

          return (
            <button
              key={sport.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(sport.id)}
              className={cn(
                "flex min-h-[34px] shrink-0 items-center gap-[5px] whitespace-nowrap rounded-full border px-[13px] py-2 text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(.2,.8,.2,1)] active:scale-95",
                isActive
                  ? "border-transparent text-[#0a0b0a]"
                  : "border-[#2a2f2a] bg-[#131614] text-[#7e8a7e]",
              )}
              style={
                isActive
                  ? {
                      background: chipColour,
                      boxShadow: `0 2px 12px ${chipColour}4d`,
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
