import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user: currentUser } = await validateRequest();

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blocks = await prisma.block.findMany({
      where: { blockerId: currentUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return Response.json(blocks);
  } catch (error) {
    console.error("GET /api/users/blocked error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

