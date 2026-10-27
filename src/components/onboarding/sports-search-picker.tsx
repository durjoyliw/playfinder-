"use client";

import {
  filterOnboardingSports,
  getOnboardingSport,
  POPULAR_SPORT_IDS,
} from "@/lib/onboarding-sports";
import { cn } from "@/lib/utils";
import { Check, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

interface SportsSearchPickerProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function SportsSearchPicker({ selected, onChange }: SportsSearchPickerProps) {
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = useMemo(() => filterOnboardingSports(search), [search]);
  const showDropdown = focused && search.trim().length > 0;

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const remove = (id: string) => {
    onChange(selected.filter((s) => s !== id));
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search sports..."
          className="w-full rounded-xl border border-[var(--pf-c-line-333333)] bg-[var(--pf-c-fill-1a1a1a)] px-4 py-3.5 text-base text-[var(--pf-c-ink-ffffff)] placeholder:text-[var(--pf-c-ink-6b6b6b)] focus:border-[var(--pf-volt)] focus:outline-none pf-card"
        />
        {showDropdown && (
          <ul className="ob-dropdown-in absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-[var(--pf-c-line-333333)] bg-[var(--pf-c-fill-1a1a1a)] py-1 shadow-lg pf-card">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--pf-c-ink-6b7280)]">No sports found</li>
            ) : (
              filtered.map((sport) => {
                const isSelected = selected.includes(sport.id);
                return (
                  <li key={sport.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggle(sport.id)}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors",
                        isSelected ? "bg-[var(--pf-volt-tint)]" : "hover:bg-[var(--pf-c-fill-262626)]",
                      )}
                    >
                      <span className="text-[var(--pf-c-ink-ffffff)]">
                        {sport.emoji} {sport.name}
                      </span>
                      {isSelected ? (
                        <Check className="h-5 w-5 text-[var(--pf-volt-text)]" />
                      ) : (
                        <Plus className="h-5 w-5 text-[var(--pf-c-ink-6b7280)]" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {!showDropdown && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--pf-c-ink-6b7280)]">
            Popular
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SPORT_IDS.map((id) => {
              const sport = getOnboardingSport(id);
              if (!sport) return null;
              const isSelected = selected.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className={cn(
                    "ob-lift rounded-full border px-3 py-1.5 text-sm font-medium",
                    isSelected
                      ? "border-[var(--pf-volt)] bg-[var(--pf-volt)] text-[var(--pf-on-accent)]"
                      : "border-[var(--pf-c-line-333333)] bg-[var(--pf-c-fill-161616)] text-[var(--pf-c-ink-ffffff)] hover:border-[var(--pf-c-line-444444)]",
                  )}
                >
                  {sport.emoji} {sport.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--pf-c-ink-6b7280)]">
          Selected ({selected.length})
        </p>
        {selected.length === 0 ? (
          <p className="text-sm text-[var(--pf-c-ink-6b7280)]">Pick at least one sport to continue.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const sport = getOnboardingSport(id);
              if (!sport) return null;
              return (
                <span
                  key={id}
                  className="ob-lift inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-volt)] px-3 py-1.5 text-sm font-medium text-[var(--pf-on-accent)]"
                >
                  {sport.emoji} {sport.name}
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    className="rounded-full p-0.5 hover:bg-black/10"
                    aria-label={`Remove ${sport.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
