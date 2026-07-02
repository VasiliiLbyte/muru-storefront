import type { Collection } from "@/lib/schemas";

import { makeImage } from "./placeholders";

/**
 * Коллекции / лендинги (нейтральные плейсхолдеры).
 */
const DEFS: { slug: string; title: string; subtitle: string }[] = [
  { slug: "leto-v-dome", title: "Лето в доме", subtitle: "Сезонная подборка" },
  {
    slug: "naturalnyy-minimalizm",
    title: "Натуральный минимализм",
    subtitle: "Спокойные фактуры",
  },
  {
    slug: "podarki-blizkim",
    title: "Подарки близким",
    subtitle: "Идеи для подарка",
  },
];

export const collections: Collection[] = DEFS.map((def) => ({
  id: `col-${def.slug}`,
  slug: def.slug,
  title: def.title,
  subtitle: def.subtitle,
  description: `${def.title}: нейтральная подборка-плейсхолдер из ассортимента MURU.`,
  heroImage: makeImage(def.title),
  // TODO: заполнить реальными SKU после согласования контента с заказчиком.
  productSlugs: [],
  seo: {
    title: `${def.title} — MURU`,
    description: `${def.title}: коллекция MURU.`,
  },
  external_id: `1c-col-${def.slug}`,
}));

export const collectionBySlug = new Map<string, Collection>(
  collections.map((c) => [c.slug, c]),
);
