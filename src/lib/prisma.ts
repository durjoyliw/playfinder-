import { PrismaClient } from "@prisma/client";
import { sendPushForNotification } from "@/lib/notification-push";

const prismaClientSingleton = () => {
  const base = new PrismaClient();

  // Every notification created anywhere in the app goes through this one
  // extension, so a real device push goes out alongside the in-app row
  // without having to remember to wire it up at each call site.
  return base.$extends({
    query: {
      notification: {
        async create({ args, query }) {
          const result = await query(args);
          void sendPushForNotification(base, result).catch((error) => {
            console.error("Failed to send push for notification", error);
          });
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
