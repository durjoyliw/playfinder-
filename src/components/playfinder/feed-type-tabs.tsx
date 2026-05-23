"use client";

import type { FeedTypeTab } from "@/lib/feed-type-tabs";
import { cn } from "@/lib/utils";

const TABS: { id: FeedTypeTab; label: string }[] = [
  { id: "players", label: "Players" },
  { id: "teams", label: "Teams" },
  { id: "posts", label: "Posts" },
];

interface FeedTypeTabsProps {
  activeTab: FeedTypeTab;
  onTabChange: (tab: FeedTypeTab) => void;
}

export function FeedTypeTabs({ activeTab, onTabChange }: FeedTypeTabsProps) {
  return (
    <div
      className="flex border-b border-[#1f1f1f]"
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
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 border-b-2 py-2.5 text-center text-sm font-semibold transition-colors",
              isActive
                ? "border-[#C9F31D] text-white"
                : "border-transparent text-[#555555]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
