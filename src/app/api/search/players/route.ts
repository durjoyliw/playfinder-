import { validateRequest } from "@/auth";
import { getSportDisplay } from "@/lib/onboarding-sports";
import prisma from "@/lib/prisma";
import { getProfileIntentDisplay } from "@/lib/settings";
import { NextRequest } from "next/server";

function getMatchingSportKeys(
  sports: { sport: string }[],
  q: string,
): string[] {
  const lower = q.toLowerCase();
  return sports
    .map((s) => s.sport)
    .filter((key) => {
      const display = getSportDisplay(key);
      return (
        key.toLowerCase().includes(lower) ||
        display.name.toLowerCase().includes(lower)
      );
    });
}

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (!q) {
      return Response.json({ players: [] });
    }

    const cleanQuery = q.startsWith("@") ? q.slice(1) : q;

    const players = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        OR: [
          { displayName: { contains: q, mode: "insensitive" } },
          { username: { contains: cleanQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        location: true,
        profileIntent: true,
        sports: {
          select: { sport: true, skillLevel: true },
          take: 6,
        },
      },
      take: 30,
      orderBy: { displayName: "asc" },
    });

    const results = players.map((p) => ({
      id: p.id,
      username: p.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      location: p.location,
      intent: getProfileIntentDisplay(p.profileIntent),
      matchingSportKeys: getMatchingSportKeys(p.sports, q),
      sports: p.sports.map((s) => ({
        ...getSportDisplay(s.sport),
        key: s.sport,
        skillLevel: s.skillLevel,
      })),
    }));

    return Response.json({ players: results });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
