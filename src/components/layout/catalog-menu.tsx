import { getCategories } from "@/lib/api/endpoints";
import { toSentenceCaseRu } from "@/lib/content/breadcrumbs";
import { catalogHref } from "@/lib/site";

import { CatalogMenuPanel } from "./catalog-menu-panel";

/**
 * Десктопное меню «Каталог» — топ-категории из API / MSW.
 */
export async function CatalogMenu() {
  let catalogItems: { label: string; href: string }[] = [];

  try {
    catalogItems = (await getCategories())
      .filter((c) => !c.parentSlug)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({
        label: toSentenceCaseRu(c.title),
        href: catalogHref.top(c.slug),
      }));
  } catch (err) {
    console.warn(
      "[catalog-menu] categories fetch failed, rendering empty menu",
      err,
    );
  }

  return <CatalogMenuPanel catalogItems={catalogItems} />;
}
