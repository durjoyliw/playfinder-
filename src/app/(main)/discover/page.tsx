import { validateRequest } from "@/auth";
import { DiscoverPage } from "@/components/discover/discover-page";
import { getSportDisplay, normalizeSportKey } from "@/lib/onboarding-sports";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover",
};

export default async function Page() {
  const { user } = await validateRequest();

  const userSports = user
    ? await prisma.userSport.findMany({
        where: { userId: user.id },
        select: { sport: true },
        orderBy: { id: "asc" },
      })
    : [];

  const sports = userSports.map((entry) => {
    const id = normalizeSportKey(entry.sport);
    const { name } = getSportDisplay(entry.sport);
    return { id, name };
  });

  return <DiscoverPage userSports={sports} />;
}
