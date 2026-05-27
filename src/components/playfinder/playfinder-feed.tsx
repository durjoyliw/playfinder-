"use client";

import { HomeFeedCard } from "@/components/playfinder/home-feed-card";
import { postMatchesFeedTypeTab, type FeedTypeTab } from "@/lib/feed-type-tabs";
import { mapPostToHomeFeedCard } from "@/lib/home-feed-card";
import { filterActivePlayfinderPosts } from "@/lib/playfinder";
import kyInstance from "@/lib/ky";
import { PlayfinderPostsPage } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface PlayFinderFeedProps {
  sportFilter: string;
  feedTypeTab: FeedTypeTab;
}

export function PlayFinderFeed({ sportFilter, feedTypeTab }: PlayFinderFeedProps) {
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
        <Loader2 className="h-8 w-8 animate-spin text-[#C9F31D]" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="px-4 py-8 text-center text-sm text-red-400">
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
      <p className="px-4 py-8 text-center text-sm text-[#888888]">
        {emptyMessages[feedTypeTab]}
      </p>
    );
  }

  return (
    <div className="pb-4 pt-1">
      {isFetching && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#C9F31D]" />
        </div>
      )}
      {posts.map((post, index) => (
        <HomeFeedCard
          key={post.id}
          {...mapPostToHomeFeedCard(post, showImIn)}
          fromTab={feedTypeTab === "posts" ? "social" : "arena"}
          cardIndex={index}
        />
      ))}
    </div>
  );
}
