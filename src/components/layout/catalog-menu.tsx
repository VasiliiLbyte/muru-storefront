import { getCategories } from "@/lib/api/endpoints";
import { isCatalogBackendEnabled } from "@/lib/api/catalog-backend";
import { catalogHref } from "@/lib/site";
import { taxonomy } from "@/lib/taxonomy";

import { CatalogMenuPanel } from "./catalog-menu-panel";

/**
 * Десктопное меню «Каталог».
 * Live-бэк: топ-категории из API. Mock: taxonomy верхнего уровня.
 */
export async function CatalogMenu() {
  const catalogItems = isCatalogBackendEnabled()
    ? (await getCategories())
        .filter((c) => !c.parentSlug)
        .map((c) => ({ label: c.title, href: catalogHref.top(c.slug) }))
    : taxonomy.map((node) => ({
        label: node.title,
        href: catalogHref.top(node.slug),
      }));

  return <CatalogMenuPanel catalogItems={catalogItems} />;
}
