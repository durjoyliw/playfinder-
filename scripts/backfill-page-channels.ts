/**
 * Backfill Stream Chat channels for Pages missing chatChannelId.
 *
 * Usage: npx tsx scripts/backfill-page-channels.ts
 *
 * Idempotent: skips pages that already have chatChannelId set.
 * Safe to re-run — ensurePageChannel tolerates an existing Stream channel.
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { ensurePageChannel } from "../src/lib/stream-messaging";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.page.findMany({
    where: { chatChannelId: null },
    select: {
      id: true,
      name: true,
      handle: true,
      createdById: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${pages.length} page(s) without chatChannelId`);

  let ok = 0;
  let failed = 0;

  for (const page of pages) {
    try {
      const chatChannelId = await ensurePageChannel({
        pageId: page.id,
        ownerUserId: page.createdById,
        name: page.name,
      });

      await prisma.page.update({
        where: { id: page.id },
        data: { chatChannelId },
      });

      console.log(`  ✓ @${page.handle} → ${chatChannelId}`);
      ok += 1;
    } catch (error) {
      failed += 1;
      console.error(`  ✗ @${page.handle} (${page.id}):`, error);
    }
  }

  console.log(`Done. provisioned=${ok} failed=${failed}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
