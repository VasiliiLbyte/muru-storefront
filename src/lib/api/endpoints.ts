import { z } from "zod";

import { getAccessToken } from "@/lib/account/session";
import { applyProductListQuery } from "@/mocks/resolve";
import { buildFallbackHomeBanners } from "@/lib/content/home-banners";
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
  type HomeBanner,
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
import {
  fetchContentBanners,
  fetchContentCollection,
  fetchContentCollections,
  fetchContentLookbook,
  fetchContentLookbooks,
  fetchContentPage,
  isContentBackendEnabled,
} from "./content-backend";
import { apiEnvelopeFetch, apiFetch, ApiError, buildQuery } from "./client";
import { buildWebPaymentRequestInit } from "./web-payment-auth";

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
export async function getCollections(): Promise<Collection[]> {
  if (isContentBackendEnabled()) {
    try {
      return await fetchContentCollections();
    } catch (err) {
      console.warn(
        "[content] collections fetch failed, using static fallback",
        err,
      );
    }
  }
  return collections;
}

/** Коллекция по slug. */
export async function getCollection(slug: string): Promise<Collection> {
  if (isContentBackendEnabled()) {
    try {
      return await fetchContentCollection(slug);
    } catch (err) {
      console.warn(
        `[content] collection "${slug}" fetch failed, using static fallback`,
        err,
      );
    }
  }
  const item = collectionBySlug.get(slug);
  if (!item) throw new ApiError(404, slug);
  return item;
}

/** Все лукбуки. */
export async function getLookbooks(): Promise<Lookbook[]> {
  if (isContentBackendEnabled()) {
    try {
      return await fetchContentLookbooks();
    } catch (err) {
      console.warn(
        "[content] lookbooks fetch failed, using static fallback",
        err,
      );
    }
  }
  return lookbooks;
}

/** Лукбук по slug. */
export async function getLookbook(slug: string): Promise<Lookbook> {
  if (isContentBackendEnabled()) {
    try {
      return await fetchContentLookbook(slug);
    } catch (err) {
      console.warn(
        `[content] lookbook "${slug}" fetch failed, using static fallback`,
        err,
      );
    }
  }
  const item = lookbookBySlug.get(slug);
  if (!item) throw new ApiError(404, slug);
  return item;
}

/** Статическая страница по slug. */
export async function getStaticPage(slug: string): Promise<StaticPage> {
  if (isContentBackendEnabled()) {
    try {
      return await fetchContentPage(slug);
    } catch (err) {
      console.warn(
        `[content] page "${slug}" fetch failed, using static fallback`,
        err,
      );
    }
  }
  const page = staticPageBySlug.get(slug);
  if (!page) throw new ApiError(404, slug);
  return page;
}

/** Баннеры главной страницы. */
export async function getHomeBanners(): Promise<HomeBanner[]> {
  if (isContentBackendEnabled()) {
    try {
      const banners = await fetchContentBanners();
      if (banners.length > 0) {
        return banners;
      }
      console.warn("[content] banners API returned empty, using static fallback");
    } catch (err) {
      console.warn("[content] banners fetch failed, using static fallback", err);
    }
  }
  return buildFallbackHomeBanners(collections, lookbooks);
}

/** Создать веб-платёж (ЮKassa + СДЭК). Bearer — если покупатель залогинен. */
export function createWebPayment(
  payload: WebCheckoutInput,
): Promise<WebPaymentCreateResponse> {
  const body = WebCheckoutSchema.parse(payload);
  return apiEnvelopeFetch(
    "/payments/web/create",
    WebPaymentCreateResponseSchema,
    buildWebPaymentRequestInit(JSON.stringify(body), getAccessToken()),
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
