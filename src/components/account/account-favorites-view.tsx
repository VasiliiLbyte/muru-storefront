"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X } from "lucide-react";

import { AccountShell } from "@/components/account/account-shell";
import {
  useFavoriteItems,
  useRemoveFavorite,
} from "@/lib/favorites/favorites-facade";
import { useAccountFavoritesStore } from "@/stores/account-favorites-store";

export function AccountFavoritesView() {
  const items = useFavoriteItems();
  const remove = useRemoveFavorite();
  const hydrate = useAccountFavoritesStore((s) => s.hydrate);
  const hydrated = useAccountFavoritesStore((s) => s.hydrated);
  const loading = useAccountFavoritesStore((s) => s.loading);
  const error = useAccountFavoritesStore((s) => s.error);

  useEffect(() => {
    if (!hydrated) {
      void hydrate().catch(() => {
        // error is stored on the account favorites store
      });
    }
  }, [hydrated, hydrate]);

  return (
    <AccountShell title="Избранное">
      {loading && !hydrated ? (
        <p className="text-body text-text-muted">Загрузка…</p>
      ) : error && !hydrated ? (
        <p className="text-body text-destructive" role="alert">
          {error}
        </p>
      ) : !hydrated ? (
        <p className="text-body text-text-muted">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="text-body text-text-muted">В избранном пока пусто</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <p className="truncate text-body text-text-heading">
                    {item.name}
                  </p>
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
      )}
    </AccountShell>
  );
}
