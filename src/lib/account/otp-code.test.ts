import { describe, expect, it } from "vitest";

import { distributeOtpPaste, extractOtpDigits } from "./otp-code";

describe("extractOtpDigits", () => {
  it("keeps only digits up to the requested length", () => {
    expect(extractOtpDigits("1234")).toBe("1234");
    expect(extractOtpDigits("12 34")).toBe("1234");
    expect(extractOtpDigits("Ваш код 1234, никому не сообщайте")).toBe("1234");
    expect(extractOtpDigits("123456")).toBe("1234");
    expect(extractOtpDigits("abc")).toBe("");
  });
});

describe("distributeOtpPaste", () => {
  const empty = ["", "", "", ""];

  it("fills all cells from the start for a full code", () => {
    expect(distributeOtpPaste(["9", "", "", ""], "1234", 2)).toEqual({
      cells: ["1", "2", "3", "4"],
      focusIndex: 3,
    });
  });

  it("fills from the focused cell for a partial paste", () => {
    expect(distributeOtpPaste(empty, "56", 1)).toEqual({
      cells: ["", "5", "6", ""],
      focusIndex: 3,
    });
  });

  it("clamps a partial paste that overflows the last cell", () => {
    expect(distributeOtpPaste(empty, "567", 2)).toEqual({
      cells: ["", "", "5", "6"],
      focusIndex: 3,
    });
  });

  it("leaves cells untouched when there are no digits", () => {
    expect(distributeOtpPaste(empty, "код", 0)).toEqual({
      cells: empty,
      focusIndex: 0,
    });
  });
});
