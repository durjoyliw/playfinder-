import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

/**
 * "Download your data" (UK GDPR right of access / portability). Returns a
 * JSON file of everything PlayFinder stores about the signed-in user.
 * Secrets (password hash, session ids, push keys, Google id) are left out.
 */
export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit("data-export", user.id);
    if (!limit.ok) return tooManyRequests(limit);

    const userRef = { select: { username: true, displayName: true } };

    const account = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        bio: true,
        location: true,
        birthDate: true,
        profileIntent: true,
        avatarUrl: true,
        createdAt: true,
        googleId: true,
        passwordHash: true,
        sports: { select: { sport: true, skillLevel: true } },
        posts: {
          select: {
            id: true,
            content: true,
            type: true,
            sport: true,
            intent: true,
            location: true,
            timeLabel: true,
            slotsNeeded: true,
            visibility: true,
            createdAt: true,
            deletedAt: true,
            attachments: { select: { url: true, type: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        comments: {
          select: { content: true, postId: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { postId: true } },
        bookmarks: { select: { postId: true, createdAt: true } },
        following: { select: { following: userRef } },
        followers: { select: { follower: userRef } },
        interests: { select: { postId: true, status: true, createdAt: true } },
        blocking: { select: { blocked: userRef, createdAt: true } },
        muting: { select: { muted: userRef, createdAt: true } },
        pageMemberships: {
          select: { role: true, page: { select: { handle: true, name: true } } },
        },
        pageFollows: {
          select: { page: { select: { handle: true, name: true } } },
        },
        receivedNotifications: {
          select: { type: true, body: true, read: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
        reports: { select: { reason: true, createdAt: true } },
        appeals: { select: { reason: true, status: true, createdAt: true } },
        feedback: { select: { message: true, page: true, createdAt: true } },
        waitlistEntry: { select: { email: true, createdAt: true } },
      },
    });

    const { passwordHash, googleId, ...profile } = account;

    const data = {
      exportedAt: new Date().toISOString(),
      notes: [
        "This is the personal data PlayFinder holds about you.",
        "Chat messages are stored by our chat provider (Stream). Ask via the app's Send feedback page for a copy.",
      ],
      signIn: {
        hasPassword: passwordHash !== null,
        usesGoogle: googleId !== null,
      },
      ...profile,
      following: account.following.map((f) => f.following),
      followers: account.followers.map((f) => f.follower),
    };

    const filename = `playfinder-data-${account.username}.json`;
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/users/export failed:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
