"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ADMIN_ACTOR_ID, requireAdmin } from "./auth";

async function updateReportStatus(
  reportId: string,
  status: "DISMISSED" | "ACTIONED",
  action: "DISMISS_REPORT" | "ACTION_REPORT",
  reason: string,
) {
  await requireAdmin();

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    throw new Error("Report not found");
  }

  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: { status },
    }),
    prisma.auditLog.create({
      data: {
        adminId: ADMIN_ACTOR_ID,
        action,
        targetType: "REPORT",
        targetId: reportId,
        reason,
      },
    }),
  ]);

  revalidatePath("/admin/reports");
  revalidatePath("/admin/audit-log");
}

export async function dismissReport(reportId: string) {
  await updateReportStatus(
    reportId,
    "DISMISSED",
    "DISMISS_REPORT",
    "Report dismissed",
  );
}

export async function actionReport(reportId: string) {
  await updateReportStatus(
    reportId,
    "ACTIONED",
    "ACTION_REPORT",
    "Action taken on report",
  );
}
