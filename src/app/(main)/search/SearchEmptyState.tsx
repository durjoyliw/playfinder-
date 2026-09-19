"use client";

import {
  addRecentSearch,
  getRecentSearches,
  removeRecentSearch,
} from "@/lib/recent-searches";
import { TrendingWidget } from "@/components/playfinder/trending-widget";
import { Clock, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BROWSE_SPORTS } from "./search-constants";

interface SearchEmptyStateProps {
  onSearch: (query: string) => void;
}

export function SearchEmptyState({ onSearch }: SearchEmptyStateProps) {
  const [recent, setRecent] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setRecent(getRecentSearches());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRemove = (term: string) => {
    removeRecentSearch(term);
    refresh();
  };

  const handleRecentClick = (term: string) => {
    addRecentSearch(term);
    onSearch(term);
  };

  const handleSportClick = (label: string) => {
    onSearch(label);
  };

  return (
    <div className="px-4 py-4">
      {/* DesktopRightRail already shows this at xl and up, so this is the
          mobile/tablet home for it -- matches X, where trending lives on
          the Explore/Search tab rather than in the feed itself. */}
      <div className="mb-6 xl:hidden">
        <TrendingWidget />
      </div>

      {recent.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
            Recent searches
          </h2>
          <ul>
            {recent.map((term) => (
              <li
                key={term}
                className="flex items-center gap-3 border-b border-[#111] py-3"
              >
                <Clock className="h-4 w-4 flex-shrink-0 text-[#666666]" />
                <button
                  type="button"
                  onClick={() => handleRecentClick(term)}
                  className="min-w-0 flex-1 text-left text-sm text-white"
                >
                  {term}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(term)}
                  className="rounded-full p-1 text-[#666666] hover:bg-[#1a1a1a] hover:text-white"
                  aria-label={`Remove ${term}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
          Browse by sport
        </h2>
        <div className="flex flex-wrap gap-2">
          {BROWSE_SPORTS.map((sport) => (
            <button
              key={sport.id}
              type="button"
              onClick={() => handleSportClick(sport.label)}
              className="rounded-[10px] border border-[#2a2f2a] bg-[#131614] px-3 py-2 text-sm text-[#f2f5ef] transition-colors hover:border-[#a1c217]"
            >
              {sport.emoji} {sport.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
