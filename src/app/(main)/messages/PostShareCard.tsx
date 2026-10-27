"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Attachment } from "stream-chat";
import { getInitials } from "./messages-utils";

interface PostShareAttachment extends Attachment {
  post_id?: string;
  author_name?: string;
  author_avatar?: string;
  content?: string;
  sport?: string;
  location?: string;
}

interface PostShareCardProps {
  attachment: PostShareAttachment;
  isMe: boolean;
}

export default function PostShareCard({
  attachment,
  isMe,
}: PostShareCardProps) {
  const postId = attachment.post_id;
  const authorName = attachment.author_name ?? "PlayFinder post";
  const snippet = attachment.content ?? "";
  const imageUrl = attachment.image_url;

  return (
    <Link
      href={postId ? `/posts/${postId}` : "/home"}
      className={cn(
        "block w-full max-w-[260px] overflow-hidden rounded-2xl border transition-opacity hover:opacity-90",
        isMe
          ? "rounded-tr-sm border-[rgb(var(--pf-volt-rgb)/0.3)] bg-[var(--pf-volt-tint-2)]"
          : "rounded-tl-sm border-[var(--pf-c-line-2a2a2a)] bg-[var(--pf-c-fill-1a1a1a)]",
      )}
    >
      {imageUrl && (
        <img src={imageUrl} alt="" className="h-32 w-full object-cover" />
      )}
      <div className="flex items-start gap-2.5 p-3">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--pf-volt)] text-[10px] font-bold text-[var(--pf-on-accent)]">
          {attachment.author_avatar ? (
            <img
              src={attachment.author_avatar}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(authorName)
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-[var(--pf-c-ink-ffffff)]">
            {authorName}
            {attachment.sport ? ` · ${attachment.sport}` : ""}
          </p>
          {snippet && (
            <p className="mt-0.5 line-clamp-2 text-xs text-[var(--pf-c-ink-b4bcaf)]">
              {snippet}
            </p>
          )}
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--pf-volt-text)]">
            View post
          </p>
        </div>
      </div>
    </Link>
  );
}
