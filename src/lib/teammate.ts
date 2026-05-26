import prisma from "@/lib/prisma";
import { getSportDisplay } from "@/lib/onboarding-sports";

const teammateUserSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  sports: {
    select: { sport: true },
    orderBy: { sport: "asc" as const },
  },
} as const;

export type TeammateUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  sports: { sport: string }[];
};

/** True when A follows B and B follows A. */
export async function isTeammate(
  userIdA: string,
  userIdB: string,
): Promise<boolean> {
  if (userIdA === userIdB) return false;

  const [aFollowsB, bFollowsA] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userIdA,
          followingId: userIdB,
        },
      },
    }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userIdB,
          followingId: userIdA,
        },
      },
    }),
  ]);

  return !!aFollowsB && !!bFollowsA;
}

/** User IDs of all mutual follows for `userId`. */
export async function getTeammateIds(userId: string): Promise<string[]> {
  const iFollow = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = iFollow.map((f) => f.followingId);
  if (!followingIds.length) return [];

  const mutual = await prisma.follow.findMany({
    where: {
      followerId: { in: followingIds },
      followingId: userId,
    },
    select: { followerId: true },
  });

  return mutual.map((f) => f.followerId);
}

export async function countTeammates(userId: string): Promise<number> {
  const ids = await getTeammateIds(userId);
  return ids.length;
}

/** All mutual follows for a user, with profile fields for the teammates list. */
export async function getTeammates(userId: string): Promise<TeammateUser[]> {
  const teammateIds = await getTeammateIds(userId);
  if (!teammateIds.length) return [];

  return prisma.user.findMany({
    where: { id: { in: teammateIds } },
    select: teammateUserSelect,
    orderBy: { displayName: "asc" },
  });
}

export function formatTeammateSportLabels(sports: { sport: string }[]): string {
  return sports.map((s) => getSportDisplay(s.sport).name).join(" · ");
}
