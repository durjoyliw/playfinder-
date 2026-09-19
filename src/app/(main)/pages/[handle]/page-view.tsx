"use client";

import { PageDesktopRightRail } from "@/app/(main)/pages/[handle]/page-desktop-right-rail";
import { SlidingPillTabs } from "@/components/playfinder/sliding-pill-tabs";
import UserAvatar from "@/components/UserAvatar";
import type { PageViewData } from "@/lib/pages/get-page-view";
import { cn } from "@/lib/utils";
import { PageType, VerifyLevel } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ClubTab = "roster" | "fixtures" | "posts";
type VenueTab = "about" | "posts";

const CLUB_TABS = [
  { id: "roster" as const, label: "Roster" },
  { id: "fixtures" as const, label: "Fixtures" },
  { id: "posts" as const, label: "Posts" },
];

const VENUE_TABS = [
  { id: "about" as const, label: "About" },
  { id: "posts" as const, label: "Posts" },
];

function formatFollowerCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k followers`;
  }
  return `${n} follower${n === 1 ? "" : "s"}`;
}

interface PageViewProps {
  page: PageViewData;
}

export function PageView({ page }: PageViewProps) {
  const router = useRouter();
  const isClub = page.type === PageType.CLUB;
  const [clubTab, setClubTab] = useState<ClubTab>("posts");
  const [venueTab, setVenueTab] = useState<VenueTab>("posts");

  const activeModule = isClub ? clubTab : venueTab;

  const metaLine = useMemo(() => {
    const parts = [
      page.categoryLabel,
      page.city?.trim() || null,
      formatFollowerCount(page.followerCount),
    ].filter(Boolean);
    return parts.join(" · ");
  }, [page.categoryLabel, page.city, page.followerCount]);

  return (
    <div className="w-full pb-10 font-grotesk text-[#f2f5ef]">
      <PageDesktopRightRail page={page} />

      {/* Banner + identity */}
      <div className="relative">
        <div className="relative h-[140px] overflow-hidden lg:h-[160px]">
          {page.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  "repeating-linear-gradient(135deg, #131614 0 10px, #161a17 10px 20px)",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,9,10,0.15)] via-transparent to-[#08090a]" />
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-3.5 top-3.5 z-[2] grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-[rgba(8,9,10,0.6)] text-[#b4bcaf] backdrop-blur-[10px] active:scale-90"
            aria-label="Go back"
          >
            <span className="text-lg leading-none">‹</span>
          </button>
        </div>

        {/*
          Avatar overlap: left-3 (12px) inset; half on banner via -translate-y-1/2;
          3px --pf-bg ring — same as create-page wizard step 5.
        */}
        <div className="relative px-4 lg:px-6">
          <div className="absolute left-3 top-0 z-[1] -translate-y-1/2 lg:left-6">
            {page.avatarUrl ? (
              <UserAvatar
                avatarUrl={page.avatarUrl}
                size={80}
                className="h-20 w-20 rounded-[1rem] border-[3px] border-[#08090a]"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-[1rem] border-[3px] border-[#08090a] bg-[#1a1e1b]">
                <span className="text-2xl font-bold tracking-[-0.03em] text-[#a1c217]">
                  {page.initials}
                </span>
              </div>
            )}
          </div>

          <div className="pt-12">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-bold tracking-[-0.03em] lg:text-[26px]">
                {page.name}
              </h1>
              <span
                className={cn(
                  "inline-flex h-[22px] items-center rounded-full border px-2 font-dm-mono text-[9px] font-medium uppercase tracking-[0.1em]",
                  page.type === PageType.VENUE
                    ? "border-[rgba(201,162,39,0.32)] bg-[rgba(201,162,39,0.1)] text-[#c9a227]"
                    : "border-[rgba(86,204,242,0.28)] bg-[rgba(86,204,242,0.1)] text-[#56ccf2]",
                )}
              >
                {page.type === PageType.VENUE ? "Venue" : "Club"}
              </span>
              {page.verify === VerifyLevel.VERIFIED && (
                <BadgeCheck
                  className="h-[18px] w-[18px] shrink-0 fill-[#3B82F6] text-[#3B82F6]"
                  aria-label="Verified"
                />
              )}
            </div>
            <p className="mt-2 text-[13px] text-[#b4bcaf]">{metaLine}</p>
            {page.bio?.trim() && (
              <p className="mt-2 text-[15px] leading-relaxed text-[#b4bcaf]">
                {page.bio.trim()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action row — stubs for 1.5; sticky on mobile */}
      <div className="sticky top-0 z-10 border-b border-white/[0.04] bg-[rgba(8,9,10,0.92)] px-4 py-2.5 backdrop-blur-[16px] lg:static lg:border-0 lg:bg-transparent lg:px-6 lg:py-4 lg:backdrop-blur-none">
        <div className="flex gap-2">
          {page.isAdmin ? (
            <>
              <button
                type="button"
                disabled
                className="flex h-[42px] flex-1 items-center justify-center rounded-xl bg-[#a1c217] text-[14px] font-bold tracking-[-0.01em] text-[#0a0b0a] opacity-90 lg:flex-none lg:px-8"
                title="Coming in a later step"
              >
                Manage
              </button>
              <button
                type="button"
                disabled
                className="flex h-[42px] flex-1 items-center justify-center rounded-xl border border-[#2a2f2a] bg-[#131614] text-[14px] font-bold text-[#f2f5ef] opacity-90 lg:flex-none lg:px-6"
                title="Coming in a later step"
              >
                Share
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled
                className="flex h-[42px] flex-1 items-center justify-center rounded-xl bg-[#a1c217] text-[14px] font-bold tracking-[-0.01em] text-[#0a0b0a] opacity-90"
                title="Coming in a later step"
              >
                {page.isFollowing ? "Following" : "Follow"}
              </button>
              <button
                type="button"
                disabled
                className="flex h-[42px] flex-1 items-center justify-center rounded-xl border border-[#2a2f2a] bg-[#131614] text-[14px] font-bold text-[#f2f5ef] opacity-90"
                title="Coming in a later step"
              >
                {page.type === PageType.VENUE
                  ? "Check availability"
                  : "Ask to join"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modules: mobile pills / desktop left rail */}
      <div className="lg:mt-2 lg:flex lg:gap-0 lg:border-t lg:border-[#2a2f2a]">
        <aside className="hidden w-[180px] shrink-0 flex-col gap-1 border-r border-[#2a2f2a] px-3 py-4 lg:flex">
          <p className="mb-2 px-2 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
            Modules
          </p>
          {isClub
            ? CLUB_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setClubTab(tab.id)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition-colors",
                    clubTab === tab.id
                      ? "border border-[#2a2f2a] bg-[#131614] text-[#f2f5ef]"
                      : "text-[#b4bcaf] hover:bg-[#131614]",
                  )}
                >
                  {tab.label}
                </button>
              ))
            : VENUE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setVenueTab(tab.id)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition-colors",
                    venueTab === tab.id
                      ? "border border-[#2a2f2a] bg-[#131614] text-[#f2f5ef]"
                      : "text-[#b4bcaf] hover:bg-[#131614]",
                  )}
                >
                  {tab.label}
                </button>
              ))}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="lg:hidden">
            {isClub ? (
              <SlidingPillTabs
                tabs={CLUB_TABS}
                activeId={clubTab}
                onTabChange={setClubTab}
                ariaLabel="Page modules"
              />
            ) : (
              <SlidingPillTabs
                tabs={VENUE_TABS}
                activeId={venueTab}
                onTabChange={setVenueTab}
                ariaLabel="Page modules"
              />
            )}
          </div>

          <div className="px-4 pt-2 lg:px-6 lg:pt-4">
            {activeModule === "posts" ? (
              <PagePostsList
                posts={page.posts}
                pageName={page.name}
                avatarUrl={page.avatarUrl}
                initials={page.initials}
              />
            ) : (
              <ModulePlaceholder
                label={
                  activeModule === "roster"
                    ? "Roster"
                    : activeModule === "fixtures"
                      ? "Fixtures"
                      : "About"
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModulePlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#353c34] bg-[#131614]/50 px-4 py-14 text-center">
      <p className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
        {label}
      </p>
      <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-[#f2f5ef]">
        Coming soon
      </p>
      <p className="mt-1 text-[13px] text-[#7e8a7e]">
        This module is a placeholder for step 1.4.
      </p>
    </div>
  );
}

function PagePostsList({
  posts,
  pageName,
  avatarUrl,
  initials,
}: {
  posts: PageViewData["posts"];
  pageName: string;
  avatarUrl: string | null;
  initials: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#353c34] px-4 py-14 text-center">
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#f2f5ef]">
          No posts yet
        </p>
        <p className="mt-2 text-[13px] text-[#7e8a7e]">
          When this page posts, updates will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-2xl border border-[#2a2f2a] bg-[#131614] p-3.5"
        >
          <div className="mb-2.5 flex items-center gap-2.5">
            {avatarUrl ? (
              <UserAvatar
                avatarUrl={avatarUrl}
                size={36}
                className="h-9 w-9 rounded-[10px] border-0"
              />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#232824] text-xs font-bold text-[#a1c217]">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold">{pageName}</p>
              <p className="text-[12px] text-[#7e8a7e]">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#b4bcaf]">
            {post.content}
          </p>
        </article>
      ))}
    </div>
  );
}
