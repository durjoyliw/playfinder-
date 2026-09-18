import { getSportDisplay } from "@/lib/onboarding-sports";
import prisma from "@/lib/prisma";
import { getTrendingTopics } from "@/lib/trending";

// Batch caps so one run can't run away on a large table -- generous for
// where this app is today, revisit if the user base outgrows a single
// daily pass.
const MAX_USERS_PER_RUN = 2000;

const NEARBY_GAMES_COOLDOWN_DAYS = 3;
const INACTIVITY_COOLDOWN_DAYS = 14;
const INACTIVITY_THRESHOLD_DAYS = 14;
const TRENDING_COOLDOWN_DAYS = 3;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/** End of the coming Sunday (or today, if today is Sunday), end-of-day. */
function endOfThisWeekend(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const daysUntilSunday = (7 - day) % 7;
  const sunday = new Date(
    startOfDay(now).getTime() + daysUntilSunday * 86400000,
  );
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        { message: "Invalid authorization header" },
        { status: 401 },
      );
    }

    const now = new Date();
    const weekendCutoff = endOfThisWeekend();

    const [users, recentNotifications, trending, upcomingGames] =
      await Promise.all([
        prisma.user.findMany({
          take: MAX_USERS_PER_RUN,
          select: {
            id: true,
            location: true,
            createdAt: true,
            sports: { select: { sport: true } },
            _count: { select: { posts: true } },
            posts: {
              where: { deletedAt: null },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { createdAt: true },
            },
          },
        }),
        prisma.notification.findMany({
          where: {
            type: { in: ["NEARBY_GAMES", "INACTIVITY_NUDGE", "TRENDING_POST"] },
            createdAt: { gte: daysAgo(INACTIVITY_COOLDOWN_DAYS) },
          },
          select: { recipientId: true, type: true, createdAt: true },
        }),
        getTrendingTopics(),
        prisma.post.findMany({
          where: {
            deletedAt: null,
            visibility: "PUBLIC",
            type: { in: ["ARENA", "BROADCAST"] },
            sport: { not: null },
            expiresAt: { gte: now, lte: weekendCutoff },
          },
          select: { sport: true, location: true, userId: true },
        }),
      ]);

    const lastNotified = new Map<string, Map<string, Date>>();
    for (const n of recentNotifications) {
      let byType = lastNotified.get(n.recipientId);
      if (!byType) {
        byType = new Map();
        lastNotified.set(n.recipientId, byType);
      }
      const existing = byType.get(n.type);
      if (!existing || n.createdAt > existing) byType.set(n.type, n.createdAt);
    }

    function wasNotifiedRecently(
      userId: string,
      type: string,
      withinDays: number,
    ): boolean {
      const at = lastNotified.get(userId)?.get(type);
      return !!at && at >= daysAgo(withinDays);
    }

    const trendingBySport = new Map(trending.map((t) => [t.sport, t]));

    let created = 0;

    for (const user of users) {
      const sports = user.sports.map((s) => s.sport);

      // 1. Nearby games this weekend.
      if (
        sports.length > 0 &&
        !wasNotifiedRecently(
          user.id,
          "NEARBY_GAMES",
          NEARBY_GAMES_COOLDOWN_DAYS,
        )
      ) {
        const matches = upcomingGames.filter(
          (g) =>
            g.userId !== user.id &&
            g.sport &&
            sports.includes(g.sport) &&
            (!user.location ||
              !g.location ||
              g.location.toLowerCase().includes(user.location.toLowerCase()) ||
              user.location.toLowerCase().includes(g.location.toLowerCase())),
        );

        if (matches.length > 0) {
          const sportLabel =
            matches.length === 1 && matches[0].sport
              ? getSportDisplay(matches[0].sport).name
              : null;
          const body = sportLabel
            ? `${matches.length} ${sportLabel} game${matches.length > 1 ? "s" : ""} near you this weekend`
            : `${matches.length} games near you this weekend`;

          await prisma.notification.create({
            data: {
              recipientId: user.id,
              type: "NEARBY_GAMES",
              body,
            },
          });
          created += 1;
        }
      }

      // 2. Inactivity nudge.
      if (
        !wasNotifiedRecently(
          user.id,
          "INACTIVITY_NUDGE",
          INACTIVITY_COOLDOWN_DAYS,
        )
      ) {
        const lastPostAt = user.posts[0]?.createdAt ?? null;
        const accountAgeOk =
          user.createdAt <= daysAgo(INACTIVITY_THRESHOLD_DAYS);
        const isInactive = lastPostAt
          ? lastPostAt <= daysAgo(INACTIVITY_THRESHOLD_DAYS)
          : accountAgeOk;

        if (isInactive) {
          await prisma.notification.create({
            data: {
              recipientId: user.id,
              type: "INACTIVITY_NUDGE",
              body: "You haven't posted in a while -- share what you're up to",
            },
          });
          created += 1;
        }
      }

      // 3. Trending post in one of the user's sports.
      if (
        sports.length > 0 &&
        !wasNotifiedRecently(user.id, "TRENDING_POST", TRENDING_COOLDOWN_DAYS)
      ) {
        const topic = sports.map((s) => trendingBySport.get(s)).find(Boolean);
        if (topic) {
          await prisma.notification.create({
            data: {
              recipientId: user.id,
              type: "TRENDING_POST",
              body: `${topic.emoji} "${topic.word}" is trending in ${topic.label} right now`,
            },
          });
          created += 1;
        }
      }
    }

    return Response.json({
      success: true,
      usersScanned: users.length,
      created,
    });
  } catch (error) {
    console.error("GET /api/cron/notifications error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
