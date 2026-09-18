import { approveAppeal, rejectAppeal } from "@/lib/admin/appeals";
import { requireAdmin } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Appeals",
};

export default async function AdminAppealsPage() {
  await requireAdmin();

  const appeals = await prisma.appeal.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
          createdAt: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const banReasons = await Promise.all(
    appeals.map((appeal) =>
      prisma.auditLog.findFirst({
        where: {
          targetType: "USER",
          targetId: appeal.userId,
          action: { in: ["BAN", "SUSPEND"] },
        },
        orderBy: { createdAt: "desc" },
      }),
    ),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Appeals</h1>
        <p className="mt-1 text-sm text-[#8a8f86]">Pending reinstatement requests</p>
      </div>

      {appeals.length === 0 ? (
        <p className="rounded-xl border border-[#2a2f2a] px-4 py-10 text-center text-sm text-[#8a8f86]">
          No pending appeals
        </p>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal, index) => {
            const approve = approveAppeal.bind(null, appeal.id);
            const reject = rejectAppeal.bind(null, appeal.id);
            const restriction = banReasons[index];
            const ageDays = Math.max(
              0,
              Math.floor(
                (Date.now() - appeal.user.createdAt.getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            );

            return (
              <article
                key={appeal.id}
                className="space-y-4 rounded-xl border border-[#2a2f2a] bg-[#121412] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/users/${appeal.user.id}`}
                      className="font-medium hover:text-[#dcef5a]"
                    >
                      {appeal.user.displayName}
                    </Link>
                    <p className="text-sm text-[#8a8f86]">
                      @{appeal.user.username} · {appeal.user.email ?? "no email"} ·{" "}
                      {appeal.user.status}
                    </p>
                    <p className="mt-1 text-xs text-[#8a8f86]">
                      Account age: {ageDays} days · Filed{" "}
                      {format(appeal.createdAt, "d MMM yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[#8a8f86]">Appeal reason</p>
                  <p className="mt-1 text-sm">{appeal.reason}</p>
                </div>

                <div>
                  <p className="text-xs text-[#8a8f86]">Ban / suspension reason</p>
                  <p className="mt-1 text-sm text-[#c4c9bf]">
                    {restriction?.reason ?? "No matching audit entry"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <form action={approve}>
                    <button
                      type="submit"
                      className="h-9 rounded-md bg-[#dcef5a] px-4 text-sm font-semibold text-[#08090a]"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={reject} className="flex flex-wrap gap-2">
                    <input
                      name="reviewNote"
                      placeholder="Review note (optional)"
                      className="h-9 min-w-[200px] rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 text-sm outline-none focus:border-[#dcef5a]"
                    />
                    <button
                      type="submit"
                      className="h-9 rounded-md border border-red-900/70 px-4 text-sm text-red-300"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
