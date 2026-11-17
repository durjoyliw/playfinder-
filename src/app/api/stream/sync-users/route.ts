import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

/** Stream accepts at most 100 users per upsertUsers call. */
const STREAM_BATCH = 100;
const MAX_CONTACTS = 300;

/**
 * Keeps the signed-in user and their contacts (people they follow or who
 * follow them) up to date in Stream Chat, so names/usernames in chat are
 * current.
 *
 * This used to upsert *every user in the database* in a single call, which
 * gets slower as PlayFinder grows and fails outright past 100 users (Stream's
 * per-call limit). DM and group creation already upsert their own members.
 */
export async function POST() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit("stream-sync", user.id);
    if (!limit.ok) return tooManyRequests(limit);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { id: user.id },
          { followers: { some: { followerId: user.id } } },
          { following: { some: { followingId: user.id } } },
        ],
      },
      select: { id: true, displayName: true, username: true },
      take: MAX_CONTACTS,
    });

    for (let i = 0; i < users.length; i += STREAM_BATCH) {
      await streamServerClient.upsertUsers(
        users.slice(i, i + STREAM_BATCH).map((u) => ({
          id: u.id,
          name: u.displayName,
          username: u.username,
        })),
      );
    }

    return Response.json({ synced: users.length });
  } catch (error) {
    console.error("Failed to sync Stream users", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
