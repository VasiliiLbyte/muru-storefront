"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ProductGrid } from "@/components/catalog/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { hydrateCartProducts } from "@/lib/cart/hydrate";
import {
  useFavoriteSkus,
  useFavoritesHydrated,
  useRemoveFavorite,
} from "@/lib/favorites/favorites-facade";
import type { Product } from "@/lib/schemas";
import { useCustomerSessionStatus } from "@/stores/customer-session-store";
import { catalogHref } from "@/lib/site";
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

/**
 * SKUs → catalog hydrate → ProductGrid (proxied images + PDP + FavoriteToggle).
 * Shared by guest and auth favorites surfaces.
 */
export function HydratedFavoritesGrid({
  waitForAccountHydrate = false,
}: {
  /** Auth surfaces: wait until account favorites store has hydrated SKUs. */
  waitForAccountHydrate?: boolean;
}) {
  const skus = useFavoriteSkus();
  const remove = useRemoveFavorite();
  const accountHydrated = useFavoritesHydrated();

  const skusKey = useMemo(() => skus.slice().sort().join(","), [skus]);

  const [hydratedKey, setHydratedKey] = useState("");
  const [productsBySku, setProductsBySku] = useState<Map<string, Product>>(
    () => new Map(),
  );

  const waitingAccount =
    waitForAccountHydrate && !accountHydrated;
  const loading =
    waitingAccount || (skus.length > 0 && hydratedKey !== skusKey);

  useEffect(() => {
    if (waitingAccount) return;
    if (skus.length === 0) {
      setProductsBySku(new Map());
      setHydratedKey(skusKey);
      return;
    }

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
  }, [remove, skusKey, skus, waitingAccount]);

  const activeProducts =
    skus.length === 0 ? new Map<string, Product>() : productsBySku;
  const products = skus
    .map((sku) => activeProducts.get(sku))
    .filter((p): p is Product => Boolean(p));

  if (loading) {
    return <p className="text-body text-text-muted">Загрузка избранного…</p>;
  }

  if (skus.length === 0 || products.length === 0) {
    return <FavoritesEmpty />;
  }

  return <ProductGrid products={products} />;
}

function AuthFavoritesGrid() {
  return <HydratedFavoritesGrid waitForAccountHydrate />;
}

function GuestFavoritesGrid() {
  return <HydratedFavoritesGrid />;
}

export function FavoriteView() {
  const status = useCustomerSessionStatus();
  const isAuth = status === "authenticated";

  return (
    <div className="mx-auto w-full max-w-[1564px] px-4 pb-16 sm:px-8">
      <h1 className="mb-8 pt-8 font-display text-display text-text-heading">
        Избранное
      </h1>
      {isAuth ? <AuthFavoritesGrid /> : <GuestFavoritesGrid />}
    </div>
  );
}
