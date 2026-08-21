"use client";

import { useEffect } from "react";

import { AccountShell } from "@/components/account/account-shell";
import { HydratedFavoritesGrid } from "@/components/favorites/favorite-view";
import { useAccountFavoritesStore } from "@/stores/account-favorites-store";

export function AccountFavoritesView() {
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
      ) : (
        <HydratedFavoritesGrid waitForAccountHydrate />
      )}
    </AccountShell>
  );
}
