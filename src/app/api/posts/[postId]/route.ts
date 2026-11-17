import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { getListingExpiresAt } from "@/lib/playfinder";
import { countAccepted } from "@/lib/post-interest-sync";
import { createBroadcastSchema } from "@/lib/validation";
import { PostIntent } from "@prisma/client";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function PATCH(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit("post-edit", user.id);
    if (!limit.ok) return tooManyRequests(limit);

    const existing = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, intent: true, expiresAt: true, deletedAt: true },
    });

    if (!existing || existing.deletedAt) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = createBroadcastSchema.parse(await req.json());

    // Keep the current expiry unless the kick-off time (or intent) changed;
    // editing typos used to push a listing's expiry out by another 24h.
    const expiresAt =
      data.startsAt || data.intent !== existing.intent || !existing.expiresAt
        ? getListingExpiresAt(data.intent, data.startsAt)
        : existing.expiresAt;

    const slotsNeeded =
      data.intent === PostIntent.LOOKING_TO_PLAY ? data.slotsNeeded ?? null : null;
    // Changing "players needed" must keep the Game full flag honest.
    const accepted = await countAccepted(prisma, postId);
    const isFull = slotsNeeded != null && slotsNeeded > 0 && accepted >= slotsNeeded;

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        isFull,
        content: data.content,
        sport: data.sport,
        intent: data.intent,
        location: data.location,
        timeLabel: data.intent === PostIntent.BANTER ? null : data.timeLabel ?? null,
        expiresAt,
        slotsNeeded,
      },
      include: getPostDataInclude(user.id),
    });

    return Response.json(updated);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
