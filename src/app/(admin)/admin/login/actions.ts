"use server";

import {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from "@/lib/admin/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLogin(
  formData: FormData,
): Promise<{ error: string } | void> {
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
