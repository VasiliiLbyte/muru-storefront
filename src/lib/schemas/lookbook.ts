import { z } from "zod";

import { ImageSchema, SeoSchema } from "./common";

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
  seo: SeoSchema,
  external_id: z.string().optional(),
});
export type Lookbook = z.infer<typeof LookbookSchema>;
