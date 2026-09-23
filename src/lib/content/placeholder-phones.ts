/**
 * Known fake / placeholder phone numbers that have appeared in CMS content.
 * Replace with the canonical public NAP when rendering.
 */
const PLACEHOLDER_PHONE_PATTERNS: RegExp[] = [
  /8\s*\(\s*800\s*\)\s*000[\s\-–—]*00[\s\-–—]*00/gi,
  /8\s*\(\s*800\s*\)\s*200[\s\-–—]*00[\s\-–—]*20/gi,
  /\+7\s*\(\s*812\s*\)\s*000[\s\-–—]*00[\s\-–—]*00/gi,
];

/** True when the value is a known placeholder rather than a real contact phone. */
export function isPlaceholderPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return PLACEHOLDER_PHONE_PATTERNS.some((re) => {
    re.lastIndex = 0;
    return re.test(trimmed);
  });
}

/** Replace known placeholder phones in HTML/text with the canonical display number. */
export function scrubPlaceholderPhones(
  html: string,
  canonicalDisplay: string,
): string {
  let out = html;
  for (const re of PLACEHOLDER_PHONE_PATTERNS) {
    out = out.replace(re, canonicalDisplay);
  }
  return out;
}
