"use client";

import { FeedCardComments } from "@/components/playfinder/feed-card-comments";
import { FeedCardImInButton } from "@/components/playfinder/feed-card-im-in-button";
import { FeedCardLikeButton } from "@/components/playfinder/feed-card-like-button";
import { FeedCardMessageClubButton } from "@/components/playfinder/feed-card-message-club-button";
import { FeedCardShareButton } from "@/components/playfinder/feed-card-share-button";
import { PostInterestedPanel } from "@/components/playfinder/post-interested-panel";
import { PostOptionsMenu } from "@/components/playfinder/post-options-menu";
import {
  getPostTypeBadge,
  isLookingToPlayIntent,
  mapPostToFeedCard,
} from "@/lib/playfinder";
import kyInstance from "@/lib/ky";
import { computeSpotsLeft } from "@/lib/post-interest";
import { PostData } from "@/lib/types";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

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
  const queryClient = useQueryClient();
  const card = mapPostToFeedCard(post, loggedInUserId);
  const isOwnPost = post.userId === loggedInUserId;
  const typeBadge = getPostTypeBadge(post.type ?? null);
  const profileHref = `/users/${card.username}`;
  const isLooking =
    isLookingToPlayIntent(post.intent) || card.type === "looking";
  const isArenaPost =
    post.type === "ARENA" || post.type === "BROADCAST";
  const showSpots =
    isArenaPost &&
    card.acceptedCount != null &&
    card.slotsRemaining != null;
  const pendingInterestCount =
    post.interests?.filter((i) => i.status === "PENDING").length ?? 0;

  const acceptedInterests = useMemo(
    () =>
      (post.interests ?? [])
        .filter((i) => i.status === "ACCEPTED")
        .sort((a, b) => a.id.localeCompare(b.id)),
    [post.interests],
  );

  const slotsRemaining = computeSpotsLeft(
    post.slotsNeeded,
    acceptedInterests.length,
  );

  const removeSpotMutation = useMutation({
    mutationFn: (interestId: string) =>
      kyInstance
        .patch(`/api/posts/${post.id}/interests/${interestId}`, {
          json: { action: "REMOVE" },
        })
        .json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
      queryClient.invalidateQueries({ queryKey: ["post-interests", post.id] });
      router.refresh();
    },
  });

  function handleRemoveSpot(spotIndex: number) {
    const interest = acceptedInterests[spotIndex];
    if (!interest) return;
    removeSpotMutation.mutate(interest.id);
  }

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

          {showSpots && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "8px 0 16px",
              }}
            >
              {acceptedInterests.map((interest, i) => (
                <div
                  key={interest.id}
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "2px solid #C9F31D",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "transparent",
                    }}
                  >
                    <IconCheck size={14} color="#C9F31D" stroke={2.5} />
                  </div>
                  {isOwnPost && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSpot(i)}
                      disabled={removeSpotMutation.isPending}
                      aria-label="Remove spot"
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#ef4444",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <IconX size={10} color="#fff" stroke={2.5} />
                    </button>
                  )}
                </div>
              ))}
              {Array.from({ length: slotsRemaining }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "2px dashed #444",
                    background: "transparent",
                  }}
                />
              ))}
              <span
                style={{ fontSize: 13, color: "#C9F31D", fontWeight: 600 }}
              >
                {slotsRemaining > 0
                  ? `${slotsRemaining} spot${slotsRemaining > 1 ? "s" : ""} left`
                  : "Full"}
              </span>
            </div>
          )}

          {isOwnPost && isArenaPost && (
            <PostInterestedPanel
              postId={post.id}
              authorId={post.userId}
              postType={post.type ?? null}
              initialPendingCount={pendingInterestCount}
            />
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

          {isLooking && !isOwnPost && (
            <div className="mb-4">
              <FeedCardImInButton
                fullWidth
                postId={card.postId}
                authorId={card.authorId}
                isFull={card.isFull}
                userInterestStatus={card.userInterestStatus}
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
