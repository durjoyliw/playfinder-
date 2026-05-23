import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

export async function PATCH(
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
      select: { userId: true, isHighlight: true },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { isHighlight: !post.isHighlight },
      include: getPostDataInclude(user.id),
    });

    return Response.json(updated);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
