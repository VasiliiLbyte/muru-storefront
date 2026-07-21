import { z } from "zod";

import { ImageSchema, SeoSchema } from "./common";

const CompanyHeroSectionSchema = z.object({
  heading: z.string(),
  text: z.string(),
  image: ImageSchema.nullable().optional(),
});

const CompanyMissionSectionSchema = z.object({
  label: z.string().optional(),
  heading: z.string(),
  text: z.string(),
  images: z.array(ImageSchema).max(2).optional(),
});

const CompanyPromoCardSchema = z.object({
  key: z.string(),
  title: z.string(),
  text: z.string(),
});

const CompanyPromoSectionSchema = z.object({
  image: ImageSchema.nullable().optional(),
  cards: z.array(CompanyPromoCardSchema),
});

export const CompanySectionsSchema = z.object({
  hero: CompanyHeroSectionSchema.optional(),
  mission: CompanyMissionSectionSchema.optional(),
  promo: CompanyPromoSectionSchema.optional(),
});
export type CompanySections = z.infer<typeof CompanySectionsSchema>;

/**
 * Статическая контентная страница (О нас, Реквизиты, Юр. страницы и т.п.).
 * body — HTML/Markdown-строка (наполнение из CMS/плейсхолдеров, не скрейп).
 */
export const StaticPageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  body: z.string(),
  heroImage: ImageSchema.nullable().optional(),
  sections: CompanySectionsSchema.nullable().optional(),
  seo: SeoSchema,
  updatedAt: z.string().datetime().optional(),
});
export type StaticPage = z.infer<typeof StaticPageSchema>;
