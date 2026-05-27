import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { PLAYFINDER_SPORTS } from "@/lib/sports";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { Sport } from "@prisma/client";
import { NextRequest } from "next/server";

function sportEnumsMatchingQuery(q: string): Sport[] {
  const lower = q.toLowerCase();
  return PLAYFINDER_SPORTS.filter(
    (s) =>
      s.label.toLowerCase().includes(lower) ||
      s.id.toLowerCase().includes(lower),
  ).map((s) => s.enum);
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!q) {
      return Response.json({ posts: [], nextCursor: null } satisfies PostsPage);
    }

    const sportMatches = sportEnumsMatchingQuery(q);

    const posts = await prisma.post.findMany({
      where: {
        type: "SOCIAL",
        OR: [
          { content: { contains: q, mode: "insensitive" } },
          ...(sportMatches.length ? [{ sport: { in: sportMatches } }] : []),
        ],
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
