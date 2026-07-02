"use client";

import { useEffect, useMemo, useState } from "react";

import { BasketEmpty } from "@/components/basket/basket-empty";
import { BasketLine } from "@/components/basket/basket-line";
import { BasketSummary } from "@/components/basket/basket-summary";
import { hydrateCartProducts } from "@/lib/cart/hydrate";
import { useCartTotals } from "@/lib/cart/use-cart-totals";
import type { Product } from "@/lib/schemas";
import { useCartItems, useCartStore } from "@/stores/cart-store";

export function BasketView() {
  const items = useCartItems();
  const removeItem = useCartStore((s) => s.removeItem);
  const [hydratedKey, setHydratedKey] = useState("");
  const [productsBySku, setProductsBySku] = useState<Map<string, Product>>(
    () => new Map(),
  );

  const skusKey = useMemo(
    () => items.map((i) => i.sku).sort().join(","),
    [items],
  );

  const loading = items.length > 0 && hydratedKey !== skusKey;

  useEffect(() => {
    if (items.length === 0) return;

    let cancelled = false;

    hydrateCartProducts(items.map((i) => i.sku)).then((map) => {
      if (cancelled) return;

      for (const item of items) {
        if (!map.has(item.sku)) removeItem(item.sku);
      }

      setProductsBySku(map);
      setHydratedKey(skusKey);
    });

    return () => {
      cancelled = true;
    };
  }, [skusKey, items, removeItem]);

  const activeProducts =
    items.length === 0 ? new Map<string, Product>() : productsBySku;
  const totals = useCartTotals(activeProducts);
  const visibleItems = items.filter((i) => activeProducts.has(i.sku));

  return (
    <div className="mx-auto w-full max-w-[1564px] px-4 pb-16 sm:px-8">
      <h1 className="mb-8 pt-8 font-display text-display text-text-heading">
        Корзина
      </h1>

      {items.length === 0 ? (
        <BasketEmpty />
      ) : loading ? (
        <p className="text-body text-text-muted">Загрузка корзины…</p>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div>
            {visibleItems.map((item) => {
              const product = activeProducts.get(item.sku);
              if (!product) return null;
              return (
                <BasketLine key={item.sku} item={item} product={product} />
              );
            })}
          </div>
          <BasketSummary items={visibleItems} totals={totals} />
        </div>
      )}
    </div>
  );
}
