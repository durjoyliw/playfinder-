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
  return (
    <div
      className="mx-4 mt-[22px] flex border-b border-[#2a2f2a]"
      role="tablist"
      aria-label="Feed type"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-tone={tab.tone}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative min-h-12 flex-1 py-4 text-center text-sm font-semibold transition-colors",
              isActive ? "text-[#f2f5ef]" : "text-[#7e8a7e]",
              isActive &&
                "after:absolute after:bottom-[-1px] after:left-1/4 after:right-1/4 after:h-[3px] after:rounded-[3px]",
              isActive && tab.tone === "social" && "after:bg-[#c9f31d]",
              isActive && tab.tone === "arena" && "after:bg-[#56ccf2]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
