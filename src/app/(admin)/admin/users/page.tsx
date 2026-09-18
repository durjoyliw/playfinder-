import { requireAdmin } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";
import { UserStatus } from "@prisma/client";
import { format } from "date-fns";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Users",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { q, status } = await searchParams;
  const query = q?.trim() ?? "";
  const statusFilter = status?.trim().toUpperCase();

  const users = await prisma.user.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { displayName: { contains: query, mode: "insensitive" } },
                { username: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { location: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        statusFilter &&
        (Object.values(UserStatus) as string[]).includes(statusFilter)
          ? { status: statusFilter as UserStatus }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      displayName: true,
      email: true,
      location: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-[#8a8f86]">
          Search and moderate PlayFinder accounts
          {statusFilter ? ` · filtered by ${statusFilter}` : ""}
        </p>
      </div>

      <form className="flex max-w-md gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search name, email, city…"
          className="h-10 flex-1 rounded-md border border-[#2a2f2a] bg-[#121412] px-3 text-sm outline-none focus:border-[#dcef5a]"
        />
        <button
          type="submit"
          className="h-10 rounded-md bg-[#dcef5a] px-4 text-sm font-semibold text-[#08090a]"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-[#2a2f2a]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#121412] text-[#8a8f86]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#8a8f86]">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-[#2a2f2a]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-medium hover:text-[#dcef5a]"
                    >
                      {user.displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#c4c9bf]">{user.email ?? "—"}</td>
                  <td className="px-4 py-3 text-[#c4c9bf]">
                    {user.location ?? "—"}
                  </td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{user.status}</td>
                  <td className="px-4 py-3 text-[#c4c9bf]">
                    {format(user.createdAt, "d MMM yyyy")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
