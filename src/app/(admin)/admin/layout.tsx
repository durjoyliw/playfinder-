import { ADMIN_COOKIE_NAME } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAdmin = Boolean(process.env.ADMIN_SECRET && session === process.env.ADMIN_SECRET);

  let pendingAppeals = 0;
  if (isAdmin) {
    try {
      pendingAppeals = await prisma.appeal.count({
        where: { status: "PENDING" },
      });
    } catch {
      pendingAppeals = 0;
    }
  }

  return <AdminShell pendingAppeals={pendingAppeals}>{children}</AdminShell>;
}
