import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {
  ensureDirectMessageChannel,
  upsertStreamUsers,
} from "@/lib/stream-messaging";
import { z } from "zod";

const prepareDmSchema = z.object({
  recipientId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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
