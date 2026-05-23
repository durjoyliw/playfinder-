"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { getListingExpiresAt } from "@/lib/playfinder";
import { createBroadcastSchema } from "@/lib/validation";
import { PostIntent } from "@prisma/client";

export async function submitBroadcast(input: unknown) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const data = createBroadcastSchema.parse(input);

  const expiresAt = getListingExpiresAt(data.intent);

  const newPost = await prisma.post.create({
    data: {
      content: data.content,
      userId: user.id,
      sport: data.sport,
      intent: data.intent,
      location: data.location,
      timeLabel: data.intent === PostIntent.BANTER ? null : data.timeLabel ?? null,
      expiresAt,
      slotsNeeded:
        data.intent === PostIntent.LOOKING_TO_PLAY ? data.slotsNeeded ?? null : null,
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
