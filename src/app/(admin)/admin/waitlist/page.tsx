import { requireAdmin } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waitlist",
};

export default async function AdminWaitlistPage() {
  await requireAdmin();

  const [total, entries] = await Promise.all([
    prisma.waitlistEntry.count(),
    prisma.waitlistEntry.findMany({
      include: { user: { select: { displayName: true, username: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Waitlist</h1>
          <p className="mt-1 text-sm text-[#8a8f86]">
            {total} {total === 1 ? "person wants" : "people want"} the launch
            email
          </p>
        </div>
        {/* Plain link: a route handler that downloads a CSV. */}
        <a
          href="/admin/waitlist/export"
          className="rounded-md border border-[#2a2f2a] px-3 py-1.5 text-sm text-[#a1c217] hover:bg-[#131614]"
        >
          Download CSV
        </a>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-[#2a2f2a] px-4 py-10 text-center text-sm text-[#8a8f86]">
          Nobody has joined yet
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#2a2f2a]">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-[#8a8f86]">
              <tr className="border-b border-[#2a2f2a]">
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Account</th>
                <th className="px-4 py-2.5 font-medium">From</th>
                <th className="px-4 py-2.5 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-[#2a2f2a] last:border-0"
                >
                  <td className="px-4 py-2.5 text-[#f2f5ef]">{e.email}</td>
                  <td className="px-4 py-2.5 text-[#8a8f86]">
                    {e.user
                      ? `${e.user.displayName} (@${e.user.username})`
                      : "-"}
                  </td>
                  <td className="px-4 py-2.5 text-[#8a8f86]">
                    {e.source === "prompt" ? "Pop-up" : "Waitlist page"}
                  </td>
                  <td className="px-4 py-2.5 text-[#8a8f86]">
                    {format(e.createdAt, "d MMM yyyy, HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
