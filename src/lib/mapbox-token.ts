/**
 * Mapbox public token — same env var Discover + Location settings use.
 * Do not introduce alternate names here.
 */
export function getMapboxToken(): string | undefined {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  return token?.trim() ? token.trim() : undefined;
}

export function hasMapboxToken(): boolean {
  return Boolean(getMapboxToken());
}
