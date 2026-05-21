"use client";

import { FeedCard } from "@/components/playfinder/feed-card";
import { mapPostToFeedCard } from "@/lib/playfinder";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface PlayFinderFeedProps {
  sportFilter: string;
}

export function PlayFinderFeed({ sportFilter }: PlayFinderFeedProps) {
  const { data, status, isFetching } = useQuery({
    queryKey: ["post-feed", "playfinder", sportFilter],
    queryFn: () =>
      kyInstance
        .get("/api/posts/playfinder", {
          searchParams: { sport: sportFilter },
        })
        .json<PostsPage>(),
  });

  if (status === "pending") {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9F31D]" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="py-8 text-center text-sm text-red-400">
        Failed to load feed. Please try again.
      </p>
    );
  }

  const posts = data?.posts ?? [];

  if (!posts.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        {sportFilter === "all"
          ? "No broadcasts yet. Tap + to post the first one."
          : "No posts for this sport yet."}
      </p>
    );
  }

  return (
    <div className="space-y-3 px-4 py-4">
      {isFetching && (
        <div className="flex justify-center py-1">
          <Loader2 className="h-4 w-4 animate-spin text-[#C9F31D]" />
        </div>
      )}
      {posts.map((post) => (
        <FeedCard key={post.id} {...mapPostToFeedCard(post)} />
      ))}
    </div>
  );
}
