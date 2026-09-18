import { requireAdmin } from "@/lib/admin/auth";
import { actionReport, dismissReport } from "@/lib/admin/reports";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
};

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-[#8a8f86]">Open moderation reports</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#2a2f2a]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-[#121412] text-[#8a8f86]">
            <tr>
              <th className="px-4 py-3 font-medium">Reporter</th>
              <th className="px-4 py-3 font-medium">Target type</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#8a8f86]">
                  No open reports
                </td>
              </tr>
            ) : (
              reports.map((report) => {
                const dismiss = dismissReport.bind(null, report.id);
                const action = actionReport.bind(null, report.id);

                return (
                  <tr key={report.id} className="border-t border-[#2a2f2a]">
                    <td className="px-4 py-3">
                      <div>{report.reporter.displayName}</div>
                      <div className="text-xs text-[#8a8f86]">
                        @{report.reporter.username}
                      </div>
                    </td>
                    <td className="px-4 py-3">{report.targetType}</td>
                    <td className="max-w-sm px-4 py-3 text-[#c4c9bf]">
                      {report.reason}
                    </td>
                    <td className="px-4 py-3 text-[#c4c9bf]">
                      {format(report.createdAt, "d MMM yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <form action={dismiss}>
                          <button
                            type="submit"
                            className="rounded-md border border-[#2a2f2a] px-3 py-1.5 text-xs hover:bg-[#121412]"
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
