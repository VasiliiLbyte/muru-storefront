import { z } from "zod";

import { SeoSchema } from "./common";

/**
 * Статическая контентная страница (О нас, Реквизиты, Юр. страницы и т.п.).
 * body — HTML/Markdown-строка (наполнение из CMS/плейсхолдеров, не скрейп).
 */
export const StaticPageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  body: z.string(),
  seo: SeoSchema,
  updatedAt: z.string().datetime().optional(),
});
export type StaticPage = z.infer<typeof StaticPageSchema>;
