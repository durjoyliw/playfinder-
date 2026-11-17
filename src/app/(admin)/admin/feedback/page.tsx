import { requireAdmin } from "@/lib/admin/auth";
import { setFeedbackStatus } from "@/lib/admin/feedback";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Feedback",
};

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: { show?: string };
}) {
  await requireAdmin();
  const showDone = searchParams.show === "all";

  const items = await prisma.feedback.findMany({
    where: showDone ? {} : { status: "NEW" },
    include: {
      user: { select: { displayName: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Feedback</h1>
          <p className="mt-1 text-sm text-[#8a8f86]">
            Sent by beta testers from the app
          </p>
        </div>
        <Link
          href={showDone ? "/admin/feedback" : "/admin/feedback?show=all"}
          className="text-sm text-[#a1c217]"
        >
          {showDone ? "Show new only" : "Show all"}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-[#2a2f2a] px-4 py-10 text-center text-sm text-[#8a8f86]">
          No feedback yet
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const nextStatus = item.status === "DONE" ? "NEW" : "DONE";
            const toggle = setFeedbackStatus.bind(null, item.id, nextStatus);
            return (
              <article
                key={item.id}
                className="rounded-xl border border-[#2a2f2a] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8a8f86]">
                  <span>
                    {item.user
                      ? `${item.user.displayName} (@${item.user.username})`
                      : "Deleted account"}{" "}
                    · {format(item.createdAt, "d MMM yyyy, HH:mm")}
                    {item.page ? ` · ${item.page}` : ""}
                  </span>
                  <form action={toggle}>
                    <button
                      type="submit"
                      className="rounded-md border border-[#2a2f2a] px-2.5 py-1 text-xs text-[#f2f5ef] hover:bg-[#131614]"
                    >
                      {item.status === "DONE" ? "Reopen" : "Mark done"}
                    </button>
                  </form>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[#f2f5ef]">
                  {item.message}
                </p>
                {item.userAgent && (
                  <p className="mt-2 truncate text-[11px] text-[#5a635a]">
                    {item.userAgent}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
