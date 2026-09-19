/**
 * Seed UNCLAIMED Glasgow venue Pages from scripts/data/glasgow-venues.json.
 *
 * Usage: npx tsx scripts/seed-venues.ts
 *
 * Idempotent: if a page with the preferred (slugified) handle already exists,
 * skip it. No PageMembership, no Stream channel (use backfill-page-channels.ts).
 */
import { loadEnvConfig } from "@next/env";
import { PageStatus, PageType, PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

type VenueSeed = {
  name: string;
  lat: number;
  lng: number;
  city: string;
  facilities?: string;
};

function slugifyHandle(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/, "");
  return base.length >= 2 ? base : `venue-${base || "x"}`;
}

/** Prefer `base`; on collision append -2, -3, … (truncated to 30 chars). */
async function uniqueHandle(base: string): Promise<string> {
  let candidate = base.slice(0, 30);
  let n = 2;
  for (;;) {
    const existing = await prisma.page.findUnique({
      where: { handle: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    const suffix = `-${n}`;
    candidate = `${base.slice(0, 30 - suffix.length)}${suffix}`;
    n += 1;
  }
}

async function main() {
  const dataPath = join(process.cwd(), "scripts/data/glasgow-venues.json");
  const venues = JSON.parse(readFileSync(dataPath, "utf8")) as VenueSeed[];

  let created = 0;
  let skipped = 0;

  for (const venue of venues) {
    const preferred = slugifyHandle(venue.name);

    const existing = await prisma.page.findUnique({
      where: { handle: preferred },
      select: { id: true },
    });

    if (existing) {
      console.log(`  skip @${preferred}`);
      skipped += 1;
      continue;
    }

    const handle = await uniqueHandle(preferred);
    const profileData = venue.facilities
      ? { facilities: venue.facilities }
      : undefined;

    await prisma.page.create({
      data: {
        handle,
        name: venue.name,
        type: PageType.VENUE,
        status: PageStatus.UNCLAIMED,
        createdById: null,
        lat: venue.lat,
        lng: venue.lng,
        city: venue.city,
        profileData,
      },
    });

    console.log(`  create @${handle} — ${venue.name}`);
    created += 1;
  }

  console.log(`Done. created=${created} skipped=${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
