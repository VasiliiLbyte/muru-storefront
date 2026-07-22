"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AccountShell } from "@/components/account/account-shell";
import {
  AccountApiError,
  accountFetchJson,
} from "@/lib/account/account-fetch";
import {
  AccountFavoriteSchema,
  type AccountFavorite,
} from "@/lib/schemas/account";
import { z } from "zod";

const FavoritesSchema = z.array(AccountFavoriteSchema);

export function AccountFavoritesView() {
  const [items, setItems] = useState<AccountFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await accountFetchJson("favorites");
        if (!cancelled) setItems(FavoritesSchema.parse(raw));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AccountApiError
              ? err.message
              : "Не удалось загрузить избранное",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AccountShell title="Избранное">
      {loading ? (
        <p className="text-body text-text-muted">Загрузка…</p>
      ) : error ? (
        <p className="text-body text-destructive" role="alert">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="text-body text-text-muted">
          В избранном пока пусто. Список синхронизируется с аккаунтом (после W4
          подтянутся локальные сохранённые товары).
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.sku} className="border border-border">
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
                <div className="space-y-1 p-3">
                  <p className="text-body text-text-heading">{item.name}</p>
                  <p className="text-small text-text-secondary">
                    {item.price.toLocaleString("ru-RU")} ₽
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
