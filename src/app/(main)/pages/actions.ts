"use server";

import { validateRequest } from "@/auth";
import {
  ACTING_AS_COOKIE_NAME,
  getActingAsCookieOptions,
  requirePageRole,
  type ActingIdentity,
} from "@/lib/pages/access";
import { PageRole } from "@prisma/client";
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
