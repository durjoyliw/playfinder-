import prisma from "@/lib/prisma";
import { randomInt } from "crypto";

/** Same rule as sign-up: letters, numbers, - and _. */
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
export const USERNAME_MAX_LENGTH = 30;

function slugifyName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents: "Zoë" -> "Zoe"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 16);
}

async function isUsernameTaken(username: string): Promise<boolean> {
  const existing = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { id: true },
  });
  return existing !== null;
}

/**
 * A free username derived from a display name, e.g. "Jordan Vance" ->
 * "jordan_vance_4821". Beta accounts get one automatically; people can pick
 * their own when they set a password.
 */
export async function generateUniqueUsername(name: string): Promise<string> {
  const base = slugifyName(name) || "player";
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `${base}_${randomInt(1000, 10000)}`;
    if (!(await isUsernameTaken(candidate))) return candidate;
  }
  // Practically unreachable; fall back to a longer random suffix.
  return `${base}_${randomInt(100000, 1000000)}`;
}

export { isUsernameTaken };
