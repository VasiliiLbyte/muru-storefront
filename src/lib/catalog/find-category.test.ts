import { describe, expect, it } from "vitest";

import type { Category } from "@/lib/schemas";

import { findCategory } from "./find-category";

const categories: Category[] = [
  {
    id: "dekor",
    slug: "dekor",
    title: "Декор",
    sortOrder: 0,
    seo: { title: "Декор", description: "Декор" },
    seoH1: "Декор",
    seoTitleCustom: false,
  },
  {
    id: "podsvechniki",
    slug: "podsvechniki",
    title: "Подсвечники",
    parentSlug: "dekor",
    sortOrder: 0,
    seo: { title: "Подсвечники", description: "Подсвечники" },
    seoH1: "Подсвечники",
    seoTitleCustom: false,
  },
  {
    id: "podsvechniki",
    slug: "podsvechniki",
    title: "Подсвечники кухня",
    parentSlug: "kukhnya",
    sortOrder: 0,
    seo: { title: "Подсвечники кухня", description: "Подсвечники кухня" },
    seoH1: "Подсвечники кухня",
    seoTitleCustom: false,
  },
];

describe("findCategory", () => {
  it("finds top-level category by slug", () => {
    expect(findCategory(categories, "dekor")?.title).toBe("Декор");
  });

  it("finds subcategory when parentSlug matches", () => {
    expect(
      findCategory(categories, "podsvechniki", "dekor")?.title,
    ).toBe("Подсвечники");
  });

  it("returns undefined for wrong parentSlug", () => {
    expect(findCategory(categories, "podsvechniki", "dekor-wrong")).toBeUndefined();
  });

  it("does not match subcategory slug without parentSlug", () => {
    expect(findCategory(categories, "podsvechniki")).toBeUndefined();
  });
});
