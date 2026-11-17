import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { isTeammate } from "@/lib/teammate-server";
import {
  ensureDirectMessageChannel,
  upsertStreamUsers,
} from "@/lib/stream-messaging";
import { z } from "zod";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const prepareDmSchema = z.object({
  recipientId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit("dm", user.id);
    if (!limit.ok) return tooManyRequests(limit);

    const { recipientId } = prepareDmSchema.parse(await req.json());

    if (recipientId === user.id) {
      return Response.json(
        { error: "You cannot message yourself" },
        { status: 400 },
      );
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, displayName: true, username: true },
    });

    if (!recipient) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Direct chats are for teammates (mutual follows) or people who accepted
    // a message request — never across a block. Everyone else goes through
    // /api/messages/request. (This route used to open a DM with anyone,
    // including people who had blocked you.)
    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: user.id, blockedId: recipient.id },
          { blockerId: recipient.id, blockedId: user.id },
        ],
      },
      select: { id: true },
    });
    if (blocked) {
      return Response.json({ error: "blocked" }, { status: 403 });
    }

    const allowed =
      (await isTeammate(user.id, recipient.id)) ||
      (await prisma.messageRequest.count({
        where: {
          status: "ACCEPTED",
          OR: [
            { fromUserId: user.id, toUserId: recipient.id },
            { fromUserId: recipient.id, toUserId: user.id },
          ],
        },
      })) > 0;
    if (!allowed) {
      return Response.json(
        { error: "Send a message request first" },
        { status: 403 },
      );
    }

    await upsertStreamUsers(
      {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
      },
      {
        id: recipient.id,
        displayName: recipient.displayName,
        username: recipient.username,
      },
    );

    await ensureDirectMessageChannel(user.id, recipient.id);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to prepare DM channel", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
