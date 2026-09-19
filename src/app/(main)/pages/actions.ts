"use server";

import { validateRequest } from "@/auth";
import {
  ACTING_AS_COOKIE_NAME,
  getActingAsCookieOptions,
  requirePageRole,
  type ActingIdentity,
} from "@/lib/pages/access";
import prisma from "@/lib/prisma";
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

  return { handle: page.handle };
}
