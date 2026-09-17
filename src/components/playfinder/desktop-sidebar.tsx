"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { usePlayFinder } from "@/components/playfinder/playfinder-provider";
import { getInitials } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { Compass, Home, MessageCircle, User, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  href: string;
  isActive: (pathname: string) => boolean;
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user } = useSession();
  const { openComposer } = usePlayFinder();
  const profileHref = `/users/${user.username}`;

  const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: Home, href: "/", isActive: (p) => p === "/" },
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
      id: "profile",
      label: "Profile",
      icon: User,
      href: profileHref,
      isActive: (p) => p === profileHref || p.startsWith(`${profileHref}/`),
    },
  ];

  return (
    <div className="sticky top-0 hidden h-screen w-[275px] shrink-0 flex-col py-3 pl-6 pr-3 font-grotesk lg:flex">
      <Link
        href="/"
        className="mb-2 flex w-fit items-center gap-2.5 rounded-full p-2.5 transition-colors hover:bg-[#131614]"
        aria-label="PlayFinder home"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#c9f31d] text-[#0a0b0a]">
          <Zap className="h-5 w-5" fill="currentColor" />
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded-full px-3 py-3 text-[17px] font-semibold transition-colors hover:bg-[#131614]",
                active ? "text-[#f2f5ef]" : "text-[#b4bcaf]",
              )}
            >
              <item.icon className="h-6 w-6" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => openComposer()}
        className="mt-4 w-full rounded-full bg-[#c9f31d] py-3.5 text-[15px] font-bold text-[#0a0b0a] transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.97]"
      >
        Broadcast
      </button>

      <Link
        href={profileHref}
        className="mt-auto flex items-center gap-2.5 rounded-full p-2.5 transition-colors hover:bg-[#131614]"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#c9f31d] text-[13px] font-bold text-[#0a0b0a]">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            getInitials(user.displayName).slice(0, 1)
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-[#f2f5ef]">
            {user.displayName}
          </div>
          <div className="truncate text-xs text-[#7e8a7e]">@{user.username}</div>
        </div>
      </Link>
    </div>
  );
}
