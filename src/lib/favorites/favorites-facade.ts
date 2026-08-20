"use client";

import type { AccountFavorite } from "@/lib/schemas/account";
import { useCustomerSessionStatus } from "@/stores/customer-session-store";
import { useAccountFavoritesStore } from "@/stores/account-favorites-store";
import { useFavoritesStore } from "@/stores/favorites-store";

function useIsAuthenticated(): boolean {
  return useCustomerSessionStatus() === "authenticated";
}

/** Whether SKU is in favorites (server when auth, local otherwise). */
export function useIsFavorite(sku: string): boolean {
  const auth = useIsAuthenticated();
  const localHas = useFavoritesStore((s) => s.skus.includes(sku));
  const serverHas = useAccountFavoritesStore((s) =>
    s.items.some((item) => item.sku === sku),
  );
  return auth ? serverHas : localHas;
}

/** Toggle favorite for current session mode. */
export function useToggleFavorite(): (sku: string) => void {
  const auth = useIsAuthenticated();
  const localToggle = useFavoritesStore((s) => s.toggle);
  const serverToggle = useAccountFavoritesStore((s) => s.toggle);

  if (auth) {
    return (sku: string) => {
      void serverToggle(sku);
    };
  }
  return localToggle;
}

/** Remove from favorites for current session mode. */
export function useRemoveFavorite(): (sku: string) => void {
  const auth = useIsAuthenticated();
  const localRemove = useFavoritesStore((s) => s.remove);
  const serverRemove = useAccountFavoritesStore((s) => s.remove);

  if (auth) {
    return (sku: string) => {
      void serverRemove(sku);
    };
  }
  return localRemove;
}

/** Favorite SKUs in add order. */
export function useFavoriteSkus(): string[] {
  const auth = useIsAuthenticated();
  const localSkus = useFavoritesStore((s) => s.skus);
  const serverSkus = useAccountFavoritesStore((s) =>
    s.items.map((item) => item.sku),
  );
  return auth ? serverSkus : localSkus;
}

/** Badge count. */
export function useFavoriteCount(): number {
  const auth = useIsAuthenticated();
  const localCount = useFavoritesStore((s) => s.skus.length);
  const serverCount = useAccountFavoritesStore((s) => s.items.length);
  return auth ? serverCount : localCount;
}

/**
 * Server favorite items (auth only). Empty for guest/unknown —
 * guest pages should use SKUs + catalog hydrate.
 */
export function useFavoriteItems(): AccountFavorite[] {
  const auth = useIsAuthenticated();
  const items = useAccountFavoritesStore((s) => s.items);
  return auth ? items : [];
}

/** Auth store hydration flag (false for guest). */
export function useFavoritesHydrated(): boolean {
  const auth = useIsAuthenticated();
  const hydrated = useAccountFavoritesStore((s) => s.hydrated);
  const loading = useAccountFavoritesStore((s) => s.loading);
  if (!auth) return true;
  return hydrated && !loading;
}
