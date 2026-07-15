import { z } from "zod";

import { ImageSchema, SeoSchema } from "./common";

/** Товар в hotspot (публичный DTO из E1). */
export const HotspotProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  price: z.number(),
  salePrice: z.number().optional(),
  image: z.string().optional(),
  slug: z.string(),
});
export type HotspotProduct = z.infer<typeof HotspotProductSchema>;

/** Hotspot на cover лукбука. */
export const HotspotSchema = z.object({
  id: z.string(),
  xPercent: z.number(),
  yPercent: z.number(),
  sortOrder: z.number(),
  product: HotspotProductSchema,
});
export type Hotspot = z.infer<typeof HotspotSchema>;

/**
 * Лукбук ("Вдохновение") — галерея изображений с обложкой.
 */
export const LookbookSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  cover: ImageSchema.optional(),
  images: z.array(ImageSchema),
  hotspots: z.array(HotspotSchema).optional(),
  seo: SeoSchema,
  external_id: z.string().optional(),
});
export type Lookbook = z.infer<typeof LookbookSchema>;
