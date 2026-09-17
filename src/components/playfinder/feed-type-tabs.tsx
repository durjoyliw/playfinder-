"use client";

import type { FeedTypeTab } from "@/lib/feed-type-tabs";
import { cn } from "@/lib/utils";

const TABS: { id: FeedTypeTab; label: string; tone: "social" | "arena" }[] = [
  // Visual order: SOCIAL (left) then ARENA (right). IDs/logic unchanged.
  { id: "posts", label: "Social", tone: "social" },
  { id: "players", label: "Arena", tone: "arena" },
];

interface FeedTypeTabsProps {
  activeTab: FeedTypeTab;
  onTabChange: (tab: FeedTypeTab) => void;
}

export function FeedTypeTabs({ activeTab, onTabChange }: FeedTypeTabsProps) {
  const isArena = activeTab === "players" || activeTab === "teams";

  return (
    <div
      className="relative flex gap-1 px-4 pb-2 pt-2.5"
      role="tablist"
      aria-label="Feed type"
    >
      <div
        className={cn(
          "pointer-events-none absolute bottom-2 top-2.5 w-[calc(50%-20px)] rounded-[10px] transition-[left,background] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
          isArena ? "bg-[#56ccf2]" : "bg-[#c9f31d]",
        )}
        style={{ left: isArena ? "auto" : 16, right: isArena ? 16 : "auto" }}
        aria-hidden
      />
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative z-[2] flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2.5 text-sm font-bold transition-colors duration-200",
              isActive ? "text-[#0a0b0a]" : "text-[#7e8a7e]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
