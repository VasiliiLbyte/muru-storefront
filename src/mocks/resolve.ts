import {
  ProductListQuerySchema,
  type Facet,
  type Product,
  type ProductListQuery,
  type ProductListResponse,
} from "@/lib/schemas";

import {
  categories,
  categoryBySlug,
  collectionBySlug,
  collections,
  descendantSlugs,
  lookbookBySlug,
  lookbooks,
  productBySku,
  productBySlug,
  products,
  staticPageBySlug,
} from "./fixtures";

/**
 * Единый источник логики моков. Используется и MSW-хендлерами (браузер/тесты),
 * и серверным резолвером (RSC в dev — см. src/lib/api/client.ts), чтобы данные
 * и фильтрация/сортировка были идентичны во всех средах.
 */

export function sortProducts(list: Product[], sort: string): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "discount":
      return copy.sort(
        (a, b) =>
          (b.oldPrice ? b.oldPrice - b.price : 0) -
          (a.oldPrice ? a.oldPrice - a.price : 0),
      );
    case "new":
      return copy.sort((a, b) => b.slug.localeCompare(a.slug));
    case "popular":
    default:
      return copy.sort((a, b) => a.slug.localeCompare(b.slug));
  }
}

export function buildFacets(list: Product[]): Facet[] {
  const countBy = (values: (p: Product) => string[]) => {
    const map = new Map<string, number>();
    for (const p of list) {
      for (const v of values(p)) map.set(v, (map.get(v) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, label: value, count }));
  };

  const materialOptions = countBy((p) =>
    p.attributes.material ? [p.attributes.material] : [],
  );
  const colorOptions = countBy((p) => p.attributes.color ?? []);

  const facets: Facet[] = [];
  if (materialOptions.length)
    facets.push({ key: "material", label: "Материал", options: materialOptions });
  if (colorOptions.length)
    facets.push({ key: "color", label: "Цвет", options: colorOptions });
  return facets;
}

export type ProductListCategoryFilter = "descendants" | "includes";

export function applyProductListQuery(
  all: Product[],
  query: ProductListQuery,
  options?: { categoryFilter?: ProductListCategoryFilter },
): ProductListResponse {
  const categoryFilter = options?.categoryFilter ?? "descendants";

  let list = all;
  if (query.category) {
    if (categoryFilter === "includes") {
      list = list.filter((p) => p.categorySlugs.includes(query.category!));
    } else {
      const allowed = new Set(descendantSlugs(query.category));
      list = list.filter((p) => p.categorySlugs.some((c) => allowed.has(c)));
    }
  }
  if (query.subcategory) {
    list = list.filter((p) => p.categorySlugs.includes(query.subcategory!));
  }
  if (query.inStock) list = list.filter((p) => p.inStock);
  if (query.onSale) list = list.filter((p) => p.isOnSale);
  if (query.minPrice !== undefined)
    list = list.filter((p) => p.price >= query.minPrice!);
  if (query.maxPrice !== undefined)
    list = list.filter((p) => p.price <= query.maxPrice!);
  if (query.material)
    list = list.filter((p) => p.attributes.material === query.material);
  if (query.color)
    list = list.filter((p) => p.attributes.color?.includes(query.color!));

  const facets = buildFacets(list);
  const sorted = sortProducts(list, query.sort ?? "popular");

  const total = sorted.length;
  const start = (query.page - 1) * query.pageSize;
  const items = sorted.slice(start, start + query.pageSize);

  return { items, total, page: query.page, pageSize: query.pageSize, facets };
}

/** Фильтрация/сортировка/пагинация/фасеты листинга товаров. */
export function listProducts(sp: URLSearchParams): ProductListResponse {
  const query = ProductListQuerySchema.parse({
    category: sp.get("category") ?? undefined,
    subcategory: sp.get("subcategory") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    page: sp.get("page") ?? undefined,
    pageSize: sp.get("pageSize") ?? undefined,
    inStock: sp.get("inStock") ?? undefined,
    onSale: sp.get("onSale") ?? undefined,
    minPrice: sp.get("minPrice") ?? undefined,
    maxPrice: sp.get("maxPrice") ?? undefined,
    material: sp.get("material") ?? undefined,
    color: sp.get("color") ?? undefined,
  });

  return applyProductListQuery(products, query, {
    categoryFilter: "descendants",
  });
}

/**
 * Серверный резолвер моков (без HTTP) для Server Components в dev.
 * Возвращает данные или `undefined` (→ 404). Путь — как у api-клиента
 * (например, "/products?sort=new" или "/categories/vazy-i-aksessuary").
 */
export async function resolveMock(
  path: string,
  init?: RequestInit,
): Promise<unknown | undefined> {
  const [rawPath, rawQuery = ""] = path.split("?");
  const segments = rawPath.split("/").filter(Boolean);
  const sp = new URLSearchParams(rawQuery);

  if (segments[0] === "products" && segments[1] === "by-sku" && segments[2]) {
    const sku = decodeURIComponent(segments[2]);
    return productBySku.get(sku);
  }

  const slug = segments[1] ? decodeURIComponent(segments[1]) : undefined;

  switch (segments[0]) {
    case "categories":
      return slug ? categoryBySlug.get(slug) : categories;
    case "products":
      return slug ? productBySlug.get(slug) : listProducts(sp);
    case "collections":
      return slug ? collectionBySlug.get(slug) : collections;
    case "lookbooks":
      return slug ? lookbookBySlug.get(slug) : lookbooks;
    case "pages":
      return slug ? staticPageBySlug.get(slug) : undefined;
    default:
      return undefined;
  }
}
