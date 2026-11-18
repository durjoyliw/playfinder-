/**
 * Publishes the beta starter content on every deploy (runs from the build
 * script, after `prisma db push`):
 *
 * 1. An official, clearly named "PlayFinder" account.
 * 2. Three padel posts (with replies and likes) from the existing demo
 *    accounts, so padel isn't empty.
 * 3. One conversation starter from the official account in each popular
 *    sport that has no posts yet.
 *
 * Safe to run on every build: anything already posted (same text) is
 * skipped, and starters only go into sports with nothing live. It never
 * fails the build; problems are logged and the deploy carries on.
 *
 * Content: scripts/data/starter-posts.json
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const content = JSON.parse(
  readFileSync(new URL("./data/starter-posts.json", import.meta.url), "utf8"),
);

const prisma = new PrismaClient();
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);

async function postExists(text) {
  return !!(await prisma.post.findFirst({
    where: { content: text },
    select: { id: true },
  }));
}

async function ensureOfficialAccount() {
  const { id, username, displayName, bio } = content.officialAccount;
  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (existing) return id;

  // Someone may already have the username; fall back to a variant.
  const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  await prisma.user.create({
    data: {
      id,
      username: taken ? "playfinder-team" : username,
      displayName,
      bio,
      location: "Glasgow",
      completedOnboarding: true,
    },
  });
  console.log("  created the official PlayFinder account");
  return id;
}

async function publishPadelPosts() {
  const usernames = [
    ...new Set(
      content.padel.flatMap((p) => [
        p.username,
        ...p.likes,
        ...p.comments.map((c) => c.username),
      ]),
    ),
  ];
  const users = await prisma.user.findMany({
    where: { username: { in: usernames } },
    select: { id: true, username: true },
  });
  const idOf = new Map(users.map((u) => [u.username, u.id]));

  for (const demo of content.padel) {
    const authorId = idOf.get(demo.username);
    if (!authorId) {
      console.log(`  padel: demo account @${demo.username} not found, skipped`);
      continue;
    }
    if (await postExists(demo.content)) continue;

    const createdAt = hoursAgo(demo.hoursAgo);
    const post = await prisma.post.create({
      data: {
        userId: authorId,
        content: demo.content,
        type: "SOCIAL",
        visibility: "PUBLIC",
        intent: "BANTER",
        sport: "PADEL",
        createdAt,
      },
      select: { id: true },
    });
    const likers = demo.likes.map((u) => idOf.get(u)).filter(Boolean);
    if (likers.length) {
      await prisma.like.createMany({
        data: likers.map((userId) => ({ userId, postId: post.id })),
        skipDuplicates: true,
      });
    }
    for (const c of demo.comments) {
      const userId = idOf.get(c.username);
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
    console.log(`  padel: posted from @${demo.username}`);
  }
}

async function publishStarters(officialId) {
  for (const starter of content.starters) {
    const live = await prisma.post.count({
      where: { sport: starter.sport, deletedAt: null, userId: { not: officialId } },
    });
    if (live > 0 || (await postExists(starter.content))) continue;
    await prisma.post.create({
      data: {
        userId: officialId,
        content: starter.content,
        type: "SOCIAL",
        visibility: "PUBLIC",
        intent: "BANTER",
        sport: starter.sport,
      },
    });
    console.log(`  starter: posted in ${starter.sport}`);
  }
}

async function main() {
  console.log("Starter posts: checking...");
  const officialId = await ensureOfficialAccount();
  // Padel demo posts first, so the starter check sees them.
  await publishPadelPosts();
  await publishStarters(officialId);
  console.log("Starter posts: done");
}

main()
  .catch((error) => {
    console.warn("Starter posts skipped (the deploy continues):", error);
  })
  .finally(() => prisma.$disconnect());
