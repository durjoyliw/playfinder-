import { validateRequest } from "@/auth";

import {

  filterActivePlayfinderPosts,

  sortPlayfinderPosts,

  sportTabToPostSport,

} from "@/lib/playfinder";

import { getTeammateIds } from "@/lib/teammate";

import prisma from "@/lib/prisma";

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



export async function GET(req: NextRequest) {

  try {

    const sportTab = req.nextUrl.searchParams.get("sport") ?? "all";
    const tab = (req.nextUrl.searchParams.get("tab") ?? "").toLowerCase();



    const { user } = await validateRequest();



    if (!user) {

      return Response.json({ error: "Unauthorized" }, { status: 401 });

    }



    const postSport = sportTabToPostSport(sportTab);

    const now = new Date();

    const teammateIds = await getTeammateIds(user.id);

    const teammateIdSet = new Set(teammateIds);



    const andFilters: Prisma.PostWhereInput[] = [

      { OR: [{ expiresAt: { gt: now } }, { expiresAt: null }] },

      {

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

      },

    ];

    if (tab === "arena") {
      andFilters.push({ type: "ARENA" });
    } else if (tab === "social") {
      andFilters.push({ type: "SOCIAL" });
    }



    if (sportTab === "all") {

      const userSports = await prisma.userSport.findMany({

        where: { userId: user.id },

        select: { sport: true },

      });



      const mappedSports = userSports

        .map((s) => sportTabToPostSport(s.sport))

        .filter((s): s is Sport => !!s);



      andFilters.push({

        sport: mappedSports.length ? { in: mappedSports } : { in: [] },

      });

    } else if (postSport) {

      andFilters.push({ sport: postSport });

    } else {

      andFilters.push({ sport: { in: [] } });

    }



    const posts = await prisma.post.findMany({

      where: { AND: andFilters },

      include: getPlayfinderFeedPostInclude(user.id),

      orderBy: { createdAt: "desc" },

      take: 100,

    });



    const activePosts = filterActivePlayfinderPosts(posts as PostData[]);



    const feedPosts: PlayfinderFeedPost[] = activePosts.map((post) => ({

      ...post,

      isTeammate: teammateIdSet.has(post.user.id),

    }));



    const sortedPosts = sortTeammatesFirst(feedPosts);



    console.log("[playfinder feed]", {

      sportTab,

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


