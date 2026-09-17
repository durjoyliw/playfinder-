import { validateRequest } from "@/auth";
import { PlayFinderHome } from "@/components/playfinder/playfinder-home";
import { buildFeedSportTabs } from "@/lib/feed-sport-tabs";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Home",
};

export default async function HomePage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/");
  }

  const userSports = await prisma.userSport.findMany({
    where: { userId: user.id },
    select: { sport: true },
    orderBy: { id: "asc" },
  });

  const feedSportTabs = buildFeedSportTabs(
    userSports.map((entry) => entry.sport),
  );

  return <PlayFinderHome feedSportTabs={feedSportTabs} />;
}
