/** UK postcode pattern (e.g. G42, SW1A, EH1) */
const UK_POSTCODE_SEGMENT = /^[A-Z]{1,2}\d/i;

/**
 * Extract a short city label from a Mapbox place_name.
 * e.g. "G42 8RT, Glasgow, Glasgow City, Scotland, United Kingdom" → "Glasgow"
 */
export function getCityFromPlaceName(
  placeName: string | null | undefined,
): string {
  const trimmed = placeName?.trim();
  if (!trimmed) return "your area";

  const segments = trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const citySegment = segments.find((s) => !UK_POSTCODE_SEGMENT.test(s));
  return citySegment ?? segments[0] ?? "your area";
}

/** Display label for the user's area on feed, header pill, etc. */
export function getDisplayArea(location: string | null | undefined): string {
  return getCityFromPlaceName(location);
}
