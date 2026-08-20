"use client";

import { useCallback } from "react";

import type { AccountFavorite } from "@/lib/schemas/account";
import { useCustomerSessionStatus } from "@/stores/customer-session-store";
import { useAccountFavoritesStore } from "@/stores/account-favorites-store";
import { useFavoritesStore } from "@/stores/favorites-store";

const EMPTY_ITEMS: AccountFavorite[] = [];

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

  return useCallback(
    (sku: string) => {
      if (auth) {
        void serverToggle(sku);
      } else {
        localToggle(sku);
      }
    },
    [auth, localToggle, serverToggle],
  );
}

/** Remove from favorites for current session mode. */
export function useRemoveFavorite(): (sku: string) => void {
  const auth = useIsAuthenticated();
  const localRemove = useFavoritesStore((s) => s.remove);
  const serverRemove = useAccountFavoritesStore((s) => s.remove);

  return useCallback(
    (sku: string) => {
      if (auth) {
        void serverRemove(sku);
      } else {
        localRemove(sku);
      }
    },
    [auth, localRemove, serverRemove],
  );
}

/** Favorite SKUs in add order. */
export function useFavoriteSkus(): string[] {
  const auth = useIsAuthenticated();
  const localSkus = useFavoritesStore((s) => s.skus);
  const items = useAccountFavoritesStore((s) => s.items);
  if (!auth) return localSkus;
  return items.map((item) => item.sku);
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
  return auth ? items : EMPTY_ITEMS;
}

/** Auth store hydration flag (false for guest). */
export function useFavoritesHydrated(): boolean {
  const auth = useIsAuthenticated();
  const hydrated = useAccountFavoritesStore((s) => s.hydrated);
  const loading = useAccountFavoritesStore((s) => s.loading);
  if (!auth) return true;
  return hydrated && !loading;
}
