import { describe, expect, it } from "vitest";

import {
  adaptProduct,
  adaptTree,
  buildCategorySlugMaps,
  type BackendProduct,
  type BackendTreeNode,
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

  it("adds parent top for secondary membership leaf under a different hub", () => {
    const maps = buildCategorySlugMaps([
      {
        name: "Натуральный декор",
        slug: "naturalnyy-dekor",
        children: [
          {
            name: "Корзины и плетёные изделия",
            slug: "korziny-i-pletenye-izdeliya",
            children: [],
          },
        ],
      },
      {
        name: "Кухня и столовая",
        slug: "kukhnya-i-stolovaya",
        children: [
          {
            name: "Хранение и порядок",
            slug: "khranenie-i-poryadok",
            children: [],
          },
        ],
      },
    ]);

    const product = adaptProduct(
      stubBackendProduct({
        category: "Натуральный декор",
        webPrimarySubcategory: {
          name: "Корзины и плетёные изделия",
          slug: "korziny-i-pletenye-izdeliya",
        },
        webSubcategorySlugs: [
          "korziny-i-pletenye-izdeliya",
          "khranenie-i-poryadok",
        ],
      }),
      maps,
    );

    expect(product.categorySlugs).toContain("khranenie-i-poryadok");
    expect(product.categorySlugs).toContain("kukhnya-i-stolovaya");
    expect(product.categorySlugs).toContain("naturalnyy-dekor");
  });
});

describe("adaptProduct SEO", () => {
  it("falls back to name and description when SEO fields are empty", () => {
    const product = adaptProduct(
      stubBackendProduct({
        name: "Ваза",
        description: "Описание вазы",
      }),
    );

    expect(product.seo.title).toBe("Ваза");
    expect(product.seo.description).toBe("Описание вазы");
    expect(product.seoH1).toBe("Ваза");
    expect(product.seoTitleCustom).toBe(false);
  });

  it("uses partial SEO overrides from backend", () => {
    const product = adaptProduct(
      stubBackendProduct({
        name: "Ваза",
        seoTitle: "SEO title",
        seoH1: "SEO H1",
      }),
    );

    expect(product.seo.title).toBe("SEO title");
    expect(product.seo.description).toBe("Ваза");
    expect(product.seoH1).toBe("SEO H1");
    expect(product.seoTitleCustom).toBe(true);
  });

  it("treats whitespace-only seoTitle as non-custom", () => {
    const product = adaptProduct(
      stubBackendProduct({
        name: "Ваза",
        seoTitle: "   ",
      }),
    );

    expect(product.seo.title).toBe("Ваза");
    expect(product.seoTitleCustom).toBe(false);
  });
});

describe("adaptTree SEO", () => {
  it("passes through category SEO fields with fallbacks", () => {
    const nodes: BackendTreeNode[] = [
      {
        name: "Декор",
        slug: "dekor",
        children: [
          {
            name: "Подсвечники",
            slug: "podsvechniki",
            children: [],
            seoTitle: "SEO title",
            seoDescription: "SEO description",
            seoH1: "SEO H1",
            seoIntroTop: "Intro top",
            seoTextBottom: "<p>Bottom</p>",
          },
        ],
      },
    ];

    const categories = adaptTree(nodes);
    const sub = categories.find((c) => c.slug === "podsvechniki");

    expect(sub?.seo.title).toBe("SEO title");
    expect(sub?.seo.description).toBe("SEO description");
    expect(sub?.seoH1).toBe("SEO H1");
    expect(sub?.seoIntroTop).toBe("Intro top");
    expect(sub?.seoTextBottom).toBe("<p>Bottom</p>");
    expect(sub?.seoTitleCustom).toBe(true);
  });

  it("sets seoTitleCustom false when seoTitle is missing", () => {
    const nodes: BackendTreeNode[] = [
      {
        name: "Декор",
        slug: "dekor",
        children: [],
      },
    ];

    const categories = adaptTree(nodes);
    expect(categories[0]?.seoTitleCustom).toBe(false);
  });
});
