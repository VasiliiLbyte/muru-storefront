import { describe, expect, it } from "vitest";

import { resolveProductJsonLdDescription, productJsonLd } from "./jsonld";
import type { Product } from "@/lib/schemas";

function stubProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "SKU",
    sku: "SKU",
    slug: "vaza",
    title: "Ваза",
    price: 1000,
    inStock: true,
    currency: "RUB",
    unit: "pcs",
    images: [{ url: "/img.webp", alt: "Ваза" }],
    categorySlugs: ["vazy-i-aksessuary"],
    seo: { title: "Ваза", description: "Ваза" },
    ...overrides,
  } as Product;
}

describe("resolveProductJsonLdDescription", () => {
  it("does not keep empty string over later candidates", () => {
    const product = stubProduct({
      description: "",
      shortDescription: "Короткая ваза из стекла",
      seo: { title: "Ваза", description: "Ваза" },
    });
    expect(resolveProductJsonLdDescription(product)).toBe(
      "Короткая ваза из стекла",
    );
  });

  it("skips seo.description when it is only the title", () => {
    const product = stubProduct({
      description: "   ",
      seo: { title: "Ваза", description: "Ваза" },
      attributes: { material: "Стекло" },
    });
    expect(resolveProductJsonLdDescription(product)).toBe("Материал: Стекло");
  });

  it("emits non-empty description in JSON-LD when material exists", () => {
    const ld = productJsonLd(
      stubProduct({
        description: "",
        attributes: { material: "Хлопок, лён" },
      }),
    );
    expect(ld.description).toBe("Материал: Хлопок, лён");
  });
});
