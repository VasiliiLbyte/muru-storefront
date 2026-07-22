import { accountFetchJson } from "@/lib/account/account-fetch";
import { useFavoritesStore } from "@/stores/favorites-store";

export type MergeFavoritesDeps = {
  getLocalSkus?: () => string[];
  postFavorite?: (sku: string) => Promise<unknown>;
  clearLocal?: () => void;
  warn?: (message: string, err?: unknown) => void;
};

/**
 * Push local muru-favorites SKUs into account favorites via BFF, then clear local.
 * Never throws — per-SKU failures are logged and skipped.
 */
export async function mergeLocalFavoritesToAccount(
  deps: MergeFavoritesDeps = {},
): Promise<void> {
  const getLocalSkus =
    deps.getLocalSkus ?? (() => useFavoritesStore.getState().skus);
  const postFavorite =
    deps.postFavorite ??
    ((sku: string) =>
      accountFetchJson("favorites", {
        method: "POST",
        body: JSON.stringify({ sku }),
      }));
  const clearLocal =
    deps.clearLocal ?? (() => useFavoritesStore.getState().clear());
  const warn = deps.warn ?? console.warn.bind(console);

  const skus = [...new Set(getLocalSkus().filter(Boolean))];
  if (skus.length === 0) return;

  for (const sku of skus) {
    try {
      await postFavorite(sku);
    } catch (err) {
      warn(`[account] favorite merge failed for ${sku}`, err);
    }
  }

  clearLocal();
}
