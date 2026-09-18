import { requireAdmin } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";
import { formatRelativeDate } from "@/lib/utils";
import { UserStatus } from "@prisma/client";
import { startOfDay, subHours } from "date-fns";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Command centre",
};

export default async function AdminHomePage() {
  await requireAdmin();

  const now = new Date();
  const today = startOfDay(now);
  const last24h = subHours(now, 24);

  const [
    signupsToday,
    openReports,
    totalUsers,
    postUserIds,
    commentUserIds,
    signupUserIds,
    recentReports,
    recentAudit,
    suspendedUsers,
    bannedCount,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.user.count(),
    prisma.post.findMany({
      where: { createdAt: { gte: last24h } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.comment.findMany({
      where: { createdAt: { gte: last24h } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: last24h } },
      select: { id: true },
    }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        reporter: { select: { displayName: true, username: true } },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      where: { status: UserStatus.SUSPENDED },
      orderBy: { suspendedUntil: "asc" },
      take: 20,
      select: {
        id: true,
        displayName: true,
        username: true,
        suspendedUntil: true,
      },
    }),
    prisma.user.count({ where: { status: UserStatus.BANNED } }),
  ]);

  const activeIds = new Set<string>([
    ...postUserIds.map((row) => row.userId),
    ...commentUserIds.map((row) => row.userId),
    ...signupUserIds.map((row) => row.id),
  ]);

  const stats = [
    { label: "New signups today", value: signupsToday },
    { label: "Open reports", value: openReports },
    { label: "Active users (24h)", value: activeIds.size },
    { label: "Total users", value: totalUsers },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Command centre</h1>
        <p className="mt-1 text-sm text-[#8a8f86]">Today’s snapshot</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#2a2f2a] bg-[#121412] p-5"
          >
            <p className="text-sm text-[#8a8f86]">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#2a2f2a] bg-[#121412] p-5">
          <h2 className="text-sm font-semibold">Latest reports</h2>
          <ul className="mt-4 space-y-3">
            {recentReports.length === 0 ? (
              <li className="text-sm text-[#8a8f86]">No reports yet</li>
            ) : (
              recentReports.map((report) => (
                <li key={report.id}>
                  <Link
                    href={`/admin/reports#${report.id}`}
                    className="block rounded-md p-2 hover:bg-[#1a1d1a]"
                  >
                    <p className="line-clamp-2 text-sm">{report.reason}</p>
                    <p className="mt-1 text-xs text-[#8a8f86]">
                      {report.reporter.displayName} ·{" "}
                      {formatRelativeDate(report.createdAt)}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-[#2a2f2a] bg-[#121412] p-5">
          <h2 className="text-sm font-semibold">Latest audit log</h2>
          <ul className="mt-4 space-y-3">
            {recentAudit.length === 0 ? (
              <li className="text-sm text-[#8a8f86]">No audit entries yet</li>
            ) : (
              recentAudit.map((log) => (
                <li key={log.id} className="rounded-md p-2">
                  <p className="text-sm">
                    {log.action} · {log.targetType}
                  </p>
                  <p className="mt-1 text-xs text-[#8a8f86]">
                    {log.targetId} · {formatRelativeDate(log.createdAt)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#2a2f2a] bg-[#121412] p-5">
          <h2 className="text-sm font-semibold">Currently suspended</h2>
          <ul className="mt-4 space-y-3">
            {suspendedUsers.length === 0 ? (
              <li className="text-sm text-[#8a8f86]">No suspended users</li>
            ) : (
              suspendedUsers.map((user) => (
                <li key={user.id}>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="flex items-center justify-between gap-3 rounded-md p-2 hover:bg-[#1a1d1a]"
                  >
                    <span className="text-sm">{user.displayName}</span>
                    <span className="text-xs text-[#8a8f86]">
                      {user.suspendedUntil
                        ? `until ${user.suspendedUntil.toLocaleString()}`
                        : "no end date"}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-[#2a2f2a] bg-[#121412] p-5">
          <h2 className="text-sm font-semibold">Currently banned</h2>
          <p className="mt-4 text-3xl font-semibold">{bannedCount}</p>
          <Link
            href="/admin/users?status=BANNED"
            className="mt-3 inline-block text-sm text-[#dcef5a] hover:underline"
          >
            View banned users
          </Link>
        </div>
      </section>
    </div>
  );
}
