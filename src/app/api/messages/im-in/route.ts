import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { z } from "zod";

const imInSchema = z.object({
  authorId: z.string().min(1),
  sport: z.string().optional(),
  location: z.string().optional(),
  timeLabel: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = imInSchema.parse(await req.json());

    if (body.authorId === user.id) {
      return Response.json(
        { error: "You cannot join your own post" },
        { status: 400 },
      );
    }

    const author = await prisma.user.findUnique({
      where: { id: body.authorId },
      select: { id: true, displayName: true, username: true },
    });

    if (!author) {
      return Response.json({ error: "Author not found" }, { status: 404 });
    }

    await streamServerClient.upsertUser({
      id: user.id,
      name: user.displayName,
      username: user.username,
    });

    await streamServerClient.upsertUser({
      id: author.id,
      name: author.displayName,
      username: author.username,
    });

    const channel = streamServerClient.channel("messaging", {
      members: [user.id, author.id],
    });

    try {
      await channel.create();
    } catch (error) {
      const streamError = error as { code?: number; status?: number };
      if (streamError.code !== 4 && streamError.status !== 409) {
        throw error;
      }
    }

    const sportLabel = body.sport ?? "game";
    const locationLabel = body.location ?? "";
    const timeLabel = body.timeLabel ?? "";

    const messageText = `Hey, I'm in for your ${sportLabel} game at ${locationLabel} ${timeLabel}!`.trim();

    await channel.sendMessage({
      text: messageText,
      user_id: user.id,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to send I'm in message", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
