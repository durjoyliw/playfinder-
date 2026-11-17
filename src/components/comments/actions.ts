"use server";

import { validateRequest } from "@/auth";
import { visiblePostsWhere } from "@/lib/post-access";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");
  await enforceRateLimit("comment", user.id);

  const { content: contentValidated } = createCommentSchema.parse({ content });

  // Never trust the post object from the client: look it up (and check the
  // caller may see it) server-side, and notify its real author.
  const target = await prisma.post.findFirst({
    where: { AND: [{ id: post.id }, visiblePostsWhere(user.id)] },
    select: { id: true, userId: true },
  });
  if (!target) throw new Error("Post not found");

  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: target.id,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    }),
    ...(target.userId !== user.id
      ? [
          prisma.notification.create({
            data: {
              issuerId: user.id,
              recipientId: target.userId,
              postId: target.id,
              type: "COMMENT",
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}

export async function deleteComment(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");
  await enforceRateLimit("comment", user.id);

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== user.id) throw new Error("Unauthorized");

  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id),
  });

  return deletedComment;
}
