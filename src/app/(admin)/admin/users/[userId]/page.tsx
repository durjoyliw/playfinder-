import { requireAdmin } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserActionPanel } from "./user-actions";
import { UserPostsList } from "./user-posts";

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
      suspendedUntil: true,
      createdAt: true,
      posts: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          content: true,
          createdAt: true,
          deletedAt: true,
          deletionReason: true,
        },
      },
    },
  });

  if (!user) notFound();

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
          <dd className="font-medium text-[#dcef5a]">{user.status}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#8a8f86]">Suspended until</dt>
          <dd>
            {user.suspendedUntil
              ? format(user.suspendedUntil, "d MMM yyyy HH:mm")
              : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#8a8f86]">Joined</dt>
          <dd>{format(user.createdAt, "d MMM yyyy")}</dd>
        </div>
      </dl>

      <UserActionPanel userId={user.id} status={user.status} />
      <UserPostsList posts={user.posts} />
    </div>
  );
}
