"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { limitMessage, rateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const joinSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "That email is too long")
    .email("Enter a valid email address"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Tick the box so we can email you" }),
  }),
  source: z.enum(["page", "prompt"]).catch("page"),
});

export type WaitlistResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

/** Join (or change the email on) the waitlist for the signed-in account. */
export async function joinWaitlist(input: {
  email: string;
  consent: boolean;
  source?: string;
}): Promise<WaitlistResult> {
  try {
    const { user } = await validateRequest();
    if (!user) return { ok: false, error: "You're not signed in." };

    const limit = await rateLimit("waitlist", user.id);
    if (!limit.ok) return { ok: false, error: limitMessage(limit) };

    const parsed = joinSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Check your email address",
      };
    }
    const { email, source } = parsed.data;

    // The email may already be on the list from another account.
    const taken = await prisma.waitlistEntry.findUnique({
      where: { email },
      select: { userId: true },
    });
    if (taken && taken.userId !== user.id) {
      return { ok: false, error: "That email is already on the waitlist." };
    }

    await prisma.waitlistEntry.upsert({
      where: { userId: user.id },
      create: { email, userId: user.id, source },
      update: { email },
    });
    revalidatePath("/waitlist");
    return { ok: true, email };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "That email is already on the waitlist." };
    }
    console.error(error);
    return { ok: false, error: "Couldn't add you. Please try again." };
  }
}

/** Remove this account's email from the waitlist. */
export async function leaveWaitlist(): Promise<{ ok: boolean }> {
  try {
    const { user } = await validateRequest();
    if (!user) return { ok: false };
    await prisma.waitlistEntry.deleteMany({ where: { userId: user.id } });
    revalidatePath("/waitlist");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
}
