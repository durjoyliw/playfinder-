"use client";

import { getInitials } from "@/lib/settings";
import kyInstance from "@/lib/ky";
import type { SearchPlayerResult } from "@/app/(main)/search/SearchPlayerRow";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Persistent desktop search entry point, used in the right rail on every
 * wide-column page (Home/Profile/Search). Shows live player results as the
 * user types -- X-style -- reusing the same /api/search/players endpoint
 * the full Search page's Profiles tab already queries, so results stay
 * consistent. Enter (or the "See all results" row) navigates to the full
 * /search?q=... results page; nothing changes about how that page works.
 */
export function DesktopSearchBox() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const { data, isFetching } = useQuery({
    queryKey: ["search", "players", "preview", debouncedQuery],
    queryFn: () =>
      kyInstance
        .get("/api/search/players", { searchParams: { q: debouncedQuery } })
        .json<{ players: SearchPlayerResult[] }>(),
    enabled: debouncedQuery.length > 0,
  });

  const results = (data?.players ?? []).slice(0, 6);
  const showDropdown = isOpen && query.trim().length > 0;

  const goToResults = (q: string) => {
    const trimmed = q.trim();
    setIsOpen(false);
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2.5 rounded-full border border-[#2a2f2a] bg-[#131614] px-4 py-3 transition-colors focus-within:border-[#353c34]">
        <Search className="h-[18px] w-[18px] shrink-0 text-[#7e8a7e]" />
        <input
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              goToResults(query);
            } else if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder="Search PlayFinder"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#f2f5ef] outline-none placeholder:text-[#7e8a7e]"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#2a2f2a] bg-[#131614] shadow-xl">
          {isFetching && results.length === 0 ? (
            <p className="px-4 py-3.5 text-sm text-[#7e8a7e]">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3.5 text-sm text-[#7e8a7e]">
              No players found for &ldquo;{debouncedQuery}&rdquo;
            </p>
          ) : (
            <>
              {results.map((player) => (
                <Link
                  key={player.id}
                  href={`/users/${player.username}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#1a1e1b]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#c9f31d] text-xs font-bold text-[#0a0b0a]">
                    {player.avatarUrl ? (
                      <img
                        src={player.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(player.displayName)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#f2f5ef]">
                      {player.displayName}
                    </p>
                    <p className="truncate text-xs text-[#7e8a7e]">
                      @{player.username}
                    </p>
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => goToResults(query)}
                className="flex w-full items-center gap-3 border-t border-[#2a2f2a] px-4 py-3 text-left text-sm font-semibold text-[#c9f31d] transition-colors hover:bg-[#1a1e1b]"
              >
                Search for &ldquo;{query.trim()}&rdquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
