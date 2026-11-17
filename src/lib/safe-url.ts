/**
 * Returns the URL only if it is http(s); anything else (javascript:, data:,
 * relative junk) becomes null. Use before putting third-party or
 * user-supplied URLs into an href.
 */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
