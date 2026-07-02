import type { Product } from "@/lib/schemas";
import { isCatalogBackendEnabled } from "@/lib/api/catalog-backend";
import { topCategoryOf } from "@/lib/taxonomy";

export type ProductCategoryPath = {
  top: string;
  leaf: string;
};

/** Топ- и листовая категория товара из categorySlugs. */
export function productCategorySlugs(product: Product): ProductCategoryPath {
  if (isCatalogBackendEnabled()) {
    const top = product.categorySlugs[0] ?? "";
    const leaf = product.categorySlugs[1] ?? product.categorySlugs[0] ?? "";
    return { top, leaf };
  }

  const leaf =
    product.categorySlugs.find((s) => {
      const top = topCategoryOf(s);
      return product.categorySlugs.includes(top) && s !== top;
    }) ?? product.categorySlugs[0];
  const top = topCategoryOf(leaf);
  return { top, leaf };
}

/**
 * Канонический URL карточки товара: /catalog/{top}/{leaf}/{slug}/.
 */
export function productHref(product: Product): string {
  const { top, leaf } = productCategorySlugs(product);
  return `/catalog/${top}/${leaf}/${product.slug}/`;
}

/** Сверка сегментов URL с каноническим путём товара. */
export function productPathMatches(
  product: Product,
  segments: string[],
): boolean {
  if (segments.length !== 3) return false;
  const { top, leaf } = productCategorySlugs(product);
  return (
    segments[0] === top &&
    segments[1] === leaf &&
    segments[2] === product.slug
  );
}
