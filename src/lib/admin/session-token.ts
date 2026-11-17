/**
 * Admin session token.
 *
 * The admin cookie used to hold ADMIN_SECRET itself, so the password sat in
 * the browser. It now holds an HMAC derived from the secret instead. Works in
 * both the Edge middleware and Node (Web Crypto is available in both).
 */

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function adminSessionToken(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("playfinder-admin-session-v1"),
  );
  return toHex(signature);
}

/** Length-safe constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** True when the cookie value is a valid admin session for this secret. */
export async function isValidAdminSession(
  cookieValue: string | undefined,
): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !cookieValue) return false;
  return safeEqual(cookieValue, await adminSessionToken(secret));
}
