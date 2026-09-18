"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ADMIN_ACTOR_ID, requireAdmin } from "./auth";

function revalidatePost(userId: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/audit-log");
}

export async function hidePost(postId: string, formData: FormData) {
  await requireAdmin();

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new Error("Post not found");
  }

  const reason =
    String(formData.get("deletionReason") ?? "").trim() ||
    "Post hidden by admin";

  await prisma.$transaction([
    prisma.post.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
        deletedBy: ADMIN_ACTOR_ID,
        deletionReason: reason,
      },
    }),
    prisma.auditLog.create({
      data: {
        adminId: ADMIN_ACTOR_ID,
        action: "HIDE_POST",
        targetType: "POST",
        targetId: postId,
        reason,
      },
    }),
  ]);

  revalidatePost(post.userId);
}

export async function restorePost(postId: string) {
  await requireAdmin();

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new Error("Post not found");
  }

  await prisma.$transaction([
    prisma.post.update({
      where: { id: postId },
      data: {
        deletedAt: null,
        deletedBy: null,
        deletionReason: null,
      },
    }),
    prisma.auditLog.create({
      data: {
        adminId: ADMIN_ACTOR_ID,
        action: "RESTORE_POST",
        targetType: "POST",
        targetId: postId,
        reason: "Post restored",
      },
    }),
  ]);

  revalidatePost(post.userId);
}
