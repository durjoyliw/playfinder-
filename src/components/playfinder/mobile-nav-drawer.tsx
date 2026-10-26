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
  ChevronRight,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  type LucideIcon,
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

interface DrawerLink {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const DRAWER_LINKS: DrawerLink[] = [
  {
    href: "/pages",
    label: "Pages",
    icon: LayoutGrid,
    isActive: (path) => path === "/pages" || path.startsWith("/pages/"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    isActive: (path) => path.startsWith("/settings"),
  },
];

/** Shared row styling: generous tap target, quiet pressed state. */
const rowBase =
  "group flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl px-3 text-left outline-none transition-[background-color,transform] duration-150 active:scale-[0.98] active:bg-[var(--pf-surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--pf-volt)]";

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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[var(--pf-text-3)] outline-none transition-all active:scale-90 active:bg-[var(--pf-surface)] focus-visible:ring-2 focus-visible:ring-[var(--pf-volt)]",
            triggerClassName,
          )}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        overlayClassName="pf-drawer-overlay bg-black/60"
        className="pf-drawer flex h-[100dvh] w-[84%] max-w-[320px] flex-col gap-0 rounded-r-[24px] border-r border-[var(--pf-border)] bg-[var(--pf-bg-2)] p-0 font-grotesk shadow-[8px_0_40px_rgba(0,0,0,0.5)] outline-none"
        aria-describedby={undefined}
        // Radix focuses the first non-link control on open, which is Log out --
        // Safari then draws its blue focus ring on it. Focus the panel instead.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
      >
        <SheetTitle className="sr-only">Account menu</SheetTitle>

        {/* Scrolls on very short screens; the footer below never moves. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <Link
            href={profileHref}
            onClick={close}
            className={cn(rowBase, "items-start gap-3 py-3")}
          >
            <UserAvatar
              avatarUrl={user.avatarUrl}
              size={56}
              className="h-14 w-14 shrink-0 rounded-full border-2 border-[var(--pf-border)]"
            />
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-[var(--pf-text)]">
                  {displayName}
                </span>
                <StaticVerifiedTick className="h-4 w-4" />
              </div>
              <p className="mt-0.5 truncate text-[13px] text-[var(--pf-text-3)]">
                @{user.username}
              </p>
              {bio && (
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-[var(--pf-text-2)]">
                  {bio}
                </p>
              )}
            </div>
            <ChevronRight className="mt-4 h-4 w-4 shrink-0 text-[var(--pf-text-4)]" />
          </Link>

          <div className="mx-3 my-3 h-px bg-[var(--pf-border)]" />

          <nav className="flex flex-col gap-1" aria-label="Menu">
            {DRAWER_LINKS.map(({ href, label, icon: Icon, isActive }) => {
              const active = isActive(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    rowBase,
                    active && "bg-[var(--pf-surface)]",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--pf-surface-2)]",
                      active
                        ? "text-[var(--pf-volt)]"
                        : "text-[var(--pf-text-2)]",
                    )}
                  >
                    <Icon className="h-[19px] w-[19px]" />
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-[15px] font-semibold",
                      active
                        ? "text-[var(--pf-text)]"
                        : "text-[var(--pf-text-2)]",
                    )}
                  >
                    {label}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--pf-text-4)]" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Pinned footer: version label, then Log out -- always visible. */}
        <div className="shrink-0 px-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-3">
          <div className="flex items-baseline justify-between px-3 pb-3 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-text-4)]">
            <span>PlayFinder</span>
            <span className="normal-case tracking-[0.04em]">v0.1</span>
          </div>
          <div className="mx-3 mb-2 h-px bg-[var(--pf-border)]" />
          <button
            type="button"
            onClick={handleLogout}
            className={cn(rowBase, "text-[#f87171]")}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(248,113,113,0.1)]">
              <LogOut className="h-[19px] w-[19px]" />
            </span>
            <span className="text-[15px] font-semibold">Log out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
