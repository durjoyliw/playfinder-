import { validateRequest } from "@/auth";
import { PlayFinderProvider } from "@/components/playfinder/playfinder-provider";
import { userNeedsOnboarding } from "@/lib/onboarding";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MainAppShell } from "./main-app-shell";
import SessionProvider from "./SessionProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/");

  if (await userNeedsOnboarding(session.user.id)) {
    redirect("/onboarding");
  }

  const unreadNotificationCount = await prisma.notification.count({
    where: {
      recipientId: session.user.id,
      read: false,
    },
  });

  return (
    <SessionProvider value={session}>
      <PlayFinderProvider>
        <MainAppShell
          initialUnreadNotificationCount={unreadNotificationCount}
        >
          {children}
        </MainAppShell>
      </PlayFinderProvider>
    </SessionProvider>
  );
}
