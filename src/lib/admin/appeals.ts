"use server";

import prisma from "@/lib/prisma";
import { UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ADMIN_ACTOR_ID, requireAdmin } from "./auth";

function revalidateAppeals(userId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/appeals");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/audit-log");
}

export async function approveAppeal(appealId: string, formData?: FormData) {
  await requireAdmin();

  const appeal = await prisma.appeal.findUnique({ where: { id: appealId } });
  if (!appeal) {
    throw new Error("Appeal not found");
  }

  const note =
    String(formData?.get("reviewNote") ?? "").trim() || "Appeal approved";

  await prisma.$transaction([
    prisma.appeal.update({
      where: { id: appealId },
      data: {
        status: "APPROVED",
        reviewedBy: ADMIN_ACTOR_ID,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    }),
    prisma.user.update({
      where: { id: appeal.userId },
      data: {
        status: UserStatus.ACTIVE,
        suspendedUntil: null,
      },
    }),
    prisma.auditLog.create({
      data: {
        adminId: ADMIN_ACTOR_ID,
        action: "APPROVE_APPEAL",
        targetType: "APPEAL",
        targetId: appealId,
        reason: note,
      },
    }),
  ]);

  revalidateAppeals(appeal.userId);
}

export async function rejectAppeal(appealId: string, formData?: FormData) {
  await requireAdmin();

  const appeal = await prisma.appeal.findUnique({ where: { id: appealId } });
  if (!appeal) {
    throw new Error("Appeal not found");
  }

  const note =
    String(formData?.get("reviewNote") ?? "").trim() || "Appeal rejected";

  await prisma.$transaction([
    prisma.appeal.update({
      where: { id: appealId },
      data: {
        status: "REJECTED",
        reviewedBy: ADMIN_ACTOR_ID,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    }),
    prisma.auditLog.create({
      data: {
        adminId: ADMIN_ACTOR_ID,
        action: "REJECT_APPEAL",
        targetType: "APPEAL",
        targetId: appealId,
        reason: note,
      },
    }),
  ]);

  revalidateAppeals(appeal.userId);
}
