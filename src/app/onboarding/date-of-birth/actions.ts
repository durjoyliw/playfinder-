"use server";

import { lucia, validateRequest } from "@/auth";
import { checkBirthDate, needsBirthDate } from "@/lib/age";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface ConfirmBirthDateResult {
  message: string;
}

/**
 * The 18+ gate for accounts that skipped the signup form (Google sign-in).
 *
 * - 18+: stores birthDate and continues onboarding.
 * - Under 18: the brand-new account is deleted, the user signed out and sent
 *   to /age-restricted, so no under-18 account or data is kept (the date
 *   itself is never stored). A redirect, not a returned message: clearing
 *   the cookie re-renders this route, whose layout needs a signed-in user.
 *   Only ever touches an account that has no birthDate AND hasn't finished
 *   onboarding, i.e. one created moments ago.
 */
export async function confirmBirthDate(
  value: string,
): Promise<ConfirmBirthDateResult> {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { birthDate: true, completedOnboarding: true },
  });
  if (!account || !needsBirthDate(account)) redirect("/onboarding");

  const check = checkBirthDate(value);

  if (!check.ok && check.reason === "invalid") {
    return { message: check.message };
  }

  if (!check.ok) {
    try {
      // Sessions cascade with the user row.
      await prisma.user.delete({ where: { id: user.id } });
    } catch (error) {
      console.error("confirmBirthDate: removing under-18 account failed", error);
      return { message: "Something went wrong. Please try again." };
    }
    try {
      await streamServerClient.deleteUser(user.id, { hard_delete: true });
    } catch (error) {
      console.error("confirmBirthDate: Stream clean-up failed", error);
    }
    const blank = lucia.createBlankSessionCookie();
    cookies().set(blank.name, blank.value, blank.attributes);
    redirect("/age-restricted");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { birthDate: check.birthDate },
  });
  redirect("/onboarding");
}
