import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/account/account-fetch", () => ({
  accountFetchJson: vi.fn(),
}));

import { accountFetchJson } from "@/lib/account/account-fetch";
import { useAccountFavoritesStore } from "./account-favorites-store";

const mockedFetch = vi.mocked(accountFetchJson);

describe("useAccountFavoritesStore", () => {
  beforeEach(() => {
    useAccountFavoritesStore.getState().reset();
    mockedFetch.mockReset();
  });

  it("hydrate loads items from GET favorites", async () => {
    mockedFetch.mockResolvedValueOnce([
      { sku: "A", name: "Item A", price: 100 },
      { sku: "B", name: "Item B", price: 200 },
    ]);

    await useAccountFavoritesStore.getState().hydrate();

    const state = useAccountFavoritesStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.items.map((i) => i.sku)).toEqual(["A", "B"]);
    expect(mockedFetch).toHaveBeenCalledWith("favorites");
  });

  it("hydrate skips when already hydrated unless force", async () => {
    mockedFetch.mockResolvedValueOnce([{ sku: "A", name: "A", price: 1 }]);
    await useAccountFavoritesStore.getState().hydrate();
    mockedFetch.mockClear();

    await useAccountFavoritesStore.getState().hydrate();
    expect(mockedFetch).not.toHaveBeenCalled();

    mockedFetch.mockResolvedValueOnce([{ sku: "Z", name: "Z", price: 9 }]);
    await useAccountFavoritesStore.getState().hydrate({ force: true });
    expect(useAccountFavoritesStore.getState().items[0]?.sku).toBe("Z");
  });

  it("toggle optimistically adds then POSTs", async () => {
    mockedFetch.mockResolvedValueOnce(undefined);
    const promise = useAccountFavoritesStore.getState().toggle("SKU1");
    expect(useAccountFavoritesStore.getState().hasSku("SKU1")).toBe(true);
    await promise;
    expect(mockedFetch).toHaveBeenCalledWith("favorites", {
      method: "POST",
      body: JSON.stringify({ sku: "SKU1" }),
    });
    expect(useAccountFavoritesStore.getState().pending).toEqual({});
  });

  it("toggle rolls back on POST failure", async () => {
    mockedFetch.mockRejectedValueOnce(new Error("network"));
    await expect(
      useAccountFavoritesStore.getState().toggle("SKU1"),
    ).rejects.toThrow("network");
    expect(useAccountFavoritesStore.getState().hasSku("SKU1")).toBe(false);
    expect(useAccountFavoritesStore.getState().pending).toEqual({});
  });

  it("toggle optimistically removes then DELETEs", async () => {
    useAccountFavoritesStore.setState({
      items: [{ sku: "SKU1", name: "One", price: 10 }],
      hydrated: true,
    });
    mockedFetch.mockResolvedValueOnce(undefined);

    const promise = useAccountFavoritesStore.getState().toggle("SKU1");
    expect(useAccountFavoritesStore.getState().hasSku("SKU1")).toBe(false);
    await promise;
    expect(mockedFetch).toHaveBeenCalledWith("favorites", {
      method: "DELETE",
      body: JSON.stringify({ sku: "SKU1" }),
    });
  });

  it("hydrate preserves pending optimistic add overlay", async () => {
    mockedFetch.mockImplementation(async (path, init) => {
      if (init?.method === "POST") {
        await new Promise((r) => setTimeout(r, 30));
        return undefined;
      }
      return [{ sku: "EXISTING", name: "E", price: 1 }];
    });

    const togglePromise = useAccountFavoritesStore.getState().toggle("NEW");
    expect(useAccountFavoritesStore.getState().hasSku("NEW")).toBe(true);

    await useAccountFavoritesStore.getState().hydrate({ force: true });
    expect(useAccountFavoritesStore.getState().hasSku("NEW")).toBe(true);
    expect(useAccountFavoritesStore.getState().hasSku("EXISTING")).toBe(true);

    await togglePromise;
  });

  it("reset clears state", () => {
    useAccountFavoritesStore.setState({
      items: [{ sku: "A", name: "A", price: 1 }],
      hydrated: true,
      loading: false,
      error: "x",
      pending: { A: "add" },
    });
    useAccountFavoritesStore.getState().reset();
    const state = useAccountFavoritesStore.getState();
    expect(state.items).toEqual([]);
    expect(state.hydrated).toBe(false);
    expect(state.error).toBeNull();
    expect(state.pending).toEqual({});
  });

  it("stale hydrate does not overwrite later force hydrate", async () => {
    let resolveFirst!: (value: unknown) => void;
    const firstDeferred = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    let call = 0;
    mockedFetch.mockImplementation(() => {
      call += 1;
      if (call === 1) return firstDeferred as Promise<unknown>;
      return Promise.resolve([
        { sku: "A", name: "A", price: 1 },
        { sku: "B", name: "B", price: 2 },
        { sku: "C", name: "C", price: 3 },
      ]);
    });

    const first = useAccountFavoritesStore.getState().hydrate();
    const second = useAccountFavoritesStore.getState().hydrate({ force: true });

    await second;
    expect(useAccountFavoritesStore.getState().items.map((i) => i.sku)).toEqual(
      ["A", "B", "C"],
    );

    resolveFirst([{ sku: "A", name: "A", price: 1 }]);
    await first;

    expect(useAccountFavoritesStore.getState().items.map((i) => i.sku)).toEqual(
      ["A", "B", "C"],
    );
  });
});
