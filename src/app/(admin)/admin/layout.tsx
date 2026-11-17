import { ADMIN_COOKIE_NAME } from "@/lib/admin/auth";
import { isValidAdminSession } from "@/lib/admin/session-token";
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
  const isAdmin = await isValidAdminSession(session);

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
