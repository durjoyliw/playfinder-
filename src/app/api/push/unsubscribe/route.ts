import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit("push", user.id);
    if (!limit.ok) return tooManyRequests(limit);

    const { endpoint } = unsubscribeSchema.parse(await req.json());

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: user.id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/push/unsubscribe error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
