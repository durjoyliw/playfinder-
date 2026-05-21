import { validateRequest } from "@/auth";
import { PlayFinderAuthenticatedHome } from "@/components/playfinder/authenticated-home";
import { PlayFinderLanding } from "@/components/marketing/playfinder-landing";
import { userNeedsOnboarding } from "@/lib/onboarding";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "PlayFinder — Find your game in Glasgow",
  description:
    "The local sports network for Glasgow. Connect with players, post a game, and never miss a match again.",
};

export default async function MarketingPage() {
  const session = await validateRequest();

  if (session.user) {
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
      <PlayFinderAuthenticatedHome
        session={session}
        initialUnreadNotificationCount={unreadNotificationCount}
      />
    );
  }

  return <PlayFinderLanding />;
}
