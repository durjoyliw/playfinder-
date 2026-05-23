import { validateRequest } from "@/auth";
import {
  filterActivePlayfinderPosts,
  sortPlayfinderPosts,
  sportTabToPostSport,
} from "@/lib/playfinder";
import prisma from "@/lib/prisma";
import {
  getPlayfinderFeedPostInclude,
  type PostData,
  PostsPage,
} from "@/lib/types";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sportTab = req.nextUrl.searchParams.get("sport") ?? "all";

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Post.sport uses the Sport enum; UserSport.sport is a separate string field
    const postSport = sportTabToPostSport(sportTab);

    const now = new Date();

    const where: Prisma.PostWhereInput = {
      OR: [{ expiresAt: { gt: now } }, { expiresAt: null }],
    };

    if (sportTab !== "all") {
      if (postSport) {
        where.sport = postSport;
      } else {
        // User sport has no Post.sport enum mapping — return no posts
        where.sport = { in: [] };
      }
    }

    const posts = await prisma.post.findMany({
      where,
      include: getPlayfinderFeedPostInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const activePosts = filterActivePlayfinderPosts(posts as PostData[]);
    const sortedPosts = sortPlayfinderPosts(activePosts);

    console.log("[playfinder feed]", {
      sportTab,
      postSport: postSport ?? null,
      filters: {
        expiry: "expiresAt > now OR expiresAt is null",
        sport:
          sportTab === "all"
            ? "none"
            : postSport
              ? postSport
              : "unmapped (empty)",
      },
      dbRowCount: posts.length,
      afterExpiryFilterCount: activePosts.length,
      returnedCount: sortedPosts.length,
    });

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
