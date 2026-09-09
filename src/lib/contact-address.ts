/** д.13 → д. 13; пом.27 → пом. 27 (идемпотентно). */
export function normalizeContactAddress(address: string): string {
  return address
    .replace(/д\.\s*(\d+)/gi, "д. $1")
    .replace(/пом\.\s*(\d+)/gi, "пом. $1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * После normalize: line1 до «ул.», line2 с «ул.» до «литера», line3 — «литера …».
 * Разбивка по макету дизайнера: в узкой колонке подвала адрес иначе рвётся
 * посреди «литера А».
 */
export function splitContactAddress(address: string): {
  line1: string;
  line2: string;
  line3: string;
} {
  const normalized = normalizeContactAddress(address);
  const streetMatch = normalized.match(/,\s*(ул\..*)$/i);

  if (!streetMatch) {
    return { line1: normalized, line2: "", line3: "" };
  }

  const line1 = normalized.slice(0, streetMatch.index).trim();
  const street = streetMatch[1].trim();
  const literaMatch = street.match(/,\s*(литера.*)$/i);

  const line2 = literaMatch
    ? street.slice(0, literaMatch.index).trim().replace(/,?$/, ",")
    : street;
  const line3 = literaMatch ? literaMatch[1].trim() : "";

  return {
    line1: line1.endsWith(",") ? line1 : `${line1},`,
    line2,
    line3,
  };
}
