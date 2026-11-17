import { validateRequest } from "@/auth";
import { GAME_EVENT, INTEREST_STATUS } from "@/lib/game-notifications";
import prisma from "@/lib/prisma";
import { countAccepted, syncPostIsFull } from "@/lib/post-interest-sync";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { NotificationType, PostIntent } from "@prisma/client";

function conflict(error: string) {
  return Response.json({ error }, { status: 409 });
}

/** "I'm in": ask to join someone's game. */
export async function POST(
  _req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit("interest", user.id);
    if (!limit.ok) return tooManyRequests(limit);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
        intent: true,
        isFull: true,
        expiresAt: true,
        deletedAt: true,
        visibility: true,
      },
    });

    // Deleted posts and posts by/of blocked people look like they don't exist.
    if (!post || post.deletedAt) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.userId === user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: post.userId, blockedId: user.id },
          { blockerId: user.id, blockedId: post.userId },
        ],
      },
      select: { id: true },
    });
    if (blocked) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.intent !== PostIntent.LOOKING_TO_PLAY) {
      return conflict("This post isn't looking for players.");
    }

    if (post.visibility === "TEAMMATES_ONLY") {
      const mutual = await prisma.follow.count({
        where: {
          OR: [
            { followerId: user.id, followingId: post.userId },
            { followerId: post.userId, followingId: user.id },
          ],
        },
      });
      if (mutual < 2) {
        return Response.json(
          { error: "This game is for teammates only." },
          { status: 403 },
        );
      }
    }

    const existing = await prisma.postInterest.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    // Already asked / in / declined / removed: report the current state.
    // Only someone who dropped out can ask again.
    if (existing && existing.status !== INTEREST_STATUS.LEFT) {
      return Response.json(existing);
    }

    if (post.expiresAt && post.expiresAt.getTime() <= Date.now()) {
      return conflict("This game has already happened.");
    }
    if (post.isFull) {
      return conflict("This game is full.");
    }

    const interest = await prisma.$transaction(async (tx) => {
      const saved = existing
        ? await tx.postInterest.update({
            where: { id: existing.id },
            data: { status: INTEREST_STATUS.PENDING },
          })
        : await tx.postInterest.create({
            data: { postId, userId: user.id, status: INTEREST_STATUS.PENDING },
          });

      await tx.notification.create({
        data: {
          recipientId: post.userId,
          issuerId: user.id,
          type: NotificationType.GAME_INTEREST,
          postId: post.id,
        },
      });

      return saved;
    });

    return Response.json(interest);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Withdraw a pending request, or drop out of a game you were accepted into
 * (which frees the spot and tells the host).
 */
export async function DELETE(
  _req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit("interest", user.id);
    if (!limit.ok) return tooManyRequests(limit);

    const interest = await prisma.postInterest.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
      include: { post: { select: { userId: true, slotsNeeded: true } } },
    });

    if (!interest) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    if (interest.status === INTEREST_STATUS.PENDING) {
      await prisma.$transaction([
        prisma.postInterest.delete({ where: { id: interest.id } }),
        // Take the "wants to join your game" alert back off the host's list.
        prisma.notification.deleteMany({
          where: {
            recipientId: interest.post.userId,
            issuerId: user.id,
            postId,
            type: NotificationType.GAME_INTEREST,
            body: null,
          },
        }),
      ]);
      return Response.json({ status: null });
    }

    if (interest.status === INTEREST_STATUS.ACCEPTED) {
      const updated = await prisma.$transaction(async (tx) => {
        const left = await tx.postInterest.update({
          where: { id: interest.id },
          data: { status: INTEREST_STATUS.LEFT },
        });
        const accepted = await countAccepted(tx, postId);
        await syncPostIsFull(postId, interest.post.slotsNeeded, accepted, tx);
        await tx.notification.create({
          data: {
            recipientId: interest.post.userId,
            issuerId: user.id,
            postId,
            type: NotificationType.GAME_INTEREST,
            body: GAME_EVENT.LEFT,
          },
        });
        return left;
      });
      return Response.json(updated);
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
