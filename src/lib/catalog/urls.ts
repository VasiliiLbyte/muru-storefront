import type { Product } from "@/lib/schemas";
import { isCatalogBackendEnabled } from "@/lib/api/catalog-backend";
import { topCategorySlugOf } from "@/lib/catalog/catalog-nav";
import type { Category } from "@/lib/schemas";

export type ProductCategoryPath = {
  top: string;
  leaf: string;
};

/**
 * Топ- и листовая категория товара из categorySlugs.
 * Backend: [0]=top, [1]=leaf (latin). Mock: leaf ≠ top via parent map.
 */
export function productCategorySlugs(
  product: Product,
  categories?: Category[],
): ProductCategoryPath {
  if (isCatalogBackendEnabled() || !categories?.length) {
    const top = product.categorySlugs[0] ?? "";
    const leaf = product.categorySlugs[1] ?? product.categorySlugs[0] ?? "";
    return { top, leaf };
  }

  const leaf =
    product.categorySlugs.find((s) => {
      const top = topCategorySlugOf(s, categories);
      return product.categorySlugs.includes(top) && s !== top;
    }) ?? product.categorySlugs[0];
  const top = topCategorySlugOf(leaf, categories);
  return { top, leaf };
}

/**
 * Канонический URL карточки товара: /catalog/{top}/{leaf}/{slug}/.
 */
export function productHref(
  product: Product,
  categories?: Category[],
): string {
  const { top, leaf } = productCategorySlugs(product, categories);
  return `/catalog/${top}/${leaf}/${product.slug}/`;
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
