"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");
  await enforceRateLimit("post", user.id);

  const { content, mediaIds } = createPostSchema.parse(input);

  // Only fresh, unattached uploads may be attached. `connect` on a media row
  // that already belongs to another post would move it onto this one.
  if (mediaIds.length > 0) {
    const attachable = await prisma.media.count({
      where: { id: { in: mediaIds }, postId: null },
    });
    if (attachable !== new Set(mediaIds).size) {
      throw new Error("Invalid attachments");
    }
  }

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
