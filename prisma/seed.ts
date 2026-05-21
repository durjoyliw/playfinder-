import { PostIntent, PrismaClient, Sport } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_USERS = [
  {
    id: "seed-user-marcus-reid",
    username: "marcus-reid",
    displayName: "Marcus Reid",
    email: "marcus@playfinder.com",
  },
  {
    id: "seed-user-sarah-kennedy",
    username: "sarah-kennedy",
    displayName: "Sarah Kennedy",
    email: "sarah@playfinder.com",
  },
  {
    id: "seed-user-ross-davidson",
    username: "ross-davidson",
    displayName: "Ross Davidson",
    email: "ross@playfinder.com",
  },
  {
    id: "seed-user-elite-fc",
    username: "elite-fc",
    displayName: "Elite FC",
    email: "elitefc@playfinder.com",
  },
  {
    id: "seed-user-jordan-vance",
    username: "jordan-vance",
    displayName: "Jordan Vance",
    email: "jordan@playfinder.com",
  },
] as const;

const DEMO_POSTS = [
  {
    username: "marcus-reid",
    sport: Sport.FOOTBALL,
    intent: PostIntent.LOOKING_TO_PLAY,
    location: "Glasgow Green",
    timeLabel: "Tonight 7 PM",
    content:
      "Need 1 more for 5-a-side tonight. Casual game all levels welcome!",
    expires: true,
  },
  {
    username: "elite-fc",
    sport: Sport.FOOTBALL,
    intent: PostIntent.RECRUITING,
    location: "Scotland",
    timeLabel: "Saturday league",
    content:
      "Elite FC looking for a solid Centre Back. 2x training per week. DM for trial.",
    expires: false,
  },
  {
    username: "jordan-vance",
    sport: Sport.TENNIS,
    intent: PostIntent.LOOKING_TO_PLAY,
    location: "Kelvingrove Park",
    timeLabel: "Tomorrow 10 AM",
    content: "Looking for a hitting partner, intermediate level.",
    expires: true,
  },
  {
    username: "sarah-kennedy",
    sport: Sport.TENNIS,
    intent: PostIntent.RECRUITING,
    location: "UWS Campus",
    timeLabel: "Tues and Thurs 6 PM",
    content:
      "UWS Tennis Club looking for new members! Beginners welcome.",
    expires: false,
  },
  {
    username: "marcus-reid",
    sport: Sport.BASKETBALL,
    intent: PostIntent.LOOKING_TO_PLAY,
    location: "Kelvin Hall",
    timeLabel: "Sunday 2 PM",
    content:
      "Got a full court booked, need 4 more players. Any level.",
    expires: true,
  },
  {
    username: "ross-davidson",
    sport: Sport.GYM,
    intent: PostIntent.BANTER,
    location: "Paisley",
    timeLabel: "Today",
    content:
      "Leg day or nah? The machine I needed was taken for 45 mins. Someone regulate this.",
    expires: false,
  },
  {
    username: "jordan-vance",
    sport: Sport.RUNNING,
    intent: PostIntent.LOOKING_TO_PLAY,
    location: "Glasgow Green",
    timeLabel: "Saturday 8 AM",
    content:
      "Parkrun this Saturday anyone? Looking for a pacer around 28-30 mins.",
    expires: true,
  },
  {
    username: "sarah-kennedy",
    sport: Sport.SQUASH,
    intent: PostIntent.LOOKING_TO_PLAY,
    location: "Lagoon Centre Paisley",
    timeLabel: "Tonight 6 PM",
    content:
      "Need a squash partner tonight, intermediate level. Court already booked!",
    expires: true,
  },
];

async function main() {
  console.log("Upserting seed users...");

  for (const user of SEED_USERS) {
    await prisma.user.upsert({
      where: { username: user.username },
      create: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
      },
      update: {
        displayName: user.displayName,
        email: user.email,
      },
    });
    console.log(`  ✓ ${user.username}`);
  }

  const seedUsernames = SEED_USERS.map((u) => u.username);
  const demoContents = DEMO_POSTS.map((p) => p.content);

  const deleted = await prisma.post.deleteMany({
    where: {
      OR: [
        { content: { in: demoContents } },
        { user: { username: { in: seedUsernames } } },
      ],
    },
  });

  console.log(`Deleted ${deleted.count} existing seed posts.`);

  const users = await prisma.user.findMany({
    where: { username: { in: seedUsernames } },
    select: { id: true, username: true },
  });

  const userIdByUsername = Object.fromEntries(
    users.map((u) => [u.username, u.id]),
  );

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  console.log(`Creating ${DEMO_POSTS.length} posts...`);

  for (const post of DEMO_POSTS) {
    const userId = userIdByUsername[post.username];

    if (!userId) {
      throw new Error(`User not found for username: ${post.username}`);
    }

    await prisma.post.create({
      data: {
        userId,
        sport: post.sport,
        intent: post.intent,
        location: post.location,
        timeLabel: post.timeLabel,
        content: post.content,
        expiresAt: post.expires ? expiresAt : null,
      },
    });

    console.log(`  ✓ ${post.username} — ${post.sport} / ${post.intent}`);
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
