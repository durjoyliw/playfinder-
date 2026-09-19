"use client";

import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/UserAvatar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserSettings } from "@/hooks/use-user-settings";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * Verified tick is NOT wired to real data — User has no emailVerified /
 * phoneVerified field. Shown as a static badge for now (Phase 1).
 */
function StaticVerifiedTick({ className }: { className?: string }) {
  return (
    <BadgeCheck
      className={cn(
        "h-[18px] w-[18px] shrink-0 fill-[#3B82F6] text-[#3B82F6]",
        className,
      )}
      aria-label="Verified"
    />
  );
}

interface MobileNavDrawerProps {
  triggerClassName?: string;
}

export function MobileNavDrawer({ triggerClassName }: MobileNavDrawerProps) {
  const { user } = useSession();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: settings } = useUserSettings();
  const [open, setOpen] = useState(false);

  const profileHref = `/users/${user.username}`;
  const displayName = settings?.displayName ?? user.displayName;
  const bio = settings?.bio?.trim() || null;

  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    queryClient.clear();
    logout();
  };

  const rowClass = (active: boolean) =>
    cn(
      "flex min-h-[52px] items-center gap-3.5 rounded-full px-3.5 py-4 text-[16px] font-semibold transition-colors active:bg-[#131614]",
      active ? "text-[#f2f5ef]" : "text-[#b4bcaf]",
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#7e8a7e] transition-all active:scale-90 active:bg-[#131614]",
            triggerClassName,
          )}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex flex-col gap-0 p-5 pb-[calc(16px+env(safe-area-inset-bottom,0px))] font-grotesk"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Account menu</SheetTitle>

        <Link
          href={profileHref}
          onClick={close}
          className="flex flex-col gap-2.5 rounded-2xl p-1 transition-colors active:bg-[#131614]"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              avatarUrl={user.avatarUrl}
              size={64}
              className="h-16 w-16 rounded-full border-2 border-[#2a2f2a]"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-lg font-bold tracking-[-0.03em] text-[#f2f5ef]">
                  {displayName}
                </span>
                <StaticVerifiedTick />
              </div>
              <p className="mt-0.5 truncate text-[13px] text-[#7e8a7e]">
                @{user.username}
              </p>
            </div>
          </div>
          {bio && (
            <p className="truncate text-[13px] leading-snug text-[#b4bcaf]">
              {bio}
            </p>
          )}
        </Link>

        <div className="my-3 h-px bg-[#2a2f2a]" />

        <nav className="flex flex-col gap-1.5" aria-label="Drawer links">
          <Link
            href="/pages"
            onClick={close}
            className={rowClass(
              pathname === "/pages" || pathname.startsWith("/pages/"),
            )}
          >
            <LayoutGrid className="h-[22px] w-[22px] shrink-0 text-[#7e8a7e]" />
            Pages
          </Link>
          <Link
            href="/settings"
            onClick={close}
            className={rowClass(pathname.startsWith("/settings"))}
          >
            <Settings className="h-[22px] w-[22px] shrink-0 text-[#7e8a7e]" />
            Settings
          </Link>
        </nav>

        <div className="min-h-6 flex-1" aria-hidden />

        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-2 px-3 font-dm-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#5a635a]">
            <span>PlayFinder</span>
            <span className="normal-case tracking-[0.04em]">v0.1</span>
          </div>
          <div className="h-px bg-[#2a2f2a]" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-[52px] items-center gap-3.5 rounded-full px-3.5 py-4 text-[16px] font-semibold text-[#f87171] transition-colors active:bg-[#131614]"
          >
            <LogOut className="h-[22px] w-[22px] shrink-0" />
            Log out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
