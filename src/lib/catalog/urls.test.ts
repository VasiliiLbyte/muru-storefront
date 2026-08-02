import { describe, expect, it } from "vitest";

import {
  productHref,
  productPathMatches,
} from "@/lib/catalog/urls";
import type { Product } from "@/lib/schemas";

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
    ...overrides,
  };
}

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
