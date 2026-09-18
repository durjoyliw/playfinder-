import prisma from "@/lib/prisma";
import { ADMIN_ACTOR_ID } from "./auth";

export async function writeAuditLog(data: {
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
}) {
  await prisma.auditLog.create({
    data: {
      adminId: ADMIN_ACTOR_ID,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
    },
  });
}
