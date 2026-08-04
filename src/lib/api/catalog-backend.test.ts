import { describe, expect, it } from "vitest";

import {
  adaptProduct,
  buildCategorySlugMaps,
  type BackendProduct,
} from "./catalog-backend";

function stubBackendProduct(
  overrides: Partial<BackendProduct> = {},
): BackendProduct {
  return {
    sku: "MU0001",
    slug: "mu0001",
    name: "Stub product",
    price: 1000,
    discountPercent: 0,
    inStock: 1,
    imageUrls: [],
    category: "Декор",
    ...overrides,
  };
}

describe("adaptProduct webSubcategorySlugs", () => {
  it("merges junction membership slugs when primary leaf is missing", () => {
    const maps = buildCategorySlugMaps([
      {
        name: "Декор",
        slug: "dekor",
        children: [{ name: "Подсвечники", slug: "podsvechniki", children: [] }],
      },
    ]);

    const product = adaptProduct(
      stubBackendProduct({
        subcategorySlug: undefined,
        webPrimarySubcategory: undefined,
        webSubcategorySlugs: ["podsvechniki"],
      }),
      maps,
    );

    expect(product.categorySlugs).toContain("podsvechniki");
    expect(product.categorySlugs).toContain("dekor");
  });

  it("dedupes primary leaf that also appears in webSubcategorySlugs", () => {
    const maps = buildCategorySlugMaps([
      {
        name: "Декор",
        slug: "dekor",
        children: [{ name: "Подсвечники", slug: "podsvechniki", children: [] }],
      },
    ]);

    const product = adaptProduct(
      stubBackendProduct({
        webPrimarySubcategory: { name: "Подсвечники", slug: "podsvechniki" },
        webSubcategorySlugs: ["podsvechniki", "vazy"],
      }),
      maps,
    );

    expect(product.categorySlugs.filter((s) => s === "podsvechniki")).toHaveLength(
      1,
    );
    expect(product.categorySlugs).toContain("vazy");
  });
});
