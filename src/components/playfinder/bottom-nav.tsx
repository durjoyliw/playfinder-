"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { cn } from "@/lib/utils";
import { Compass, Home, MessageCircle, Plus, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  onBroadcast?: () => void;
}

type NavItemId = "home" | "discover" | "messages" | "profile";

interface NavItem {
  id: NavItemId;
  label: string;
  icon: typeof Home;
  href: string;
  isActive: (pathname: string, username: string) => boolean;
}

export function BottomNav({ onBroadcast }: BottomNavProps) {
  const pathname = usePathname();
  const { user } = useSession();

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "HOME",
      icon: Home,
      href: "/",
      isActive: (path) => path === "/",
    },
    {
      id: "discover",
      label: "DISCOVER",
      icon: Compass,
      href: "/discover",
      isActive: (path) => path.startsWith("/discover"),
    },
    {
      id: "messages",
      label: "MESSAGES",
      icon: MessageCircle,
      href: "/messages",
      isActive: (path) => path.startsWith("/messages"),
    },
    {
      id: "profile",
      label: "PROFILE",
      icon: User,
      href: `/users/${user.username}`,
      isActive: (path, username) =>
        path === `/users/${username}` || path.startsWith(`/users/${username}/`),
    },
  ];

  const linkClass = (active: boolean) =>
    cn(
      "flex flex-col items-center gap-1 p-2 transition-colors",
      active
        ? "text-[#C9F31D]"
        : "text-muted-foreground hover:text-white",
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-[#0d0d0d] px-2 pb-6 pt-2">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.slice(0, 2).map((item) => {
          const active = item.isActive(pathname, user.username);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={linkClass(active)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onBroadcast}
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#C9F31D] shadow-lg shadow-[#C9F31D]/30 transition-all hover:bg-[#d4f73a] active:scale-95"
        >
          <Plus className="h-7 w-7 text-black" strokeWidth={2.5} />
        </button>

        {navItems.slice(2).map((item) => {
          const active = item.isActive(pathname, user.username);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={linkClass(active)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
