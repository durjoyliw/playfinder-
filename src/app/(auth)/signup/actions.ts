"use server";

import { lucia } from "@/auth";
import { getPostAuthRedirect } from "@/lib/onboarding";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { checkBirthDate } from "@/lib/age";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const parsed = signUpSchema.safeParse(credentials);
    if (!parsed.success) {
      // Surface the real reason (e.g. the 18+ message), not a generic error.
      return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
    }
    const { username, email, password } = parsed.data;

    // Age gate, re-checked server-side. Under-18s are rejected before
    // anything is stored.
    const age = checkBirthDate(parsed.data.birthDate);
    if (!age.ok) {
      return { error: age.message };
    }

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return {
        error: "Username already taken",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Email already taken",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
          birthDate: age.birthDate,
        },
      });
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect(await getPostAuthRedirect(userId));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
