/**
 * Ensure contact hrefs have a usable scheme (CMS sometimes sends bare phone/email).
 */

/** Empty → ""; already tel:/http/mailto: → as-is; else tel:+digits. */
export function normalizeTelHref(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("tel:") ||
    lower.startsWith("http:") ||
    lower.startsWith("https:") ||
    lower.startsWith("mailto:")
  ) {
    return trimmed;
  }
  const cleaned = trimmed.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "";
}

/** Empty → ""; already mailto:/http/tel: → as-is; else mailto:trimmed. */
export function normalizeMailtoHref(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("mailto:") ||
    lower.startsWith("http:") ||
    lower.startsWith("https:") ||
    lower.startsWith("tel:")
  ) {
    return trimmed;
  }
  return `mailto:${trimmed}`;
}
