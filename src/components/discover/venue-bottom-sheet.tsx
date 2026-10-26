"use client";

import { DiscoverPlaceList } from "@/components/discover/discover-place-list";
import type { DiscoverPlace, DiscoverTabType } from "@/lib/discover-places";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState, type RefObject } from "react";
import { Drawer } from "vaul";

/** Visible height of the sheet when collapsed. */
const PEEK_PX = 220;
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
          className="pointer-events-none absolute bottom-2 top-2.5 w-[calc(50%-20px)] rounded-[10px] bg-[#a1c217] transition-[left,background] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
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
                isActive ? "text-[#0a0b0a]" : "text-[#7e8a7e]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className="px-4 pb-2 text-right font-dm-mono text-[11px] font-medium text-[#7e8a7e]">
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
 * Draggable venue sheet on mobile Discover (vaul).
 *
 * The sheet is exactly as tall as the map area (minus a small top gap) and
 * sits directly above the bottom nav, so "full" means no translation -- vaul
 * only lets the inner list scroll when the sheet is at rest at translateY(0).
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
  const [snapIndex, setSnapIndex] = useState(0);

  const sheetHeight = size ? Math.max(size.area - FULL_TOP_GAP_PX, 0) : 0;

  const snapPoints = useMemo(() => {
    if (!size || sheetHeight === 0) return [];
    const peek = Math.min(PEEK_PX, sheetHeight);
    const half = Math.max(Math.round(size.area * 0.5), peek);
    const visible = Array.from(new Set([peek, half, sheetHeight])).sort(
      (a, b) => a - b,
    );
    return visible.map((v) => `${v + size.viewport - sheetHeight}px`);
  }, [size, sheetHeight]);

  if (snapPoints.length === 0) return null;

  const activeIndex = Math.min(snapIndex, snapPoints.length - 1);
  const isFull = activeIndex === snapPoints.length - 1;

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      noBodyStyles
      snapPoints={snapPoints}
      activeSnapPoint={snapPoints[activeIndex]}
      setActiveSnapPoint={(point) => {
        const next = snapPoints.indexOf(String(point));
        if (next !== -1) setSnapIndex(next);
      }}
      fadeFromIndex={snapPoints.length - 1}
    >
      <Drawer.Content
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="fixed inset-x-0 z-20 mx-auto flex max-w-[480px] flex-col rounded-t-[24px] border-t border-white/[0.06] bg-[var(--pf-bg)] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] outline-none"
        style={{
          height: sheetHeight,
          bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Drawer.Title className="sr-only">Nearby venues</Drawer.Title>

        <div className="flex shrink-0 justify-center pb-2 pt-3">
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
