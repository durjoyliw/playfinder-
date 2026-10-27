import { validateRequest } from "@/auth";
import { needsBirthDate } from "@/lib/age";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DateOfBirthForm } from "./date-of-birth-form";

export const metadata: Metadata = {
  title: "Confirm your date of birth",
};

/**
 * Age-gate step for accounts that skipped the signup form (Google sign-in).
 * The onboarding layout already requires a signed-in, not-yet-onboarded
 * user; anyone who has a birthDate goes straight back to onboarding.
 */
export default async function DateOfBirthPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { birthDate: true, completedOnboarding: true },
  });
  if (!account || !needsBirthDate(account)) redirect("/onboarding");

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[420px] flex-col justify-center px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(24px,env(safe-area-inset-top))]">
      <DateOfBirthForm />
    </main>
  );
}
