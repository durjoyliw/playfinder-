"use client";

import { DiscoverPlaceList } from "@/components/discover/discover-place-list";
import type { DiscoverPlace, DiscoverTabType } from "@/lib/discover-places";
import { cn } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";
import { Drawer } from "vaul";

/** Visible height of the sheet at "peek" (the default resting state). */
const PEEK_PX = 220;
/** First-render estimate of the collapsed bar until it is measured. */
const COLLAPSED_ESTIMATE_PX = 106;

type SnapName = "collapsed" | "peek" | "half" | "full";
/** Space left between the header and the sheet when fully open. */
const FULL_TOP_GAP_PX = 8;

export interface DiscoverVenueClubTabsProps {
  activeTab: DiscoverTabType;
  onTabChange: (tab: DiscoverTabType) => void;
  nearbyCount: number;
}

export function DiscoverVenueClubTabs({
  activeTab,
  onTabChange,
  nearbyCount,
}: DiscoverVenueClubTabsProps) {
  // Same layout/spacing/pill as Home Social/Arena (`feed-type-tabs.tsx`).
  // Styles duplicated here — FeedTypeTabs is wired to FeedTypeTab IDs.
  const tabs: { id: DiscoverTabType; label: string }[] = [
    { id: "venues", label: "Venues" },
    { id: "clubs", label: "Clubs" },
  ];
  const isClubs = activeTab === "clubs";

  return (
    <div className="shrink-0">
      <div
        className="relative flex gap-1 px-4 pb-2 pt-2.5"
        role="tablist"
        aria-label="Venues or clubs"
      >
        <div
          className="pointer-events-none absolute bottom-2 top-2.5 w-[calc(50%-20px)] rounded-[10px] bg-[var(--pf-volt)] transition-[left,background] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{
            left: isClubs ? "auto" : 16,
            right: isClubs ? 16 : "auto",
          }}
          aria-hidden
        />
        {tabs.map((tab) => {
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
                isActive ? "text-[var(--pf-on-accent)]" : "text-[var(--pf-c-ink-7e8a7e)]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className="px-4 pb-2 text-right font-dm-mono text-[11px] font-medium text-[var(--pf-c-ink-7e8a7e)]">
        {nearbyCount} nearby
      </p>
    </div>
  );
}

export interface VenueBottomSheetProps {
  /** The map area the sheet lives in. Snap points are measured from it. */
  boundsRef: RefObject<HTMLElement>;
  places: DiscoverPlace[];
  activeTab: DiscoverTabType;
  onTabChange: (tab: DiscoverTabType) => void;
  loading: boolean;
  sportKey: string;
}

/** Height of the map area + the viewport, re-measured on resize. */
function useAreaSize(ref: RefObject<HTMLElement>) {
  const [size, setSize] = useState<{ area: number; viewport: number } | null>(
    null,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const area = Math.round(el.getBoundingClientRect().height);
      const viewport = window.innerHeight;
      setSize((prev) =>
        prev && prev.area === area && prev.viewport === viewport
          ? prev
          : { area, viewport },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref]);

  return size;
}

/**
 * Live height of an element, via a callback ref so it starts measuring as
 * soon as the element mounts (the bar only renders once the sheet has sizes).
 */
function useElementHeight<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    if (!node) return;
    const measure = () =>
      setHeight(Math.round(node.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  const ref = useCallback((el: T | null) => setNode(el), []);
  return [ref, height] as const;
}

/**
 * Draggable venue sheet on mobile Discover (vaul).
 *
 * The sheet is exactly as tall as the map area (minus a small top gap) and
 * sits directly above the bottom nav, so "full" means no translation -- vaul
 * only lets the inner list scroll when the sheet is at rest at translateY(0).
 *
 * Snaps, lowest first: "collapsed" shows only the handle + Venues/Clubs bar
 * over the full map (Airbnb-style), then "peek", "half", "full". Swipe down
 * from peek to collapse; drag the bar up to expand again.
 *
 * vaul measures px snap points against `window.innerHeight` (it assumes a
 * full-screen drawer), so each visible height `v` is converted with
 * `v + viewport - sheetHeight`.
 */
export function VenueBottomSheet({
  boundsRef,
  places,
  activeTab,
  onTabChange,
  loading,
  sportKey,
}: VenueBottomSheetProps) {
  const size = useAreaSize(boundsRef);
  const [barRef, barHeight] = useElementHeight<HTMLDivElement>();
  const [snap, setSnap] = useState<SnapName>("peek");

  const sheetHeight = size ? Math.max(size.area - FULL_TOP_GAP_PX, 0) : 0;

  // Named snaps -> vaul px values. Snaps that collapse to the same height on
  // very short screens are merged (the higher name wins).
  const snaps = useMemo(() => {
    if (!size || sheetHeight === 0) return [];
    const collapsed = Math.min(barHeight ?? COLLAPSED_ESTIMATE_PX, sheetHeight);
    const peek = Math.min(Math.max(PEEK_PX, collapsed), sheetHeight);
    const half = Math.max(Math.round(size.area * 0.5), peek);
    const visible: [SnapName, number][] = [
      ["collapsed", collapsed],
      ["peek", peek],
      ["half", half],
      ["full", sheetHeight],
    ];
    const byHeight = new Map<number, SnapName>();
    visible.forEach(([name, v]) => byHeight.set(v, name));
    return Array.from(byHeight.entries())
      .sort(([a], [b]) => a - b)
      .map(([v, name]) => ({
        name,
        point: `${v + size.viewport - sheetHeight}px`,
      }));
  }, [size, sheetHeight, barHeight]);

  if (snaps.length === 0) return null;

  const snapPoints = snaps.map((s) => s.point);
  const active = snaps.find((s) => s.name === snap) ?? snaps[0];
  const isFull = active.name === "full";

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      noBodyStyles
      snapPoints={snapPoints}
      activeSnapPoint={active.point}
      setActiveSnapPoint={(point) => {
        const next = snaps.find((s) => s.point === String(point));
        if (next) setSnap(next.name);
      }}
      fadeFromIndex={snapPoints.length - 1}
    >
      <Drawer.Content
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="fixed inset-x-0 z-20 mx-auto flex max-w-[480px] flex-col rounded-t-[24px] border-t border-[rgb(var(--pf-contrast-rgb)/0.06)] bg-[var(--pf-bg)] outline-none"
        style={{
          height: sheetHeight,
          // Inline: Tailwind reads shadow-[var(..)] as a colour, not a box-shadow.
          boxShadow: "var(--pf-sheet-shadow)",
          bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Drawer.Title className="sr-only">Nearby venues</Drawer.Title>

        {/* The always-visible bar: what stays on screen when collapsed. */}
        <div ref={barRef} className="shrink-0">
          <div className="flex justify-center pb-2 pt-3">
            <Drawer.Handle
              aria-label="Drag to resize"
              className="!h-1 !w-10 !bg-[var(--pf-border-light)] !opacity-100"
            />
          </div>

          <DiscoverVenueClubTabs
            activeTab={activeTab}
            onTabChange={onTabChange}
            nearbyCount={places.length}
          />
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 overscroll-y-contain",
            isFull ? "overflow-y-auto" : "overflow-hidden",
          )}
        >
          {/* Bottom padding clears the bottom nav's raised "+" button. */}
          <div className="pb-12">
            <DiscoverPlaceList
              places={places}
              tabType={activeTab}
              sportKey={sportKey}
              loading={loading}
            />
          </div>
        </div>
      </Drawer.Content>
    </Drawer.Root>
  );
}
