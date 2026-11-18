"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import prisma from "@/lib/prisma";
import {
  OFFICIAL_ACCOUNT,
  PADEL_DEMO_POSTS,
  STARTER_POSTS,
} from "@/lib/admin/starter-posts-content";
import { PostIntent, Sport } from "@prisma/client";
import { revalidatePath } from "next/cache";

/*
 * Beta content, published from Admin -> Starter posts.
 *
 * 1. Conversation starters from an official, clearly named "PlayFinder"
 *    account, only in popular sports that have no posts yet.
 * 2. A few padel posts from the existing demo accounts (the same people
 *    who wrote the other demo posts), so padel isn't empty.
 *
 * Safe to run more than once: anything already posted (same text) is
 * skipped, and starters are only added where a sport has no posts.
 */

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

interface StarterPostsResult {
  officialAccountCreated: boolean;
  startersAdded: string[];
  startersSkipped: string[];
  padelAdded: number;
  padelSkipped: number;
  missingDemoAccounts: string[];
}

async function ensureOfficialAccount(): Promise<{
  id: string;
  created: boolean;
}> {
  const existing = await prisma.user.findUnique({
    where: { id: OFFICIAL_ACCOUNT.id },
    select: { id: true },
  });
  if (existing) return { id: existing.id, created: false };

  // Someone may already have the username; fall back to a variant.
  const taken = await prisma.user.findUnique({
    where: { username: OFFICIAL_ACCOUNT.username },
    select: { id: true },
  });
  await prisma.user.create({
    data: {
      id: OFFICIAL_ACCOUNT.id,
      username: taken ? "playfinder-team" : OFFICIAL_ACCOUNT.username,
      displayName: OFFICIAL_ACCOUNT.displayName,
      bio: OFFICIAL_ACCOUNT.bio,
      location: "Glasgow",
      completedOnboarding: true,
    },
  });
  return { id: OFFICIAL_ACCOUNT.id, created: true };
}

async function postExists(content: string) {
  return !!(await prisma.post.findFirst({
    where: { content },
    select: { id: true },
  }));
}

export async function publishStarterPosts(): Promise<StarterPostsResult> {
  await requireAdmin();

  const official = await ensureOfficialAccount();
  const result: StarterPostsResult = {
    officialAccountCreated: official.created,
    startersAdded: [],
    startersSkipped: [],
    padelAdded: 0,
    padelSkipped: 0,
    missingDemoAccounts: [],
  };

  // Padel demo posts first, so the starter check below sees them.
  const demoUsers = await prisma.user.findMany({
    where: {
      username: {
        in: [
          ...new Set(
            PADEL_DEMO_POSTS.flatMap((p) => [
              p.username,
              ...p.likes,
              ...p.comments.map((c) => c.username),
            ]),
          ),
        ],
      },
    },
    select: { id: true, username: true },
  });
  const idByUsername = new Map(demoUsers.map((u) => [u.username, u.id]));

  for (const demo of PADEL_DEMO_POSTS) {
    const authorId = idByUsername.get(demo.username);
    if (!authorId) {
      result.missingDemoAccounts.push(demo.username);
      continue;
    }
    if (await postExists(demo.content)) {
      result.padelSkipped++;
      continue;
    }
    const createdAt = hoursAgo(demo.hoursAgo);
    const post = await prisma.post.create({
      data: {
        userId: authorId,
        content: demo.content,
        type: "SOCIAL",
        visibility: "PUBLIC",
        intent: PostIntent.BANTER,
        sport: Sport.PADEL,
        createdAt,
      },
      select: { id: true },
    });
    const likers = demo.likes
      .map((u) => idByUsername.get(u))
      .filter((id): id is string => !!id);
    if (likers.length) {
      await prisma.like.createMany({
        data: likers.map((userId) => ({ userId, postId: post.id })),
        skipDuplicates: true,
      });
    }
    for (const c of demo.comments) {
      const userId = idByUsername.get(c.username);
      if (!userId) continue;
      await prisma.comment.create({
        data: {
          userId,
          postId: post.id,
          content: c.content,
          createdAt: new Date(createdAt.getTime() + c.minutesAfter * 60 * 1000),
        },
      });
    }
    result.padelAdded++;
  }

  // Starters only where a sport has nothing live.
  for (const starter of STARTER_POSTS) {
    const label =
      starter.sport.charAt(0) + starter.sport.slice(1).toLowerCase();
    const live = await prisma.post.count({
      where: {
        sport: starter.sport,
        deletedAt: null,
        userId: { not: official.id },
      },
    });
    if (live > 0 || (await postExists(starter.content))) {
      result.startersSkipped.push(label);
      continue;
    }
    await prisma.post.create({
      data: {
        userId: official.id,
        content: starter.content,
        type: "SOCIAL",
        visibility: "PUBLIC",
        intent: PostIntent.BANTER,
        sport: starter.sport,
      },
    });
    result.startersAdded.push(label);
  }

  await writeAuditLog({
    action: "PUBLISH_STARTER_POSTS",
    targetType: "SYSTEM",
    targetId: "starter-posts",
    reason: `starters: ${result.startersAdded.join(", ") || "none"}; padel: ${result.padelAdded}`,
  });
  revalidatePath("/admin/starter-posts");
  return result;
}
