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
  images: z.array(ImageSchema.nullable()).max(2).optional(),
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

const VacancyHrSchema = z.object({
  heading: z.string(),
  contactName: z.string(),
  phone: z.string(),
  email: z.string(),
});

const VacancyItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string(),
  experience: z.string(),
  format: z.string(),
  salary: z.string(),
  description: z.string(),
});

const VacancyListSchema = z.object({
  heading: z.string(),
  items: z.array(VacancyItemSchema),
});

/** Vacancy page sections — `hr` + `vacancies` required for union discrimination. */
export const VacancySectionsSchema = z.object({
  hero: CompanyHeroSectionSchema.optional(),
  hr: VacancyHrSchema,
  vacancies: VacancyListSchema,
});
export type VacancySections = z.infer<typeof VacancySectionsSchema>;

/** Partners page sections — only `hero`; strict so company payloads don't match. */
export const PartnersSectionsSchema = z
  .object({ hero: CompanyHeroSectionSchema })
  .strict();
export type PartnersSections = z.infer<typeof PartnersSectionsSchema>;

/**
 * Company first would strip vacancy `hr`/`vacancies`. Vacancy-first requires those keys.
 * Partners (strict, hero-only) sits before Company so company `mission`/`promo` isn't stripped.
 */
export const PageSectionsSchema = z.union([
  VacancySectionsSchema,
  PartnersSectionsSchema,
  CompanySectionsSchema,
]);
export type PageSections = z.infer<typeof PageSectionsSchema>;

export function isVacancySections(
  sections: PageSections | null | undefined,
): sections is VacancySections {
  return (
    sections != null &&
    typeof sections === "object" &&
    "hr" in sections &&
    "vacancies" in sections
  );
}

export function isPartnersSections(
  sections: PageSections | null | undefined,
): sections is PartnersSections {
  return (
    sections != null &&
    typeof sections === "object" &&
    "hero" in sections &&
    !("hr" in sections) &&
    !("vacancies" in sections) &&
    !("mission" in sections) &&
    !("promo" in sections)
  );
}

export function isCompanySections(
  sections: PageSections | null | undefined,
): sections is CompanySections {
  return (
    sections != null &&
    !isVacancySections(sections) &&
    !isPartnersSections(sections)
  );
}

/**
 * Статическая контентная страница (О нас, Реквизиты, Юр. страницы и т.п.).
 * body — HTML/Markdown-строка (наполнение из CMS/плейсхолдеров, не скрейп).
 */
export const StaticPageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  body: z.string(),
  heroImage: ImageSchema.nullable().optional(),
  sections: PageSectionsSchema.nullable().optional(),
  seo: SeoSchema,
  updatedAt: z.string().datetime().optional(),
});
export type StaticPage = z.infer<typeof StaticPageSchema>;
