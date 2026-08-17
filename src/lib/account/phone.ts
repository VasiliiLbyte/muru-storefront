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

/** Human-readable phone for toast / UI (e.g. +7 900 123-45-67). */
export function formatRussianPhoneForDisplay(phone: string): string {
  const normalized = normalizeRussianPhoneForApi(phone);
  if (!normalized) return phone.trim();

  const digits = digitsOnly(normalized);
  if (digits.length !== 11) return normalized;

  return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}
