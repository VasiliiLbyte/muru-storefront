import { describe, expect, it } from "vitest";

import {
  appendSearchToPath,
  productCategorySlugs,
  productHref,
  productPathMatches,
} from "@/lib/catalog/urls";
import type { Category, Product } from "@/lib/schemas";

function stubProduct(overrides: Partial<Product> & Pick<Product, "slug">): Product {
  return {
    id: "MU0000",
    sku: "MU0000",
    title: "Stub",
    price: 1000,
    currency: "RUB",
    images: [],
    attributes: {},
    categorySlugs: [],
    inStock: true,
    isOnSale: false,
    giftGuide: false,
    newArrival: false,
    unit: "pcs",
    seo: { title: "Stub", description: "Stub" },
    seoH1: "Stub",
    seoTitleCustom: false,
    ...overrides,
  };
}

const GIFT_TREE: Category[] = [
  {
    id: "podarochnye-karty",
    slug: "podarochnye-karty",
    title: "Подарочные карты",
    sortOrder: 0,
    seo: { title: "Подарочные карты", description: "x" },
    seoH1: "Подарочные карты",
    seoTitleCustom: false,
  },
  {
    id: "kompleksnye-nabory",
    slug: "kompleksnye-nabory",
    title: "Наборы",
    sortOrder: 1,
    seo: { title: "Наборы", description: "x" },
    seoH1: "Наборы",
    seoTitleCustom: false,
  },
  {
    id: "korporativnye-podarki",
    slug: "korporativnye-podarki",
    title: "Корп",
    parentSlug: "kompleksnye-nabory",
    sortOrder: 0,
    seo: { title: "Корп", description: "x" },
    seoH1: "Корп",
    seoTitleCustom: false,
  },
];

describe("productHref sale orphan fallback", () => {
  it("maps empty categorySlugs + isOnSale to rasprodazha/rasprodazha", () => {
    const product = stubProduct({
      slug: "keramicheskaya-vaza",
      isOnSale: true,
      categorySlugs: [],
    });
    expect(productHref(product)).toBe(
      "/catalog/rasprodazha/rasprodazha/keramicheskaya-vaza/",
    );
  });

  it("productPathMatches accepts the sale fallback path", () => {
    const product = stubProduct({
      slug: "keramicheskaya-vaza",
      isOnSale: true,
      categorySlugs: [],
    });
    expect(
      productPathMatches(product, [
        "rasprodazha",
        "rasprodazha",
        "keramicheskaya-vaza",
      ]),
    ).toBe(true);
  });

  it("keeps normal category path (MU0270-style)", () => {
    const product = stubProduct({
      slug: "polotence-lnyanoe",
      isOnSale: true,
      categorySlugs: ["tekstil", "vannaya-komnata"],
    });
    expect(productHref(product)).toBe(
      "/catalog/tekstil/vannaya-komnata/polotence-lnyanoe/",
    );
    expect(
      productPathMatches(product, [
        "tekstil",
        "vannaya-komnata",
        "polotence-lnyanoe",
      ]),
    ).toBe(true);
  });

  it("never emits empty path segments (///)", () => {
    const orphanSale = stubProduct({
      slug: "keramicheskaya-vaza",
      isOnSale: true,
      categorySlugs: [],
    });
    const orphanNotSale = stubProduct({
      slug: "orphan-plain",
      isOnSale: false,
      categorySlugs: [],
    });
    for (const p of [orphanSale, orphanNotSale]) {
      const href = productHref(p);
      expect(href).not.toContain("///");
      expect(href.split("/").filter((s) => s === "").length).toBeLessThanOrEqual(
        2,
      ); // leading + trailing only
    }
  });
});

describe("productCategorySlugs tree-valid pair (SEO-018)", () => {
  it("uses flat top===top when [1] is a cross hub not under [0]", () => {
    const product = stubProduct({
      slug: "podarochnyy-sertifikat-5000",
      categorySlugs: [
        "podarochnye-karty",
        "kompleksnye-nabory",
        "korporativnye-podarki",
      ],
    });
    expect(productCategorySlugs(product, GIFT_TREE)).toEqual({
      top: "podarochnye-karty",
      leaf: "podarochnye-karty",
    });
    expect(productHref(product, GIFT_TREE)).toBe(
      "/catalog/podarochnye-karty/podarochnye-karty/podarochnyy-sertifikat-5000/",
    );
  });

  it("keeps a valid child pair when present", () => {
    const categories: Category[] = [
      ...GIFT_TREE,
      {
        id: "tekstil",
        slug: "tekstil",
        title: "Текстиль",
        sortOrder: 2,
        seo: { title: "t", description: "t" },
        seoH1: "t",
        seoTitleCustom: false,
      },
      {
        id: "vannaya-komnata",
        slug: "vannaya-komnata",
        title: "Ванная",
        parentSlug: "tekstil",
        sortOrder: 0,
        seo: { title: "t", description: "t" },
        seoH1: "t",
        seoTitleCustom: false,
      },
    ];
    const product = stubProduct({
      slug: "polotence",
      categorySlugs: ["tekstil", "vannaya-komnata"],
    });
    expect(productCategorySlugs(product, categories)).toEqual({
      top: "tekstil",
      leaf: "vannaya-komnata",
    });
  });
});

describe("appendSearchToPath", () => {
  it("preserves query string for mismatch redirects", () => {
    expect(
      appendSearchToPath("/catalog/a/b/c/", { sort: "new", page: "2" }),
    ).toBe("/catalog/a/b/c/?sort=new&page=2");
  });

  it("returns path unchanged without searchParams", () => {
    expect(appendSearchToPath("/catalog/a/b/c/")).toBe("/catalog/a/b/c/");
  });
});
