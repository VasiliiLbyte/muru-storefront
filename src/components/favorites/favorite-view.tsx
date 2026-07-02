"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ProductGrid } from "@/components/catalog/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { hydrateCartProducts } from "@/lib/cart/hydrate";
import type { Product } from "@/lib/schemas";
import { catalogHref } from "@/lib/site";
import { useFavoritesStore, useFavoriteSkus } from "@/stores/favorites-store";
import { cn } from "@/lib/utils";

function FavoritesEmpty() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <p className="text-body text-text-secondary">
        Пока в избранном нет товаров.
      </p>
      <Link
        href={catalogHref.root}
        className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}
      >
        Перейти в каталог
      </Link>
    </div>
  );
}

export function FavoriteView() {
  const skus = useFavoriteSkus();
  const remove = useFavoritesStore((s) => s.remove);

  const skusKey = useMemo(() => skus.slice().sort().join(","), [skus]);

  const [hydratedKey, setHydratedKey] = useState("");
  const [productsBySku, setProductsBySku] = useState<
    Map<string, Product>
  >(() => new Map());

  const loading = skus.length > 0 && hydratedKey !== skusKey;

  useEffect(() => {
    if (skus.length === 0) return;

    let cancelled = false;

    hydrateCartProducts(skus).then((map) => {
      if (cancelled) return;

      for (const sku of skus) {
        if (!map.has(sku)) remove(sku);
      }

      setProductsBySku(map);
      setHydratedKey(skusKey);
    });

    return () => {
      cancelled = true;
    };
  }, [remove, skusKey, skus]);

  const activeProducts = skus.length === 0 ? new Map<string, Product>() : productsBySku;
  const products = skus
    .map((sku) => activeProducts.get(sku))
    .filter((p): p is Product => Boolean(p));

  return (
    <div className="mx-auto w-full max-w-[1564px] px-4 pb-16 sm:px-8">
      <h1 className="mb-8 pt-8 font-display text-display text-text-heading">
        Избранное
      </h1>

      {skus.length === 0 ? (
        <FavoritesEmpty />
      ) : loading ? (
        <p className="text-body text-text-muted">Загрузка избранного…</p>
      ) : products.length === 0 ? (
        <FavoritesEmpty />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

