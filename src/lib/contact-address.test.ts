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
  it("splits fallback into index / city / street / building", () => {
    expect(splitContactAddress(FALLBACK_RAW)).toEqual([
      "192102,",
      "г. Санкт-Петербург,",
      "ул. Дубровская д. 13,",
      "литера А, пом. 27",
    ]);
  });

  it("normalizes CMS strings without spaces before split", () => {
    expect(splitContactAddress(FALLBACK_NORMALIZED)).toEqual([
      "192102,",
      "г. Санкт-Петербург,",
      "ул. Дубровская д. 13,",
      "литера А, пом. 27",
    ]);
  });

  it("keeps street on one line when there is no building part", () => {
    expect(
      splitContactAddress("192102, г. Санкт-Петербург, ул. Дубровская д. 13"),
    ).toEqual(["192102,", "г. Санкт-Петербург,", "ул. Дубровская д. 13"]);
  });

  it("returns single line when there is nothing to split", () => {
    expect(splitContactAddress("г. Санкт-Петербург")).toEqual([
      "г. Санкт-Петербург",
    ]);
  });

  it("glues unknown parts to the previous line", () => {
    expect(
      splitContactAddress("г. Москва, Пресненская наб. 12, башня Федерация"),
    ).toEqual(["г. Москва,", "Пресненская наб. 12, башня Федерация"]);
  });
});
