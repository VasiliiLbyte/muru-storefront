/**
 * Digits for a segmented OTP field. Handles plain codes and pastes of
 * provider messages like «Ваш код 1234».
 */
export function extractOtpDigits(raw: string, length = 4): string {
  return raw.replace(/\D/g, "").slice(0, length);
}

/**
 * Apply pasted text to an OTP cell array starting at `startIndex`.
 * Returns the new cells and the index that should receive focus.
 */
export function distributeOtpPaste(
  cells: string[],
  pasted: string,
  startIndex: number,
): { cells: string[]; focusIndex: number } {
  const digits = extractOtpDigits(pasted, cells.length);
  if (!digits) return { cells, focusIndex: startIndex };

  const from = digits.length === cells.length ? 0 : startIndex;
  const next = [...cells];
  for (let i = 0; i < digits.length && from + i < cells.length; i += 1) {
    next[from + i] = digits[i];
  }

  const filled = Math.min(from + digits.length, cells.length);
  return { cells: next, focusIndex: Math.min(filled, cells.length - 1) };
}
