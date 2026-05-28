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

/** Test posts for I'm in button — 2 week expiry, slotsNeeded set */
const LOOKING_TO_PLAY_TEST_POSTS = [
  {
    username: "marcus-reid",
    sport: Sport.FOOTBALL,
    intent: PostIntent.LOOKING_TO_PLAY,
    location: "Glasgow West End",
    timeLabel: "Tonight 7 PM",
    content:
      "Need 2 more for 5-a-side at Kelvingrove tonight. All levels welcome 🔥",
    expiresTwoWeeks: true,
    slotsNeeded: 2,
  },
  {
    username: "jordan-vance",
    sport: Sport.BASKETBALL,
    intent: PostIntent.LOOKING_TO_PLAY,
    location: "Glasgow",
    timeLabel: "Sunday afternoon",
    content:
      "3v3 at the outdoor courts Sunday afternoon, need 2 players. Intermediate level",
    expiresTwoWeeks: true,
    slotsNeeded: 2,
  },
  {
    username: "ross-davidson",
    sport: Sport.TENNIS,
    intent: PostIntent.LOOKING_TO_PLAY,
    location: "Scotstoun, Glasgow",
    timeLabel: "This weekend",
    content:
      "Looking for a hitting partner this weekend, intermediate level, got a court booked at Scotstoun",
    expiresTwoWeeks: true,
    slotsNeeded: 1,
  },
  {
    username: "sarah-kennedy",
    sport: Sport.GYM,
    intent: PostIntent.LOOKING_TO_PLAY,
    location: "Paisley",
    timeLabel: "Morning sessions",
    content:
      "Anyone want a gym partner at Paisley Leisure Centre? Morning sessions, going 3x a week",
    expiresTwoWeeks: true,
    slotsNeeded: 1,
  },
] as const;

type DemoPost = (typeof DEMO_POSTS)[number] | (typeof LOOKING_TO_PLAY_TEST_POSTS)[number];

const ALL_DEMO_POSTS: DemoPost[] = [...DEMO_POSTS, ...LOOKING_TO_PLAY_TEST_POSTS];

type SocialCommentSeed = {
  username: string;
  content: string;
  minutesAfter: number;
};

type SocialPostSeed = {
  username: string;
  content: string;
  sport: Sport | null;
  isHighlight?: boolean;
  daysAgo: number;
  hoursOffset: number;
  likeUsernames: string[];
  comments: SocialCommentSeed[];
};

const SOCIAL_POSTS: SocialPostSeed[] = [
  {
    username: "marcus-reid",
    content:
      "Arsenal's 'process' is just a fancy word for bottling the league in April. You can't win a title when your starboy goes missing in every single big away game.",
    sport: Sport.FOOTBALL,
    isHighlight: true,
    daysAgo: 6,
    hoursOffset: 14,
    likeUsernames: [
      "jordan-vance",
      "sarah-kennedy",
      "ross-davidson",
      "elite-fc",
    ],
    comments: [
      {
        username: "jordan-vance",
        content: "Couldn't agree more, happened again on Tuesday",
        minutesAfter: 8,
      },
      {
        username: "sarah-kennedy",
        content: "harsh but fair tbh",
        minutesAfter: 22,
      },
      {
        username: "ross-davidson",
        content: "give it time they're building",
        minutesAfter: 41,
      },
    ],
  },
  {
    username: "jordan-vance",
    content:
      "Kelvingrove pitches are absolutely diabolical. Played there Sunday, felt like the surface was actively trying to injure me. Glasgow City Council please.",
    sport: Sport.FOOTBALL,
    daysAgo: 5,
    hoursOffset: 11,
    likeUsernames: ["marcus-reid", "sarah-kennedy", "ross-davidson", "elite-fc"],
    comments: [
      {
        username: "marcus-reid",
        content: "those pitches have been like that since 2019 mate",
        minutesAfter: 15,
      },
      {
        username: "ross-davidson",
        content: "just use Toryglen, worth the trip",
        minutesAfter: 35,
      },
    ],
  },
  {
    username: "sarah-kennedy",
    content:
      "Need recommendations for a decent physio around the West End that won't charge £80 just to tell me to stretch my hamstrings",
    sport: null,
    daysAgo: 5,
    hoursOffset: 18,
    likeUsernames: ["marcus-reid", "jordan-vance", "ross-davidson"],
    comments: [
      {
        username: "jordan-vance",
        content:
          "try the one on Byres Road, forgot the name but they're reasonable",
        minutesAfter: 12,
      },
      {
        username: "marcus-reid",
        content: "physios in Glasgow are a scam full stop",
        minutesAfter: 28,
      },
    ],
  },
  {
    username: "jordan-vance",
    content:
      "Hot take: Scottish basketball is genuinely growing and nobody is talking about it. The junior leagues in Glasgow have doubled in the last 2 years. Give it 5 years.",
    sport: Sport.BASKETBALL,
    isHighlight: true,
    daysAgo: 4,
    hoursOffset: 9,
    likeUsernames: [
      "marcus-reid",
      "sarah-kennedy",
      "ross-davidson",
      "elite-fc",
    ],
    comments: [
      {
        username: "sarah-kennedy",
        content:
          "been saying this for ages, Scotstoun courts are packed every weekend now",
        minutesAfter: 18,
      },
      {
        username: "ross-davidson",
        content: "would love to see a proper pro league here",
        minutesAfter: 44,
      },
    ],
  },
  {
    username: "sarah-kennedy",
    content:
      "For anyone training for a half marathon in Glasgow — the Clyde walkway from Pacific Quay to Bothwell is exactly 10 miles one way. Perfect long run route, mostly flat, zero traffic lights.",
    sport: Sport.RUNNING,
    daysAgo: 4,
    hoursOffset: 16,
    likeUsernames: [
      "marcus-reid",
      "jordan-vance",
      "ross-davidson",
      "elite-fc",
    ],
    comments: [
      {
        username: "marcus-reid",
        content: "saving this, cheers",
        minutesAfter: 10,
      },
      {
        username: "jordan-vance",
        content: "done this one, it's brilliant early morning",
        minutesAfter: 26,
      },
    ],
  },
  {
    username: "ross-davidson",
    content:
      "Whoever books the last court at Scotstoun at 9pm on a weekday and then doesn't show up — I hope you step on a Lego. Some of us drove 20 minutes for that court.",
    sport: Sport.TENNIS,
    daysAgo: 3,
    hoursOffset: 20,
    likeUsernames: ["marcus-reid", "sarah-kennedy", "jordan-vance", "elite-fc"],
    comments: [
      {
        username: "sarah-kennedy",
        content: "this has happened to me twice this month",
        minutesAfter: 14,
      },
      {
        username: "jordan-vance",
        content: "they need a deposit system honestly",
        minutesAfter: 33,
      },
    ],
  },
  {
    username: "sarah-kennedy",
    content:
      "Unpopular opinion: most people in the gym don't need a PT, they need someone to actually explain how progressive overload works. One concept. Changes everything.",
    sport: Sport.GYM,
    daysAgo: 2,
    hoursOffset: 13,
    likeUsernames: ["marcus-reid", "jordan-vance", "ross-davidson", "elite-fc"],
    comments: [
      {
        username: "marcus-reid",
        content: "PTs hate this comment",
        minutesAfter: 11,
      },
      {
        username: "ross-davidson",
        content: "nah some people genuinely need the accountability though",
        minutesAfter: 29,
      },
    ],
  },
  {
    username: "marcus-reid",
    content:
      "Anyone know a good 5-a-side league in the South Side that's actually competitive? Not looking for a kickabout, want proper games with ref and everything.",
    sport: Sport.FOOTBALL,
    daysAgo: 2,
    hoursOffset: 19,
    likeUsernames: ["jordan-vance", "sarah-kennedy", "ross-davidson"],
    comments: [
      {
        username: "jordan-vance",
        content: "Powerleague Parkhead run one on Thursday nights",
        minutesAfter: 16,
      },
      {
        username: "ross-davidson",
        content: "Elite FC might have a space actually, DM them",
        minutesAfter: 38,
      },
    ],
  },
  {
    username: "ross-davidson",
    content:
      "Glasgow weather really said 'you wanted to go for a run? Here's horizontal rain and 40mph wind. Enjoy.' Treadmill szn it is.",
    sport: null,
    daysAgo: 1,
    hoursOffset: 8,
    likeUsernames: [
      "marcus-reid",
      "sarah-kennedy",
      "jordan-vance",
      "elite-fc",
    ],
    comments: [
      {
        username: "sarah-kennedy",
        content:
          "literally cancelled my run this morning for this exact reason",
        minutesAfter: 9,
      },
      {
        username: "jordan-vance",
        content: "just embrace it, builds character",
        minutesAfter: 21,
      },
      {
        username: "marcus-reid",
        content: "nah I drew the line at lightning",
        minutesAfter: 37,
      },
    ],
  },
  {
    username: "jordan-vance",
    content:
      "PSA: the outdoor courts at Kelvingrove are free, usually quiet before 11am on weekends, and the surface is actually decent. Stop paying for indoor courts when you're just doing drills.",
    sport: Sport.BASKETBALL,
    daysAgo: 0,
    hoursOffset: 10,
    likeUsernames: ["marcus-reid", "sarah-kennedy", "ross-davidson"],
    comments: [
      {
        username: "ross-davidson",
        content: "didn't know about these, cheers",
        minutesAfter: 13,
      },
      {
        username: "sarah-kennedy",
        content: "going to check these out this Saturday",
        minutesAfter: 27,
      },
    ],
  },
];

function socialPostCreatedAt(daysAgo: number, hoursOffset: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hoursOffset, 30, 0, 0);
  return date;
}

async function seedSocialPosts(userIdByUsername: Record<string, string>) {
  console.log(`Seeding ${SOCIAL_POSTS.length} social posts (skip if already exist)...`);

  for (const post of SOCIAL_POSTS) {
    const userId = userIdByUsername[post.username];
    if (!userId) {
      throw new Error(`User not found for username: ${post.username}`);
    }

    const createdAt = socialPostCreatedAt(post.daysAgo, post.hoursOffset);

    let postRecord = await prisma.post.findFirst({
      where: { content: post.content },
      select: { id: true, createdAt: true },
    });

    if (!postRecord) {
      postRecord = await prisma.post.create({
        data: {
          userId,
          content: post.content,
          type: "SOCIAL",
          visibility: "PUBLIC",
          intent: PostIntent.BANTER,
          sport: post.sport,
          isHighlight: post.isHighlight ?? false,
          createdAt,
        },
        select: { id: true, createdAt: true },
      });
      console.log(`  ✓ created social — ${post.username}`);
    } else {
      console.log(`  ○ skipped existing post — ${post.username}`);
    }

    const postId = postRecord.id;
    const postCreatedAt = postRecord.createdAt;

    for (const likerUsername of post.likeUsernames) {
      const likerId = userIdByUsername[likerUsername];
      if (!likerId) continue;

      await prisma.like.upsert({
        where: {
          userId_postId: { userId: likerId, postId },
        },
        create: { userId: likerId, postId },
        update: {},
      });
    }

    for (const comment of post.comments) {
      const commenterId = userIdByUsername[comment.username];
      if (!commenterId) continue;

      const existingComment = await prisma.comment.findFirst({
        where: {
          postId,
          userId: commenterId,
          content: comment.content,
        },
      });

      if (existingComment) continue;

      const commentCreatedAt = new Date(postCreatedAt);
      commentCreatedAt.setMinutes(
        commentCreatedAt.getMinutes() + comment.minutesAfter,
      );

      await prisma.comment.create({
        data: {
          postId,
          userId: commenterId,
          content: comment.content,
          createdAt: commentCreatedAt,
        },
      });
    }
  }
}

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
  const demoContents = ALL_DEMO_POSTS.map((p) => p.content);

  const deleted = await prisma.post.deleteMany({
    where: { content: { in: demoContents } },
  });

  console.log(`Deleted ${deleted.count} existing seed posts.`);

  const users = await prisma.user.findMany({
    where: { username: { in: seedUsernames } },
    select: { id: true, username: true },
  });

  const userIdByUsername = Object.fromEntries(
    users.map((u) => [u.username, u.id]),
  );

  const expiresAt24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const expiresAt2Weeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  console.log(`Creating ${ALL_DEMO_POSTS.length} posts...`);

  for (const post of ALL_DEMO_POSTS) {
    const userId = userIdByUsername[post.username];

    if (!userId) {
      throw new Error(`User not found for username: ${post.username}`);
    }

    const expiresTwoWeeks =
      "expiresTwoWeeks" in post && post.expiresTwoWeeks === true;
    const expires24h = "expires" in post && post.expires === true;
    const slotsNeeded =
      "slotsNeeded" in post ? post.slotsNeeded : undefined;

    await prisma.post.create({
      data: {
        userId,
        type: "ARENA",
        visibility: "PUBLIC",
        sport: post.sport,
        intent: post.intent,
        location: post.location,
        timeLabel: post.timeLabel,
        content: post.content,
        expiresAt: expiresTwoWeeks
          ? expiresAt2Weeks
          : expires24h
            ? expiresAt24h
            : null,
        slotsNeeded: slotsNeeded ?? null,
      },
    });

    console.log(`  ✓ ${post.username} — ${post.sport} / ${post.intent}`);
  }

  await seedSocialPosts(userIdByUsername);

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
