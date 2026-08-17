import { describe, expect, it } from "vitest";

import {
  formatRussianPhoneForDisplay,
  normalizeRussianPhoneForApi,
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
