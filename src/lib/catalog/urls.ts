import type { Product } from "@/lib/schemas";
import { isCatalogBackendEnabled } from "@/lib/api/catalog-backend";
import { topCategorySlugOf } from "@/lib/catalog/catalog-nav";
import { SALE_CATEGORY_SLUG } from "@/lib/catalog/sale-category";
import type { Category } from "@/lib/schemas";

export type ProductCategoryPath = {
  top: string;
  leaf: string;
};

/**
 * Топ- и листовая категория товара из categorySlugs.
 * Backend: [0]=top, [1]=leaf (latin). Mock: leaf ≠ top via parent map.
 * Orphan sale (пустые сегменты + isOnSale) → rasprodazha/rasprodazha.
 */
export function productCategorySlugs(
  product: Product,
  categories?: Category[],
): ProductCategoryPath {
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
