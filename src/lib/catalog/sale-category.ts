export const SALE_CATEGORY_SLUG = "распродажа";
export const LEGACY_SALE_CATEGORY_SLUG = "rasprodazha";

export function isSaleCategorySlug(slug: string): boolean {
  const n = slug.normalize("NFC");
  return n === SALE_CATEGORY_SLUG || n === LEGACY_SALE_CATEGORY_SLUG;
}

export function saleCategoryHref(): string {
  return `/catalog/${SALE_CATEGORY_SLUG}/`;
}
