import { z } from "zod";

import { ImageSchema } from "./common";

/** Баннер главной страницы (публичный DTO из GET /api/content/banners). */
export const HomeBannerSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  href: z.string().optional(),
  image: ImageSchema.optional(),
  sortOrder: z.number().int(),
});
export type HomeBanner = z.infer<typeof HomeBannerSchema>;
