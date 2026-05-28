import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {
  countAcceptedInterests,
  syncPostIsFull,
} from "@/lib/post-interest";
import { NotificationType } from "@prisma/client";
import { z } from "zod";

const bodySchema = z.object({
  action: z.enum(["ACCEPT", "IGNORE", "REMOVE", "MANUAL_FILL"]),
});

export async function PATCH(
  req: Request,
  {
    params: { postId, interestId },
  }: { params: { postId: string; interestId: string } },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }

    const { action } = parsed.data;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
        slotsNeeded: true,
        interests: {
          select: { userId: true, status: true },
        },
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "MANUAL_FILL") {
      const interest = await prisma.$transaction(async (tx) => {
        const manual = await tx.postInterest.upsert({
          where: {
            postId_userId: {
              postId,
              userId: user.id,
            },
          },
          create: {
            postId,
            userId: user.id,
            status: "ACCEPTED",
          },
          update: {
            status: "ACCEPTED",
          },
        });

        const allInterests = await tx.postInterest.findMany({
          where: { postId },
          select: { userId: true, status: true },
        });

        const acceptedCount = countAcceptedInterests(allInterests);
        await syncPostIsFull(postId, post.slotsNeeded, acceptedCount);

        return manual;
      });

      return Response.json(interest);
    }

    const interest = await prisma.postInterest.findFirst({
      where: { id: interestId, postId },
      select: { id: true, userId: true, status: true },
    });

    if (!interest) {
      return Response.json({ error: "Interest not found" }, { status: 404 });
    }

    if (action === "ACCEPT") {
      const updated = await prisma.$transaction(async (tx) => {
        const accepted = await tx.postInterest.update({
          where: { id: interestId },
          data: { status: "ACCEPTED" },
        });

        const allInterests = await tx.postInterest.findMany({
          where: { postId },
          select: { userId: true, status: true },
        });

        const acceptedCount = countAcceptedInterests(allInterests);
        await syncPostIsFull(postId, post.slotsNeeded, acceptedCount);

        if (interest.userId !== user.id) {
          await tx.notification.create({
            data: {
              issuerId: user.id,
              recipientId: interest.userId,
              postId,
              type: NotificationType.GAME_INTEREST,
            },
          });
        }

        return accepted;
      });

      return Response.json(updated);
    }

    if (action === "IGNORE") {
      const updated = await prisma.postInterest.update({
        where: { id: interestId },
        data: { status: "IGNORED" },
      });
      return Response.json(updated);
    }

    if (action === "REMOVE") {
      const updated = await prisma.$transaction(async (tx) => {
        const removed = await tx.postInterest.update({
          where: { id: interestId },
          data: { status: "PENDING" },
        });

        const allInterests = await tx.postInterest.findMany({
          where: { postId },
          select: { userId: true, status: true },
        });

        const acceptedCount = countAcceptedInterests(allInterests);
        await syncPostIsFull(postId, post.slotsNeeded, acceptedCount);

        return removed;
      });

      return Response.json(updated);
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
