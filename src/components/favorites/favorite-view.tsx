"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { ProductGrid } from "@/components/catalog/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { hydrateCartProducts } from "@/lib/cart/hydrate";
import {
  useFavoriteItems,
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

function AuthFavoritesGrid() {
  const items = useFavoriteItems();
  const remove = useRemoveFavorite();
  const hydrated = useFavoritesHydrated();

  if (!hydrated) {
    return <p className="text-body text-text-muted">Загрузка избранного…</p>;
  }

  if (items.length === 0) {
    return <FavoritesEmpty />;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.sku} className="relative border border-border">
          <Link
            href={`/search/?q=${encodeURIComponent(item.sku)}`}
            className="block focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="relative aspect-square bg-surface">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- CRM CDN hosts vary
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 space-y-1 p-3">
              <p className="truncate text-body text-text-heading">{item.name}</p>
              <p className="text-small text-text-secondary">
                {item.price.toLocaleString("ru-RU")} ₽
              </p>
            </div>
          </Link>
          <button
            type="button"
            aria-label={`Убрать «${item.name}» из избранного`}
            onClick={() => remove(item.sku)}
            className="absolute top-2 right-2 inline-flex size-11 items-center justify-center bg-background/80 text-text-secondary backdrop-blur-sm transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

function GuestFavoritesGrid() {
  const skus = useFavoriteSkus();
  const remove = useRemoveFavorite();

  const skusKey = useMemo(() => skus.slice().sort().join(","), [skus]);

  const [hydratedKey, setHydratedKey] = useState("");
  const [productsBySku, setProductsBySku] = useState<Map<string, Product>>(
    () => new Map(),
  );

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

  const activeProducts =
    skus.length === 0 ? new Map<string, Product>() : productsBySku;
  const products = skus
    .map((sku) => activeProducts.get(sku))
    .filter((p): p is Product => Boolean(p));

  if (skus.length === 0) {
    return <FavoritesEmpty />;
  }

  if (loading) {
    return <p className="text-body text-text-muted">Загрузка избранного…</p>;
  }

  if (products.length === 0) {
    return <FavoritesEmpty />;
  }

  return <ProductGrid products={products} />;
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
