import { describe, expect, it } from "vitest";

import { normalizeRedirectPath } from "@/lib/seo/normalize-redirect-path";
import {
  GONE_PATHS,
  REDIRECT_MAP,
  REDIRECT_MAP_STATS,
} from "@/lib/seo/redirect-map.generated";

describe("REDIRECT_MAP integrity", () => {
  it("has expected S0 group counts (±0 drops)", () => {
    expect(REDIRECT_MAP_STATS.a).toBe(184);
    expect(REDIRECT_MAP_STATS.b).toBe(3);
    expect(REDIRECT_MAP_STATS.c).toBe(290);
    expect(REDIRECT_MAP_STATS.total).toBe(477);
    expect(REDIRECT_MAP.size).toBe(477);
  });

  it("has no duplicate old keys (Map size === unique)", () => {
    expect(REDIRECT_MAP.size).toBe(REDIRECT_MAP_STATS.total);
  });

  it("old !== new for every entry", () => {
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
});

describe("normalizeRedirectPath", () => {
  it("adds trailing slash and lowercases latin", () => {
    expect(normalizeRedirectPath("/catalog/Vazy-i-Aksessuary")).toBe(
      "/catalog/vazy-i-aksessuary/",
    );
  });

  it("decodes percent-encoding and keeps Cyrillic NFC", () => {
    const encoded = "/catalog/%D0%B2%D0%B0%D0%B7%D1%8B-%D0%B8-%D0%B0%D0%BA%D1%81%D0%B5%D1%81%D1%81%D1%83%D0%B0%D1%80%D1%8B/";
    expect(normalizeRedirectPath(encoded)).toBe(
      "/catalog/вазы-и-аксессуары/",
    );
  });
});
