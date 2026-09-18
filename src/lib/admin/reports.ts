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

  revalidatePath("/admin");
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

export type ReportedUserHistory = {
  userId: string;
  displayName: string;
  username: string;
  accountAgeDays: number;
  createdAt: Date;
  status: string;
  reportsReceived: number;
  priorWarnings: number;
  priorSuspensions: number;
  recentPosts: {
    id: string;
    content: string;
    createdAt: Date;
    deletedAt: Date | null;
  }[];
} | null;

export async function getReportedUserHistory(
  reportId: string,
): Promise<ReportedUserHistory> {
  await requireAdmin();

  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    return null;
  }

  let userId: string | null = null;
  const targetType = report.targetType.toUpperCase();

  if (targetType === "USER") {
    userId = report.targetId;
  } else if (targetType === "POST") {
    const post = await prisma.post.findUnique({
      where: { id: report.targetId },
      select: { userId: true },
    });
    userId = post?.userId ?? null;
  }

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      username: true,
      createdAt: true,
      status: true,
      posts: { select: { id: true } },
    },
  });

  if (!user) {
    return null;
  }

  const postIds = user.posts.map((post) => post.id);
  const msPerDay = 1000 * 60 * 60 * 24;
  const accountAgeDays = Math.max(
    0,
    Math.floor((Date.now() - user.createdAt.getTime()) / msPerDay),
  );

  const [reportsReceived, priorWarnings, priorSuspensions, recentPosts] =
    await Promise.all([
      prisma.report.count({
        where: {
          OR: [
            { targetType: { equals: "USER", mode: "insensitive" }, targetId: user.id },
            postIds.length
              ? {
                  targetType: { equals: "POST", mode: "insensitive" },
                  targetId: { in: postIds },
                }
              : { id: { in: [] } },
          ],
        },
      }),
      prisma.auditLog.count({
        where: {
          targetType: "USER",
          targetId: user.id,
          action: { contains: "warn", mode: "insensitive" },
        },
      }),
      prisma.auditLog.count({
        where: {
          targetType: "USER",
          targetId: user.id,
          action: { contains: "suspend", mode: "insensitive" },
        },
      }),
      prisma.post.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          content: true,
          createdAt: true,
          deletedAt: true,
        },
      }),
    ]);

  return {
    userId: user.id,
    displayName: user.displayName,
    username: user.username,
    accountAgeDays,
    createdAt: user.createdAt,
    status: user.status,
    reportsReceived,
    priorWarnings,
    priorSuspensions,
    recentPosts,
  };
}
