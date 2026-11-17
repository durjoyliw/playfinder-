"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { limitMessage, rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { z } from "zod";

const feedbackSchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, "Tell us a little more")
    .max(2000, "Keep it under 2,000 characters"),
  // Only in-app paths, so this can't be used to store arbitrary URLs.
  page: z
    .string()
    .max(200)
    .regex(/^\/[^\s]*$/)
    .optional()
    .catch(undefined),
});

export type FeedbackResult = { ok: true } | { ok: false; error: string };

export async function submitFeedback(input: {
  message: string;
  page?: string;
}): Promise<FeedbackResult> {
  try {
    const { user } = await validateRequest();
    if (!user) return { ok: false, error: "You're not signed in." };

    const limit = await rateLimit("feedback", user.id);
    if (!limit.ok) return { ok: false, error: limitMessage(limit) };

    const parsed = feedbackSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid feedback",
      };
    }

    const userAgent = headers().get("user-agent")?.slice(0, 300) ?? null;

    await prisma.feedback.create({
      data: {
        userId: user.id,
        message: parsed.data.message,
        page: parsed.data.page ?? null,
        userAgent,
      },
    });

    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Couldn't send that. Please try again." };
  }
}
