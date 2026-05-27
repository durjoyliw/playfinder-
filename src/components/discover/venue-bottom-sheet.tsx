"use client";

import { DiscoverPlaceList } from "@/components/discover/discover-place-list";
import type { MapMarker } from "@/components/discover/map-overlay-layout";
import type { DiscoverPlace, DiscoverTabType } from "@/lib/discover-places";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

export type SheetSnap = "peek" | "half" | "full";

const SNAP_ORDER: SheetSnap[] = ["peek", "half", "full"];
const DRAG_THRESHOLD_PX = 40;

function sheetHeightClass(snap: SheetSnap): string {
  switch (snap) {
    case "peek":
      return "h-[220px]";
    case "half":
      return "h-[50dvh]";
    case "full":
      return "h-[calc(100dvh-120px)]";
  }
}

function expandSnap(snap: SheetSnap): SheetSnap {
  if (snap === "peek") return "half";
  if (snap === "half") return "full";
  return "full";
}

function collapseSnap(snap: SheetSnap): SheetSnap {
  if (snap === "full") return "half";
  if (snap === "half") return "peek";
  return "peek";
}

function nextSnap(snap: SheetSnap): SheetSnap {
  const index = SNAP_ORDER.indexOf(snap);
  return SNAP_ORDER[(index + 1) % SNAP_ORDER.length];
}

interface DiscoverVenueClubTabsProps {
  activeTab: DiscoverTabType;
  onTabChange: (tab: DiscoverTabType) => void;
}

function DiscoverVenueClubTabs({
  activeTab,
  onTabChange,
}: DiscoverVenueClubTabsProps) {
  const tabs: { id: DiscoverTabType; label: string }[] = [
    { id: "venues", label: "Venues" },
    { id: "clubs", label: "Clubs" },
  ];

  return (
    <div className="flex shrink-0 border-b border-[#222222]" role="tablist">
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
              "flex-1 border-b-2 py-3 text-center text-sm font-semibold transition-colors",
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

export interface VenueBottomSheetProps {
  places: DiscoverPlace[];
  activeTab: DiscoverTabType;
  onTabChange: (tab: DiscoverTabType) => void;
  loading: boolean;
  sportKey: string;
}

export function VenueBottomSheet({
  places,
  activeTab,
  onTabChange,
  loading,
  sportKey,
}: VenueBottomSheetProps) {
  const [snap, setSnap] = useState<SheetSnap>("peek");
  const dragStartY = useRef(0);
  const didDrag = useRef(false);
  const isDragging = useRef(false);

  const finishDrag = useCallback((clientY: number) => {
    const distance = dragStartY.current - clientY;
    if (Math.abs(distance) > 10) didDrag.current = true;

    if (distance > DRAG_THRESHOLD_PX) {
      setSnap((s) => expandSnap(s));
    } else if (distance < -DRAG_THRESHOLD_PX) {
      setSnap((s) => collapseSnap(s));
    }
    isDragging.current = false;
  }, []);

  const onHandlePointerDown = (clientY: number) => {
    dragStartY.current = clientY;
    didDrag.current = false;
    isDragging.current = true;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    onHandlePointerDown(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    finishDrag(e.changedTouches[0].clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onHandlePointerDown(e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const distance = dragStartY.current - moveEvent.clientY;
      if (Math.abs(distance) > 10) didDrag.current = true;
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      finishDrag(upEvent.clientY);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleHandleClick = () => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    setSnap((s) => nextSnap(s));
  };

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 z-20 flex flex-col overflow-hidden rounded-t-[2rem] border-t border-[#222222] bg-[#0d0d0d] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        sheetHeightClass(snap),
      )}
    >
      <button
        type="button"
        className="flex w-full shrink-0 cursor-grab items-center justify-center py-3 active:cursor-grabbing"
        aria-label="Drag to resize drawer"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={handleHandleClick}
      >
        <div className="h-1 w-10 rounded-full bg-[#333333]" />
      </button>

      <DiscoverVenueClubTabs activeTab={activeTab} onTabChange={onTabChange} />

      <div
        className={cn(
          "min-h-0 flex-1",
          snap === "peek" ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
        <div className={cn(snap === "peek" && "pb-2")}>
          <DiscoverPlaceList
            places={places}
            tabType={activeTab}
            sportKey={sportKey}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

/** Single-venue detail sheet (map overlay flow) */
interface VenueMarkerBottomSheetProps {
  marker: MapMarker;
  onClose: () => void;
  onBook: () => void;
}

export function VenueMarkerBottomSheet({
  marker,
  onClose,
  onBook,
}: VenueMarkerBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sports = marker.sports ?? [marker.sport];
  const address = marker.address ?? marker.location;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    window.setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-40 mx-auto max-w-[600px]">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close venue details"
        onClick={handleClose}
      />
      <div
        className="absolute inset-x-0 bottom-[4.75rem] transition-transform duration-300 ease-out"
        style={{
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-t-2xl bg-[#161616] px-4 pb-4 pt-3 shadow-2xl">
          <div className="mb-3 flex justify-center">
            <div className="h-1 rounded-full bg-[#444444]" style={{ width: 36 }} />
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 text-lg leading-none text-[#666666]"
            aria-label="Close"
          >
            ✕
          </button>
          <h3 className="pr-8 text-base font-bold text-white">{marker.title}</h3>
          <p className="mt-1 text-xs text-[#666666]">{address}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sports.map((sport) => (
              <span
                key={sport}
                className="rounded-full border border-[#C9F31D] px-2 py-0.5 text-[11px] font-medium text-[#C9F31D]"
              >
                {sport}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onBook}
            className="mt-4 w-full rounded-[10px] bg-[#C9F31D] py-3 text-sm font-bold text-black"
          >
            Book / Info →
          </button>
        </div>
      </div>
    </div>
  );
}
