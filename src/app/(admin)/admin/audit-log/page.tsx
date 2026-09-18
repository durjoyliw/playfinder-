import { requireAdmin } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit log",
};

export default async function AdminAuditLogPage() {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <p className="mt-1 text-sm text-[#8a8f86]">
          Newest admin actions first
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#2a2f2a]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-[#121412] text-[#8a8f86]">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#8a8f86]">
                  No audit entries yet
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t border-[#2a2f2a]">
                  <td className="whitespace-nowrap px-4 py-3 text-[#c4c9bf]">
                    {format(log.createdAt, "d MMM yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-3">{log.adminId}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 text-[#c4c9bf]">
                    {log.targetType} · {log.targetId}
                  </td>
                  <td className="px-4 py-3 text-[#c4c9bf]">{log.reason ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
