import { validateRequest } from "@/auth";
import { PlayFinderShell } from "@/components/playfinder/playfinder-shell";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  const unreadNotificationCount = await prisma.notification.count({
    where: {
      recipientId: session.user.id,
      read: false,
    },
  });

  return (
    <SessionProvider value={session}>
      <PlayFinderShell
        initialUnreadNotificationCount={unreadNotificationCount}
      >
        {children}
      </PlayFinderShell>
    </SessionProvider>
  );
}
