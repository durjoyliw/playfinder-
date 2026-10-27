"use server";

import {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from "@/lib/admin/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp, rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

export async function adminLogin(
  formData: FormData,
): Promise<{ error: string } | void> {
  const limit = await rateLimit("admin-login-ip", getClientIp());
  if (!limit.ok) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const secret = process.env.ADMIN_SECRET;

  if (username !== "playfinder_admin" || !secret || password !== secret) {
    return { error: "Invalid credentials" };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_COOKIE_NAME,
    secret,
    getAdminCookieOptions(60 * 60 * 24 * 7),
  );

  redirect("/admin");
}
