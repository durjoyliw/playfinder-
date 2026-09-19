import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { PageRole, type PageMembership } from "@prisma/client";
import { cookies } from "next/headers";

/*
 * Page authorization + active identity (no UI yet).
 *
 * Gate every Page mutation:
 *   const { user, membership } = await requirePageRole(pageId, PageRole.MANAGER);
 *   await assertLastOwnerProtected(pageId, targetUserId);
 *
 * Who the user is acting as (cookie `pf_acting_as`, default = session user):
 *   const identity = await getActingIdentity();
 *   // identity.kind === "user" | "page"
 *   // A post authored as a Page keeps userId = the admin who hit send
 *   // and sets authorPageId = identity.id
 *
 *   await setActingIdentity({ kind: "page", id: pageId }); // src/app/(main)/pages/actions.ts
 *   // kind === "page" requires role >= MANAGER; otherwise rejected.
 */

export const ACTING_AS_COOKIE_NAME = "pf_acting_as";

export type ActingIdentity = {
  kind: "user" | "page";
  id: string;
};

const PAGE_ROLE_RANK: Record<PageRole, number> = {
  [PageRole.ANALYST]: 1,
  [PageRole.MANAGER]: 2,
  [PageRole.OWNER]: 3,
};

export function hasAtLeastPageRole(role: PageRole, min: PageRole) {
  return PAGE_ROLE_RANK[role] >= PAGE_ROLE_RANK[min];
}

export function getActingAsCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

function parseActingIdentity(value: string | undefined): ActingIdentity | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ActingIdentity>;
    if (
      (parsed.kind === "user" || parsed.kind === "page") &&
      typeof parsed.id === "string" &&
      parsed.id.length > 0
    ) {
      return { kind: parsed.kind, id: parsed.id };
    }
  } catch {
    return null;
  }

  return null;
}

export async function getPageMembership(
  userId: string,
  pageId: string,
): Promise<PageMembership | null> {
  return prisma.pageMembership.findUnique({
    where: {
      pageId_userId: { pageId, userId },
    },
  });
}

export async function requirePageRole(pageId: string, min: PageRole) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const membership = await getPageMembership(user.id, pageId);
  if (!membership || !hasAtLeastPageRole(membership.role, min)) {
    throw new Error("Forbidden");
  }

  return { user, membership };
}

export async function assertLastOwnerProtected(
  pageId: string,
  userId: string,
) {
  const membership = await getPageMembership(userId, pageId);
  if (!membership || membership.role !== PageRole.OWNER) return;

  const ownerCount = await prisma.pageMembership.count({
    where: { pageId, role: PageRole.OWNER },
  });

  if (ownerCount <= 1) {
    throw new Error("Cannot remove or demote the last remaining owner");
  }
}

export async function getActingIdentity(): Promise<ActingIdentity> {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const asUser: ActingIdentity = { kind: "user", id: user.id };

  const cookieStore = await cookies();
  const stored = parseActingIdentity(
    cookieStore.get(ACTING_AS_COOKIE_NAME)?.value,
  );

  if (!stored) return asUser;

  if (stored.kind === "user") {
    return stored.id === user.id ? stored : asUser;
  }

  const membership = await getPageMembership(user.id, stored.id);
  if (
    !membership ||
    !hasAtLeastPageRole(membership.role, PageRole.MANAGER)
  ) {
    return asUser;
  }

  return stored;
}
