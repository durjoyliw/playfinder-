import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: currentUser } = await validateRequest();

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.id === userId) {
      return Response.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.block.upsert({
        where: {
          blockerId_blockedId: {
            blockerId: currentUser.id,
            blockedId: userId,
          },
        },
        create: {
          blockerId: currentUser.id,
          blockedId: userId,
        },
        update: {},
      }),
      prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: currentUser.id, followingId: userId },
            { followerId: userId, followingId: currentUser.id },
          ],
        },
      }),
      prisma.messageRequest.deleteMany({
        where: {
          OR: [
            { fromUserId: currentUser.id, toUserId: userId },
            { fromUserId: userId, toUserId: currentUser.id },
          ],
        },
      }),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/users/[userId]/block error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: currentUser } = await validateRequest();

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.block.deleteMany({
      where: {
        blockerId: currentUser.id,
        blockedId: userId,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/users/[userId]/block error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

