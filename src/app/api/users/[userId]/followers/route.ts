import { validateRequest } from "@/auth";
import { isTeammate } from "@/lib/teammate";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";
import { NotificationType } from "@prisma/client";

async function createTeammateNotifications(
  userAId: string,
  userBId: string,
) {
  await prisma.$transaction([
    prisma.notification.create({
      data: {
        issuerId: userBId,
        recipientId: userAId,
        type: NotificationType.TEAMMATE,
      },
    }),
    prisma.notification.create({
      data: {
        issuerId: userAId,
        recipientId: userBId,
        type: NotificationType.TEAMMATE,
      },
    }),
  ]);
}

export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        following: {
          where: {
            followingId: loggedInUser.id,
          },
          select: {
            followingId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const isFollowedByUser = user.followers.length > 0;
    const isFollowedByThem = user.following.length > 0;

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser,
      isFollowedByThem,
      isTeammate: isFollowedByUser && isFollowedByThem,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (loggedInUser.id === userId) {
      return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const wasMutualBefore = await isTeammate(loggedInUser.id, userId);

    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId,
          },
        },
        create: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
        update: {},
      }),
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: NotificationType.FOLLOW,
        },
      }),
    ]);

    if (!wasMutualBefore) {
      const isMutualNow = await isTeammate(loggedInUser.id, userId);
      if (isMutualNow) {
        await createTeammateNotifications(loggedInUser.id, userId);
      }
    }

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          OR: [
            {
              followerId: loggedInUser.id,
              followingId: userId,
            },
            {
              followerId: userId,
              followingId: loggedInUser.id,
            },
          ],
        },
      }),
      prisma.notification.deleteMany({
        where: {
          OR: [
            {
              issuerId: loggedInUser.id,
              recipientId: userId,
              type: NotificationType.FOLLOW,
            },
            {
              issuerId: userId,
              recipientId: loggedInUser.id,
              type: NotificationType.FOLLOW,
            },
            {
              issuerId: loggedInUser.id,
              recipientId: userId,
              type: NotificationType.TEAMMATE,
            },
            {
              issuerId: userId,
              recipientId: loggedInUser.id,
              type: NotificationType.TEAMMATE,
            },
          ],
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
