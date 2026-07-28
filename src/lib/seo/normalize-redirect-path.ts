/**
 * Normalize catalog redirect paths for Map keys/values.
 * decodeURIComponent → NFC → trailing slash; Latin segments lowercased.
 */
export function normalizeRedirectPath(raw: string): string {
  let path = raw.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    // keep raw if malformed % sequences
  }
  path = path.normalize("NFC");
  if (!path.startsWith("/")) path = `/${path}`;

  const segments = path
    .split("/")
    .filter((s) => s.length > 0)
    .map((seg) => (/^[a-zA-Z0-9_-]+$/.test(seg) ? seg.toLowerCase() : seg));

  if (segments.length === 0) return "/";
  return `/${segments.join("/")}/`;
}
