"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem } from "@/lib/schemas";

type CartState = {
  items: CartItem[];
  addItem: (sku: string, qty?: number) => void;
  removeItem: (sku: string) => void;
  updateQty: (sku: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (sku, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.sku === sku);
        if (existing) {
          set({
            items: items.map((i) =>
              i.sku === sku ? { ...i, qty: i.qty + qty } : i,
            ),
          });
        } else {
          set({ items: [...items, { sku, qty }] });
        }
      },
      removeItem: (sku) => {
        set({ items: get().items.filter((i) => i.sku !== sku) });
      },
      updateQty: (sku, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.sku !== sku) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.sku === sku ? { ...i, qty } : i,
          ),
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "muru-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Суммарное количество единиц в корзине (для badge в header). */
export function useCartCount(): number {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
}

/** Число уникальных позиций (SKU) в корзине. */
export function useCartLineCount(): number {
  return useCartStore((s) => s.items.length);
}

/** Позиции корзины. */
export function useCartItems(): CartItem[] {
  return useCartStore((s) => s.items);
}
