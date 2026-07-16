import { describe, expect, it } from "vitest";

import {
  mapImgProxyWidth,
  resolveImgProxyUrl,
} from "./image-loader";

describe("mapImgProxyWidth", () => {
  it("maps to nearest preset >= requested width", () => {
    expect(mapImgProxyWidth(100)).toBe(320);
    expect(mapImgProxyWidth(600)).toBe(600);
    expect(mapImgProxyWidth(601)).toBe(1200);
    expect(mapImgProxyWidth(3840)).toBe(1200);
  });
});

describe("resolveImgProxyUrl", () => {
  it("rewrites /img proxy URLs to webp presets", () => {
    expect(
      resolveImgProxyUrl("https://murushop.ru/img/abc123/600.webp", 600),
    ).toBe("https://murushop.ru/img/abc123/600.webp");
    expect(
      resolveImgProxyUrl("https://murushop.ru/img/abc123/600.webp", 3840),
    ).toBe("https://murushop.ru/img/abc123/1200.webp");
    expect(resolveImgProxyUrl("/img/abc123/600.jpeg", 100)).toBe(
      "/img/abc123/320.webp",
    );
  });

  it("passes through non-proxy URLs", () => {
    expect(resolveImgProxyUrl("/uploads/x.webp", 1200)).toBe("/uploads/x.webp");
    expect(resolveImgProxyUrl("/brand/logo.svg", 1200)).toBe(
      "/brand/logo.svg",
    );
  });
});
