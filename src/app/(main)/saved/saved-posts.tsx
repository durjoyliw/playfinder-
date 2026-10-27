"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { FeedCard } from "@/components/playfinder/feed-card";
import { SAVED_POSTS_QUERY_KEY } from "@/components/playfinder/feed-card-save-button";
import kyInstance from "@/lib/ky";
import { mapPostToFeedCard } from "@/lib/playfinder";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";

/** The signed-in user's saved posts, newest save first. */
export function SavedPosts() {
  const { user } = useSession();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: SAVED_POSTS_QUERY_KEY,
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/bookmarked",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (status === "pending") {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--pf-volt-text)]" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="px-6 py-16 text-center text-sm text-[var(--pf-text-3)]">
        Couldn’t load your saved posts. Pull to refresh or try again later.
      </p>
    );
  }

  if (posts.length === 0 && !hasNextPage) {
    return (
      <div className="flex flex-col items-center px-8 py-20 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--pf-surface)] text-[var(--pf-volt-text)] pf-card">
          <Bookmark className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-[19px] font-bold tracking-[-0.02em] text-[var(--pf-text)]">
          Nothing saved yet
        </h2>
        <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-[var(--pf-text-3)]">
          Tap the bookmark on any post to keep it here — games you might join,
          banter worth rereading.
        </p>
        <Link
          href="/home"
          className="mt-6 rounded-xl bg-[var(--pf-volt)] px-5 py-2.5 text-sm font-bold text-[var(--pf-on-accent)] transition-[filter] hover:brightness-110 active:scale-[0.98]"
        >
          Browse the feed
        </Link>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-3 px-4 py-4"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <FeedCard key={post.id} {...mapPostToFeedCard(post, user.id)} />
      ))}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--pf-volt-text)]" />
        </div>
      )}
    </InfiniteScrollContainer>
  );
}
