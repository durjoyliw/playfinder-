"use server";

import {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from "@/lib/admin/auth";
import { adminSessionToken, safeEqual } from "@/lib/admin/session-token";
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

  // Compare HMACs rather than raw strings so the check is constant-time.
  // (Empty inputs short-circuit: HMAC keys can't be zero-length.)
  const valid =
    !!secret &&
    password.length > 0 &&
    safeEqual(username, "playfinder_admin") &&
    safeEqual(
      await adminSessionToken(password),
      await adminSessionToken(secret),
    );
  if (!valid || !secret) {
    return { error: "Invalid credentials" };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_COOKIE_NAME,
    await adminSessionToken(secret),
    getAdminCookieOptions(60 * 60 * 24 * 7),
  );

  redirect("/admin");
}
