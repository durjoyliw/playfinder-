import { validateRequest } from "@/auth";
import { needsBirthDate } from "@/lib/age";
import prisma from "@/lib/prisma";
import { completeOnboardingSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit("profile", user.id);
    if (!limit.ok) return tooManyRequests(limit);

    // Age gate: a new account can't finish onboarding (and so can't reach
    // the app) until a date of birth is on file.
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { birthDate: true, completedOnboarding: true },
    });
    if (!account || needsBirthDate(account)) {
      return Response.json(
        { error: "Confirm your date of birth first" },
        { status: 403 },
      );
    }

    const body = completeOnboardingSchema.parse(await req.json());

    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.userSport.deleteMany({
        where: { userId: user.id },
      });

      if (body.sports.length > 0) {
        await tx.userSport.createMany({
          data: body.sports.map((entry) => ({
            userId: user.id,
            sport: entry.sport,
            skillLevel: entry.skillLevel,
          })),
        });
      }

      return tx.user.update({
        where: { id: user.id },
        data: {
          location: body.location,
          profileIntent: body.profileIntent,
          completedOnboarding: true,
        },
        select: { username: true },
      });
    });

    revalidatePath(`/users/${updatedUser.username}`);
    revalidatePath("/");

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/users/onboarding failed:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
