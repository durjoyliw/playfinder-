export function getUploadThingFileKey(url: string): string {
  const appPathMatch = url.match(/\/a\/[^/]+\/(.+)$/);
  if (appPathMatch) return appPathMatch[1];
  const flatPathMatch = url.match(/\/f\/(.+)$/);
  if (flatPathMatch) return flatPathMatch[1];
  return url;
}
