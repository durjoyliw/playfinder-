import { validateRequest } from "@/auth";
import { userNeedsOnboarding } from "@/lib/onboarding";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  if (!(await userNeedsOnboarding(user.id))) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">{children}</div>
  );
}
