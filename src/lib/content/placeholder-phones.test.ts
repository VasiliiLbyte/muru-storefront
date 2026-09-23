import { describe, expect, it } from "vitest";

import {
  isPlaceholderPhone,
  scrubPlaceholderPhones,
} from "./placeholder-phones";

describe("placeholder phones", () => {
  it("detects known fake 8(800) numbers", () => {
    expect(isPlaceholderPhone("8 (800) 200 00 20")).toBe(true);
    expect(isPlaceholderPhone("8 (800) 000-00-00")).toBe(true);
    expect(isPlaceholderPhone("+7 (812) 000-00-00")).toBe(true);
    expect(isPlaceholderPhone("+7 (981) 292-09-00")).toBe(false);
  });

  it("scrubs placeholders from HTML body", () => {
    const html =
      'звонить по номеру 8 (800) 000-00-00 или 8 (800) 200 00 20';
    expect(scrubPlaceholderPhones(html, "+7 (981) 292-09-00")).toBe(
      "звонить по номеру +7 (981) 292-09-00 или +7 (981) 292-09-00",
    );
  });
});
