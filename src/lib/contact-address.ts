/** д.13 → д. 13; пом.27 → пом. 27 (идемпотентно). */
export function normalizeContactAddress(address: string): string {
  return address
    .replace(/д\.\s*(\d+)/gi, "д. $1")
    .replace(/пом\.\s*(\d+)/gi, "пом. $1")
    .replace(/\s+/g, " ")
    .trim();
}

/** После normalize: line1 до «ул.», line2 с «ул.». */
export function splitContactAddress(address: string): {
  line1: string;
  line2: string;
} {
  const normalized = normalizeContactAddress(address);
  const streetMatch = normalized.match(/,\s*(ул\..*)$/i);

  if (!streetMatch) {
    return { line1: normalized, line2: "" };
  }

  const line1 = normalized.slice(0, streetMatch.index).trim();
  const line2 = streetMatch[1].trim();

  return {
    line1: line1.endsWith(",") ? line1 : `${line1},`,
    line2,
  };
}
