import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const activePosters = await prisma.post.findMany({
      where: { createdAt: { gte: since } },
      select: { userId: true },
      distinct: ["userId"],
    });

    return Response.json({ count: activePosters.length });
  } catch (error) {
    console.error("Failed to fetch active count", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
