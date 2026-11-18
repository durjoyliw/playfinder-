"use client";

import { BetaBadge } from "@/components/playfinder/beta-badge";
import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/app/(main)/SessionProvider";
import { usePlayFinder } from "@/components/playfinder/playfinder-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import kyInstance from "@/lib/ky";
import { getInitials } from "@/lib/settings";
import { NotificationCountInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Bookmark,
  Compass,
  Home,
  LayoutGrid,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquareText,
  MoreVertical,
  Search,
  Settings,
  User,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  href: string;
  isActive: (pathname: string) => boolean;
  badge?: number;
}

interface DesktopSidebarProps {
  initialUnreadNotificationCount: number;
  /**
   * X-style collapsed rail: logo + icons only, no labels. Used on routes
   * whose own content already fills the middle+right area (Discover,
   * Messages), so that extra width goes to that content instead of sitting
   * empty -- while the sidebar's own items/hrefs/badges stay identical, so
   * nothing about what it can do changes, only how it's drawn.
   */
  collapsed?: boolean;
}

export function DesktopSidebar({
  initialUnreadNotificationCount,
  collapsed = false,
}: DesktopSidebarProps) {
  const pathname = usePathname();
  const { user } = useSession();
  const { openComposer } = usePlayFinder();
  const queryClient = useQueryClient();
  const profileHref = `/users/${user.username}`;

  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: { unreadCount: initialUnreadNotificationCount },
    refetchInterval: 60 * 1000,
  });

  const handleLogout = () => {
    queryClient.clear();
    logout();
  };

  // Same two extras as the mobile menu: the waitlist, and beta feedback
  // (which remembers the page you were on).
  const extraItems: NavItem[] = [
    {
      id: "waitlist",
      label: "Join the waitlist",
      icon: Mail,
      href: "/waitlist",
      isActive: (p) => p.startsWith("/waitlist"),
    },
    {
      id: "feedback",
      label: "Send feedback",
      icon: MessageSquareText,
      href: `/settings/feedback?from=${encodeURIComponent(pathname)}`,
      isActive: (p) => p.startsWith("/settings/feedback"),
    },
  ];

  const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: Home, href: "/home", isActive: (p) => p === "/home" },
    {
      id: "search",
      label: "Search",
      icon: Search,
      href: "/search",
      isActive: (p) => p.startsWith("/search"),
    },
    {
      id: "discover",
      label: "Discover",
      icon: Compass,
      href: "/discover",
      isActive: (p) => p.startsWith("/discover"),
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      href: "/messages",
      isActive: (p) => p.startsWith("/messages"),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/notifications",
      isActive: (p) => p.startsWith("/notifications"),
      badge: data?.unreadCount ?? 0,
    },
    {
      id: "saved",
      label: "Saved",
      icon: Bookmark,
      href: "/saved",
      isActive: (p) => p.startsWith("/saved"),
    },
    {
      id: "teammates",
      label: "Teammates",
      icon: Users,
      href: "/teammates",
      isActive: (p) => p.startsWith("/teammates"),
    },
    {
      id: "pages",
      label: "Pages",
      icon: LayoutGrid,
      href: "/pages",
      isActive: (p) => p === "/pages" || p.startsWith("/pages/"),
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: profileHref,
      isActive: (p) => p === profileHref || p.startsWith(`${profileHref}/`),
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/settings",
      isActive: (p) => p.startsWith("/settings"),
    },
  ];

  if (collapsed) {
    return (
      <div className="sticky top-0 hidden h-screen w-[88px] shrink-0 flex-col items-center overflow-y-auto py-3 font-grotesk [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden">
        <Link
          href="/home"
          className="mb-2 flex items-center justify-center rounded-full p-2.5 transition-colors hover:bg-[var(--pf-c-fill-131614)]"
          aria-label="PlayFinder home"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[var(--pf-volt)] text-[var(--pf-on-accent)]">
            <Zap className="h-5 w-5" fill="currentColor" />
          </span>
        </Link>

        <nav className="flex flex-col items-center gap-1">
          {navItems.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Link
                key={item.id}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-[var(--pf-c-fill-131614)]",
                  active ? "text-[var(--pf-c-ink-f2f5ef)]" : "text-[var(--pf-c-ink-b4bcaf)]",
                )}
              >
                <span className="relative">
                  <item.icon className="h-6 w-6" />
                  {!!item.badge && item.badge > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[var(--pf-c-line-08090a)] bg-[var(--pf-volt)] px-1 font-dm-mono text-[9px] font-bold text-[var(--pf-on-accent)]">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => openComposer()}
          aria-label="Broadcast"
          title="Broadcast"
          className="mt-4 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--pf-volt)] text-[var(--pf-on-accent)] transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.97]"
        >
          <Zap className="h-6 w-6" fill="currentColor" />
        </button>

        <nav className="mt-4 flex flex-col items-center gap-1 border-t border-[var(--pf-c-line-2a2f2a)] pt-3" aria-label="More">
          {extraItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className="grid h-11 w-11 place-items-center rounded-full text-[var(--pf-c-ink-b4bcaf)] transition-colors hover:bg-[var(--pf-c-fill-131614)]"
            >
              <item.icon className="h-5 w-5" />
            </Link>
          ))}
        </nav>

        <Link
          href={profileHref}
          title={user.displayName}
          aria-label={user.displayName}
          className="mt-auto flex items-center justify-center rounded-full p-2.5 transition-colors hover:bg-[var(--pf-c-fill-131614)]"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--pf-volt)] text-[13px] font-bold text-[var(--pf-on-accent)]">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(user.displayName).slice(0, 1)
            )}
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="sticky top-0 hidden h-screen w-[275px] shrink-0 flex-col overflow-y-auto py-3 pl-6 pr-3 font-grotesk [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden">
      <Link
        href="/home"
        className="mb-2 flex w-fit items-center gap-2.5 rounded-full p-2.5 transition-colors hover:bg-[var(--pf-c-fill-131614)] [@media(max-height:820px)]:mb-0"
        aria-label="PlayFinder home"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[var(--pf-volt)] text-[var(--pf-on-accent)]">
          <Zap className="h-5 w-5" fill="currentColor" />
        </span>
        <BetaBadge />
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded-full px-3 py-2.5 text-[17px] font-semibold transition-colors hover:bg-[var(--pf-c-fill-131614)] [@media(max-height:820px)]:py-[7px]",
                active ? "text-[var(--pf-c-ink-f2f5ef)]" : "text-[var(--pf-c-ink-b4bcaf)]",
              )}
            >
              <span className="relative">
                <item.icon className="h-6 w-6" />
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[var(--pf-c-line-08090a)] bg-[var(--pf-volt)] px-1 font-dm-mono text-[9px] font-bold text-[var(--pf-on-accent)]">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => openComposer()}
        className="mt-4 w-full rounded-full bg-[var(--pf-volt)] py-3.5 text-[15px] font-bold [@media(max-height:820px)]:mt-3 [@media(max-height:820px)]:py-3 text-[var(--pf-on-accent)] transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.97]"
      >
        Broadcast
      </button>

      <nav className="mt-4 flex flex-col gap-0.5 border-t border-[var(--pf-c-line-2a2f2a)] pt-3 [@media(max-height:820px)]:mt-3 [@media(max-height:820px)]:pt-2" aria-label="More">
        {extraItems.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-3 py-2 text-[14px] font-semibold [@media(max-height:820px)]:py-1.5 transition-colors hover:bg-[var(--pf-c-fill-131614)]",
                active ? "text-[var(--pf-c-ink-f2f5ef)]" : "text-[var(--pf-c-ink-b4bcaf)]",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-1 rounded-full p-1.5 transition-colors hover:bg-[var(--pf-c-fill-131614)]">
        <Link
          href={profileHref}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full p-1"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--pf-volt)] text-[13px] font-bold text-[var(--pf-on-accent)]">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(user.displayName).slice(0, 1)
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-[var(--pf-c-ink-f2f5ef)]">
              {user.displayName}
            </div>
            <div className="truncate text-xs text-[var(--pf-c-ink-7e8a7e)]">@{user.username}</div>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account options"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--pf-c-ink-7e8a7e)] transition-colors hover:bg-[var(--pf-c-fill-1a1e1b)] hover:text-[var(--pf-c-ink-f2f5ef)]"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="z-[60] min-w-[180px] rounded-xl border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] p-1.5 text-[var(--pf-c-ink-f2f5ef)] pf-card"
          >
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-semibold text-[var(--pf-c-ink-f2f5ef)] focus:bg-[var(--pf-c-fill-1a1e1b)] focus:text-[var(--pf-c-ink-f2f5ef)]"
              onSelect={handleLogout}
            >
              <LogOut className="h-4 w-4 text-[var(--pf-c-ink-7e8a7e)]" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
