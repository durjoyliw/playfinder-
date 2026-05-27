import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { filterActivePlayfinderPosts } from "@/lib/playfinder";
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
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    if (!q) {
      return Response.json({ posts: [], nextCursor: null } satisfies PostsPage);
    }

    const sportMatches = sportEnumsMatchingQuery(q);
    const now = new Date();

    const posts = await prisma.post.findMany({
      where: {
        AND: [
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
          {
            type: "ARENA",
            OR: [
              { content: { contains: q, mode: "insensitive" } },
              ...(sportMatches.length
                ? [{ sport: { in: sportMatches } }]
                : []),
            ],
          },
        ],
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const active = filterActivePlayfinderPosts(posts);
    const nextCursor =
      active.length > pageSize ? active[pageSize].id : null;

    const data: PostsPage = {
      posts: active.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
