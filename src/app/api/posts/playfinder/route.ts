import { validateRequest } from "@/auth";
import {
  filterActivePlayfinderPosts,
  sortPlayfinderPosts,
  sportTabToEnum,
} from "@/lib/playfinder";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sportTab = req.nextUrl.searchParams.get("sport") || "all";

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sportFilter = sportTabToEnum(sportTab);

    const posts = await prisma.post.findMany({
      where: {
        ...(sportFilter ? { sport: sportFilter } : {}),
        OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const sortedPosts = sortPlayfinderPosts(filterActivePlayfinderPosts(posts));

    const data: PostsPage = {
      posts: sortedPosts,
      nextCursor: null,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
