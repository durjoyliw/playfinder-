"use server";

import prisma from "@/lib/prisma";
import { UserStatus } from "@prisma/client";
import { addHours } from "date-fns";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "./audit";
import { ADMIN_ACTOR_ID, requireAdmin } from "./auth";

const SUSPEND_HOURS: Record<string, number> = {
  "24h": 24,
  "48h": 48,
  "7d": 7 * 24,
  "30d": 30 * 24,
};

function revalidateUser(userId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/audit-log");
  revalidatePath("/admin/appeals");
}

async function getUserOrThrow(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function warnUser(userId: string, reason?: string) {
  await requireAdmin();
  await getUserOrThrow(userId);
  await writeAuditLog({
    action: "WARN",
    targetType: "USER",
    targetId: userId,
    reason: reason?.trim() || "Warning issued",
  });
  revalidateUser(userId);
}

async function setUserStatus(
  userId: string,
  status: UserStatus,
  action: string,
  reason: string,
  suspendedUntil: Date | null,
) {
  await requireAdmin();
  await getUserOrThrow(userId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status, suspendedUntil },
    }),
    prisma.auditLog.create({
      data: {
        adminId: ADMIN_ACTOR_ID,
        action,
        targetType: "USER",
        targetId: userId,
        reason,
      },
    }),
  ]);

  revalidateUser(userId);
}

export async function restrictUser(userId: string, reason?: string) {
  await setUserStatus(
    userId,
    UserStatus.RESTRICTED,
    "RESTRICT",
    reason?.trim() || "Account restricted (read-only)",
    null,
  );
}

export async function disableMessaging(userId: string, reason?: string) {
  await setUserStatus(
    userId,
    UserStatus.MESSAGING_DISABLED,
    "DISABLE_MESSAGING",
    reason?.trim() || "Messaging disabled",
    null,
  );
}

export async function disableEventCreation(userId: string, reason?: string) {
  await setUserStatus(
    userId,
    UserStatus.EVENT_CREATION_DISABLED,
    "DISABLE_EVENT_CREATION",
    reason?.trim() || "Event creation disabled",
    null,
  );
}

export async function timedSuspendUser(
  userId: string,
  duration: string,
  reason?: string,
) {
  const hours = SUSPEND_HOURS[duration];
  if (!hours) {
    throw new Error("Invalid suspension duration");
  }

  const until = addHours(new Date(), hours);
  await setUserStatus(
    userId,
    UserStatus.SUSPENDED,
    "SUSPEND",
    reason?.trim() || `Account suspended for ${duration} until ${until.toISOString()}`,
    until,
  );
}

export async function banUser(userId: string, reason?: string) {
  await setUserStatus(
    userId,
    UserStatus.BANNED,
    "BAN",
    reason?.trim() || "Account permanently banned",
    null,
  );
}

export async function liftUserRestriction(userId: string, reason?: string) {
  await setUserStatus(
    userId,
    UserStatus.ACTIVE,
    "LIFT_RESTRICTION",
    reason?.trim() || "Restriction lifted; account restored to ACTIVE",
    null,
  );
}
