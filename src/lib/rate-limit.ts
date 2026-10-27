import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * DB-backed fixed-window rate limiting (table `rate_limits`, no external
 * service). Each check is ONE atomic upsert, so concurrent requests can't
 * slip past the limit.
 *
 * Usage (API route):
 *   const limit = await rateLimit("comment", user.id);
 *   if (!limit.ok) return tooManyRequests(limit);
 *
 * Usage (server action): `await enforceRateLimit("post", user.id)` throws a
 * RateLimitError, or check `rateLimit()` and return a friendly error.
 */

/** Per-route limits: `limit` requests per `windowSec` per subject. */
export const RATE_LIMITS = {
  // Auth (subject: IP, plus username for login)
  "login-ip": { limit: 20, windowSec: 15 * 60 },
  "login-user": { limit: 10, windowSec: 15 * 60 },
  "signup-ip": { limit: 10, windowSec: 60 * 60 },
  "admin-login-ip": { limit: 10, windowSec: 15 * 60 },

  // Writes (subject: user id)
  post: { limit: 10, windowSec: 10 * 60 },
  "post-edit": { limit: 30, windowSec: 10 * 60 },
  comment: { limit: 20, windowSec: 5 * 60 },
  like: { limit: 120, windowSec: 10 * 60 },
  save: { limit: 120, windowSec: 10 * 60 },
  share: { limit: 30, windowSec: 10 * 60 },
  interest: { limit: 20, windowSec: 10 * 60 },
  "interest-manage": { limit: 60, windowSec: 10 * 60 },
  follow: { limit: 60, windowSec: 10 * 60 },
  "block-mute": { limit: 30, windowSec: 60 * 60 },
  "message-request": { limit: 10, windowSec: 60 * 60 },
  dm: { limit: 30, windowSec: 10 * 60 },
  "group-chat": { limit: 10, windowSec: 60 * 60 },
  report: { limit: 10, windowSec: 60 * 60 },
  appeal: { limit: 3, windowSec: 24 * 60 * 60 },
  profile: { limit: 30, windowSec: 10 * 60 },
  "page-create": { limit: 5, windowSec: 24 * 60 * 60 },
  "page-handle-check": { limit: 60, windowSec: 60 },
  "acting-identity": { limit: 60, windowSec: 10 * 60 },
  upload: { limit: 30, windowSec: 60 * 60 },
  push: { limit: 20, windowSec: 60 * 60 },
  "stream-sync": { limit: 10, windowSec: 60 * 60 },
  "mark-read": { limit: 60, windowSec: 10 * 60 },
  "account-delete": { limit: 5, windowSec: 60 * 60 },
  "birth-date": { limit: 10, windowSec: 60 * 60 },
} as const;

export type RateLimitBucket = keyof typeof RATE_LIMITS;

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
}

export const RATE_LIMIT_MESSAGE =
  "You're doing that too often. Please wait a moment and try again.";

export class RateLimitError extends Error {
  constructor(public readonly result: RateLimitResult) {
    super(RATE_LIMIT_MESSAGE);
    this.name = "RateLimitError";
  }
}

export async function rateLimit(
  bucket: RateLimitBucket,
  subject: string,
): Promise<RateLimitResult> {
  const { limit, windowSec } = RATE_LIMITS[bucket];
  const key = `${bucket}:${subject.toLowerCase()}`;

  try {
    // Start a new window if the old one has elapsed, else count up. Times
    // are UTC timestamps (how Prisma stores DateTime) regardless of the
    // database session's time zone.
    const rows = await prisma.$queryRaw<
      { count: number; windowStart: Date }[]
    >`
      INSERT INTO "rate_limits" ("key", "count", "windowStart")
      VALUES (${key}, 1, (now() AT TIME ZONE 'UTC'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "rate_limits"."windowStart" <= (now() AT TIME ZONE 'UTC') - (${windowSec}::double precision * INTERVAL '1 second')
          THEN 1 ELSE "rate_limits"."count" + 1 END,
        "windowStart" = CASE
          WHEN "rate_limits"."windowStart" <= (now() AT TIME ZONE 'UTC') - (${windowSec}::double precision * INTERVAL '1 second')
          THEN (now() AT TIME ZONE 'UTC') ELSE "rate_limits"."windowStart" END
      RETURNING "count", "windowStart"
    `;

    maybePrune();

    const { count, windowStart } = rows[0];
    const resetAt = new Date(windowStart).getTime() + windowSec * 1000;
    return {
      ok: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      retryAfter: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)),
    };
  } catch (error) {
    // Fail open: a limiter outage must not take the app down with it.
    console.error(`rateLimit(${bucket}) failed`, error);
    return { ok: true, limit, remaining: limit, retryAfter: 0 };
  }
}

/** Server-action helper: throws RateLimitError when over the limit. */
export async function enforceRateLimit(
  bucket: RateLimitBucket,
  subject: string,
): Promise<void> {
  const result = await rateLimit(bucket, subject);
  if (!result.ok) throw new RateLimitError(result);
}

/** Standard 429 response for API routes. */
export function tooManyRequests(result: RateLimitResult): Response {
  return Response.json(
    { error: RATE_LIMIT_MESSAGE },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    },
  );
}

/** Best-effort client IP (Vercel sets x-forwarded-for). */
export function getClientIp(source?: Headers): string {
  const h = source ?? headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "unknown";
}

/** Occasionally delete rows whose window ended over a day ago. */
function maybePrune() {
  if (Math.random() > 0.01) return;
  void prisma.rateLimit
    .deleteMany({
      where: { windowStart: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    })
    .catch((error) => console.error("rate_limits prune failed", error));
}
