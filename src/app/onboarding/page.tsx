import { validateRequest } from "@/auth";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { needsBirthDate } from "@/lib/age";
import { getFirstName } from "@/lib/onboarding";
import prisma from "@/lib/prisma";
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

  // Google sign-ups skip the signup form, so they confirm their date of
  // birth here before anything else.
  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { birthDate: true, completedOnboarding: true },
  });
  if (account && needsBirthDate(account)) {
    redirect("/onboarding/date-of-birth");
  }

  return <OnboardingFlow firstName={getFirstName(user.displayName)} />;
}
