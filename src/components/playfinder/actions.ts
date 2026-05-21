"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createBroadcastSchema } from "@/lib/validation";
import { PostIntent } from "@prisma/client";

export async function submitBroadcast(input: unknown) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const data = createBroadcastSchema.parse(input);

  const expiresAt =
    data.intent === PostIntent.LOOKING_TO_PLAY
      ? new Date(Date.now() + 6 * 60 * 60 * 1000)
      : null;

  const newPost = await prisma.post.create({
    data: {
      content: data.content,
      userId: user.id,
      sport: data.sport,
      intent: data.intent,
      location: data.location,
      timeLabel: data.timeLabel,
      expiresAt,
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
