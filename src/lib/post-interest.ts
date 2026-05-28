import type { PostInterest } from "@prisma/client";

type InterestRow = Pick<PostInterest, "userId" | "status">;

export function countAcceptedInterests(interests: InterestRow[]): number {
  return interests.filter((i) => i.status === "ACCEPTED").length;
}

export function computeSpotsLeft(
  slotsNeeded: number | null | undefined,
  acceptedCount: number,
): number {
  if (slotsNeeded == null || slotsNeeded <= 0) return 0;
  return Math.max(0, slotsNeeded - acceptedCount);
}

export function computeInterestFields(
  post: {
    slotsNeeded: number | null;
    isFull: boolean;
    interests?: InterestRow[];
  },
  currentUserId: string,
) {
  const interests = post.interests ?? [];
  const acceptedCount = countAcceptedInterests(interests);
  const spotsLeft = computeSpotsLeft(post.slotsNeeded, acceptedCount);
  const userInterest = interests.find((i) => i.userId === currentUserId);

  return {
    acceptedCount,
    spotsLeft,
    isFull: post.isFull,
    userInterestStatus: userInterest?.status ?? null,
  };
}

import prisma from "@/lib/prisma";

export async function syncPostIsFull(
  postId: string,
  slotsNeeded: number | null,
  acceptedCount: number,
) {
  const isFull =
    slotsNeeded != null &&
    slotsNeeded > 0 &&
    acceptedCount >= slotsNeeded;

  await prisma.post.update({
    where: { id: postId },
    data: { isFull },
  });

  return isFull;
}
