import { z } from "zod";
import { cache } from "react";

import { findCategory } from "@/lib/catalog/find-category";
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
  type PublicRequisites,
  type PublicSiteContacts,
  type StaticPage,
  type WebCheckoutInput,
  type WebPaymentCreateResponse,
  type WebPaymentStatusResponse,
} from "@/lib/schemas";
import {
  normalizeMailtoHref,
  normalizeTelHref,
} from "@/lib/contact-href";
import {
  SITE_CONTACTS_FALLBACK,
  type SiteContacts,
} from "@/lib/site";

import {
  adaptProduct,
  buildCategorySlugMaps,
  fetchCatalogProductBySku,
  fetchCatalogProductBySlug,
  fetchCatalogProducts,
  fetchCatalogSearch,
  fetchCatalogSearchSuggest,
  fetchCatalogTree,
  fetchRawTree,
  isCatalogBackendEnabled,
  type SearchSuggestResult,
} from "./catalog-backend";
import {
  fetchContentBanners,
  fetchContentCollection,
  fetchContentCollections,
  fetchContentLookbook,
  fetchContentLookbooks,
  fetchContentPage,
  fetchRequisites,
  fetchSiteContacts,
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
export async function getCategory(
  slug: string,
  parentSlug?: string,
): Promise<Category> {
  if (isCatalogBackendEnabled()) {
    const category = findCategory(await fetchCatalogTree(), slug, parentSlug);
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

/** Товар по slug (публичный URL). */
export function getProduct(slug: string): Promise<Product> {
  if (isCatalogBackendEnabled()) {
    return fetchCatalogProductBySlug(slug);
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

function coalesceString(
  value: string | null | undefined,
  fallback: string,
): string {
  if (value == null) return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function adaptPublicSiteContacts(dto: PublicSiteContacts): SiteContacts {
  const fb = SITE_CONTACTS_FALLBACK;
  const email = coalesceString(dto.contactEmail, fb.email);
  const lat = dto.contactMapLat;
  const lng = dto.contactMapLng;
  return {
    address: coalesceString(dto.contactAddress, fb.address),
    phoneDisplay: coalesceString(dto.contactPhoneDisplay, fb.phoneDisplay),
    phoneHref: normalizeTelHref(
      coalesceString(dto.contactPhoneHref, fb.phoneHref),
    ),
    email,
    emailHref: normalizeMailtoHref(
      email ? `mailto:${email}` : fb.emailHref,
    ),
    hours: coalesceString(dto.contactHours, fb.hours),
    coordinates:
      lat != null && lng != null
        ? { lat, lng }
        : { ...fb.coordinates },
    mapZoom: dto.contactMapZoom ?? fb.mapZoom,
  };
}

/**
 * Контакты сайта: API при NEXT_PUBLIC_API_BASE, иначе / при ошибке — fallback.
 * Per-field coalesce: null/пустые поля не стирают fallback.
 * React.cache — дедуп layout + footer в одном RSC-запросе.
 */
export const getSiteContacts = cache(async (): Promise<SiteContacts> => {
  if (isContentBackendEnabled()) {
    try {
      const dto = await fetchSiteContacts();
      return adaptPublicSiteContacts(dto);
    } catch (err) {
      console.warn(
        "[content] site-contacts fetch failed, using static fallback",
        err,
      );
    }
  }
  return { ...SITE_CONTACTS_FALLBACK, coordinates: { ...SITE_CONTACTS_FALLBACK.coordinates } };
});

export type RequisiteRow = { label: string; value: string };

/** Статический fallback — нейтральные плейсхолдеры (как в прежней таблице). */
const REQUISITES_FALLBACK: RequisiteRow[] = [
  { label: "Полное наименование", value: "Индивидуальный предприниматель Плейсхолдер А. А." },
  { label: "Сокращённое наименование", value: "ИП Плейсхолдер" },
  { label: "ИНН", value: "000000000000" },
  { label: "ОГРНИП", value: "000000000000000" },
  {
    label: "Юридический адрес",
    value: "000000, г. Санкт-Петербург, ул. Примерная, д. 1, кв. 1",
  },
  {
    label: "Фактический адрес",
    value: "192102, г. Санкт-Петербург, ул. Дубровская д.13, литера А, пом.27",
  },
  { label: "Телефон, факс", value: "+7 (812) 000-00-00" },
  { label: "Электронная почта", value: "hello@muru.ru" },
  { label: "Сайт", value: "muru.ru" },
  {
    label: "Банковские реквизиты",
    value:
      "БИК 000000000 Р/с №00000000000000000000 в Банк-плейсхолдер, Кор/счёт 00000000000000000000",
  },
];

const REQUISITE_FIELD_BY_LABEL: Record<string, keyof PublicRequisites> = {
  "Полное наименование": "reqFullName",
  "Сокращённое наименование": "reqShortName",
  ИНН: "reqInn",
  ОГРНИП: "reqOgrnip",
  "Юридический адрес": "reqLegalAddress",
  "Фактический адрес": "reqActualAddress",
  "Телефон, факс": "reqPhone",
  "Электронная почта": "reqEmail",
  Сайт: "reqSite",
  "Банковские реквизиты": "reqBankDetails",
};

function adaptPublicRequisites(dto: PublicRequisites): RequisiteRow[] {
  return REQUISITES_FALLBACK.map((row) => {
    const field = REQUISITE_FIELD_BY_LABEL[row.label];
    return {
      label: row.label,
      value: field ? coalesceString(dto[field], row.value) : row.value,
    };
  });
}

/**
 * Реквизиты: API при NEXT_PUBLIC_API_BASE, иначе / при ошибке — fallback.
 * Labels и порядок фиксированы; values — per-field coalesce.
 */
export const getRequisites = cache(async (): Promise<RequisiteRow[]> => {
  if (isContentBackendEnabled()) {
    try {
      const dto = await fetchRequisites();
      return adaptPublicRequisites(dto);
    } catch (err) {
      console.warn(
        "[content] requisites fetch failed, using static fallback",
        err,
      );
    }
  }
  return REQUISITES_FALLBACK.map((row) => ({ ...row }));
});

/** Ответ POST /payments/web/promo/validate. */
export const PromoValidateResponseSchema = z.discriminatedUnion("valid", [
  z.object({
    valid: z.literal(true),
    promoCodeId: z.number(),
    code: z.string(),
    discountType: z.enum(["percent", "fixed"]),
    discountValue: z.number(),
  }),
  z.object({
    valid: z.literal(false),
    reason: z.string(),
  }),
]);
export type PromoValidateResponse = z.infer<typeof PromoValidateResponseSchema>;

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

/** Проверка промокода для web-checkout. Bearer — если покупатель залогинен. */
export function validateWebPromo(
  code: string,
  subtotal: number,
): Promise<PromoValidateResponse> {
  return apiEnvelopeFetch(
    "/payments/web/promo/validate",
    PromoValidateResponseSchema,
    buildWebPaymentRequestInit(
      JSON.stringify({ code, subtotal }),
      getAccessToken(),
    ),
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

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/** Ranked search results (SSR — for /search/ page). */
export async function searchProducts(params: {
  q: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Product[]; total: number; page: number; pageSize: number }> {
  if (!isCatalogBackendEnabled()) {
    return { items: [], total: 0, page: params.page ?? 1, pageSize: params.pageSize ?? 24 };
  }

  const [nodes, result] = await Promise.all([
    fetchRawTree(),
    fetchCatalogSearch(params),
  ]);
  const maps = buildCategorySlugMaps(nodes);
  return {
    items: result.items.map((item) => adaptProduct(item, maps)),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

/** Autocomplete suggest (used by BFF proxy, not client-direct). */
export async function getSearchSuggestions(
  q: string,
): Promise<SearchSuggestResult> {
  if (!isCatalogBackendEnabled()) {
    return { products: [], categories: [] };
  }
  return fetchCatalogSearchSuggest(q);
}
