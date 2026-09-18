import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {
  createGroupChannel,
  upsertStreamUsersMany,
} from "@/lib/stream-messaging";
import { z } from "zod";

const prepareGroupSchema = z.object({
  memberIds: z.array(z.string().min(1)).min(2).max(49),
  name: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberIds, name } = prepareGroupSchema.parse(await req.json());
    const uniqueMemberIds = Array.from(
      new Set(memberIds.filter((id) => id !== user.id)),
    );

    if (uniqueMemberIds.length < 2) {
      return Response.json(
        { error: "Pick at least 2 people for a group" },
        { status: 400 },
      );
    }

    const members = await prisma.user.findMany({
      where: { id: { in: uniqueMemberIds } },
      select: { id: true, displayName: true, username: true },
    });

    if (members.length !== uniqueMemberIds.length) {
      return Response.json(
        { error: "One or more users could not be found" },
        { status: 404 },
      );
    }

    const blocks = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: user.id, blockedId: { in: uniqueMemberIds } },
          { blockerId: { in: uniqueMemberIds }, blockedId: user.id },
        ],
      },
    });

    if (blocks) {
      return Response.json(
        { error: "You can't start a group with someone you've blocked" },
        { status: 403 },
      );
    }

    await upsertStreamUsersMany([
      { id: user.id, displayName: user.displayName, username: user.username },
      ...members,
    ]);

    const channel = await createGroupChannel(user.id, uniqueMemberIds, name);

    return Response.json({ success: true, channelId: channel.id });
  } catch (error) {
    console.error("Failed to prepare group channel", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
