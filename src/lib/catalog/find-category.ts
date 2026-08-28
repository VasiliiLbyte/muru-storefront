import type { Category } from "@/lib/schemas";

export function findCategory(
  categories: Category[],
  slug: string,
  parentSlug?: string,
): Category | undefined {
  if (parentSlug) {
    return categories.find(
      (category) =>
        category.slug === slug && category.parentSlug === parentSlug,
    );
  }

  return categories.find(
    (category) => category.slug === slug && !category.parentSlug,
  );
}
