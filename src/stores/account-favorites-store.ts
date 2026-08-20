import { create } from "zustand";
import { z } from "zod";

import { accountFetchJson } from "@/lib/account/account-fetch";
import {
  AccountFavoriteSchema,
  type AccountFavorite,
} from "@/lib/schemas/account";

const FavoritesListSchema = z.array(AccountFavoriteSchema);

/** Monotonic generation so stale hydrate responses are discarded. */
let hydrateEpoch = 0;

type PendingOp = "add" | "remove";

type AccountFavoritesState = {
  items: AccountFavorite[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  /** In-flight optimistic ops — hydrate must respect these. */
  pending: Record<string, PendingOp>;
  hydrate: (opts?: { force?: boolean }) => Promise<void>;
  toggle: (sku: string) => Promise<void>;
  remove: (sku: string) => Promise<void>;
  reset: () => void;
  hasSku: (sku: string) => boolean;
};

function placeholderFavorite(sku: string): AccountFavorite {
  return { sku, name: sku, price: 0 };
}

function applyPendingOverlay(
  serverItems: AccountFavorite[],
  pending: Record<string, PendingOp>,
): AccountFavorite[] {
  const bySku = new Map(serverItems.map((item) => [item.sku, item]));
  for (const [sku, op] of Object.entries(pending)) {
    if (op === "remove") {
      bySku.delete(sku);
    } else if (op === "add" && !bySku.has(sku)) {
      bySku.set(sku, placeholderFavorite(sku));
    }
  }
  return [...bySku.values()];
}

export const useAccountFavoritesStore = create<AccountFavoritesState>(
  (set, get) => ({
    items: [],
    hydrated: false,
    loading: false,
    error: null,
    pending: {},

    hasSku: (sku) => get().items.some((item) => item.sku === sku),

    reset: () => {
      hydrateEpoch += 1;
      set({
        items: [],
        hydrated: false,
        loading: false,
        error: null,
        pending: {},
      });
    },

    hydrate: async (opts) => {
      const force = opts?.force === true;
      const state = get();
      if (state.hydrated && !force) return;
      if (state.loading && !force) return;

      const epoch = ++hydrateEpoch;
      set({ loading: true, error: null });
      try {
        const raw = await accountFetchJson("favorites");
        if (epoch !== hydrateEpoch) return;
        const serverItems = FavoritesListSchema.parse(raw);
        const { pending } = get();
        set({
          items: applyPendingOverlay(serverItems, pending),
          hydrated: true,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (epoch !== hydrateEpoch) return;
        set({
          loading: false,
          error:
            err instanceof Error
              ? err.message
              : "Не удалось загрузить избранное",
        });
        throw err;
      }
    },

    toggle: async (sku) => {
      const trimmed = sku.trim();
      if (!trimmed) return;

      const { items, pending } = get();
      if (pending[trimmed]) return;

      const isFav = items.some((item) => item.sku === trimmed);
      const op: PendingOp = isFav ? "remove" : "add";
      const snapshot = items;

      set({
        pending: { ...pending, [trimmed]: op },
        items:
          op === "remove"
            ? items.filter((item) => item.sku !== trimmed)
            : [...items, placeholderFavorite(trimmed)],
      });

      try {
        if (op === "add") {
          await accountFetchJson("favorites", {
            method: "POST",
            body: JSON.stringify({ sku: trimmed }),
          });
        } else {
          await accountFetchJson("favorites", {
            method: "DELETE",
            body: JSON.stringify({ sku: trimmed }),
          });
        }
        const nextPending = { ...get().pending };
        delete nextPending[trimmed];
        set({ pending: nextPending });
      } catch (err) {
        const nextPending = { ...get().pending };
        delete nextPending[trimmed];
        set({ items: snapshot, pending: nextPending });
        throw err;
      }
    },

    remove: async (sku) => {
      const trimmed = sku.trim();
      if (!trimmed) return;

      const { items, pending } = get();
      if (pending[trimmed]) return;
      if (!items.some((item) => item.sku === trimmed)) return;

      const snapshot = items;
      set({
        pending: { ...pending, [trimmed]: "remove" },
        items: items.filter((item) => item.sku !== trimmed),
      });

      try {
        await accountFetchJson("favorites", {
          method: "DELETE",
          body: JSON.stringify({ sku: trimmed }),
        });
        const nextPending = { ...get().pending };
        delete nextPending[trimmed];
        set({ pending: nextPending });
      } catch (err) {
        const nextPending = { ...get().pending };
        delete nextPending[trimmed];
        set({ items: snapshot, pending: nextPending });
        throw err;
      }
    },
  }),
);
