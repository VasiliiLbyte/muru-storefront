import { describe, expect, it } from "vitest";

import { decideCatalogRedirect } from "@/lib/seo/decide-catalog-redirect";
import { normalizeRedirectPath } from "@/lib/seo/normalize-redirect-path";
import {
  GONE_PATHS,
  REDIRECT_MAP,
  REDIRECT_MAP_STATS,
} from "@/lib/seo/redirect-map.generated";

const PUBLIC_LATIN_CATEGORIES = [
  "floristika-dlya-doma",
  "interer",
  "kompleksnye-nabory",
  "kukhnya-i-stolovaya",
  "naturalnyy-dekor",
  "rasprodazha",
  "tekstil",
  "vazy-i-aksessuary",
] as const;

describe("REDIRECT_MAP integrity", () => {
  it("has expected S0 group counts (±0 drops; D2 +2 category keys)", () => {
    expect(REDIRECT_MAP_STATS.a).toBe(184);
    expect(REDIRECT_MAP_STATS.b).toBe(4);
    expect(REDIRECT_MAP_STATS.c).toBe(291);
    expect(REDIRECT_MAP_STATS.total).toBe(479);
    expect(REDIRECT_MAP.size).toBe(479);
  });

  it("has no duplicate old keys (Map size === unique)", () => {
    expect(REDIRECT_MAP.size).toBe(REDIRECT_MAP_STATS.total);
  });

  it("old !== new for every entry (self-redirect 0)", () => {
    for (const [oldPath, newPath] of REDIRECT_MAP) {
      expect(oldPath, oldPath).not.toBe(newPath);
    }
  });

  it("has no chains: no new_url is also an old_url key", () => {
    for (const [, newPath] of REDIRECT_MAP) {
      expect(
        REDIRECT_MAP.has(newPath),
        `chain: ${newPath} is both target and source`,
      ).toBe(false);
    }
  });

  it("GONE_PATHS does not overlap REDIRECT_MAP", () => {
    for (const gone of GONE_PATHS) {
      expect(REDIRECT_MAP.has(gone)).toBe(false);
    }
  });

  it("all map keys are idempotent under normalizeRedirectPath", () => {
    for (const [oldPath] of REDIRECT_MAP) {
      expect(normalizeRedirectPath(oldPath)).toBe(oldPath);
    }
  });

  it("9 muru.ru categories: 8 public not in map; podarochnye-karty → /catalog/", () => {
    for (const slug of PUBLIC_LATIN_CATEGORIES) {
      expect(
        REDIRECT_MAP.has(`/catalog/${slug}/`),
        `${slug} must remain canonical 200`,
      ).toBe(false);
    }
    expect(REDIRECT_MAP.get("/catalog/podarochnye-karty/")).toBe("/catalog/");
    expect(REDIRECT_MAP.get("/catalog/подарочные-карты/")).toBe("/catalog/");
  });
});

describe("normalizeRedirectPath", () => {
  it("adds trailing slash and lowercases latin", () => {
    expect(normalizeRedirectPath("/catalog/Vazy-i-Aksessuary")).toBe(
      "/catalog/vazy-i-aksessuary/",
    );
  });

  it("decodes percent-encoding and keeps Cyrillic NFC", () => {
    const encoded =
      "/catalog/%D0%B2%D0%B0%D0%B7%D1%8B-%D0%B8-%D0%B0%D0%BA%D1%81%D0%B5%D1%81%D1%81%D1%83%D0%B0%D1%80%D1%8B/";
    expect(normalizeRedirectPath(encoded)).toBe(
      "/catalog/вазы-и-аксессуары/",
    );
  });
});

describe("decideCatalogRedirect", () => {
  it("D3: Cyrillic without trailing slash → one hop to latin target", () => {
    expect(decideCatalogRedirect("/catalog/вазы-и-аксессуары")).toEqual({
      type: "redirect",
      location: "/catalog/vazy-i-aksessuary/",
      status: 301,
    });
  });

  it("D2/D3: gift-card Cyrillic category without slash → /catalog/", () => {
    expect(decideCatalogRedirect("/catalog/подарочные-карты")).toEqual({
      type: "redirect",
      location: "/catalog/",
      status: 301,
    });
  });

  it("D2: latin podarochnye-karty → /catalog/", () => {
    expect(decideCatalogRedirect("/catalog/podarochnye-karty/")).toEqual({
      type: "redirect",
      location: "/catalog/",
      status: 301,
    });
  });

  it("D4: uppercase latin category → lowercase canonical key", () => {
    expect(decideCatalogRedirect("/catalog/VAZY-I-AKSESSUARY/")).toEqual({
      type: "redirect",
      location: "/catalog/vazy-i-aksessuary/",
      status: 301,
    });
  });

  it("canonical latin with slash → next", () => {
    expect(decideCatalogRedirect("/catalog/vazy-i-aksessuary/")).toEqual({
      type: "next",
    });
  });
});
