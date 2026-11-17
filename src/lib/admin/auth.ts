import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidAdminSession } from "./session-token";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_ACTOR_ID = "playfinder_admin";

export function getAdminCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge,
    path: "/",
  };
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!(await isValidAdminSession(session))) {
    redirect("/admin/login");
  }
}
