"use client";

import { cn } from "@/lib/utils";

export interface SlidingPillTab<T extends string = string> {
  id: T;
  label: string;
}

interface SlidingPillTabsProps<T extends string> {
  tabs: readonly SlidingPillTab<T>[];
  activeId: T;
  onTabChange: (id: T) => void;
  ariaLabel: string;
  /** Sliding pill fill. Default volt (#a1c217). */
  activePillClassName?: string;
}

/**
 * Shared Social/Arena-style sliding pill tabs (feed-type-tabs visual).
 * Two equal flex-1 tabs; pill slides under the active label.
 */
export function SlidingPillTabs<T extends string>({
  tabs,
  activeId,
  onTabChange,
  ariaLabel,
  activePillClassName = "bg-[#a1c217]",
}: SlidingPillTabsProps<T>) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeId),
  );
  const isSecond = activeIndex === 1;

  return (
    <div
      className="relative flex gap-1 px-4 pb-2 pt-2.5"
      role="tablist"
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          "pointer-events-none absolute bottom-2 top-2.5 w-[calc(50%-20px)] rounded-[10px] transition-[left,right,background] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
          activePillClassName,
        )}
        style={{
          left: isSecond ? "auto" : 16,
          right: isSecond ? 16 : "auto",
        }}
        aria-hidden
      />
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
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
