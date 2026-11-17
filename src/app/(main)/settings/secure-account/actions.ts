"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import streamServerClient from "@/lib/stream";
import { isUsernameTaken } from "@/lib/username";
import { secureAccountSchema, SecureAccountValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { revalidatePath } from "next/cache";

export type SecureAccountResult =
  | { ok: true; username: string }
  | { ok: false; error: string };

/**
 * Lets a name-only beta account choose a username + password, so the person
 * can log in on another device. Accounts that already have a password (or use
 * Google) are refused: this is not a password-change endpoint.
 */
export async function secureAccount(
  values: SecureAccountValues,
): Promise<SecureAccountResult> {
  try {
    const { user } = await validateRequest();
    if (!user) return { ok: false, error: "You're not signed in." };

    const limit = await rateLimit("secure-account", user.id);
    if (!limit.ok) return { ok: false, error: RATE_LIMIT_MESSAGE };

    const parsed = secureAccountSchema.safeParse(values);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid details",
      };
    }
    const { username, password } = parsed.data;

    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { username: true, passwordHash: true, googleId: true },
    });
    if (!account) return { ok: false, error: "Account not found." };
    if (account.passwordHash || account.googleId) {
      return { ok: false, error: "This account already has a way to log in." };
    }

    const changingUsername =
      username.toLowerCase() !== account.username.toLowerCase();
    if (changingUsername && (await isUsernameTaken(username))) {
      return { ok: false, error: "That username is taken." };
    }

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { username, passwordHash },
      });
    } catch {
      // Unique constraint: someone took the username in the meantime.
      return { ok: false, error: "That username is taken." };
    }

    try {
      await streamServerClient.partialUpdateUser({
        id: user.id,
        set: { username },
      });
    } catch (error) {
      console.error("secureAccount: Stream update failed", error);
    }

    revalidatePath(`/users/${account.username}`);
    revalidatePath(`/users/${username}`);
    return { ok: true, username };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
