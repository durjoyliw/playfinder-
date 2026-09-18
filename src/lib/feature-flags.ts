import prisma from "@/lib/prisma";

const DEFAULT_FLAGS = [
  {
    key: "post_creation",
    description: "Allow users to create posts",
    enabled: true,
  },
  {
    key: "event_creation",
    description: "Allow users to create events",
    enabled: true,
  },
  {
    key: "messaging",
    description: "Allow direct messaging",
    enabled: true,
  },
  {
    key: "discover_map",
    description: "Show the discover map",
    enabled: true,
  },
];

export async function getFlag(key: string) {
  return prisma.featureFlag.findUnique({
    where: { key },
  });
}

export async function ensureDefaultFlags() {
  await Promise.all(
    DEFAULT_FLAGS.map((flag) =>
      prisma.featureFlag.upsert({
        where: { key: flag.key },
        create: flag,
        update: {},
      }),
    ),
  );
}
