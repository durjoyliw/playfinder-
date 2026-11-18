"use client";

import {
  ArenaDateTile,
  ArenaMainAction,
  ArenaSpotPips,
  spotsText,
} from "@/components/playfinder/arena-parts";
import { EditPostSheet } from "@/components/playfinder/edit-post-sheet";
import { FeedCardComments } from "@/components/playfinder/feed-card-comments";
import { FeedCardLikeButton } from "@/components/playfinder/feed-card-like-button";
import { FeedCardSaveButton } from "@/components/playfinder/feed-card-save-button";
import { FeedCardShareButton } from "@/components/playfinder/feed-card-share-button";
import { PostInterestedPanel } from "@/components/playfinder/post-interested-panel";
import { PostOptionsMenu } from "@/components/playfinder/post-options-menu";
import { PostViewerMenu } from "@/components/playfinder/post-viewer-menu";
import { SendPostDialog } from "@/components/playfinder/send-post-dialog";
import { parseArenaWhen } from "@/lib/arena-when";
import { isLookingToPlayIntent, mapPostToFeedCard } from "@/lib/playfinder";
import { getSportEmoji } from "@/lib/sports";
import { getSportColour } from "@/lib/sport-visuals";
import { PostData } from "@/lib/types";
import { PageType } from "@prisma/client";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

/**
 * The game page for Arena posts (looking to play / recruiting), laid out
 * like the Arena card: date tile and title, Sport / When / Where, spots,
 * one main action (or the host tools on your own game), then like /
 * comment / share / send / save and the comments.
 */
export function ArenaPostDetail({
  post,
  loggedInUserId,
}: {
  post: PostData;
  loggedInUserId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const card = mapPostToFeedCard(post, loggedInUserId);
  const isOwnPost = post.userId === loggedInUserId;
  const isLooking = isLookingToPlayIntent(post.intent);
  const isPage = Boolean(card.authorPageHandle);
  const profileHref = isPage
    ? `/pages/${card.authorPageHandle}`
    : `/users/${card.username}`;
  const postHref = `/posts/${post.id}`;
  const sportColour = getSportColour(card.sport);
  const sportEmoji = card.sport ? getSportEmoji(card.sport) : "";
  const when = useMemo(
    () => parseArenaWhen(post.timeLabel, new Date(), post.createdAt),
    [post.timeLabel, post.createdAt],
  );

  const accepted = card.acceptedCount ?? 0;
  const left = card.slotsRemaining ?? 0;
  const total = accepted + left;
  const showSpots = isLooking && card.slotsRemaining != null && total > 0;
  const pendingCount =
    post.interests?.filter(
      (i) => i.status === "PENDING" && i.userId !== post.userId,
    ).length ?? 0;
  const isArenaType = post.type === "ARENA" || post.type === "BROADCAST";

  const rows: { label: string; value: React.ReactNode }[] = [];
  if (card.sport) {
    rows.push({
      label: "Sport",
      value: (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: sportColour }}
            aria-hidden
          />
          {card.sport}
        </span>
      ),
    });
  }
  if (post.timeLabel) rows.push({ label: "When", value: post.timeLabel });
  if (post.location) {
    rows.push({
      label: "Where",
      value: (
        <span>
          {post.location}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--pf-volt-text)] hover:underline"
          >
            {" "}
            · Map
          </a>
        </span>
      ),
    });
  }

  const iconBtn =
    "pf-hit flex min-h-9 items-center gap-1.5 text-[var(--pf-c-ink-7e8a7e)] transition-colors hover:text-[var(--pf-c-ink-f2f5ef)] active:scale-90";

  return (
    <div className="mx-auto min-h-full w-full max-w-lg bg-[var(--pf-bg)] pb-8">
      <header className="sticky top-0 z-40 flex items-center border-b border-[var(--pf-c-line-262626)] bg-[var(--pf-bg)] px-4 py-3">
        <button
          type="button"
          onClick={() => {
            const tab = searchParams.get("tab") ?? "arena";
            router.push(`/home?tab=${tab}`);
          }}
          className="rounded-full p-2 text-[var(--pf-c-ink-ffffff)] hover:bg-[var(--pf-c-fill-161616)]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-[var(--pf-c-ink-ffffff)]">
          {isLooking ? "Game" : "Recruiting"}
        </h1>
        <div className="relative flex w-9 justify-end">
          {isOwnPost ? (
            <PostOptionsMenu
              post={post}
              redirectToFeedOnDelete
              triggerClassName="rounded-full p-2 text-[var(--pf-c-ink-9ca3af)] hover:bg-[var(--pf-c-fill-161616)] hover:text-[var(--pf-c-ink-ffffff)]"
            />
          ) : (
            <PostViewerMenu
              postId={post.id}
              authorId={post.userId}
              authorUsername={card.username}
              authorName={card.name}
            />
          )}
        </div>
      </header>

      {/* Same card, sizes and spacing as the Social post page. */}
      <article className="pf-card mx-4 mt-4 rounded-xl bg-[var(--pf-c-fill-161616)] p-4">
        <div className="mb-4 flex items-center gap-3">
          <ArenaDateTile
            when={when}
            label={post.timeLabel ?? undefined}
            sportEmoji={sportEmoji}
            sportColour={sportColour}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={profileHref}
                className="font-semibold text-[var(--pf-c-ink-ffffff)] hover:underline"
              >
                {isOwnPost ? "You" : card.name}
              </Link>
              {isOwnPost ? (
                <span className="rounded bg-[rgb(var(--pf-volt-rgb)/0.14)] px-1.5 py-px text-[11px] font-semibold text-[var(--pf-volt-text)]">
                  Your {isLooking ? "game" : "post"}
                </span>
              ) : (
                card.authorPageType && (
                  <span className="rounded bg-[rgb(var(--pf-contrast-rgb)/0.07)] px-1.5 py-px text-[11px] font-semibold text-[var(--pf-c-ink-b4bcaf)]">
                    {card.authorPageType === PageType.VENUE ? "Venue" : "Club"}
                  </span>
                )
              )}
            </div>
            <p className="text-xs text-[var(--pf-c-ink-6b7280)]">
              {card.timestamp}
              {post.location ? ` · ${post.location}` : ""}
            </p>
          </div>
        </div>

        <p className="mb-4 text-base leading-relaxed text-[var(--pf-c-ink-ffffff)] [word-break:break-word]">
          {post.content}
        </p>

        {rows.length > 0 && (
          <dl className="border-t border-[var(--pf-c-line-262626)]">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex gap-3 border-b border-[var(--pf-c-line-262626)] py-2.5 text-sm"
              >
                <dt className="w-14 shrink-0 text-[var(--pf-c-ink-7e8a7e)]">
                  {row.label}
                </dt>
                <dd className="min-w-0 text-[var(--pf-c-ink-f2f5ef)] [word-break:break-word]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {post.attachments?.[0]?.type === "IMAGE" && (
          <img
            src={post.attachments[0].url}
            alt=""
            className="mt-4 w-full rounded-xl object-cover"
          />
        )}

        {showSpots && (
          <p className="mt-3.5 flex items-center gap-2 text-[13px] text-[var(--pf-c-ink-b4bcaf)]">
            <ArenaSpotPips accepted={accepted} total={total} size="lg" />
            {spotsText(left, card.isFull ?? false, total)}
            {isOwnPost && pendingCount > 0 && (
              <span className="font-medium text-[var(--pf-volt-text)]">
                · {pendingCount} waiting for you
              </span>
            )}
          </p>
        )}

        <div className="mt-3">
          {isOwnPost ? (
            isLooking && isArenaType ? (
              <PostInterestedPanel
                postId={post.id}
                authorId={post.userId}
                postType={post.type ?? null}
                initialPendingCount={pendingCount}
                variant="arena"
                onEdit={() => setEditOpen(true)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="mb-1 flex h-10 w-full items-center justify-center rounded-xl border border-[var(--pf-c-line-2a2f2a)] text-[13px] font-semibold text-[var(--pf-c-ink-f2f5ef)] hover:bg-[var(--pf-c-fill-1e211e)]"
              >
                Edit
              </button>
            )
          ) : (
            <ArenaMainAction
              size="lg"
              postId={post.id}
              authorId={post.userId}
              name={card.name}
              sport={card.sport}
              isPage={isPage}
              postHref={postHref}
              isOwnPost={false}
              isRecruiting={!isLooking}
              isFull={card.isFull ?? false}
              userInterestStatus={card.userInterestStatus ?? null}
            />
          )}
        </div>

        <div className="-mx-1.5 mt-4 flex items-center justify-between border-t border-[var(--pf-c-line-262626)] pt-4">
          <FeedCardLikeButton
            postId={post.id}
            initialState={{
              likes: card.likes ?? 0,
              isLikedByUser: card.isLikedByUser ?? false,
            }}
            className="pf-hit min-h-9"
          />
          <a href="#comments" className={iconBtn} aria-label="Go to comments">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[13px] font-medium">{card.replies ?? 0}</span>
          </a>
          <FeedCardShareButton postId={post.id} iconOnly className={iconBtn} />
          <button
            type="button"
            onClick={() => setSendDialogOpen(true)}
            className={iconBtn}
            aria-label="Send as message"
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
          <FeedCardSaveButton
            postId={post.id}
            initialState={{
              isBookmarkedByUser: card.isBookmarkedByUser ?? false,
            }}
            iconSize={19}
            className="pf-hit active:scale-90"
          />
        </div>
      </article>

      <section
        id="comments"
        className="pf-card mx-4 mt-4 scroll-mt-20 rounded-xl bg-[var(--pf-c-fill-161616)] p-4"
      >
        <h2 className="mb-3 text-sm font-semibold text-[var(--pf-c-ink-ffffff)]">
          Comments
        </h2>
        <FeedCardComments
          postId={post.id}
          initialReplyCount={card.replies}
          defaultOpen
          showInputAlways
        />
      </section>

      {sendDialogOpen && (
        <SendPostDialog postId={post.id} onOpenChange={setSendDialogOpen} />
      )}
      {editOpen && (
        <EditPostSheet post={post} open={editOpen} onOpenChange={setEditOpen} />
      )}
    </div>
  );
}
