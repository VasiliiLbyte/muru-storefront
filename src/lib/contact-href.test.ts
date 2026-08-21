import { describe, expect, it } from "vitest";

import { normalizeMailtoHref, normalizeTelHref } from "./contact-href";

describe("normalizeTelHref", () => {
  it("prefixes bare phone with tel:", () => {
    expect(normalizeTelHref("+79812920900")).toBe("tel:+79812920900");
    expect(normalizeTelHref("+7 (981) 292-09-00")).toBe("tel:+79812920900");
  });

  it("leaves tel:/http/mailto unchanged", () => {
    expect(normalizeTelHref("tel:+79812920900")).toBe("tel:+79812920900");
    expect(normalizeTelHref("https://example.com")).toBe("https://example.com");
    expect(normalizeTelHref("mailto:a@b.c")).toBe("mailto:a@b.c");
  });

  it("returns empty for blank input", () => {
    expect(normalizeTelHref("")).toBe("");
    expect(normalizeTelHref("   ")).toBe("");
  });
});

describe("normalizeMailtoHref", () => {
  it("prefixes bare email with mailto:", () => {
    expect(normalizeMailtoHref("hello@muru.ru")).toBe("mailto:hello@muru.ru");
  });

  it("leaves mailto:/http/tel unchanged", () => {
    expect(normalizeMailtoHref("mailto:hello@muru.ru")).toBe(
      "mailto:hello@muru.ru",
    );
    expect(normalizeMailtoHref("https://example.com")).toBe(
      "https://example.com",
    );
    expect(normalizeMailtoHref("tel:+1")).toBe("tel:+1");
  });

  it("returns empty for blank input", () => {
    expect(normalizeMailtoHref("")).toBe("");
  });
});
