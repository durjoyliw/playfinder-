import { timingSafeEqual } from "crypto";

/**
 * Authorises Vercel Cron calls. Vercel sends `Authorization: Bearer
 * <CRON_SECRET>` when the CRON_SECRET env var is set.
 *
 * Rejects when the secret is missing or empty -- previously an unset secret
 * made the expected header the literal "Bearer undefined", which anyone
 * could send.
 */
export function isAuthorizedCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.error("Cron request rejected: CRON_SECRET is not set");
    return false;
  }

  const header = req.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}

export function unauthorizedCronResponse(): Response {
  return Response.json({ message: "Unauthorized" }, { status: 401 });
}
