import { validateRequest } from "@/auth";
import AthleteProfile from "@/components/playfinder-profile/athlete-profile";
import prisma from "@/lib/prisma";
import { countTeammates } from "@/lib/teammate";
import { FollowerInfo, getUserProfileInclude } from "@/lib/types";
import { PostIntent } from "@prisma/client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { buildAthleteProfileData } from "./build-athlete-profile";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { username: string };
}

async function getUser(username: string, loggedInUserId: string) {
  noStore();

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    include: getUserProfileInclude(loggedInUserId),
  });

  if (!user) notFound();

  if (user.id !== loggedInUserId) {
    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: loggedInUserId, blockedId: user.id },
          { blockerId: user.id, blockedId: loggedInUserId },
        ],
      },
      select: { id: true },
    });

    if (blocked) notFound();
  }

  return user;
}

export async function generateMetadata({
  params: { username },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const user = await getUser(username, loggedInUser.id);

  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

export default async function Page({ params: { username } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const user = await getUser(username, loggedInUser.id);

  const isFollowedByUser = user.followers.some(
    ({ followerId }) => followerId === loggedInUser.id,
  );
  const isFollowedByThem = user.following.some(
    ({ followingId }) => followingId === loggedInUser.id,
  );

  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser,
    isFollowedByThem,
    isTeammate: isFollowedByUser && isFollowedByThem,
  };

  const [gamesCount, broadcastsCount, teammatesCount] = await Promise.all([
    prisma.post.count({
      where: {
        userId: user.id,
        intent: PostIntent.LOOKING_TO_PLAY,
      },
    }),
    prisma.post.count({
      where: { userId: user.id },
    }),
    countTeammates(user.id),
  ]);

  const isOwnProfile =
    loggedInUser.username.toLowerCase() === username.toLowerCase();

  const profile = {
    ...buildAthleteProfileData(user, loggedInUser.id, {
      games: gamesCount,
      broadcasts: broadcastsCount,
      teammates: teammatesCount,
    }),
    isOwnProfile,
  };

  return (
    <AthleteProfile
      profile={profile}
      user={user}
      followerInfo={followerInfo}
    />
  );
}
