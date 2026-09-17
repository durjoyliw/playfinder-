"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { usePlayFinder } from "@/components/playfinder/playfinder-provider";
import { cn } from "@/lib/utils";
import { Compass, Home, MessageCircle, Plus, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItemId = "home" | "discover" | "messages" | "profile";

interface NavItem {
  id: NavItemId;
  label: string;
  icon: typeof Home;
  href: string;
  isActive: (pathname: string, username: string) => boolean;
}

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useSession();
  const { openComposer } = usePlayFinder();

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      href: "/",
      isActive: (path) => path === "/",
    },
    {
      id: "discover",
      label: "Discover",
      icon: Compass,
      href: "/discover",
      isActive: (path) => path.startsWith("/discover"),
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      href: "/messages",
      isActive: (path) => path.startsWith("/messages"),
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: `/users/${user.username}`,
      isActive: (path, username) =>
        path === `/users/${username}` || path.startsWith(`/users/${username}/`),
    },
  ];

  const linkClass = (active: boolean) =>
    cn(
      "flex min-h-12 flex-1 flex-col items-center justify-center gap-1 font-dm-mono text-[10px] font-medium uppercase tracking-[0.04em] transition-colors active:scale-90",
      active ? "text-[#c9f31d]" : "text-[#7e8a7e]",
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex h-[calc(64px+env(safe-area-inset-bottom,0px))] shrink-0 items-center justify-around border-t border-white/[0.05] bg-[rgba(8,9,10,0.95)] pb-[env(safe-area-inset-bottom,0px)] font-grotesk backdrop-blur-[24px]">
      <div className="mx-auto flex h-full w-full max-w-md items-center justify-around">
        {navItems.slice(0, 2).map((item) => {
          const active = item.isActive(pathname, user.username);
          return (
            <Link key={item.id} href={item.href} className={linkClass(active)}>
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => openComposer()}
          className="-mt-[30px] grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#c9f31d] text-[#0a0b0a] transition-transform active:scale-90"
          style={{ boxShadow: "0 6px 24px var(--pf-volt-glow)" }}
          aria-label="Create post"
        >
          <Plus className="h-[26px] w-[26px]" strokeWidth={2.5} />
        </button>

        {navItems.slice(2).map((item) => {
          const active = item.isActive(pathname, user.username);
          return (
            <Link key={item.id} href={item.href} className={linkClass(active)}>
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
