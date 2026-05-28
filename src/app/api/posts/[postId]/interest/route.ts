import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export async function POST(
  _req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId === user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.postInterest.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return Response.json(existing);
    }

    const interest = await prisma.$transaction(async (tx) => {
      const created = await tx.postInterest.create({
        data: {
          postId,
          userId: user.id,
          status: "PENDING",
        },
      });

      await tx.notification.create({
        data: {
          issuerId: user.id,
          recipientId: post.userId,
          postId,
          type: NotificationType.GAME_INTEREST,
        },
      });

      return created;
    });

    return Response.json(interest);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
