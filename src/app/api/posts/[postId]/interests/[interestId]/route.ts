import { validateRequest } from "@/auth";
import { GAME_EVENT, INTEREST_STATUS } from "@/lib/game-notifications";
import prisma from "@/lib/prisma";
import {
  countAccepted,
  lockPost,
  syncPostIsFull,
} from "@/lib/post-interest-sync";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { NotificationType } from "@prisma/client";
import { z } from "zod";

const bodySchema = z.object({
  action: z.enum(["ACCEPT", "IGNORE", "REMOVE", "MANUAL_FILL"]),
});

/** Thrown inside a transaction to abort it with a user-facing 409. */
class GameConflict extends Error {}

/**
 * Host actions on a game:
 * - ACCEPT a pending request (never past the number of players needed)
 * - IGNORE (decline) a pending request — the player is told
 * - REMOVE an accepted player — the spot reopens and the player is told
 * - MANUAL_FILL a spot filled outside the app (reduces players needed by one)
 */
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

    const limit = await rateLimit("interest-manage", user.id);
    if (!limit.ok) return tooManyRequests(limit);

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }
    const { action } = parsed.data;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, deletedAt: true },
    });

    if (!post || post.deletedAt) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.userId !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Serialise all changes to this game's roster.
      await lockPost(tx, postId);
      const locked = await tx.post.findUniqueOrThrow({
        where: { id: postId },
        select: { slotsNeeded: true },
      });

      if (action === "MANUAL_FILL") {
        const accepted = await countAccepted(tx, postId);
        const needed = locked.slotsNeeded ?? 0;
        if (needed <= accepted) {
          throw new GameConflict("The game is already full.");
        }
        const slotsNeeded = needed - 1;
        await tx.post.update({ where: { id: postId }, data: { slotsNeeded } });
        await syncPostIsFull(postId, slotsNeeded, accepted, tx);
        return { slotsNeeded };
      }

      const interest = await tx.postInterest.findFirst({
        where: { id: interestId, postId },
        select: { id: true, userId: true, status: true },
      });
      if (!interest) return null;

      if (action === "ACCEPT") {
        if (interest.status !== INTEREST_STATUS.PENDING) {
          throw new GameConflict("That request is no longer pending.");
        }
        const accepted = await countAccepted(tx, postId);
        if (locked.slotsNeeded != null && accepted >= locked.slotsNeeded) {
          throw new GameConflict("The game is already full.");
        }
        const updated = await tx.postInterest.update({
          where: { id: interest.id },
          data: { status: INTEREST_STATUS.ACCEPTED },
        });
        await syncPostIsFull(postId, locked.slotsNeeded, accepted + 1, tx);
        await tx.notification.create({
          data: {
            issuerId: user.id,
            recipientId: interest.userId,
            postId,
            type: NotificationType.GAME_INTEREST,
            body: GAME_EVENT.ACCEPTED,
          },
        });
        return updated;
      }

      if (action === "IGNORE") {
        if (interest.status !== INTEREST_STATUS.PENDING) {
          throw new GameConflict("That request is no longer pending.");
        }
        const updated = await tx.postInterest.update({
          where: { id: interest.id },
          data: { status: INTEREST_STATUS.DECLINED },
        });
        await tx.notification.create({
          data: {
            issuerId: user.id,
            recipientId: interest.userId,
            postId,
            type: NotificationType.GAME_INTEREST,
            body: GAME_EVENT.DECLINED,
          },
        });
        return updated;
      }

      // REMOVE
      if (interest.status !== INTEREST_STATUS.ACCEPTED) {
        throw new GameConflict("That player isn't in the game.");
      }
      const updated = await tx.postInterest.update({
        where: { id: interest.id },
        // Used to silently reset to PENDING, so the player thought they
        // were still queued.
        data: { status: INTEREST_STATUS.REMOVED },
      });
      const accepted = await countAccepted(tx, postId);
      await syncPostIsFull(postId, locked.slotsNeeded, accepted, tx);
      if (interest.userId !== user.id) {
        await tx.notification.create({
          data: {
            issuerId: user.id,
            recipientId: interest.userId,
            postId,
            type: NotificationType.GAME_INTEREST,
            body: GAME_EVENT.REMOVED,
          },
        });
      }
      return updated;
    });

    if (result === null) {
      return Response.json({ error: "Interest not found" }, { status: 404 });
    }
    return Response.json(result);
  } catch (error) {
    if (error instanceof GameConflict) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
