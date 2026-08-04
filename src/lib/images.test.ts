import { describe, expect, it } from "vitest";

import { ASSETS_BASE } from "@/lib/assets-base";
import { resolveCatalogImageUrl } from "@/lib/images";

describe("resolveCatalogImageUrl", () => {
  it("preserves CRM cache-bust v= on Drive → /img proxy rewrite", () => {
    const input =
      "https://drive.google.com/thumbnail?id=abc123&sz=w1600&v=1723000000000";
    expect(resolveCatalogImageUrl(input)).toBe(
      `${ASSETS_BASE}/img/abc123/600.webp?v=1723000000000`,
    );
  });

  it("does not append query when Drive URL has no v=", () => {
    const input = "https://drive.google.com/thumbnail?id=abc123&sz=w1600";
    expect(resolveCatalogImageUrl(input)).toBe(
      `${ASSETS_BASE}/img/abc123/600.webp`,
    );
  });

  it("keeps existing query on /img/ relative paths", () => {
    expect(resolveCatalogImageUrl("/img/abc123/600.webp?v=1723000000000")).toBe(
      `${ASSETS_BASE}/img/abc123/600.webp?v=1723000000000`,
    );
  });

  it("keeps existing query on /uploads/ paths", () => {
    expect(resolveCatalogImageUrl("/uploads/covers/x.webp?v=99")).toBe(
      `${ASSETS_BASE}/uploads/covers/x.webp?v=99`,
    );
  });
});
