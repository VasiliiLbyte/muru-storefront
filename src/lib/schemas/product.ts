import { z } from "zod";

import { CurrencySchema, ImageSchema, SeoSchema, UnitSchema } from "./common";

/** Габариты товара. */
export const DimensionsSchema = z.object({
  l: z.number().nonnegative(),
  w: z.number().nonnegative(),
  h: z.number().nonnegative(),
  unit: z.enum(["cm", "mm", "m"]).default("cm"),
});
export type Dimensions = z.infer<typeof DimensionsSchema>;

/** Вес товара (для расчёта доставки / CommerceML). */
export const WeightSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(["g", "kg"]).default("kg"),
});
export type Weight = z.infer<typeof WeightSchema>;

/** Атрибуты товара. Все поля опциональны — наполнение придёт из CRM. */
export const ProductAttributesSchema = z.object({
  material: z.string().optional(),
  dimensions: DimensionsSchema.optional(),
  weight: WeightSchema.optional(),
  color: z.array(z.string()).optional(),
});
export type ProductAttributes = z.infer<typeof ProductAttributesSchema>;

/**
 * Товар.
 * CommerceML-ready: sku (артикул), unit (ед. изм.), external_id (id в 1С).
 */
export const ProductSchema = z.object({
  id: z.string(),
  sku: z.string(),
  slug: z.string(),
  title: z.string(),
  price: z.number().nonnegative(),
  oldPrice: z.number().nonnegative().optional(),
  currency: CurrencySchema,
  images: z.array(ImageSchema),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  attributes: ProductAttributesSchema.default({}),
  categorySlugs: z.array(z.string()),
  inStock: z.boolean(),
  isOnSale: z.boolean(),
  unit: UnitSchema,
  external_id: z.string().optional(),
  seo: SeoSchema,
});
export type Product = z.infer<typeof ProductSchema>;

/** Варианты сортировки листинга. */
export const ProductSortSchema = z
  .enum(["popular", "price-asc", "price-desc", "new", "discount"])
  .default("popular");
export type ProductSort = z.infer<typeof ProductSortSchema>;

/** Опция фасета (значение фильтра + количество товаров). */
export const FacetOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
});
export type FacetOption = z.infer<typeof FacetOptionSchema>;

/** Фасет (группа фильтра: материал, цвет и т.п.). */
export const FacetSchema = z.object({
  key: z.string(),
  label: z.string(),
  options: z.array(FacetOptionSchema),
});
export type Facet = z.infer<typeof FacetSchema>;

/**
 * Параметры запроса листинга. z.coerce — чтобы парсить строки из URLSearchParams
 * (page/pageSize/цены/флаги приходят строками).
 */
export const ProductListQuerySchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  sort: ProductSortSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(24),
  inStock: z.coerce.boolean().optional(),
  onSale: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
});
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;
/** Входной (до применения дефолтов) тип запроса — удобно для вызова getProducts. */
export type ProductListQueryInput = z.input<typeof ProductListQuerySchema>;

/** Ответ листинга с пагинацией и фасетами. */
export const ProductListResponseSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  facets: z.array(FacetSchema).optional(),
});
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
