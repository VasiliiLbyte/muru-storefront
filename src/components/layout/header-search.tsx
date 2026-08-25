"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Clock, Loader2, Mic, Tag, X } from "lucide-react";

import { IconSearch } from "@/components/icons";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  SearchSuggestCategory,
  SearchSuggestProduct,
} from "@/lib/api/catalog-backend";
import { formatPrice } from "@/lib/format";
import { resolveCatalogImageUrl } from "@/lib/images";
import { productHref } from "@/lib/catalog/urls";
import { addRecentSearch } from "@/lib/search/recent-searches";
import type { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useSearchSuggest, type SuggestState } from "@/hooks/use-search-suggest";

function suggestProductToHref(p: SearchSuggestProduct): string {
  const slugs = [p.categorySlug, p.subcategorySlug].filter(
    (s) => s && s !== "bez-kategorii",
  );
  const miniProduct = {
    categorySlugs: slugs,
    isOnSale: p.discountPercent > 0,
    slug: p.slug,
  } as Product;
  return productHref(miniProduct);
}

// ---------------------------------------------------------------------------
// Dropdown items — flat list for keyboard nav
// ---------------------------------------------------------------------------

type DropdownItem =
  | { kind: "recent"; value: string }
  | { kind: "product"; product: SearchSuggestProduct }
  | { kind: "category"; category: SearchSuggestCategory }
  | { kind: "all-results"; query: string };

function buildItems(
  state: SuggestState,
  query: string,
  recentSearches: string[],
  products: SearchSuggestProduct[],
  categories: SearchSuggestCategory[],
): DropdownItem[] {
  const trimmed = query.trim();

  if (trimmed.length < 2 && recentSearches.length > 0) {
    return recentSearches.map((v) => ({ kind: "recent" as const, value: v }));
  }

  if (state === "results") {
    const items: DropdownItem[] = [];
    for (const p of products) items.push({ kind: "product", product: p });
    for (const c of categories) items.push({ kind: "category", category: c });
    items.push({ kind: "all-results", query: trimmed });
    return items;
  }

  return [];
}

// ---------------------------------------------------------------------------
// SearchDropdown
// ---------------------------------------------------------------------------

function SearchDropdown({
  id,
  items,
  state,
  query,
  activeIndex,
  onSelect,
  mobile,
}: {
  id: string;
  items: DropdownItem[];
  state: SuggestState;
  query: string;
  activeIndex: number;
  onSelect: (item: DropdownItem) => void;
  mobile?: boolean;
}) {
  const trimmed = query.trim();

  if (state === "loading") {
    return (
      <div
        id={id}
        role="listbox"
        aria-label="Подсказки поиска"
        className={cn(
          "border border-border bg-background shadow-lg",
          mobile
            ? "w-full"
            : "absolute top-full left-0 z-50 w-full",
        )}
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-4 animate-spin text-text-muted" aria-hidden />
          <span className="sr-only">Загрузка подсказок…</span>
        </div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div
        id={id}
        role="listbox"
        aria-label="Подсказки поиска"
        className={cn(
          "border border-border bg-background shadow-lg",
          mobile
            ? "w-full"
            : "absolute top-full left-0 z-50 w-full",
        )}
      >
        <p className="px-4 py-6 text-center text-small text-text-muted">
          Ничего не найдено по «{trimmed}»
        </p>
      </div>
    );
  }

  if (items.length === 0) return null;

  const hasRecent = items.some((i) => i.kind === "recent");
  const hasProducts = items.some((i) => i.kind === "product");
  const hasCategories = items.some((i) => i.kind === "category");

  let flatIndex = -1;

  return (
    <div
      id={id}
      role="listbox"
      aria-label="Подсказки поиска"
      className={cn(
        "overflow-y-auto border border-border bg-background shadow-lg",
        mobile
          ? "max-h-[60vh] w-full"
          : "absolute top-full left-0 z-50 w-full max-h-[min(50vh,24rem)]",
      )}
    >
      {hasRecent && (
        <div role="group" aria-label="Недавние запросы">
          <p className="px-4 pt-3 pb-1 text-caption font-medium text-text-muted">
            Недавние запросы
          </p>
          {items
            .filter((i) => i.kind === "recent")
            .map((item) => {
              flatIndex++;
              const idx = flatIndex;
              return (
                <button
                  key={`recent-${item.value}`}
                  id={`${id}-opt-${idx}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-small text-text-primary transition-colors",
                    mobile && "min-h-11",
                    idx === activeIndex
                      ? "bg-surface"
                      : "hover:bg-surface",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(item)}
                >
                  <Clock className="size-4 shrink-0 text-text-muted" aria-hidden />
                  {item.value}
                </button>
              );
            })}
        </div>
      )}

      {hasProducts && (
        <div role="group" aria-label="Товары">
          {hasRecent && <hr className="border-border" />}
          <p className="px-4 pt-3 pb-1 text-caption font-medium text-text-muted">
            Товары
          </p>
          {items
            .filter((i): i is DropdownItem & { kind: "product" } => i.kind === "product")
            .map((item) => {
              flatIndex++;
              const idx = flatIndex;
              const p = item.product;
              const imgSrc = resolveCatalogImageUrl(p.imageUrl, 320);
              const salePrice =
                p.discountPercent > 0
                  ? Math.round(p.price * (1 - p.discountPercent / 100))
                  : p.price;
              return (
                <button
                  key={p.sku}
                  id={`${id}-opt-${idx}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                    mobile && "min-h-11",
                    idx === activeIndex
                      ? "bg-surface"
                      : "hover:bg-surface",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(item)}
                >
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={p.name}
                      width={40}
                      height={40}
                      className="size-10 shrink-0 rounded-none object-cover"
                    />
                  ) : (
                    <span
                      className="flex size-10 shrink-0 items-center justify-center bg-surface text-text-muted"
                      aria-hidden
                    >
                      <IconSearch className="size-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-small text-text-primary">
                      {p.name}
                    </span>
                    <span className="flex items-center gap-1.5 text-caption">
                      {p.discountPercent > 0 ? (
                        <>
                          <span className="text-text-heading font-medium">
                            {formatPrice(salePrice)}
                          </span>
                          <span className="text-text-muted line-through">
                            {formatPrice(p.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-text-heading font-medium">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
        </div>
      )}

      {hasCategories && (
        <div role="group" aria-label="Категории">
          {(hasProducts || hasRecent) && <hr className="border-border" />}
          <p className="px-4 pt-3 pb-1 text-caption font-medium text-text-muted">
            Категории
          </p>
          {items
            .filter(
              (i): i is DropdownItem & { kind: "category" } =>
                i.kind === "category",
            )
            .map((item) => {
              flatIndex++;
              const idx = flatIndex;
              const c = item.category;
              const label = c.subcategoryName
                ? `${c.name} → ${c.subcategoryName}`
                : c.name;
              return (
                <button
                  key={`${c.categorySlug}-${c.subcategorySlug ?? ""}`}
                  id={`${id}-opt-${idx}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-small text-text-primary transition-colors",
                    mobile && "min-h-11",
                    idx === activeIndex
                      ? "bg-surface"
                      : "hover:bg-surface",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(item)}
                >
                  <Tag className="size-4 shrink-0 text-text-muted" aria-hidden />
                  {label}
                </button>
              );
            })}
        </div>
      )}

      {items.some((i) => i.kind === "all-results") && (
        <>
          <hr className="border-border" />
          {items
            .filter(
              (i): i is DropdownItem & { kind: "all-results" } =>
                i.kind === "all-results",
            )
            .map((item) => {
              flatIndex++;
              const idx = flatIndex;
              return (
                <button
                  key="all"
                  id={`${id}-opt-${idx}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-center gap-2 px-4 py-3 text-small font-medium text-brand transition-colors",
                    mobile && "min-h-11",
                    idx === activeIndex
                      ? "bg-surface"
                      : "hover:bg-surface",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(item)}
                >
                  <IconSearch className="size-4" aria-hidden />
                  Все результаты по «{item.query}»
                </button>
              );
            })}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared search form with dropdown integration
// ---------------------------------------------------------------------------

function SearchFormWithSuggest({
  id,
  mobile,
  inputRef,
  inputClassName,
  onNavigate,
}: {
  id: string;
  mobile?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  inputClassName?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownId = `${id}-dropdown`;

  const { suggestions, state, recentSearches, refreshRecent } =
    useSearchSuggest(query);

  const items = buildItems(
    state,
    query,
    recentSearches,
    suggestions?.products ?? [],
    suggestions?.categories ?? [],
  );

  const showDropdown =
    open &&
    (state === "loading" ||
      state === "empty" ||
      items.length > 0);


  const navigate = useCallback(
    (href: string, searchQuery?: string) => {
      if (searchQuery) addRecentSearch(searchQuery);
      refreshRecent();
      setOpen(false);
      setQuery("");
      setActiveIndex(-1);
      onNavigate?.();
      router.push(href);
    },
    [router, onNavigate, refreshRecent],
  );

  const selectItem = useCallback(
    (item: DropdownItem) => {
      switch (item.kind) {
        case "recent":
          navigate(`/search/?q=${encodeURIComponent(item.value)}`, item.value);
          break;
        case "product": {
          navigate(suggestProductToHref(item.product), item.product.name);
          break;
        }
        case "category": {
          const c = item.category;
          const href = c.subcategorySlug
            ? `/catalog/${c.categorySlug}/${c.subcategorySlug}/`
            : `/catalog/${c.categorySlug}/`;
          navigate(href);
          break;
        }
        case "all-results":
          navigate(
            `/search/?q=${encodeURIComponent(item.query)}`,
            item.query,
          );
          break;
      }
    },
    [navigate],
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search/?q=${encodeURIComponent(q)}` : "/search/", q || undefined);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && items[activeIndex]) {
      e.preventDefault();
      selectItem(items[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  // Click outside (desktop only)
  useEffect(() => {
    if (mobile || !open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, mobile]);

  // Reset active index when items change
  const itemsKey = `${items.length}-${state}`;
  const prevItemsKeyRef = useRef(itemsKey);
  useEffect(() => {
    if (prevItemsKeyRef.current !== itemsKey) {
      prevItemsKeyRef.current = itemsKey;
      setActiveIndex(-1);
    }
  }, [itemsKey]);

  const activeDescendant =
    activeIndex >= 0 ? `${dropdownId}-opt-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className={cn("relative w-full", mobile && "min-w-0")}>
      <form onSubmit={submit} role="search" className="relative min-w-0 w-full">
        <label htmlFor={id} className="sr-only">
          Поиск по каталогу
        </label>
        <input
          ref={inputRef}
          id={id}
          type="search"
          name="q"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={dropdownId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            refreshRecent();
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Поиск по каталогу"
          autoComplete="off"
          style={{ fontSize: 16 }}
          className={cn(
            "h-[45px] w-full rounded-none border border-[#d7d8da] bg-background py-2.5 pr-24 pl-8 text-[16px] font-normal text-text-primary placeholder:text-text-secondary focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:text-[15px]",
            inputClassName,
          )}
        />
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2.5 text-text-muted">
          <button
            type="button"
            aria-label="Голосовой поиск"
            className="inline-flex size-11 items-center justify-center transition-colors hover:text-brand lg:size-auto"
          >
            <Mic className="size-5" aria-hidden />
          </button>
          <span className="h-5 w-px bg-border" aria-hidden />
          <button
            type="submit"
            aria-label="Найти"
            className="inline-flex size-11 items-center justify-center transition-colors hover:text-brand lg:size-auto"
          >
            <IconSearch className="size-5" aria-hidden />
          </button>
        </div>
      </form>

      {showDropdown && (
        <SearchDropdown
          id={dropdownId}
          items={items}
          state={state}
          query={query}
          activeIndex={activeIndex}
          onSelect={selectItem}
          mobile={mobile}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop inline search (hidden below lg)
// ---------------------------------------------------------------------------

export function HeaderSearch({ className }: { className?: string }) {
  const desktopId = useId();

  return (
    <div className={cn("hidden lg:block", className)}>
      <SearchFormWithSuggest id={desktopId} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile search icon → fullscreen dialog
// ---------------------------------------------------------------------------

export function HeaderMobileSearch() {
  const mobileId = useId();
  const [open, setOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => mobileInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label="Открыть поиск"
        className="inline-flex shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
        style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
        onClick={() => setOpen(true)}
      >
        <IconSearch className="size-5" aria-hidden />
      </button>
      {open ? (
        <DialogContent
          variant="fullscreen"
          showClose={false}
          className="gap-0 p-0"
        >
          <DialogTitle className="sr-only">Поиск по каталогу</DialogTitle>
          <div className="flex items-center gap-1 border-b border-border px-2 py-2">
            <div className="min-w-0 flex-1">
              <SearchFormWithSuggest
                id={mobileId}
                mobile
                inputRef={mobileInputRef}
                inputClassName="lg:text-[16px]"
                onNavigate={() => setOpen(false)}
              />
            </div>
            <DialogClose
              aria-label="Закрыть поиск"
              className="inline-flex size-11 shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-5" aria-hidden />
            </DialogClose>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
