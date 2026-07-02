import { catalogHref } from "@/lib/site";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import type { Category, Product } from "@/lib/schemas";
import { productCategorySlugs, productHref } from "@/lib/catalog/urls";

function catalogBreadcrumbBase(): BreadcrumbItem[] {
  return [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: catalogHref.root },
  ];
}

/** Хлебные крошки для карточки товара. */
export function buildProductBreadcrumbs(
  product: Product,
  categories: Category[],
): BreadcrumbItem[] {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const { top, leaf } = productCategorySlugs(product);
  const items = catalogBreadcrumbBase();

  const topCat = bySlug.get(top);
  if (topCat) {
    items.push({
      name: topCat.title,
      href: catalogHref.top(top),
    });
  }

  if (leaf !== top) {
    const leafCat = bySlug.get(leaf);
    if (leafCat) {
      items.push({
        name: leafCat.title,
        href: catalogHref.sub(top, leaf),
      });
    }
  }

  items.push({
    name: product.title,
    href: productHref(product),
  });

  return items;
}
