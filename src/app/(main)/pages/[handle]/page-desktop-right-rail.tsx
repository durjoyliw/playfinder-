"use client";

import type { PageViewData } from "@/lib/pages/get-page-view";
import { PageType } from "@prisma/client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const RAIL_SLOT_ID = "page-view-right-rail";

export function pageViewRightRailSlotId() {
  return RAIL_SLOT_ID;
}

interface PageDesktopRightRailProps {
  page: PageViewData;
}

export function PageDesktopRightRail({ page }: PageDesktopRightRailProps) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const find = () => document.getElementById(RAIL_SLOT_ID);
    const el = find();
    if (el) {
      setSlot(el);
      return;
    }
    const frame = requestAnimationFrame(() => setSlot(find()));
    return () => cancelAnimationFrame(frame);
  }, []);

  const rail = (
    <div className="flex h-full flex-col gap-4 px-6 py-3 font-grotesk">
      <p className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
        Context
      </p>

      <div className="rounded-2xl border border-[#2a2f2a] bg-[#131614] p-4">
        <h3 className="text-[14px] font-bold text-[#f2f5ef]">About</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#7e8a7e]">
          {page.bio?.trim() ||
            (page.type === PageType.CLUB
              ? "Club page on PlayFinder."
              : "Venue page on PlayFinder.")}
        </p>
      </div>

      <div className="rounded-2xl border border-[#2a2f2a] bg-[#131614] p-4">
        <div className="flex items-center justify-between border-b border-white/[0.04] py-2 text-[13px]">
          <span className="text-[#7e8a7e]">Followers</span>
          <span className="font-bold text-[#f2f5ef]">{page.followerCount}</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/[0.04] py-2 text-[13px]">
          <span className="text-[#7e8a7e]">Type</span>
          <span className="font-bold text-[#f2f5ef]">
            {page.type === PageType.VENUE ? "Venue" : "Club"}
          </span>
        </div>
        {page.city && (
          <div className="flex items-center justify-between py-2 text-[13px]">
            <span className="text-[#7e8a7e]">City</span>
            <span className="font-bold text-[#f2f5ef]">{page.city}</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#2a2f2a] bg-[#131614] p-4">
        <h3 className="text-[14px] font-bold text-[#f2f5ef]">Handle</h3>
        <p className="mt-1.5 text-[13px] text-[#7e8a7e]">@{page.handle}</p>
      </div>
    </div>
  );

  if (!slot) return null;
  return createPortal(rail, slot);
}
