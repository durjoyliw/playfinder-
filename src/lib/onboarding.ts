import prisma from "@/lib/prisma";

export async function userNeedsOnboarding(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { completedOnboarding: true },
  });

  return !user?.completedOnboarding;
}

export async function getPostAuthRedirect(userId: string): Promise<string> {
  return (await userNeedsOnboarding(userId)) ? "/onboarding" : "/";
}

export function getFirstName(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}
