import { requireAdmin } from "@/lib/admin/auth";
import {
  actionReport,
  dismissReport,
  getReportedUserHistory,
} from "@/lib/admin/reports";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reports",
};

function preview(content: string) {
  const text = content.replace(/\s+/g, " ").trim();
  return text.length > 120 ? `${text.slice(0, 117)}…` : text || "(empty)";
}

export default async function AdminReportsPage() {
  await requireAdmin();

  const reports = await prisma.report.findMany({
    where: { status: "OPEN" },
    include: {
      reporter: {
        select: {
          displayName: true,
          username: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const histories = await Promise.all(
    reports.map((report) => getReportedUserHistory(report.id)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-[#8a8f86]">Open moderation reports</p>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <p className="rounded-xl border border-[#2a2f2a] px-4 py-10 text-center text-sm text-[#8a8f86]">
            No open reports
          </p>
        ) : (
          reports.map((report, index) => {
            const dismiss = dismissReport.bind(null, report.id);
            const action = actionReport.bind(null, report.id);
            const history = histories[index];

            return (
              <article
                key={report.id}
                id={report.id}
                className="rounded-xl border border-[#2a2f2a] bg-[#121412] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{report.reason}</p>
                    <p className="mt-1 text-xs text-[#8a8f86]">
                      {report.reporter.displayName} (@{report.reporter.username})
                      · {report.targetType} ·{" "}
                      {format(report.createdAt, "d MMM yyyy")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={dismiss}>
                      <button
                        type="submit"
                        className="rounded-md border border-[#2a2f2a] px-3 py-1.5 text-xs hover:bg-[#08090a]"
                      >
                        Dismiss
                      </button>
                    </form>
                    <form action={action}>
                      <button
                        type="submit"
                        className="rounded-md border border-[#dcef5a]/40 px-3 py-1.5 text-xs text-[#dcef5a] hover:bg-[#1a1d1a]"
                      >
                        Action taken
                      </button>
                    </form>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-xs text-[#8a8f86]">
                    Reported user history
                  </summary>
                  {history ? (
                    <div className="mt-3 grid gap-3 rounded-lg border border-[#2a2f2a] bg-[#08090a] p-4 text-sm md:grid-cols-2">
                      <div className="space-y-1">
                        <p>
                          <Link
                            href={`/admin/users/${history.userId}`}
                            className="font-medium hover:text-[#dcef5a]"
                          >
                            {history.displayName}
                          </Link>{" "}
                          <span className="text-[#8a8f86]">
                            @{history.username}
                          </span>
                        </p>
                        <p className="text-[#c4c9bf]">
                          Account age: {history.accountAgeDays} days
                        </p>
                        <p className="text-[#c4c9bf]">
                          Status: {history.status}
                        </p>
                      </div>
                      <div className="space-y-1 text-[#c4c9bf]">
                        <p>Reports received: {history.reportsReceived}</p>
                        <p>Prior warnings: {history.priorWarnings}</p>
                        <p>Prior suspensions: {history.priorSuspensions}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="mb-2 text-xs text-[#8a8f86]">Last 3 posts</p>
                        {history.recentPosts.length === 0 ? (
                          <p className="text-xs text-[#8a8f86]">No posts</p>
                        ) : (
                          <ul className="space-y-2">
                            {history.recentPosts.map((post) => (
                              <li
                                key={post.id}
                                className="text-xs text-[#c4c9bf]"
                              >
                                {preview(post.content)}
                                {post.deletedAt ? " · hidden" : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[#8a8f86]">
                      No user context for this target
                    </p>
                  )}
                </details>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
