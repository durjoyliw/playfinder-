import { validateRequest } from "@/auth";
import { hasAtLeastPageRole } from "@/lib/pages/access";
import prisma from "@/lib/prisma";
import { getInitials } from "@/lib/settings";
import {
  PageRole,
  PageStatus,
  PageType,
  VerifyLevel,
  type Page,
} from "@prisma/client";

export type PageProfileData = {
  sport?: string;
  facilities?: string;
  homeVenueId?: string;
};

export type PageViewPost = {
  id: string;
  content: string;
  createdAt: Date;
};

export type PageViewData = {
  id: string;
  handle: string;
  name: string;
  type: PageType;
  verify: VerifyLevel;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  city: string | null;
  initials: string;
  categoryLabel: string;
  followerCount: number;
  isFollowing: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
  posts: PageViewPost[];
};

function parseProfileData(raw: Page["profileData"]): PageProfileData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  return {
    sport: typeof obj.sport === "string" ? obj.sport : undefined,
    facilities: typeof obj.facilities === "string" ? obj.facilities : undefined,
    homeVenueId:
      typeof obj.homeVenueId === "string" ? obj.homeVenueId : undefined,
  };
}

function categoryLabel(page: Page, profile: PageProfileData): string {
  if (page.type === PageType.CLUB) {
    return profile.sport?.trim() || "Club";
  }
  if (page.type === PageType.VENUE) {
    return profile.facilities?.trim() || "Venue";
  }
  return page.type.charAt(0) + page.type.slice(1).toLowerCase();
}

/**
 * Server loader for /pages/[handle]. Returns null → caller should notFound().
 * Public when logged out (isFollowing/isAdmin false). SUSPENDED → null.
 */
export async function getPageViewByHandle(
  handle: string,
): Promise<PageViewData | null> {
  const page = await prisma.page.findFirst({
    where: {
      handle: { equals: handle, mode: "insensitive" },
      status: { not: PageStatus.SUSPENDED },
    },
  });

  if (!page) return null;

  const { user } = await validateRequest();
  const profile = parseProfileData(page.profileData);

  const [followerCount, follow, membership, posts] = await Promise.all([
    prisma.pageFollow.count({ where: { pageId: page.id } }),
    user
      ? prisma.pageFollow.findUnique({
          where: {
            pageId_userId: { pageId: page.id, userId: user.id },
          },
          select: { pageId: true },
        })
      : Promise.resolve(null),
    user
      ? prisma.pageMembership.findUnique({
          where: {
            pageId_userId: { pageId: page.id, userId: user.id },
          },
          select: { role: true },
        })
      : Promise.resolve(null),
    prisma.post.findMany({
      where: {
        authorPageId: page.id,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    }),
  ]);

  const isAdmin = Boolean(
    membership && hasAtLeastPageRole(membership.role, PageRole.MANAGER),
  );

  return {
    id: page.id,
    handle: page.handle,
    name: page.name,
    type: page.type,
    verify: page.verify,
    bio: page.bio,
    avatarUrl: page.avatarUrl,
    bannerUrl: page.bannerUrl,
    city: page.city,
    initials: getInitials(page.name),
    categoryLabel: categoryLabel(page, profile),
    followerCount,
    isFollowing: Boolean(follow),
    isAdmin,
    isLoggedIn: Boolean(user),
    posts,
  };
}
