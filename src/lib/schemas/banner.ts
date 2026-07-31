import { z } from "zod";

import { ImageSchema } from "./common";

/** Баннер главной страницы (публичный DTO из GET /api/content/banners). */
export const HomeBannerSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  href: z.string().optional(),
  image: ImageSchema.optional(),
  /** Optional looping background video; `image` is the poster. */
  video: z
    .object({
      url: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      durationSec: z.number().optional(),
      mime: z.string().optional(),
    })
    .optional(),
  sortOrder: z.number().int(),
});
export type HomeBanner = z.infer<typeof HomeBannerSchema>;
