/** Strip non-digits from user input. */
function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Normalize Russian mobile for API (`+7XXXXXXXXXX`).
 * Mirrors backend `normalizeRussianPhone` behavior.
 */
export function normalizeRussianPhoneForApi(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let digits = digitsOnly(trimmed);
  if (digits.length === 0) return null;

  if (digits.length === 11 && digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  } else if (digits.length === 10) {
    if (digits.startsWith("7")) return null;
    digits = `7${digits}`;
  }

  if (digits.length !== 11 || !digits.startsWith("7")) {
    return null;
  }

  return `+${digits}`;
}

/**
 * Digits after the `+7` country code, for inputs with a fixed `+7` prefix.
 * Accepts pasted `+7…`, `8…`, `7…` and bare 10-digit numbers.
 */
export function russianPhoneDigits10(raw: string): string {
  let digits = digitsOnly(raw);

  if (digits.length > 10 && (digits.startsWith("7") || digits.startsWith("8"))) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

/** Progressive mask for the 10 digits after `+7`: `(900) 123-45-67`. */
export function formatRussianPhoneMask(digits10: string): string {
  const d = digitsOnly(digits10).slice(0, 10);
  if (!d) return "";

  const area = d.slice(0, 3);
  if (d.length <= 3) return `(${area}`;

  let out = `(${area}) ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

/** Human-readable phone for toast / UI (e.g. +7 900 123-45-67). */
export function formatRussianPhoneForDisplay(phone: string): string {
  const normalized = normalizeRussianPhoneForApi(phone);
  if (!normalized) return phone.trim();

  const digits = digitsOnly(normalized);
  if (digits.length !== 11) return normalized;

  return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}
