import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { completeOnboardingSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
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
