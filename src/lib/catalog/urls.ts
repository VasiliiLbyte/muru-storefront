import type { Product } from "@/lib/schemas";
import { isCatalogBackendEnabled } from "@/lib/api/catalog-backend";
import {
  categoriesToNavTree,
  childNavOf,
  isTopLevelNavSlug,
  topCategorySlugOf,
  type CatalogNavNode,
} from "@/lib/catalog/catalog-nav";
import { SALE_CATEGORY_SLUG } from "@/lib/catalog/sale-category";
import type { Category } from "@/lib/schemas";

export type ProductCategoryPath = {
  top: string;
  leaf: string;
};

function isValidCategoryPair(
  top: string,
  leaf: string,
  tree: CatalogNavNode[],
): boolean {
  if (!top || !leaf) return false;
  if (top === leaf) return isTopLevelNavSlug(top, tree);
  return Boolean(childNavOf(top, leaf, tree));
}

/**
 * Pick a tree-valid {top,leaf} from categorySlugs when the raw [0]/[1]
 * pair is a cross-placement (or otherwise not in the nav tree).
 * Prefer the primary hub (categorySlugs[0]) over later cross memberships.
 */
function resolveValidCategoryPair(
  categorySlugs: string[],
  categories: Category[],
): ProductCategoryPath | null {
  const tree = categoriesToNavTree(categories);
  if (categorySlugs.length === 0) return null;

  const primary = categorySlugs[0] ?? "";
  const rawLeaf = categorySlugs[1] ?? categorySlugs[0] ?? "";
  if (isValidCategoryPair(primary, rawLeaf, tree)) {
    return { top: primary, leaf: rawLeaf };
  }

  // Flat primary hub (gift cards, sale, …) — before scanning cross leaves.
  if (primary && isValidCategoryPair(primary, primary, tree)) {
    return { top: primary, leaf: primary };
  }

  // Child of primary that appears later in the slug list.
  for (const candidate of categorySlugs.slice(1)) {
    if (isValidCategoryPair(primary, candidate, tree)) {
      return { top: primary, leaf: candidate };
    }
  }

  // Prefer a real child leaf whose parent is also in the slug list.
  for (const candidate of categorySlugs) {
    const parent = topCategorySlugOf(candidate, categories);
    if (
      candidate !== parent &&
      categorySlugs.includes(parent) &&
      isValidCategoryPair(parent, candidate, tree)
    ) {
      return { top: parent, leaf: candidate };
    }
  }

  // Any other flat top-level slug in the list.
  for (const candidate of categorySlugs.slice(1)) {
    if (isValidCategoryPair(candidate, candidate, tree)) {
      return { top: candidate, leaf: candidate };
    }
  }

  return null;
}

/**
 * Топ- и листовая категория товара из categorySlugs.
 * Backend: [0]=top, [1]=leaf (latin). Mock: leaf ≠ top via parent map.
 * Orphan sale (пустые сегменты + isOnSale) → rasprodazha/rasprodazha.
 * When categories are provided, prefer a tree-valid pair (cross ≠ leaf).
 */
export function productCategorySlugs(
  product: Product,
  categories?: Category[],
): ProductCategoryPath {
  if (categories?.length) {
    const valid = resolveValidCategoryPair(product.categorySlugs, categories);
    if (valid) return valid;
  }

  let top: string;
  let leaf: string;

  if (isCatalogBackendEnabled() || !categories?.length) {
    top = product.categorySlugs[0] ?? "";
    leaf = product.categorySlugs[1] ?? product.categorySlugs[0] ?? "";
  } else {
    leaf =
      product.categorySlugs.find((s) => {
        const t = topCategorySlugOf(s, categories);
        return product.categorySlugs.includes(t) && s !== t;
      }) ??
      product.categorySlugs[0] ??
      "";
    top = leaf ? topCategorySlugOf(leaf, categories) : "";
  }

  if ((!top || !leaf) && product.isOnSale) {
    return { top: SALE_CATEGORY_SLUG, leaf: SALE_CATEGORY_SLUG };
  }

  return { top, leaf };
}

/**
 * Канонический URL карточки товара: /catalog/{top}/{leaf}/{slug}/.
 * Никогда не эмитит пустые сегменты (`/catalog///…`).
 */
export function productHref(
  product: Product,
  categories?: Category[],
): string {
  const { top, leaf } = productCategorySlugs(product, categories);
  // Guard: never emit `/catalog///…` even for non-sale orphans.
  const safeTop = top || "_";
  const safeLeaf = leaf || "_";
  const safeSlug = product.slug || "_";
  return `/catalog/${safeTop}/${safeLeaf}/${safeSlug}/`;
}

/** Сверка сегментов URL с каноническим путём товара. */
export function productPathMatches(
  product: Product,
  segments: string[],
  categories?: Category[],
): boolean {
  if (segments.length !== 3) return false;
  const { top, leaf } = productCategorySlugs(product, categories);
  return (
    segments[0] === top &&
    segments[1] === leaf &&
    segments[2] === product.slug
  );
}

/** Append searchParams to a path (for catalog mismatch redirects). */
export function appendSearchToPath(
  path: string,
  searchParams?: Record<string, string | string[] | undefined>,
): string {
  if (!searchParams) return path;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) sp.append(key, item);
    } else {
      sp.set(key, value);
    }
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}
