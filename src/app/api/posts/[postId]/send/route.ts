import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import {
  ensureDirectMessageChannel,
  upsertStreamUsers,
} from "@/lib/stream-messaging";
import { z } from "zod";

const sendSchema = z.object({
  recipientId: z.string().min(1),
});

export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: currentUser } = await validateRequest();

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId } = sendSchema.parse(await req.json());

    if (recipientId === currentUser.id) {
      return Response.json(
        { error: "You can't send a post to yourself" },
        { status: 400 },
      );
    }

    const [post, recipient, blocked] = await Promise.all([
      prisma.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          content: true,
          sport: true,
          user: { select: { displayName: true, avatarUrl: true } },
          attachments: { select: { url: true, type: true }, take: 1 },
        },
      }),
      prisma.user.findUnique({
        where: { id: recipientId },
        select: { id: true, displayName: true, username: true },
      }),
      prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: currentUser.id, blockedId: recipientId },
            { blockerId: recipientId, blockedId: currentUser.id },
          ],
        },
      }),
    ]);

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }
    if (!recipient) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    if (blocked) {
      return Response.json(
        { error: "Can't message this user" },
        { status: 403 },
      );
    }

    await upsertStreamUsers(
      {
        id: currentUser.id,
        displayName: currentUser.displayName,
        username: currentUser.username,
      },
      {
        id: recipient.id,
        displayName: recipient.displayName,
        username: recipient.username,
      },
    );

    const channel = await ensureDirectMessageChannel(
      currentUser.id,
      recipient.id,
    );
    await channel.watch();

    const image =
      post.attachments.find((m) => m.type === "IMAGE") ?? post.attachments[0];

    await channel.sendMessage({
      user_id: currentUser.id,
      text: "",
      attachments: [
        {
          type: "post_share",
          post_id: post.id,
          author_name: post.user.displayName,
          author_avatar: post.user.avatarUrl ?? undefined,
          content: post.content.slice(0, 200),
          sport: post.sport ?? undefined,
          image_url: image?.url,
        },
      ],
    });

    return Response.json({ success: true, channelId: channel.id });
  } catch (error) {
    console.error("POST /api/posts/[postId]/send error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
