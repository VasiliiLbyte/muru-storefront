import {
  ProductListQuerySchema,
  type ProductListQueryInput,
} from "@/lib/schemas";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Парсит URL searchParams в контракт листинга (Zod coerce + дефолты). */
export function parseListingSearchParams(
  searchParams: SearchParams,
): ProductListQueryInput {
  return ProductListQuerySchema.parse({
    sort: first(searchParams.sort),
    page: first(searchParams.page),
    pageSize: first(searchParams.pageSize),
    inStock: first(searchParams.inStock),
    onSale: first(searchParams.onSale),
    minPrice: first(searchParams.minPrice),
    maxPrice: first(searchParams.maxPrice),
    material: first(searchParams.material),
    color: first(searchParams.color),
  });
}

/** Собирает query-строку для пагинации/фильтров (без category/subcategory). */
export function listingQueryString(
  query: ProductListQueryInput,
  page?: number,
): string {
  const params = new URLSearchParams();
  if (query.sort && query.sort !== "popular") params.set("sort", query.sort);
  if (query.inStock) params.set("inStock", "true");
  if (query.onSale) params.set("onSale", "true");
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.material) params.set("material", query.material);
  if (query.color) params.set("color", query.color);
  const pageNum =
    typeof page === "number" ? page : typeof query.page === "number" ? query.page : 1;
  if (pageNum > 1) params.set("page", String(pageNum));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
