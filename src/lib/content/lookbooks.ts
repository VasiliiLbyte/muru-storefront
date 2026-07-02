import type { Lookbook } from "@/lib/schemas";

import { makeImage } from "./placeholders";

/**
 * Лукбуки ("Вдохновение") — нейтральные плейсхолдеры.
 */
const DEFS: { slug: string; title: string }[] = [
  { slug: "utro-na-kukhne", title: "Утро на кухне" },
  { slug: "tikhiy-vecher", title: "Тихий вечер" },
  { slug: "zelenyy-ugolok", title: "Зелёный уголок" },
];

export const lookbooks: Lookbook[] = DEFS.map((def) => ({
  id: `lb-${def.slug}`,
  slug: def.slug,
  title: def.title,
  description: `${def.title}: визуальная история-плейсхолдер для раздела «Вдохновение».`,
  cover: makeImage(def.title),
  images: Array.from({ length: 6 }, (_, i) =>
    makeImage(`${def.title} — кадр ${i + 1}`),
  ),
  seo: {
    title: `${def.title} — MURU`,
    description: `${def.title}: вдохновение MURU.`,
  },
  external_id: `1c-lb-${def.slug}`,
}));

export const lookbookBySlug = new Map<string, Lookbook>(
  lookbooks.map((l) => [l.slug, l]),
);
