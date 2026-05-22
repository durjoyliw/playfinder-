import { validateRequest } from "@/auth";
import type { DiscoverPlayer } from "@/lib/discover";
import { DISCOVER_SPORT_FILTERS } from "@/lib/discover";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sportFilter = searchParams.get("sport") ?? "all";

    const filterEntry = DISCOVER_SPORT_FILTERS.find((f) => f.id === sportFilter);
    const sportEnum = filterEntry?.sport ?? null;

    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        completedOnboarding: true,
        ...(sportEnum
          ? {
              sports: {
                some: { sport: sportEnum },
              },
            }
          : {}),
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        location: true,
        profileIntent: true,
        sports: {
          select: { sport: true, skillLevel: true },
          orderBy: { sport: "asc" },
        },
      },
      orderBy: { displayName: "asc" },
    });

    const players: DiscoverPlayer[] = users.map((u) => ({
      id: u.id,
      displayName: u.displayName,
      username: u.username,
      avatarUrl: u.avatarUrl,
      location: u.location,
      profileIntent: u.profileIntent,
      sports: u.sports,
    }));

    return Response.json({ players });
  } catch (error) {
    console.error("GET /api/discover/players failed:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
