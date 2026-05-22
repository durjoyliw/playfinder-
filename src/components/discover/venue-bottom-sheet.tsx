"use client";

import type { MapMarker } from "@/components/discover/map-overlay-layout";
import { useEffect, useState } from "react";

interface VenueBottomSheetProps {
  marker: MapMarker;
  onClose: () => void;
  onBook: () => void;
}

export function VenueBottomSheet({
  marker,
  onClose,
  onBook,
}: VenueBottomSheetProps) {
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
      {/* Backdrop — tap anywhere to close */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close venue details"
        onClick={handleClose}
      />

      {/* Sheet — above bottom nav (nav is z-50) */}
      <div
        className="absolute inset-x-0 bottom-[4.75rem] transition-transform duration-300 ease-out"
        style={{
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-t-2xl bg-[#161616] px-4 pb-4 pt-3 shadow-2xl">
          <div className="mb-3 flex justify-center">
            <div
              className="h-1 rounded-full bg-[#444444]"
              style={{ width: 36 }}
            />
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 text-lg leading-none text-[#666666] transition-colors hover:text-[#f0f0f0]"
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
            className="mt-4 w-full rounded-[10px] bg-[#C9F31D] py-3 text-sm font-bold text-black transition-colors hover:bg-[#d4f73a]"
          >
            Book / Info →
          </button>
        </div>
      </div>
    </div>
  );
}
