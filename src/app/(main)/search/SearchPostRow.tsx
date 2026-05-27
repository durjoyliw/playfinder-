"use client";

import { formatSportLabel } from "@/lib/playfinder";
import { getInitials } from "@/lib/settings";
import { PostData } from "@/lib/types";
import Link from "next/link";

interface SearchPostRowProps {
  post: PostData;
}

export function SearchPostRow({ post }: SearchPostRowProps) {
  const sportLabel = formatSportLabel(post.sport);

  return (
    <Link
      href={`/posts/${post.id}`}
      className="block border-b border-[#111] px-4 py-3 transition-colors hover:bg-[#111111]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#C9F31D] text-xs font-bold text-black">
          {post.user.avatarUrl ? (
            <img
              src={post.user.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(post.user.displayName)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">{post.user.displayName}</p>
          <p className="mt-1 line-clamp-3 text-sm leading-snug text-[#cccccc]">
            {post.content}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {sportLabel && (
              <span className="rounded-full bg-[#1f2d00] px-2 py-0.5 text-[10px] font-medium text-[#C9F31D]">
                {sportLabel}
              </span>
            )}
            <span className="text-xs text-[#666666]">
              {post._count.likes} like{post._count.likes === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
