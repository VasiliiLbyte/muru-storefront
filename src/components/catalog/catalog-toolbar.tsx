"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Facet, ProductSort } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "По популярности" },
  { value: "new", label: "Новинки" },
  { value: "price-asc", label: "Цена: по возрастанию" },
  { value: "price-desc", label: "Цена: по убыванию" },
  { value: "discount", label: "По скидке" },
];

const FILTER_PARAM_KEYS = [
  "inStock",
  "onSale",
  "material",
  "color",
  "minPrice",
  "maxPrice",
] as const;

type DraftState = {
  sort: ProductSort;
  inStock: boolean;
  onSale: boolean;
  material: string;
  color: string;
  minPrice: string;
  maxPrice: string;
};

function countActiveFilters(params: URLSearchParams): number {
  let n = 0;
  for (const key of FILTER_PARAM_KEYS) {
    const v = params.get(key);
    if (v != null && v !== "") n += 1;
  }
  return n;
}

function draftFromParams(params: URLSearchParams): DraftState {
  return {
    sort: (params.get("sort") as ProductSort | null) ?? "popular",
    inStock: params.get("inStock") === "true",
    onSale: params.get("onSale") === "true",
    material: params.get("material") ?? "",
    color: params.get("color") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
  };
}

const controlSelectClass =
  "h-11 w-full rounded-sm border border-input bg-background px-2 text-base text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:h-9";

function FilterControls({
  draft,
  setDraft,
  materialFacet,
  colorFacet,
}: {
  draft: DraftState;
  setDraft: (next: DraftState | ((prev: DraftState) => DraftState)) => void;
  materialFacet?: Facet;
  colorFacet?: Facet;
}) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-small text-text-secondary">
        Сортировка
        <select
          value={draft.sort}
          onChange={(e) =>
            setDraft((prev) => ({
              ...prev,
              sort: e.target.value as ProductSort,
            }))
          }
          className={controlSelectClass}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Фильтры</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-small text-text-secondary">
          <input
            type="checkbox"
            checked={draft.inStock}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, inStock: e.target.checked }))
            }
            className="size-4 rounded-sm border-input accent-brand"
          />
          В наличии
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-small text-text-secondary">
          <input
            type="checkbox"
            checked={draft.onSale}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, onSale: e.target.checked }))
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
            value={draft.material}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, material: e.target.value }))
            }
            className={cn(controlSelectClass, "min-w-[140px]")}
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
            value={draft.color}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, color: e.target.value }))
            }
            className={cn(controlSelectClass, "min-w-[140px]")}
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

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-small text-text-secondary">
          Цена от
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            value={draft.minPrice}
            className="w-24"
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, minPrice: e.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-small text-text-secondary">
          до
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="∞"
            value={draft.maxPrice}
            className="w-24"
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, maxPrice: e.target.value }))
            }
          />
        </label>
      </div>
    </div>
  );
}

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<DraftState>(() =>
    draftFromParams(searchParams),
  );

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

  const materialFacet = facets?.find((f) => f.key === "material");
  const colorFacet = facets?.find((f) => f.key === "color");
  const activeFilterCount = useMemo(
    () => countActiveFilters(searchParams),
    [searchParams],
  );

  const urlDraft = useMemo(
    () => draftFromParams(searchParams),
    [searchParams],
  );

  useEffect(() => {
    if (sheetOpen) setDraft(draftFromParams(searchParams));
  }, [sheetOpen, searchParams]);

  const openSheet = () => {
    setDraft(draftFromParams(searchParams));
    setSheetOpen(true);
  };

  const applyDraftAndClose = () => {
    updateParams({
      sort: draft.sort === "popular" ? null : draft.sort,
      inStock: draft.inStock ? "true" : null,
      onSale: draft.onSale ? "true" : null,
      material: draft.material || null,
      color: draft.color || null,
      minPrice: draft.minPrice.trim() || null,
      maxPrice: draft.maxPrice.trim() || null,
    });
    setSheetOpen(false);
  };

  const resetAndClose = () => {
    updateParams({
      sort: null,
      inStock: null,
      onSale: null,
      material: null,
      color: null,
      minPrice: null,
      maxPrice: null,
    });
    setSheetOpen(false);
  };

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === urlDraft.sort)?.label ??
    "Сортировка";

  return (
    <div
      className={cn(
        "mb-1 border-b border-border pb-1 lg:mb-8 lg:pb-6",
        // Sticky under mobile header; self-start so flex stretch doesn't kill sticky.
        // lg:static restores desktop flow (no sticky on desktop toolbar).
        "sticky z-30 w-full self-start top-[calc(3.5rem+env(safe-area-inset-top)+1px)] lg:static lg:z-auto lg:top-auto lg:self-auto",
        "max-lg:-mx-4 max-lg:bg-background/95 max-lg:px-4 max-lg:backdrop-blur max-lg:supports-[backdrop-filter]:bg-background/80",
        "max-lg:sm:-mx-8 max-lg:sm:px-8",
        pending && "opacity-70",
        className,
      )}
    >
      {/* Mobile compact row */}
      <div className="flex items-center gap-2 py-1 lg:hidden">
        <button
          type="button"
          onClick={openSheet}
          className="inline-flex min-h-11 flex-1 items-center justify-between gap-2 border border-input bg-background px-3 text-body text-text-primary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="truncate">{sortLabel}</span>
          <ChevronDown className="size-4 shrink-0 text-text-secondary" aria-hidden />
        </button>
        <button
          type="button"
          onClick={openSheet}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-input bg-background px-3 text-body text-text-primary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
          Фильтры{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
      </div>

      {/* Desktop inline (unchanged layout) */}
      <div className="hidden flex-col gap-4 lg:flex">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-small text-text-secondary">
            <span className="sr-only">Сортировка</span>
            <span aria-hidden="true">Сортировка:</span>
            <select
              value={urlDraft.sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="h-11 rounded-sm border border-input bg-background px-2 text-base text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:h-9"
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
                checked={urlDraft.inStock}
                onChange={(e) =>
                  updateParams({
                    inStock: e.target.checked ? "true" : null,
                  })
                }
                className="size-4 rounded-sm border-input accent-brand"
              />
              В наличии
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-small text-text-secondary">
              <input
                type="checkbox"
                checked={urlDraft.onSale}
                onChange={(e) =>
                  updateParams({
                    onSale: e.target.checked ? "true" : null,
                  })
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
                value={urlDraft.material}
                onChange={(e) =>
                  updateParams({ material: e.target.value || null })
                }
                className="h-11 min-w-[140px] rounded-sm border border-input bg-background px-2 text-base text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:h-9"
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
                value={urlDraft.color}
                onChange={(e) =>
                  updateParams({ color: e.target.value || null })
                }
                className="h-11 min-w-[140px] rounded-sm border border-input bg-background px-2 text-base text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:h-9"
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
              defaultValue={urlDraft.minPrice}
              key={`min-${urlDraft.minPrice}`}
              className="w-24"
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== urlDraft.minPrice)
                  updateParams({ minPrice: v || null });
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
              defaultValue={urlDraft.maxPrice}
              key={`max-${urlDraft.maxPrice}`}
              className="w-24"
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== urlDraft.maxPrice)
                  updateParams({ maxPrice: v || null });
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="gap-0 overflow-hidden p-0">
          <SheetHeader className="border-b border-border px-6 py-4">
            <SheetTitle className="font-display text-h2 text-text-heading">
              Сортировка и фильтры
            </SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <FilterControls
              draft={draft}
              setDraft={setDraft}
              materialFacet={materialFacet}
              colorFacet={colorFacet}
            />
          </div>
          <div className="flex shrink-0 gap-3 border-t border-border bg-surface px-6 py-4 pb-safe">
            <button
              type="button"
              onClick={resetAndClose}
              className="inline-flex h-11 flex-1 items-center justify-center border border-input bg-background text-body text-text-primary transition-colors hover:border-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              Сбросить
            </button>
            <button
              type="button"
              onClick={applyDraftAndClose}
              className="inline-flex h-11 flex-1 items-center justify-center bg-brand text-body text-text-inverse transition-colors hover:bg-brand-hover focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              Показать
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
