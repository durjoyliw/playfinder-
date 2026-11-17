"use server";

import { lucia } from "@/auth";
import { checkBirthDate } from "@/lib/age";
import { BETA_OPEN_JOIN } from "@/lib/beta";
import prisma from "@/lib/prisma";
import { getClientIp, rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import streamServerClient from "@/lib/stream";
import { generateUniqueUsername } from "@/lib/username";
import { joinBetaSchema, JoinBetaValues } from "@/lib/validation";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Beta join: creates a passwordless account from just a name and date of
 * birth, signs the person in, and sends them to onboarding. They can add a
 * username + password later (Settings → Secure your account) to sign in on
 * another device.
 */
export async function joinBeta(
  values: JoinBetaValues,
): Promise<{ error: string }> {
  try {
    if (!BETA_OPEN_JOIN) {
      return { error: "Beta sign-up is closed. Please create an account." };
    }

    // Shares the sign-up budget so the two routes can't be combined to
    // mass-create accounts.
    const limit = await rateLimit("signup-ip", getClientIp());
    if (!limit.ok) {
      return { error: RATE_LIMIT_MESSAGE };
    }

    const parsed = joinBetaSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
    }

    // Age gate, re-checked server-side; under-18s are rejected before
    // anything is stored.
    const age = checkBirthDate(parsed.data.birthDate);
    if (!age.ok) {
      return { error: age.message };
    }

    const displayName = parsed.data.name.replace(/\s+/g, " ").trim();
    const userId = generateIdFromEntropySize(10);

    let username = await generateUniqueUsername(displayName);
    try {
      await prisma.user.create({
        data: {
          id: userId,
          username,
          displayName,
          birthDate: age.birthDate,
        },
      });
    } catch {
      // Lost a race for the generated username; one retry with a fresh one.
      username = await generateUniqueUsername(displayName);
      await prisma.user.create({
        data: {
          id: userId,
          username,
          displayName,
          birthDate: age.birthDate,
        },
      });
    }

    // Best effort: chat also creates the Stream user when it first connects,
    // so a Stream hiccup must not block someone joining.
    try {
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: displayName,
      });
    } catch (error) {
      console.error("joinBeta: Stream upsert failed", error);
    }

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/onboarding");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}
