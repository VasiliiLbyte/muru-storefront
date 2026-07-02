import { z } from "zod";

import { applyProductListQuery } from "@/mocks/resolve";
import {
  collectionBySlug,
  collections,
  lookbookBySlug,
  lookbooks,
  staticPageBySlug,
} from "@/lib/content";
import {
  AddressSuggestionSchema,
  CategorySchema,
  CdekCalcResultSchema,
  CdekCitySchema,
  CdekPvzSchema,
  ProductListQuerySchema,
  ProductListResponseSchema,
  ProductSchema,
  WebCheckoutSchema,
  WebPaymentCreateResponseSchema,
  WebPaymentStatusResponseSchema,
  type AddressSuggestion,
  type Category,
  type CdekCalcResult,
  type CdekCity,
  type CdekPvz,
  type Collection,
  type Lookbook,
  type Product,
  type ProductListQueryInput,
  type ProductListResponse,
  type StaticPage,
  type WebCheckoutInput,
  type WebPaymentCreateResponse,
  type WebPaymentStatusResponse,
} from "@/lib/schemas";

import {
  fetchCatalogProductBySku,
  fetchCatalogProducts,
  fetchCatalogTree,
  isCatalogBackendEnabled,
} from "./catalog-backend";
import { apiEnvelopeFetch, apiFetch, ApiError, buildQuery } from "./client";

/** Все категории каталога. */
export function getCategories(): Promise<Category[]> {
  if (isCatalogBackendEnabled()) {
    return fetchCatalogTree();
  }
  return apiFetch("/categories", z.array(CategorySchema));
}

/** Категория по slug. */
export async function getCategory(slug: string): Promise<Category> {
  if (isCatalogBackendEnabled()) {
    const category = (await fetchCatalogTree()).find((c) => c.slug === slug);
    if (!category) {
      throw new ApiError(404, slug);
    }
    return category;
  }
  return apiFetch(`/categories/${encodeURIComponent(slug)}`, CategorySchema);
}

/** Листинг товаров с пагинацией/сортировкой/фильтрами. */
export async function getProducts(
  query?: ProductListQueryInput,
): Promise<ProductListResponse> {
  const parsed = ProductListQuerySchema.parse(query ?? {});

  if (isCatalogBackendEnabled()) {
    const all = await fetchCatalogProducts();
    return applyProductListQuery(all, parsed, { categoryFilter: "includes" });
  }

  return apiFetch(
    `/products${buildQuery(parsed)}`,
    ProductListResponseSchema,
  );
}

/** Товар по slug. */
export function getProduct(slug: string): Promise<Product> {
  if (isCatalogBackendEnabled()) {
    return fetchCatalogProductBySku(slug);
  }
  return apiFetch(`/products/${encodeURIComponent(slug)}`, ProductSchema);
}

/** Товар по артикулу (SKU) — для корзины. */
export function getProductBySku(sku: string): Promise<Product> {
  if (isCatalogBackendEnabled()) {
    return fetchCatalogProductBySku(sku);
  }
  return apiFetch(
    `/products/by-sku/${encodeURIComponent(sku)}`,
    ProductSchema,
  );
}

/** Все коллекции/лендинги. */
export function getCollections(): Promise<Collection[]> {
  return Promise.resolve(collections);
}

/** Коллекция по slug. */
export function getCollection(slug: string): Promise<Collection> {
  const item = collectionBySlug.get(slug);
  if (!item) throw new ApiError(404, slug);
  return Promise.resolve(item);
}

/** Все лукбуки. */
export function getLookbooks(): Promise<Lookbook[]> {
  return Promise.resolve(lookbooks);
}

/** Лукбук по slug. */
export function getLookbook(slug: string): Promise<Lookbook> {
  const item = lookbookBySlug.get(slug);
  if (!item) throw new ApiError(404, slug);
  return Promise.resolve(item);
}

/** Статическая страница по slug. */
export function getStaticPage(slug: string): Promise<StaticPage> {
  const page = staticPageBySlug.get(slug);
  if (!page) throw new ApiError(404, slug);
  return Promise.resolve(page);
}

/** Создать гостевой веб-платёж (ЮKassa + СДЭК). */
export function createWebPayment(
  payload: WebCheckoutInput,
): Promise<WebPaymentCreateResponse> {
  const body = WebCheckoutSchema.parse(payload);
  return apiEnvelopeFetch(
    "/payments/web/create",
    WebPaymentCreateResponseSchema,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

/** Статус гостевого веб-платежа. */
export function getWebPaymentStatus(
  paymentId: string,
): Promise<WebPaymentStatusResponse> {
  return apiEnvelopeFetch(
    `/payments/web/${encodeURIComponent(paymentId)}/status`,
    WebPaymentStatusResponseSchema,
  );
}

/** Поиск городов СДЭК. */
export function getCdekCities(q: string): Promise<CdekCity[]> {
  return apiEnvelopeFetch(
    `/cdek/cities${buildQuery({ q })}`,
    z.array(CdekCitySchema),
  );
}

/** Пункты выдачи СДЭК в городе. */
export function getCdekPvz(cityCode: number): Promise<CdekPvz[]> {
  return apiEnvelopeFetch(
    `/cdek/pickup-points${buildQuery({ cityCode })}`,
    z.array(CdekPvzSchema),
  );
}

/** Подсказки адреса СДЭК. */
export function getCdekAddressSuggestions(
  q: string,
  city?: string,
): Promise<AddressSuggestion[]> {
  return apiEnvelopeFetch(
    `/cdek/address-suggest${buildQuery({ q, city })}`,
    z.array(AddressSuggestionSchema),
  );
}

/** Расчёт тарифов СДЭК для веб-чекаута. */
export function calculateCdekWeb(input: {
  toCityCode: number;
  items: Array<{ sku: string; quantity: number }>;
}): Promise<CdekCalcResult> {
  return apiEnvelopeFetch("/cdek/web/calculate", CdekCalcResultSchema, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
