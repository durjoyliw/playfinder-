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
      select: { id: true, userId: true },
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

      if (post.userId !== user.id) {
        await tx.notification.create({
          data: {
            recipientId: post.userId,
            issuerId: user.id,
            type: NotificationType.GAME_INTEREST,
            postId: post.id,
          },
        });
      }

      return created;
    });

    return Response.json(interest);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interest = await prisma.postInterest.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    if (!interest || interest.status !== "PENDING") {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.postInterest.delete({
      where: { id: interest.id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
