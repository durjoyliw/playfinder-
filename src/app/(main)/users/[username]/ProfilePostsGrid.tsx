"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import kyInstance from "@/lib/ky";
import { getPostTypeBadge } from "@/lib/playfinder";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface ProfilePostsGridProps {
  userId: string;
}

export default function ProfilePostsGrid({ userId }: ProfilePostsGridProps) {
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

  const posts = data?.pages.flatMap((page) => page.posts) || [];

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
      <p className="py-8 text-center text-sm text-gray-500">
        No posts yet.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="grid grid-cols-2 gap-3"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => {
        const imageAttachment = post.attachments.find((a) => a.type === "IMAGE");
        const typeBadge = getPostTypeBadge(post.type ?? null);

        return (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="overflow-hidden rounded-xl border border-[#262626] bg-[#1a1a1a]"
          >
            <div className="relative aspect-[4/3] bg-[#262626]">
              {imageAttachment ? (
                <Image
                  src={imageAttachment.url}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
            </div>
            <div className="p-3">
              <div className="mb-1.5 flex items-center justify-end gap-2">
                <span className="inline-block" style={typeBadge.style}>
                  {typeBadge.label}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-gray-300">{post.content}</p>
            </div>
          </Link>
        );
      })}
      {isFetchingNextPage && (
        <div className="col-span-2 flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#C9F31D]" />
        </div>
      )}
    </InfiniteScrollContainer>
  );
}
