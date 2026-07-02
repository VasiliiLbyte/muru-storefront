"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Input } from "@/components/ui/input";
import type { Facet, ProductSort } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "По популярности" },
  { value: "new", label: "Новинки" },
  { value: "price-asc", label: "Цена: по возрастанию" },
  { value: "price-desc", label: "Цена: по убыванию" },
  { value: "discount", label: "По скидке" },
];

export function CatalogToolbar({
  facets,
  className,
}: {
  facets?: Facet[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const sort = (searchParams.get("sort") as ProductSort | null) ?? "popular";
  const inStock = searchParams.get("inStock") === "true";
  const onSale = searchParams.get("onSale") === "true";
  const material = searchParams.get("material") ?? "";
  const color = searchParams.get("color") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const materialFacet = facets?.find((f) => f.key === "material");
  const colorFacet = facets?.find((f) => f.key === "color");

  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 border-b border-border pb-6",
        pending && "opacity-70",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-small text-text-secondary">
          <span className="sr-only">Сортировка</span>
          <span aria-hidden="true">Сортировка:</span>
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="h-9 rounded-sm border border-input bg-background px-2 text-body text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <fieldset className="flex flex-wrap gap-4">
          <legend className="sr-only">Фильтры</legend>
          <label className="flex cursor-pointer items-center gap-2 text-small text-text-secondary">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) =>
                updateParams({ inStock: e.target.checked ? "true" : null })
              }
              className="size-4 rounded-sm border-input accent-brand"
            />
            В наличии
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-small text-text-secondary">
            <input
              type="checkbox"
              checked={onSale}
              onChange={(e) =>
                updateParams({ onSale: e.target.checked ? "true" : null })
              }
              className="size-4 rounded-sm border-input accent-brand"
            />
            Распродажа
          </label>
        </fieldset>

        {materialFacet && materialFacet.options.length > 0 ? (
          <label className="flex flex-col gap-1 text-small text-text-secondary">
            Материал
            <select
              value={material}
              onChange={(e) =>
                updateParams({ material: e.target.value || null })
              }
              className="h-9 min-w-[140px] rounded-sm border border-input bg-background px-2 text-body text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <option value="">Все</option>
              {materialFacet.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.count})
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {colorFacet && colorFacet.options.length > 0 ? (
          <label className="flex flex-col gap-1 text-small text-text-secondary">
            Цвет
            <select
              value={color}
              onChange={(e) => updateParams({ color: e.target.value || null })}
              className="h-9 min-w-[140px] rounded-sm border border-input bg-background px-2 text-body text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <option value="">Все</option>
              {colorFacet.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.count})
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="flex flex-col gap-1 text-small text-text-secondary">
          Цена от
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            defaultValue={minPrice}
            key={`min-${minPrice}`}
            className="w-24"
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== minPrice) updateParams({ minPrice: v || null });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = (e.target as HTMLInputElement).value.trim();
                updateParams({ minPrice: v || null });
              }
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-small text-text-secondary">
          до
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="∞"
            defaultValue={maxPrice}
            key={`max-${maxPrice}`}
            className="w-24"
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== maxPrice) updateParams({ maxPrice: v || null });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = (e.target as HTMLInputElement).value.trim();
                updateParams({ maxPrice: v || null });
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}
