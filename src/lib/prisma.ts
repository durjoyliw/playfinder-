import { runAfterResponse } from "@/lib/after-response";
import { sendPushForNotification } from "@/lib/notification-push";
import { Prisma, PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

/**
 * Pushes for the given notification ids, AFTER the response is sent (so any
 * transaction that created them has finished). Re-reads each row first: a
 * notification whose transaction rolled back no longer exists and is skipped.
 */
function pushAfterCommit(base: PrismaClient, ids: string[]) {
  if (ids.length === 0) return;
  runAfterResponse(async () => {
    const committed = await base.notification.findMany({
      where: { id: { in: ids } },
    });
    await Promise.allSettled(
      committed.map((notification) =>
        sendPushForNotification(base, notification),
      ),
    );
  }, "notification push");
}

/** createMany returns only a count, so give every row an id up front. */
function withIds(
  data: Prisma.NotificationCreateManyInput | Prisma.NotificationCreateManyInput[],
) {
  const rows = (Array.isArray(data) ? data : [data]).map((row) => ({
    ...row,
    id: row.id ?? randomUUID(),
  }));
  return { rows, ids: rows.map((row) => row.id as string) };
}

const prismaClientSingleton = () => {
  const base = new PrismaClient();

  // Every notification created anywhere in the app goes through this one
  // extension, so a real device push goes out alongside the in-app row
  // without having to remember to wire it up at each call site -- including
  // createMany paths, and never before the creating transaction commits.
  return base.$extends({
    query: {
      notification: {
        async create({ args, query }) {
          // Assign the id up front so it's known even if `select` omits it.
          const id = args.data.id ?? randomUUID();
          const result = await query({ ...args, data: { ...args.data, id } });
          pushAfterCommit(base, [id]);
          return result;
        },
        async createMany({ args, query }) {
          const { rows, ids } = withIds(args.data);
          const result = await query({ ...args, data: rows });
          pushAfterCommit(base, ids);
          return result;
        },
        async createManyAndReturn({ args, query }) {
          const result = await query(args);
          // `select` may leave out id; only push rows we can identify.
          const ids = result
            .map((row) => (row as { id?: string }).id)
            .filter((id): id is string => !!id);
          pushAfterCommit(base, ids);
          return result;
        },
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
