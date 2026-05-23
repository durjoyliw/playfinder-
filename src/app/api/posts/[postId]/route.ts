import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createBroadcastSchema } from "@/lib/validation";
import { PostIntent } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!existing) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = createBroadcastSchema.parse(await req.json());

    const expiresAt =
      data.intent === PostIntent.BANTER
        ? null
        : data.expiresAt
          ? new Date(data.expiresAt)
          : null;

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        content: data.content,
        sport: data.sport,
        intent: data.intent,
        location: data.location,
        timeLabel: data.intent === PostIntent.BANTER ? null : data.timeLabel ?? null,
        expiresAt,
        slotsNeeded:
          data.intent === PostIntent.LOOKING_TO_PLAY
            ? data.slotsNeeded ?? null
            : null,
      },
      include: getPostDataInclude(user.id),
    });

    return Response.json(updated);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
