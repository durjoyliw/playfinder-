"use server";

import { validateRequest } from "@/auth";
import {
  ACTING_AS_COOKIE_NAME,
  getActingAsCookieOptions,
  getActingIdentity,
  requirePageRole,
  type ActingIdentity,
} from "@/lib/pages/access";
import prisma from "@/lib/prisma";
import { ensurePageChannel } from "@/lib/stream-messaging";
import {
  createPageSchema,
  PAGE_HANDLE_REGEX,
  RESERVED_PAGE_HANDLES,
  type CreatePageValues,
} from "@/lib/validation";
import { PageRole, PageType } from "@prisma/client";
import { cookies } from "next/headers";

export async function setActingIdentity(
  identity: ActingIdentity,
): Promise<ActingIdentity> {
  if (identity.kind === "page") {
    await requirePageRole(identity.id, PageRole.MANAGER);
  } else if (identity.kind === "user") {
    const { user } = await validateRequest();
    if (!user || user.id !== identity.id) {
      throw new Error("Unauthorized");
    }
  } else {
    throw new Error("Invalid acting identity");
  }

  const cookieStore = await cookies();
  cookieStore.set(
    ACTING_AS_COOKIE_NAME,
    JSON.stringify(identity),
    getActingAsCookieOptions(),
  );

  return identity;
}

export type ActingIdentityOptionPage = {
  id: string;
  handle: string;
  name: string;
  type: PageType;
  avatarUrl: string | null;
};

export type ActingIdentityState = {
  identity: ActingIdentity;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  pages: ActingIdentityOptionPage[];
};

/** Current acting identity + switcher options (self + MANAGER+ pages). */
export async function getActingIdentityState(): Promise<ActingIdentityState> {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const [identity, pages] = await Promise.all([
    getActingIdentity(),
    prisma.page.findMany({
      where: {
        memberships: {
          some: {
            userId: user.id,
            role: { in: [PageRole.MANAGER, PageRole.OWNER] },
          },
        },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        handle: true,
        name: true,
        type: true,
        avatarUrl: true,
      },
    }),
  ]);

  return {
    identity,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    pages,
  };
}

export async function followPage(pageId: string): Promise<void> {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  await prisma.pageFollow.upsert({
    where: {
      pageId_userId: { pageId, userId: user.id },
    },
    create: { pageId, userId: user.id },
    update: {},
  });
}

export async function unfollowPage(pageId: string): Promise<void> {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  await prisma.pageFollow.deleteMany({
    where: { pageId, userId: user.id },
  });
}

function normalizeHandle(raw: string) {
  return raw.trim().toLowerCase().replace(/^@/, "");
}

export async function checkPageHandle(
  handle: string,
): Promise<{ available: boolean }> {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const normalized = normalizeHandle(handle);
  if (
    !PAGE_HANDLE_REGEX.test(normalized) ||
    RESERVED_PAGE_HANDLES.includes(
      normalized as (typeof RESERVED_PAGE_HANDLES)[number],
    )
  ) {
    return { available: false };
  }

  const existing = await prisma.page.findFirst({
    where: { handle: { equals: normalized, mode: "insensitive" } },
    select: { id: true },
  });

  return { available: !existing };
}

export async function createPage(
  input: CreatePageValues,
): Promise<{ handle: string }> {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const data = createPageSchema.parse(input);

  if (data.homeVenueId) {
    if (data.type !== "CLUB") {
      throw new Error("Home venue is only valid for clubs");
    }
    const venue = await prisma.page.findFirst({
      where: {
        id: data.homeVenueId,
        type: PageType.VENUE,
      },
      select: { id: true },
    });
    if (!venue) throw new Error("Home venue not found");
  }

  const taken = await prisma.page.findFirst({
    where: { handle: { equals: data.handle, mode: "insensitive" } },
    select: { id: true },
  });
  if (taken) throw new Error("Handle already taken");

  const profileData: Record<string, string> = {};
  if (data.type === "CLUB" && data.sport) profileData.sport = data.sport;
  if (data.type === "VENUE" && data.facilities) {
    profileData.facilities = data.facilities;
  }
  if (data.homeVenueId) profileData.homeVenueId = data.homeVenueId;

  const page = await prisma.$transaction(async (tx) => {
    const created = await tx.page.create({
      data: {
        handle: data.handle,
        name: data.name,
        type: data.type,
        city: data.city,
        bio: data.bio || null,
        avatarUrl: data.avatarUrl || null,
        bannerUrl: data.bannerUrl || null,
        createdById: user.id,
        profileData:
          Object.keys(profileData).length > 0 ? profileData : undefined,
      },
    });

    await tx.pageMembership.create({
      data: {
        pageId: created.id,
        userId: user.id,
        role: PageRole.OWNER,
      },
    });

    return created;
  });

  // Stream channel is best-effort — never fail page creation if Stream is down.
  try {
    const chatChannelId = await ensurePageChannel({
      pageId: page.id,
      ownerUserId: user.id,
      name: page.name,
    });
    await prisma.page.update({
      where: { id: page.id },
      data: { chatChannelId },
    });
  } catch (error) {
    console.error(
      `Failed to provision Stream channel for page ${page.id}:`,
      error,
    );
  }

  return { handle: page.handle };
}
