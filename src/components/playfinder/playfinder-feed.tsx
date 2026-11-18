"use client";

import { HomeFeedCard } from "@/components/playfinder/home-feed-card";
import { postMatchesFeedTypeTab, type FeedTypeTab } from "@/lib/feed-type-tabs";
import { mapPostToHomeFeedCard } from "@/lib/home-feed-card";
import {
  filterActivePlayfinderPosts,
  isLookingToPlayIntent,
} from "@/lib/playfinder";
import kyInstance from "@/lib/ky";
import { PlayfinderPostsPage } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { FeedEnd } from "@/components/system/feed-end";
import { Loader2 } from "lucide-react";

interface PlayFinderFeedProps {
  sportFilter: string;
  feedTypeTab: FeedTypeTab;
}

export function PlayFinderFeed({
  sportFilter,
  feedTypeTab,
}: PlayFinderFeedProps) {
  const { data, status, isFetching } = useQuery({
    queryKey: ["post-feed", "playfinder", sportFilter, feedTypeTab],
    queryFn: () =>
      kyInstance
        .get("/api/posts/playfinder", {
          searchParams: {
            sport: sportFilter,
            tab: feedTypeTab === "posts" ? "social" : "arena",
          },
        })
        .json<PlayfinderPostsPage>(),
  });

  const showImIn = feedTypeTab === "players" || feedTypeTab === "teams";

  const posts = filterActivePlayfinderPosts(data?.posts ?? []).filter((post) =>
    postMatchesFeedTypeTab(post.intent, feedTypeTab),
  );

  if (status === "pending") {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--pf-volt-text)]" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="px-4 py-8 text-center text-sm text-[#ff6b6b]">
        Failed to load feed. Please try again.
      </p>
    );
  }

  if (!posts.length) {
    const emptyMessages: Record<FeedTypeTab, string> = {
      players: "No player posts yet. Broadcast a game to get started.",
      teams: "No team posts yet.",
      posts: "No posts yet. Share something with the community.",
    };
    return (
      <p className="px-4 py-8 text-center text-sm text-[var(--pf-c-ink-7e8a7e)]">
        {emptyMessages[feedTypeTab]}
      </p>
    );
  }

  const isSocial = feedTypeTab === "posts";

  const renderCard = (post: (typeof posts)[number], index: number) => (
    <HomeFeedCard
      key={post.id}
      {...mapPostToHomeFeedCard(post, showImIn)}
      fromTab={isSocial ? "social" : "arena"}
      cardIndex={index}
    />
  );

  // Arena: games first, then clubs recruiting, each under a small heading.
  const games = isSocial
    ? []
    : posts.filter((post) => isLookingToPlayIntent(post.intent));
  const recruiting = isSocial
    ? []
    : posts.filter((post) => !isLookingToPlayIntent(post.intent));
  const sectionHeading = (label: string, count: number) => (
    <h2 className="flex items-baseline justify-between border-b border-[rgb(var(--pf-contrast-rgb)/0.04)] px-4 pb-2 pt-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--pf-c-ink-7e8a7e)]">
      {label}
      <span className="text-[12px] font-medium text-[var(--pf-c-ink-7e8a7e)]">
        {count}
      </span>
    </h2>
  );

  return (
    <div className="pb-4">
      {isFetching && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--pf-volt-text)]" />
        </div>
      )}
      {isSocial ? (
        posts.map(renderCard)
      ) : (
        <>
          {games.length > 0 && sectionHeading("Games", games.length)}
          {games.map(renderCard)}
          {recruiting.length > 0 && (
            sectionHeading("Recruiting", recruiting.length)
          )}
          {recruiting.map((post, i) => renderCard(post, games.length + i))}
        </>
      )}
      <FeedEnd
        noun={isSocial ? "posts" : "games"}
        action={
          isSocial
            ? { href: "/discover", label: "Find players near you" }
            : { href: "/discover", label: "Look for more on Discover" }
        }
      />
    </div>
  );
}
