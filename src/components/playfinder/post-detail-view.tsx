"use client";

import { FeedCardComments } from "@/components/playfinder/feed-card-comments";
import { FeedCardImInButton } from "@/components/playfinder/feed-card-im-in-button";
import { FeedCardLikeButton } from "@/components/playfinder/feed-card-like-button";
import { FeedCardMessageClubButton } from "@/components/playfinder/feed-card-message-club-button";
import { FeedCardShareButton } from "@/components/playfinder/feed-card-share-button";
import { PostOptionsMenu } from "@/components/playfinder/post-options-menu";
import {
  getPostTypeBadge,
  isLookingToPlayIntent,
  mapPostToFeedCard,
} from "@/lib/playfinder";
import { PostData } from "@/lib/types";
import { ArrowLeft, BadgeCheck, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface PostDetailViewProps {
  post: PostData;
  loggedInUserId: string;
}

const accentColors = {
  looking: "#C9F31D",
  recruiting: "#3B82F6",
  banter: "#EAB308",
} as const;

export function PostDetailView({ post, loggedInUserId }: PostDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const card = mapPostToFeedCard(post);
  const isOwnPost = post.userId === loggedInUserId;
  const typeBadge = getPostTypeBadge(post.type ?? null);
  const profileHref = `/users/${card.username}`;
  const isLooking =
    isLookingToPlayIntent(post.intent) || card.type === "looking";

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg bg-[#0d0d0d] pb-8">
      <header className="sticky top-0 z-40 flex items-center border-b border-[#262626] bg-[#0d0d0d] px-4 py-3">
        <button
          type="button"
          onClick={() => {
            const tab = searchParams.get("tab") ?? "social";
            router.push(`/?tab=${tab}`);
          }}
          className="rounded-full p-2 text-white hover:bg-[#161616]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-white">
          Post
        </h1>
        <div className="relative flex w-9 justify-end">
          {isOwnPost && (
            <PostOptionsMenu
              post={post}
              redirectToFeedOnDelete
              triggerClassName="rounded-full p-2 text-gray-400 hover:bg-[#161616] hover:text-white"
            />
          )}
        </div>
      </header>

      <article className="mx-4 mt-4 overflow-hidden rounded-xl bg-[#161616]">
        <div
          className="h-[3px]"
          style={{ backgroundColor: accentColors[card.type] }}
        />

        <div className="p-4">
          <div className="mb-4 flex items-start justify-between gap-2">
            <Link
              href={profileHref}
              className="flex min-w-0 items-center gap-3"
            >
              {card.avatar.startsWith("http") ? (
                <img
                  src={card.avatar}
                  alt=""
                  className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-sm font-bold text-white">
                  {card.avatar}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">{card.name}</span>
                  {card.isVerified && (
                    <BadgeCheck className="h-4 w-4 fill-[#3B82F6] text-[#3B82F6]" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {card.timestamp} · {card.location}
                </p>
              </div>
            </Link>
            <span className="flex-shrink-0" style={typeBadge.style}>
              {typeBadge.label}
            </span>
          </div>

          {card.sport && (
            <span className="mb-3 inline-block rounded-full bg-[#2a2a2a] px-2.5 py-1 text-xs text-gray-300">
              {card.sport}
            </span>
          )}

          <p className="mb-4 text-base leading-relaxed text-white">
            {card.content}
          </p>

          {isLooking && (card.playerSlots?.length ?? 0) > 0 && (
              <div className="mb-4 flex items-center gap-3">
                <div className="flex -space-x-1">
                  {card.playerSlots!.map((slot, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        slot.filled
                          ? "border-[#C9F31D] bg-[#C9F31D] text-black"
                          : "border-dashed border-gray-500 bg-transparent"
                      }`}
                    >
                      {slot.filled && "✓"}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-[#C9F31D]">
                  {card.slotsRemaining} spot
                  {card.slotsRemaining !== 1 ? "s" : ""} left
                </span>
              </div>
            )}

          {isLooking && (card.timeChip || card.locationChip) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {card.timeChip && (
                  <span className="flex items-center gap-1 rounded-full border border-[#333] bg-[#1a1a1a] px-2.5 py-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {card.timeChip}
                  </span>
                )}
                {card.locationChip && (
                  <span className="flex items-center gap-1 rounded-full border border-[#333] bg-[#1a1a1a] px-2.5 py-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" />
                    {card.locationChip}
                  </span>
                )}
              </div>
            )}

          {isLooking && (
            <div className="mb-4">
              <FeedCardImInButton
                fullWidth
                authorId={card.authorId}
                sport={card.sport}
                location={card.locationChip ?? card.location}
                timeLabel={card.timeChip}
              />
            </div>
          )}

          {card.type === "recruiting" && (
            <div className="mb-4">
              <FeedCardMessageClubButton
                fullWidth
                authorId={card.authorId}
                clubName={card.name}
              />
            </div>
          )}

          <div className="flex items-center gap-6 border-t border-[#262626] pt-4">
            <FeedCardLikeButton
              postId={card.postId}
              initialState={{
                likes: card.likes ?? 0,
                isLikedByUser: card.isLikedByUser ?? false,
              }}
            />
            <FeedCardShareButton postId={card.postId} />
          </div>
        </div>
      </article>

      <section className="mx-4 mt-4 rounded-xl bg-[#161616] p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">Comments</h2>
        <FeedCardComments
          postId={card.postId}
          initialReplyCount={card.replies}
          defaultOpen
          showInputAlways
        />
      </section>
    </div>
  );
}
