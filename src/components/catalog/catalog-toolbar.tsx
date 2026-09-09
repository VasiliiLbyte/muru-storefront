"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { IconFilter } from "@/components/icons";
import { actionGlyphClass } from "@/components/layout/header-actions";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMatchMedia } from "@/hooks/use-match-media";
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

function SortSelect({
  value,
  onChange,
}: {
  value: ProductSort;
  onChange: (value: ProductSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(() =>
    Math.max(
      0,
      SORT_OPTIONS.findIndex((option) => option.value === value),
    ),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedLabel =
    SORT_OPTIONS.find((option) => option.value === value)?.label ??
    "Сортировка";

  useEffect(() => {
    if (!open) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setHighlightIndex(
        Math.max(
          0,
          SORT_OPTIONS.findIndex((option) => option.value === value),
        ),
      );
    }
  }, [open, value]);

  const selectOption = (next: ProductSort) => {
    onChange(next);
    setOpen(false);
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((index) =>
        Math.min(index + 1, SORT_OPTIONS.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = SORT_OPTIONS[highlightIndex];
      if (option) selectOption(option.value);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          controlSelectClass,
          "inline-flex items-center justify-between gap-2 text-left",
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-text-secondary transition-transform motion-reduce:transition-none",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Сортировка"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto border border-input bg-background py-1 shadow-(--shadow-overlay)"
        >
          {SORT_OPTIONS.map((option, index) => (
            <li key={option.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === option.value}
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => selectOption(option.value)}
                className={cn(
                  "flex w-full px-3 py-2 text-left text-base text-foreground transition-colors hover:bg-surface",
                  (value === option.value || highlightIndex === index) &&
                    "bg-surface",
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FilterCheckbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}) {
  const id = useId();

  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-2 text-small text-text-secondary",
        className,
      )}
    >
      <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer size-4 appearance-none rounded-none border border-input bg-background checked:border-brand checked:bg-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        />
        <Check
          className="pointer-events-none absolute size-3 text-text-inverse opacity-0 peer-checked:opacity-100"
          aria-hidden
        />
      </span>
      {label}
    </label>
  );
}

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
      <div className="flex flex-col gap-1 text-small text-text-secondary">
        <span>Сортировка</span>
        <SortSelect
          value={draft.sort}
          onChange={(sort) => setDraft((prev) => ({ ...prev, sort }))}
        />
      </div>

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
            placeholder=""
            value={draft.maxPrice}
            className="w-24"
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, maxPrice: e.target.value }))
            }
          />
        </label>
      </div>

      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Фильтры</legend>
        <FilterCheckbox
          checked={draft.inStock}
          onChange={(inStock) => setDraft((prev) => ({ ...prev, inStock }))}
          label="В наличии"
        />
        <FilterCheckbox
          checked={draft.onSale}
          onChange={(onSale) => setDraft((prev) => ({ ...prev, onSale }))}
          label="Распродажа"
        />
      </fieldset>
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
  // Десктоп — панель выезжает справа, мобайл — снизу (SSR отдаёт `bottom`,
  // но панель монтируется только после открытия, т.е. уже после гидрации).
  const isDesktop = useMatchMedia("(min-width: 1024px)");
  const sheetSide = isDesktop ? "right" : "bottom";
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
      {/* Один и тот же контрол на всех вьюпортах: иконка + «Фильтры».
          На мобиле слева, на десктопе прижат вправо (макет от 2026-09-10).
          Сортировка живёт внутри панели, отдельной кнопки для неё нет. */}
      <div className="flex items-center lg:justify-end">
        <button
          type="button"
          onClick={openSheet}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 text-body text-text-heading transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          <IconFilter className={actionGlyphClass} aria-hidden />
          <span>Фильтры</span>
          {activeFilterCount > 0 ? (
            <span
              aria-label={`активных фильтров: ${activeFilterCount}`}
              className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] leading-none font-medium text-text-inverse"
            >
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side={sheetSide}
          showClose={false}
          onSwipeClose={
            sheetSide === "right" ? () => setSheetOpen(false) : undefined
          }
          className={cn(
            "gap-0 overflow-hidden border-0 p-0",
            sheetSide === "bottom"
              ? "max-h-[min(85dvh,calc(100dvh-7rem-env(safe-area-inset-top)))]"
              : "w-[min(92vw,420px)] max-w-none",
          )}
        >
          <SheetHeader className="flex-row items-center justify-between gap-4 px-6 py-4 pr-4">
            {/* text-h2 (до 36px) в панели шириной 420px ломался на две
                строки и наезжал на крестик — фиксируем размер. */}
            <SheetTitle className="font-display text-[20px] leading-[1.2] font-normal text-text-heading lg:text-[22px]">
              Сортировка и фильтры
            </SheetTitle>
            <SheetClose
              aria-label="Закрыть фильтры"
              className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className={actionGlyphClass} aria-hidden />
            </SheetClose>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <FilterControls
              draft={draft}
              setDraft={setDraft}
              materialFacet={materialFacet}
              colorFacet={colorFacet}
            />
          </div>
          <div className="flex shrink-0 gap-3 bg-surface px-6 py-4 pb-safe">
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
