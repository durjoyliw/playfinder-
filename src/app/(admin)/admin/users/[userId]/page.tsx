import { requireAdmin } from "@/lib/admin/auth";
import { banUser, suspendUser, warnUser } from "@/lib/admin/users";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "User",
};

interface PageProps {
  params: { userId: string };
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      location: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  const warn = warnUser.bind(null, user.id);
  const suspend = suspendUser.bind(null, user.id);
  const ban = banUser.bind(null, user.id);

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm text-[#8a8f86] hover:text-[#dcef5a]">
        ← Users
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{user.displayName}</h1>
        <p className="mt-1 text-sm text-[#8a8f86]">@{user.username}</p>
      </div>

      <dl className="grid max-w-xl gap-3 rounded-xl border border-[#2a2f2a] bg-[#121412] p-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[#8a8f86]">Email</dt>
          <dd>{user.email ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#8a8f86]">City</dt>
          <dd>{user.location ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#8a8f86]">Role</dt>
          <dd>{user.role}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#8a8f86]">Status</dt>
          <dd>{user.status}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#8a8f86]">Joined</dt>
          <dd>{format(user.createdAt, "d MMM yyyy")}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <form action={warn}>
          <button
            type="submit"
            className="h-10 rounded-md border border-[#2a2f2a] px-4 text-sm hover:bg-[#121412]"
          >
            Warn
          </button>
        </form>
        <form action={suspend}>
          <button
            type="submit"
            disabled={user.status === "SUSPENDED"}
            className="h-10 rounded-md border border-amber-800/70 px-4 text-sm text-amber-300 hover:bg-amber-950/40 disabled:opacity-40"
          >
            Suspend
          </button>
        </form>
        <form action={ban}>
          <button
            type="submit"
            disabled={user.status === "BANNED"}
            className="h-10 rounded-md border border-red-900/70 px-4 text-sm text-red-300 hover:bg-red-950/40 disabled:opacity-40"
          >
            Ban
          </button>
        </form>
      </div>
    </div>
  );
}
