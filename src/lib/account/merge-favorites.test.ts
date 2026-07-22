import { describe, expect, it, vi } from "vitest";

import { mergeLocalFavoritesToAccount } from "./merge-favorites";

describe("mergeLocalFavoritesToAccount", () => {
  it("no-ops on empty local list", async () => {
    const postFavorite = vi.fn();
    const clearLocal = vi.fn();
    await mergeLocalFavoritesToAccount({
      getLocalSkus: () => [],
      postFavorite,
      clearLocal,
    });
    expect(postFavorite).not.toHaveBeenCalled();
    expect(clearLocal).not.toHaveBeenCalled();
  });

  it("posts each unique SKU then clears local", async () => {
    const postFavorite = vi.fn(async () => ({}));
    const clearLocal = vi.fn();
    await mergeLocalFavoritesToAccount({
      getLocalSkus: () => ["A", "B", "A"],
      postFavorite,
      clearLocal,
    });
    expect(postFavorite).toHaveBeenCalledTimes(2);
    expect(postFavorite).toHaveBeenNthCalledWith(1, "A");
    expect(postFavorite).toHaveBeenNthCalledWith(2, "B");
    expect(clearLocal).toHaveBeenCalledOnce();
  });

  it("continues on per-SKU failure and still clears local", async () => {
    const postFavorite = vi.fn(async (sku: string) => {
      if (sku === "bad") throw new Error("fail");
      return {};
    });
    const clearLocal = vi.fn();
    const warn = vi.fn();
    await mergeLocalFavoritesToAccount({
      getLocalSkus: () => ["ok", "bad", "ok2"],
      postFavorite,
      clearLocal,
      warn,
    });
    expect(postFavorite).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenCalled();
    expect(clearLocal).toHaveBeenCalledOnce();
  });
});
