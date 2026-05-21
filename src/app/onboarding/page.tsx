import { validateRequest } from "@/auth";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getFirstName } from "@/lib/onboarding";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Welcome to PlayFinder",
};

export default async function OnboardingPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  return <OnboardingFlow firstName={getFirstName(user.displayName)} />;
}
