import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FavoritesState = {
  skus: string[];
  toggle: (sku: string) => void;
  remove: (sku: string) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      skus: [],
      toggle: (sku) => {
        const has = get().skus.includes(sku);
        if (has) {
          set({ skus: get().skus.filter((s) => s !== sku) });
          return;
        }
        set({ skus: [...get().skus, sku] });
      },
      remove: (sku) => {
        set({ skus: get().skus.filter((s) => s !== sku) });
      },
    }),
    {
      name: "muru-favorites",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ skus: state.skus }),
    },
  ),
);

/** Все избранные SKU (в порядке добавления). */
export function useFavoriteSkus(): string[] {
  return useFavoritesStore((s) => s.skus);
}

/** Является ли SKU избранным. */
export function useIsFavorite(sku: string): boolean {
  return useFavoritesStore((s) => s.skus.includes(sku));
}

/** Количество избранных позиций (для badge в шапке). */
export function useFavoriteCount(): number {
  return useFavoritesStore((s) => s.skus.length);
}

