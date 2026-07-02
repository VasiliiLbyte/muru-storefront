import { z } from "zod";

import { ImageSchema, SeoSchema } from "./common";

/**
 * Категория каталога. Дерево (parentSlug) зеркалит taxonomy.
 * external_id — мост к 1С/CommerceML (идентификатор раздела в учётной системе).
 */
export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  parentSlug: z.string().optional(),
  sortOrder: z.number().int().default(0),
  seo: SeoSchema,
  image: ImageSchema.optional(),
  external_id: z.string().optional(),
});
export type Category = z.infer<typeof CategorySchema>;
