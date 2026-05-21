import { validateRequest } from "@/auth";
import { userNeedsOnboarding } from "@/lib/onboarding";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (user) {
    redirect(
      (await userNeedsOnboarding(user.id)) ? "/onboarding" : "/",
    );
  }

  return <>{children}</>;
}
