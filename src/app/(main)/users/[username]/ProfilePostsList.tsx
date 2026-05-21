"use client";

import { FeedCard } from "@/components/playfinder/feed-card";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import kyInstance from "@/lib/ky";
import { mapPostToFeedCard } from "@/lib/playfinder";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface ProfilePostsListProps {
  userId: string;
}

export default function ProfilePostsList({ userId }: ProfilePostsListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "user-posts", userId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/users/${userId}/posts`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

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
        An error occurred while loading posts.
      </p>
    );
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">No posts yet.</p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-3"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <FeedCard key={post.id} {...mapPostToFeedCard(post)} compact />
      ))}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#C9F31D]" />
        </div>
      )}
    </InfiniteScrollContainer>
  );
}
