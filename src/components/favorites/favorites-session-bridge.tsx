"use client";

import { useEffect } from "react";

import { useCustomerSessionStatus } from "@/stores/customer-session-store";
import { useAccountFavoritesStore } from "@/stores/account-favorites-store";

/**
 * Keeps account favorites store in sync with session:
 * hydrate on authenticated (cookie bootstrap + login),
 * reset on guest (logout).
 */
export function FavoritesSessionBridge() {
  const status = useCustomerSessionStatus();
  const hydrate = useAccountFavoritesStore((s) => s.hydrate);
  const reset = useAccountFavoritesStore((s) => s.reset);
  const hydrated = useAccountFavoritesStore((s) => s.hydrated);

  useEffect(() => {
    if (status === "authenticated" && !hydrated) {
      void hydrate().catch(() => {
        // Non-blocking: badge/toggle stay empty until retry
      });
    }
    if (status === "guest") {
      reset();
    }
  }, [status, hydrated, hydrate, reset]);

  return null;
}
