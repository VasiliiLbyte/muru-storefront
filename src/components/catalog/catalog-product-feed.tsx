"use client";

import { useEffect, useState } from "react";

import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export type CatalogFeedQuery = Record<
  string,
  string | number | boolean | undefined | null
>;

type FeedResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

function buildFeedUrl(
  fetchPath: string,
  query: CatalogFeedQuery,
  page: number,
  pageSize: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key === "page" || key === "pageSize") continue;
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "boolean") {
      if (value) params.set(key, "true");
      continue;
    }
    params.set(key, String(value));
  }
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  return `${fetchPath}?${params.toString()}`;
}

function toFeedQuery(
  query: Record<string, unknown> | CatalogFeedQuery,
): CatalogFeedQuery {
  const out: CatalogFeedQuery = {};
  for (const [key, value] of Object.entries(query)) {
    if (
      value === undefined ||
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      out[key] = value as string | number | boolean | null | undefined;
    }
  }
  return out;
}

/**
 * SSR first page + client «Показать ещё» append via BFF.
 */
export function CatalogProductFeed({
  initialItems,
  total,
  pageSize,
  page = 1,
  query,
  fetchPath = "/api/catalog/products",
  className,
  prioritizeLcp = true,
}: {
  initialItems: Product[];
  total: number;
  pageSize: number;
  page?: number;
  query: CatalogFeedQuery | Record<string, unknown>;
  fetchPath?: string;
  className?: string;
  prioritizeLcp?: boolean;
}) {
  const feedQuery = toFeedQuery(query);
  const [items, setItems] = useState(initialItems);
  const [nextPage, setNextPage] = useState(page + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Soft navigation / filter SSR updates reuse this client island — reset snapshot.
  const snapshotKey = [
    page,
    pageSize,
    total,
    JSON.stringify(feedQuery),
    initialItems.map((p) => p.sku).join("|"),
  ].join("::");

  useEffect(() => {
    setItems(initialItems);
    setNextPage(page + 1);
    setError(null);
    setLoading(false);
  }, [snapshotKey, initialItems, page]);

  const hasMore = items.length < total;

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        buildFeedUrl(fetchPath, feedQuery, nextPage, pageSize),
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as FeedResponse;
      const incoming = Array.isArray(data.items) ? data.items : [];
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.sku));
        const appended = incoming.filter((p) => !seen.has(p.sku));
        return appended.length > 0 ? [...prev, ...appended] : prev;
      });
      setNextPage((p) => p + 1);
    } catch {
      setError("Не удалось загрузить товары. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <ProductGrid products={items} prioritizeLcp={prioritizeLcp} />
      {hasMore ? (
        <div className="mt-10 flex flex-col items-center gap-3">
          {error ? (
            <p className="text-small text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            className="h-[45px] px-8"
            disabled={loading}
            onClick={() => void loadMore()}
          >
            {loading ? "Загрузка…" : "Показать ещё"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
