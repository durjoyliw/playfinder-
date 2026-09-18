"use server";

import prisma from "@/lib/prisma";
import { UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ADMIN_ACTOR_ID, requireAdmin } from "./auth";

async function writeUserAuditLog(
  userId: string,
  action: string,
  reason: string,
) {
  await prisma.auditLog.create({
    data: {
      adminId: ADMIN_ACTOR_ID,
      action,
      targetType: "USER",
      targetId: userId,
      reason,
    },
  });
}

function revalidateUser(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/audit-log");
}

export async function warnUser(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  await writeUserAuditLog(userId, "WARN", "Warning issued");
  revalidateUser(userId);
}

export async function suspendUser(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED },
    }),
    prisma.auditLog.create({
      data: {
        adminId: ADMIN_ACTOR_ID,
        action: "SUSPEND",
        targetType: "USER",
        targetId: userId,
        reason: "Account suspended",
      },
    }),
  ]);

  revalidateUser(userId);
}

export async function banUser(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.BANNED },
    }),
    prisma.auditLog.create({
      data: {
        adminId: ADMIN_ACTOR_ID,
        action: "BAN",
        targetType: "USER",
        targetId: userId,
        reason: "Account banned",
      },
    }),
  ]);

  revalidateUser(userId);
}
