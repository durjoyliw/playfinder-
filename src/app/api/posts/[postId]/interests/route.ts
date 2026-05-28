import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const interests = await prisma.postInterest.findMany({
      where: {
        postId,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            sports: {
              select: {
                sport: true,
                skillLevel: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return Response.json(interests);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
