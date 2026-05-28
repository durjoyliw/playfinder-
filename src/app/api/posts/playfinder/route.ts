import { validateRequest } from "@/auth";
import {
  filterActivePlayfinderPosts,
  sortPlayfinderPosts,
  sportTabToPostSport,
} from "@/lib/playfinder";
import { getTeammateIds } from "@/lib/teammate";
import prisma from "@/lib/prisma";
import { computeInterestFields } from "@/lib/post-interest";
import {
  getPlayfinderFeedPostInclude,
  type PlayfinderFeedPost,
  type PlayfinderPostsPage,
  type PostData,
} from "@/lib/types";
import { Prisma, Sport } from "@prisma/client";
import { NextRequest } from "next/server";

function sortTeammatesFirst(posts: PlayfinderFeedPost[]): PlayfinderFeedPost[] {
  const teammatePosts = posts.filter((p) => p.isTeammate);
  const otherPosts = posts.filter((p) => !p.isTeammate);

  return [
    ...sortPlayfinderPosts(teammatePosts),
    ...sortPlayfinderPosts(otherPosts),
  ];
}

/** Post.type filter — Social includes SOCIAL and any legacy/non-arena type (null, GENERAL, etc.). */
function buildPostTypeFilter(tab: string | null): Prisma.PostWhereInput | null {
  try {
    const normalized = tab?.toLowerCase() ?? null;
    if (normalized === "social") {
      return {
        NOT: { type: { in: ["ARENA", "BROADCAST"] } },
      };
    }
    return { type: { in: ["ARENA", "BROADCAST"] } };
  } catch {
    return null;
  }
}

function isPostTypeFieldError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("type") &&
    (message.includes("unknown arg") ||
      message.includes("does not exist") ||
      message.includes("unknown field"))
  );
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sportTab = searchParams.get("sport") ?? "all";
    const tab = searchParams.get("tab");

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postSport = sportTabToPostSport(sportTab);
    const now = new Date();
    const teammateIds = await getTeammateIds(user.id);
    const teammateIdSet = new Set(teammateIds);

    const expiryFilter: Prisma.PostWhereInput = {
      OR: [{ expiresAt: { gt: now } }, { expiresAt: null }],
    };

    const visibilityFilter: Prisma.PostWhereInput = {
      OR: [
        { visibility: "PUBLIC" },
        { userId: user.id },
        {
          AND: [
            { visibility: "TEAMMATES_ONLY" },
            {
              user: {
                followers: { some: { followerId: user.id } },
                following: { some: { followingId: user.id } },
              },
            },
          ],
        },
      ],
    };

    let sportFilter: Prisma.PostWhereInput;

    const isSocialTab = tab?.toLowerCase() === "social";

    if (sportTab === "all") {
      if (isSocialTab) {
        // Social "All" — show every non-arena post; do not restrict to profile sports.
        sportFilter = {};
      } else {
        const userSports = await prisma.userSport.findMany({
          where: { userId: user.id },
          select: { sport: true },
        });

        const mappedSports = userSports
          .map((s) => sportTabToPostSport(s.sport))
          .filter((s): s is Sport => !!s);

        sportFilter = {
          sport: mappedSports.length ? { in: mappedSports } : { in: [] },
        };
      }
    } else if (postSport) {
      sportFilter = { sport: postSport };
    } else {
      sportFilter = { sport: { in: [] } };
    }

    const typeFilter = buildPostTypeFilter(tab);

    const andFilters: Prisma.PostWhereInput[] = [
      expiryFilter,
      visibilityFilter,
      sportFilter,
      ...(typeFilter ? [typeFilter] : []),
    ];

    const where: Prisma.PostWhereInput = { AND: andFilters };

    const queryArgs = {
      where,
      include: getPlayfinderFeedPostInclude(user.id),
      orderBy: { createdAt: "desc" as const },
      take: 100,
    };

    let posts;
    try {
      posts = await prisma.post.findMany(queryArgs);
    } catch (queryError) {
      if (typeFilter && isPostTypeFieldError(queryError)) {
        console.warn(
          "[playfinder feed] Post.type filter skipped — column may be missing. Re-run: npx prisma db push && npx prisma generate",
          queryError,
        );
        const { AND, ...whereRest } = where;
        const filtersWithoutType = Array.isArray(AND)
          ? AND.filter((clause) => !("type" in clause))
          : [];
        posts = await prisma.post.findMany({
          ...queryArgs,
          where: { ...whereRest, AND: filtersWithoutType },
        });
      } else {
        throw queryError;
      }
    }

    const activePosts = filterActivePlayfinderPosts(posts as PostData[]);

    const feedPosts: PlayfinderFeedPost[] = activePosts.map((post) => {
      const interestFields = computeInterestFields(post, user.id);
      return {
        ...post,
        isTeammate: teammateIdSet.has(post.user.id),
        ...interestFields,
      };
    });

    const sortedPosts = sortTeammatesFirst(feedPosts);

    const postTypeForLog = isSocialTab
      ? "NOT ARENA/BROADCAST"
      : "ARENA/BROADCAST";

    console.log("[playfinder feed]", {
      sportTab,
      tab: tab ?? null,
      postType: postTypeForLog,
      postSport: postSport ?? null,
      filters: {
        expiry: "expiresAt > now OR expiresAt is null",
        visibility: "PUBLIC or own or teammates-only from mutual follows",
        sport:
          sportTab === "all"
            ? "user onboarding sports"
            : postSport
              ? postSport
              : "unmapped (empty)",
      },
      teammateCount: teammateIds.length,
      dbRowCount: posts.length,
      afterExpiryFilterCount: activePosts.length,
      returnedCount: sortedPosts.length,
    });

    const data: PlayfinderPostsPage = {
      posts: sortedPosts,
      nextCursor: null,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
