import { describe, expect, it } from "vitest";

import {
  formatRussianPhoneForDisplay,
  formatRussianPhoneMask,
  normalizeRussianPhoneForApi,
  russianPhoneDigits10,
} from "./phone";

describe("normalizeRussianPhoneForApi", () => {
  it("normalizes common Russian mobile formats", () => {
    expect(normalizeRussianPhoneForApi("79001234567")).toBe("+79001234567");
    expect(normalizeRussianPhoneForApi("89001234567")).toBe("+79001234567");
    expect(normalizeRussianPhoneForApi("+7 (900) 123-45-67")).toBe(
      "+79001234567",
    );
    expect(normalizeRussianPhoneForApi("9001234567")).toBe("+79001234567");
    expect(normalizeRussianPhoneForApi("+79001234567")).toBe("+79001234567");
  });

  it("returns null for invalid input", () => {
    expect(normalizeRussianPhoneForApi("")).toBeNull();
    expect(normalizeRussianPhoneForApi("   ")).toBeNull();
    expect(normalizeRussianPhoneForApi("abc")).toBeNull();
    expect(normalizeRussianPhoneForApi("12345")).toBeNull();
    expect(normalizeRussianPhoneForApi("7900123456")).toBeNull();
    expect(normalizeRussianPhoneForApi("69001234567")).toBeNull();
  });
});

describe("formatRussianPhoneForDisplay", () => {
  it("formats normalized API phone", () => {
    expect(formatRussianPhoneForDisplay("+79001234567")).toBe(
      "+7 900 123-45-67",
    );
  });

  it("passes through unparseable input trimmed", () => {
    expect(formatRussianPhoneForDisplay("  bad  ")).toBe("bad");
  });
});

describe("russianPhoneDigits10", () => {
  it("drops the country code from pasted numbers", () => {
    expect(russianPhoneDigits10("+7 (900) 123-45-67")).toBe("9001234567");
    expect(russianPhoneDigits10("89001234567")).toBe("9001234567");
    expect(russianPhoneDigits10("79001234567")).toBe("9001234567");
    expect(russianPhoneDigits10("9001234567")).toBe("9001234567");
  });

  it("keeps partial input and clamps overflow", () => {
    expect(russianPhoneDigits10("")).toBe("");
    expect(russianPhoneDigits10("900")).toBe("900");
    expect(russianPhoneDigits10("7")).toBe("7");
    expect(russianPhoneDigits10("+7 900 123 45 67 89")).toBe("9001234567");
  });

  it("pairs with normalizeRussianPhoneForApi through an explicit +7", () => {
    const digits = russianPhoneDigits10("8 (900) 123-45-67");
    expect(normalizeRussianPhoneForApi(`+7${digits}`)).toBe("+79001234567");
  });
});

describe("formatRussianPhoneMask", () => {
  it("formats progressively", () => {
    expect(formatRussianPhoneMask("")).toBe("");
    expect(formatRussianPhoneMask("9")).toBe("(9");
    expect(formatRussianPhoneMask("900")).toBe("(900");
    expect(formatRussianPhoneMask("900123")).toBe("(900) 123");
    expect(formatRussianPhoneMask("90012345")).toBe("(900) 123-45");
    expect(formatRussianPhoneMask("9001234567")).toBe("(900) 123-45-67");
  });

  it("ignores non-digits and extra digits", () => {
    expect(formatRussianPhoneMask("(900) 123-45-67")).toBe("(900) 123-45-67");
    expect(formatRussianPhoneMask("900123456789")).toBe("(900) 123-45-67");
  });
});
