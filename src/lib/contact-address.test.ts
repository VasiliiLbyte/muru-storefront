import { describe, expect, it } from "vitest";

import {
  normalizeContactAddress,
  splitContactAddress,
} from "./contact-address";

const FALLBACK_RAW =
  "192102, г. Санкт-Петербург, ул. Дубровская д.13, литера А, пом.27";

const FALLBACK_NORMALIZED =
  "192102, г. Санкт-Петербург, ул. Дубровская д. 13, литера А, пом. 27";

describe("normalizeContactAddress", () => {
  it("adds spaces after д. and пом.", () => {
    expect(normalizeContactAddress(FALLBACK_RAW)).toBe(FALLBACK_NORMALIZED);
  });

  it("is idempotent", () => {
    expect(normalizeContactAddress(FALLBACK_NORMALIZED)).toBe(
      FALLBACK_NORMALIZED,
    );
  });

  it("handles already normalized CMS strings", () => {
    expect(normalizeContactAddress(FALLBACK_NORMALIZED)).toBe(
      FALLBACK_NORMALIZED,
    );
  });
});

describe("splitContactAddress", () => {
  it("splits fallback into city line and street line", () => {
    expect(splitContactAddress(FALLBACK_RAW)).toEqual({
      line1: "192102, г. Санкт-Петербург,",
      line2: "ул. Дубровская д. 13, литера А, пом. 27",
    });
  });

  it("normalizes CMS strings without spaces before split", () => {
    expect(splitContactAddress(FALLBACK_RAW)).toEqual({
      line1: "192102, г. Санкт-Петербург,",
      line2: "ул. Дубровская д. 13, литера А, пом. 27",
    });
  });

  it("returns single line when no street marker", () => {
    expect(splitContactAddress("192102, г. Санкт-Петербург")).toEqual({
      line1: "192102, г. Санкт-Петербург",
      line2: "",
    });
  });
});
