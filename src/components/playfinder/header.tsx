"use client";

import { MobileNavDrawer } from "@/components/playfinder/mobile-nav-drawer";
import { Search, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface HeaderProps {
  /** Kept for shell API stability; unread badge lives outside the header now. */
  initialUnreadNotificationCount: number;
}

export function Header({
  initialUnreadNotificationCount: _initialUnreadNotificationCount,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();

  const handleSearchClick = () => {
    const q = urlSearchParams.get("q")?.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <header className="sticky top-0 z-50 flex shrink-0 items-center gap-2 border-b border-white/[0.04] bg-[rgba(8,9,10,0.92)] px-4 py-3 pt-[calc(12px+env(safe-area-inset-top,0px))] font-grotesk backdrop-blur-[20px] lg:hidden">
      <MobileNavDrawer />

      <Link
        href="/home"
        className="flex min-w-0 flex-1 items-center gap-2.5"
        aria-label="PlayFinder home"
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#a1c217] text-[#0a0b0a]"
          aria-hidden
        >
          <Zap className="h-5 w-5" fill="currentColor" />
        </span>
        <span className="truncate text-[22px] font-bold leading-none tracking-[-0.04em] text-white">
          PlayFinder
        </span>
      </Link>

      <button
        type="button"
        onClick={handleSearchClick}
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#7e8a7e] transition-all active:scale-90 active:bg-[#131614]"
        aria-label="Search"
        aria-current={pathname === "/search" ? "page" : undefined}
      >
        <Search className="h-5 w-5" />
      </button>
    </header>
  );
}
