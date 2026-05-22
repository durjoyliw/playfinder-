/** Display label for the user's area on feed, header pill, etc. */
export function getDisplayArea(location: string | null | undefined): string {
  const trimmed = location?.trim();
  return trimmed || "your area";
}
