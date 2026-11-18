import { validateRequest } from "@/auth";
import { PlayFinderLanding } from "@/components/marketing/playfinder-landing";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "PlayFinder | Your local sports social network",
  description:
    "Find your game. Find your people. Talk sport with people near you, and find a game when you want to play.",
};

export default async function MarketingPage() {
  const session = await validateRequest();

  if (session.user) {
    redirect("/home");
  }

  return <PlayFinderLanding />;
}
