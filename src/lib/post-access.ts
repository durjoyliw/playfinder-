import type { Prisma } from "@prisma/client";

/**
 * Which posts a viewer may see — one rule for every list and lookup:
 * - never soft-deleted / admin-hidden posts,
 * - "Teammates only" posts only for the author and mutual follows,
 * - nothing from people the viewer blocked or who blocked the viewer.
 *
 * Several routes (a user's profile posts, the For You / Following feeds,
 * Saved, trending, post detail) used to skip some or all of these checks.
 */
export function visiblePostsWhere(viewerId: string): Prisma.PostWhereInput {
  return {
    deletedAt: null,
    user: {
      blocking: { none: { blockedId: viewerId } },
      blockedBy: { none: { blockerId: viewerId } },
    },
    OR: [
      { visibility: "PUBLIC" },
      { userId: viewerId },
      {
        visibility: "TEAMMATES_ONLY",
        user: {
          followers: { some: { followerId: viewerId } },
          following: { some: { followingId: viewerId } },
        },
      },
    ],
  };
}
