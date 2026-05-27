"use client";

import { FeedCard } from "@/components/playfinder/feed-card";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import kyInstance from "@/lib/ky";
import { mapPostToFeedCard } from "@/lib/playfinder";
import { PostsPage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProfilePostMenu } from "./profile-post-menu";

type ProfileTab = "posts" | "highlights";

interface ProfilePostsSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function ProfilePostsSection({
  userId,
  isOwnProfile,
}: ProfilePostsSectionProps) {
  const router = useRouter();
  const [tab, setTab] = useState<ProfileTab>("posts");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "user-posts", userId, tab],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(`/api/users/${userId}/posts`, {
          searchParams: {
            ...(tab === "highlights" ? { highlights: "true" } : {}),
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div>
      <div className="mb-4 flex gap-2 border-b border-[#262626]">
        {(["posts", "highlights"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 pb-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-[#C9F31D] text-[#C9F31D]"
                : "border-transparent text-gray-500 hover:text-white",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {status === "pending" && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#C9F31D]" />
        </div>
      )}

      {status === "error" && (
        <p className="py-8 text-center text-sm text-red-400">
          An error occurred while loading posts.
        </p>
      )}

      {status === "success" && !posts.length && !hasNextPage && (
        <div className="py-8 text-center">
          {tab === "highlights" ? (
            <>
              <p className="text-sm text-gray-400">No highlights yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Pin your best posts here.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No posts yet.</p>
          )}
        </div>
      )}

      {posts.length > 0 && (
        <InfiniteScrollContainer
          className="space-y-3"
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              className="relative cursor-pointer"
              onClick={() => {
                const tab =
                  post.type === "ARENA" || post.type === "BROADCAST"
                    ? "arena"
                    : "social";
                router.push(`/posts/${post.id}?tab=${tab}`);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const tab =
                    post.type === "ARENA" || post.type === "BROADCAST"
                      ? "arena"
                      : "social";
                  router.push(`/posts/${post.id}?tab=${tab}`);
                }
              }}
              role="link"
              tabIndex={0}
            >
              {isOwnProfile && (
                <div className="absolute right-2 top-2 z-10">
                  <ProfilePostMenu post={post} />
                </div>
              )}
              <FeedCard {...mapPostToFeedCard(post)} compact />
            </div>
          ))}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-[#C9F31D]" />
            </div>
          )}
        </InfiniteScrollContainer>
      )}
    </div>
  );
}
