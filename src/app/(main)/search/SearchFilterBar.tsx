"use client";

import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import { cn } from "@/lib/utils";

interface SearchFilterBarProps<T extends string> {
  pills: readonly { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}

/**
 * One-line, horizontally scrollable filter pills. Swipe on touch; wheel or
 * click-and-drag with a mouse. The row runs edge to edge (pills scroll under
 * the screen edge instead of clipping at the page padding), with a fade on
 * the right hinting there is more.
 */
export function SearchFilterBar<T extends string>({
  pills,
  active,
  onChange,
}: SearchFilterBarProps<T>) {
  const { scrollRef, onMouseDown, wasDragged } =
    useHorizontalScroll<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      onMouseDown={onMouseDown}
      role="tablist"
      aria-label="Filter results"
      className="flex cursor-grab select-none gap-2 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 py-3 [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
    >
      {pills.map((pill) => {
        const isActive = active === pill.id;
        return (
          <button
            key={pill.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              if (wasDragged()) return;
              onChange(pill.id);
            }}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-[20px] border px-4 py-2 text-sm outline-none transition-[background-color,border-color,color,transform] duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--pf-volt)]",
              isActive
                ? "border-[var(--pf-volt)] bg-[var(--pf-volt)] font-bold text-[var(--pf-on-accent)]"
                : "border-[var(--pf-border)] bg-[var(--pf-surface)] font-medium text-[var(--pf-text-3)]",
            )}
          >
            {pill.label}
          </button>
        );
      })}
      {/* Keeps the last pill clear of the fade when scrolled to the end. */}
      <span className="w-6 shrink-0" aria-hidden />
    </div>
  );
}
