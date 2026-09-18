import {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from "@/lib/admin/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.set(ADMIN_COOKIE_NAME, "", getAdminCookieOptions(0));
  return response;
}
