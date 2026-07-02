"use client";

import { useMemo } from "react";

import { computeCartTotals } from "@/lib/cart/totals";
import type { Product } from "@/lib/schemas";
import { useCartItems } from "@/stores/cart-store";

/** Итоги корзины на основе загруженных товаров. */
export function useCartTotals(productsBySku: Map<string, Product>) {
  const items = useCartItems();
  return useMemo(
    () => computeCartTotals(items, productsBySku),
    [items, productsBySku],
  );
}
