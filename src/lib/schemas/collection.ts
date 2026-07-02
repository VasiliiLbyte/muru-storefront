import { z } from "zod";

import { ImageSchema, SeoSchema } from "./common";

/**
 * Коллекция / лендинг ("Коллекции MURU").
 * Связь с товарами — через productSlugs (резолвится в API/моках).
 */
export const CollectionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  heroImage: ImageSchema.optional(),
  productSlugs: z.array(z.string()).optional(),
  seo: SeoSchema,
  external_id: z.string().optional(),
});
export type Collection = z.infer<typeof CollectionSchema>;
