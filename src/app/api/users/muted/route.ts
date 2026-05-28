import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user: currentUser } = await validateRequest();

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mutes = await prisma.mute.findMany({
      where: { muterId: currentUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        muted: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return Response.json(mutes);
  } catch (error) {
    console.error("GET /api/users/muted error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

