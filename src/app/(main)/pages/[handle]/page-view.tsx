"use client";

import { PageDesktopRightRail } from "@/app/(main)/pages/[handle]/page-desktop-right-rail";
import {
  PageFollowButton,
  usePageFollowInfo,
} from "@/components/playfinder/page-follow-button";
import { SlidingPillTabs } from "@/components/playfinder/sliding-pill-tabs";
import { useToast } from "@/components/ui/use-toast";
import UserAvatar from "@/components/UserAvatar";
import { JOIN_HREF } from "@/lib/beta";
import type { PageViewData } from "@/lib/pages/get-page-view";
import { cn } from "@/lib/utils";
import { PageType, VerifyLevel } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { BadgeCheck } from "lucide-react";
import { useSafeBack } from "@/hooks/use-safe-back";
import Link from "next/link";
import { useMemo, useState } from "react";

// Roster / Fixtures modules aren't built yet, so they're not shown in the
// beta (they used to render a developer placeholder).
type PageTab = "posts" | "about";

const PAGE_TABS = [
  { id: "posts" as const, label: "Posts" },
  { id: "about" as const, label: "About" },
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
  const goBack = useSafeBack("/home");
  const [activeModule, setActiveModule] = useState<PageTab>("posts");
  const { data: followInfo } = usePageFollowInfo(page.id, {
    followers: page.followerCount,
    isFollowedByUser: page.isFollowing,
  });

  const metaLine = useMemo(() => {
    const parts = [
      page.categoryLabel,
      page.city?.trim() || null,
      formatFollowerCount(followInfo.followers),
    ].filter(Boolean);
    return parts.join(" · ");
  }, [page.categoryLabel, page.city, followInfo.followers]);

  return (
    <div className="w-full pb-10 font-grotesk text-[var(--pf-c-ink-f2f5ef)]">
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
                  "repeating-linear-gradient(135deg, var(--pf-c-fill-131614) 0 10px, var(--pf-c-fill-161a17) 10px 20px)",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgb(var(--pf-c-fill-08090a-rgb)/0.15)] via-transparent to-[var(--pf-c-fill-08090a)]" />
          <button
            type="button"
            onClick={goBack}
            className="absolute left-3.5 top-3.5 z-[2] grid h-10 w-10 place-items-center rounded-xl border border-[rgb(var(--pf-contrast-rgb)/0.06)] bg-[rgb(var(--pf-c-fill-08090a-rgb)/0.6)] text-[var(--pf-c-ink-b4bcaf)] backdrop-blur-[10px] active:scale-90"
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
                className="h-20 w-20 rounded-[1rem] border-[3px] border-[var(--pf-c-line-08090a)]"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-[1rem] border-[3px] border-[var(--pf-c-line-08090a)] bg-[var(--pf-c-fill-1a1e1b)]">
                <span className="text-2xl font-bold tracking-[-0.03em] text-[var(--pf-volt-text)]">
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
            <p className="mt-2 text-[13px] text-[var(--pf-c-ink-b4bcaf)]">{metaLine}</p>
            {page.bio?.trim() && (
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--pf-c-ink-b4bcaf)]">
                {page.bio.trim()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action row; sticky on mobile */}
      <div className="sticky top-[var(--pf-header-h)] z-10 border-b border-[rgb(var(--pf-contrast-rgb)/0.04)] bg-[rgb(var(--pf-c-fill-08090a-rgb)/0.92)] px-4 py-2.5 backdrop-blur-[16px] lg:static lg:top-0 lg:border-0 lg:bg-transparent lg:px-6 lg:py-4 lg:backdrop-blur-none">
        <div className="flex gap-2">
          {page.isLoggedIn && !page.isAdmin && (
            <PageFollowButton
              pageId={page.id}
              initialState={{
                followers: page.followerCount,
                isFollowedByUser: page.isFollowing,
              }}
            />
          )}
          {!page.isLoggedIn && (
            <Link
              href={JOIN_HREF}
              className="flex h-[42px] flex-1 items-center justify-center rounded-xl bg-[var(--pf-volt)] text-[14px] font-bold tracking-[-0.01em] text-[var(--pf-on-accent)]"
            >
              Join to follow
            </Link>
          )}
          <PageShareButton name={page.name} handle={page.handle} />
        </div>
      </div>

      {/* Modules: mobile pills / desktop left rail */}
      <div className="lg:mt-2 lg:flex lg:gap-0 lg:border-t lg:border-[var(--pf-c-line-2a2f2a)]">
        <aside className="hidden w-[180px] shrink-0 flex-col gap-1 border-r border-[var(--pf-c-line-2a2f2a)] px-3 py-4 lg:flex">
          <p className="mb-2 px-2 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-c-ink-7e8a7e)]">
            Modules
          </p>
          {PAGE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveModule(tab.id)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition-colors",
                activeModule === tab.id
                  ? "border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] text-[var(--pf-c-ink-f2f5ef)]"
                  : "text-[var(--pf-c-ink-b4bcaf)] hover:bg-[var(--pf-c-fill-131614)]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="lg:hidden">
            <SlidingPillTabs
              tabs={PAGE_TABS}
              activeId={activeModule}
              onTabChange={setActiveModule}
              ariaLabel="Page sections"
            />
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
              <PageAbout page={page} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageAbout({ page }: { page: PageViewData }) {
  const rows = [
    { label: "Type", value: page.categoryLabel },
    { label: "Area", value: page.city?.trim() || null },
    {
      label: "Status",
      value:
        page.verify === VerifyLevel.VERIFIED
          ? "Verified"
          : page.isAdmin
            ? "You manage this Page"
            : null,
    },
  ].filter((row): row is { label: string; value: string } => !!row.value);

  return (
    <div className="space-y-4 pb-4">
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-[var(--pf-c-ink-b4bcaf)]">
        {page.bio?.trim() || `${page.name} hasn\u2019t added a description yet.`}
      </p>
      {rows.length > 0 && (
        <dl className="overflow-hidden rounded-2xl border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] pf-card">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 border-b border-[var(--pf-c-line-2a2f2a)] px-4 py-3 last:border-b-0"
            >
              <dt className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-c-ink-7e8a7e)]">
                {row.label}
              </dt>
              <dd className="text-right text-[14px] font-semibold text-[var(--pf-c-ink-f2f5ef)]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function PageShareButton({ name, handle }: { name: string; handle: string }) {
  const { toast } = useToast();

  async function share() {
    const url = `${window.location.origin}/pages/${handle}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied" });
    } catch (error) {
      // Dismissing the share sheet throws AbortError; that's fine.
      if (error instanceof Error && error.name === "AbortError") return;
      toast({ variant: "destructive", description: "Couldn\u2019t share this Page" });
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="flex h-[42px] flex-1 items-center justify-center rounded-xl border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] text-[14px] font-bold text-[var(--pf-c-ink-f2f5ef)] pf-card lg:flex-none lg:px-6"
    >
      Share
    </button>
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
      <div className="rounded-2xl border border-dashed border-[var(--pf-c-line-353c34)] px-4 py-14 text-center">
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--pf-c-ink-f2f5ef)]">
          No posts yet
        </p>
        <p className="mt-2 text-[13px] text-[var(--pf-c-ink-7e8a7e)]">
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
          className="rounded-2xl border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] p-3.5 pf-card"
        >
          <div className="mb-2.5 flex items-center gap-2.5">
            {avatarUrl ? (
              <UserAvatar
                avatarUrl={avatarUrl}
                size={36}
                className="h-9 w-9 rounded-[10px] border-0"
              />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--pf-c-fill-232824)] text-xs font-bold text-[var(--pf-volt-text)]">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold">{pageName}</p>
              <p className="text-[12px] text-[var(--pf-c-ink-7e8a7e)]">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--pf-c-ink-b4bcaf)]">
            {post.content}
          </p>
        </article>
      ))}
    </div>
  );
}
