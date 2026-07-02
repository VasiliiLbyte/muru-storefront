import { z } from "zod";

/**
 * Общие строительные блоки контракта данных MURU.
 *
 * Контракт — north star для будущего backend/CRM. Поля проектируются
 * 1С/CommerceML-ready (см. external_id/unit/sku в сущностях). Все ответы API
 * валидируются этими схемами на рантайме (src/lib/api).
 */

/** SEO-метаданные сущности (используется в Category/Product/Collection/...). */
export const SeoSchema = z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string().url().optional(),
});
export type Seo = z.infer<typeof SeoSchema>;

/** Изображение с данными для next/image (blur-плейсхолдер, размеры). */
export const ImageSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  blurDataURL: z.string().optional(),
});
export type Image = z.infer<typeof ImageSchema>;

/** Валюта. v1 — только рубли; enum оставляет место под расширение. */
export const CurrencySchema = z.enum(["RUB"]).default("RUB");
export type Currency = z.infer<typeof CurrencySchema>;

/**
 * Единица измерения товара (CommerceML-ready).
 * pcs — штука, set — комплект/набор, kg — килограмм, m — метр, l — литр.
 */
export const UnitSchema = z.enum(["pcs", "set", "kg", "m", "l"]).default("pcs");
export type Unit = z.infer<typeof UnitSchema>;

/** Параметры пагинации, общие для листингов. */
export const PaginationSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});
export type Pagination = z.infer<typeof PaginationSchema>;
