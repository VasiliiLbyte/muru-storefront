"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SearchSuggestResult } from "@/lib/api/catalog-backend";
import { getRecentSearches } from "@/lib/search/recent-searches";

export type SuggestState = "idle" | "loading" | "results" | "empty" | "error";

type SuggestStore = {
  suggestions: SearchSuggestResult | null;
  state: SuggestState;
};

export function useSearchSuggest(query: string) {
  const [store, setStore] = useState<SuggestStore>({
    suggestions: null,
    state: "idle",
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentTick, setRecentTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);

  const refreshRecent = useCallback(() => {
    setRecentTick((t) => t + 1);
  }, []);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [recentTick]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setStore({ suggestions: null, state: "idle" });
      return;
    }

    const seq = ++seqRef.current;

    const timer = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStore((prev) => ({ ...prev, state: "loading" }));

      fetch(`/api/catalog/suggest?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<SearchSuggestResult>;
        })
        .then((data) => {
          if (seq !== seqRef.current) {
            console.log("[suggest] stale response, ignoring", { seq, current: seqRef.current });
            return;
          }
          const hasResults =
            data.products.length > 0 || data.categories.length > 0;
          console.log("[suggest] got results", { hasResults, products: data.products.length, categories: data.categories.length });
          setStore({
            suggestions: data,
            state: hasResults ? "results" : "empty",
          });
        })
        .catch((err) => {
          if (seq !== seqRef.current) return;
          if (err instanceof DOMException && err.name === "AbortError") {
            console.log("[suggest] aborted");
            return;
          }
          console.error("[suggest] error", err);
          setStore({ suggestions: null, state: "error" });
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [query]);

  return {
    suggestions: store.suggestions,
    state: store.state,
    recentSearches,
    refreshRecent,
  };
}
