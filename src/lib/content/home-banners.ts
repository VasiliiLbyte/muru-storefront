import type { Collection, HomeBanner, Lookbook } from "@/lib/schemas";

import { catalogHref } from "@/lib/site";

/** Статические баннеры главной при недоступности API. */
export function buildFallbackHomeBanners(
  collections: Collection[],
  lookbooks: Lookbook[],
): HomeBanner[] {
  const newsImage = collections[0]?.heroImage;
  const inspImage = lookbooks[0]?.cover;

  return [
    {
      id: "fallback-news",
      title: "Новинки",
      subtitle: "Свежие идеи вашего интерьера",
      href: "/landings/",
      image: newsImage ?? { url: "/placeholders/hero.svg", alt: "" },
      sortOrder: 0,
    },
    {
      id: "fallback-collections",
      title: "Коллекции MURU",
      subtitle: "Аксессуары для дома, которые создают атмосферу",
      href: catalogHref.root,
      image: { url: "/placeholders/hero.svg", alt: "" },
      sortOrder: 1,
    },
    {
      id: "fallback-inspiration",
      title: "Вдохновение",
      subtitle: "Идеи для уюта и стильной сервировки",
      href: "/lookbooks/",
      image: inspImage ?? { url: "/placeholders/hero.svg", alt: "" },
      sortOrder: 2,
    },
    {
      id: "fallback-about",
      title: "О нас",
      subtitle:
        "MURU — интернет-магазин предметов декора для дома и эстетики пространства. Мы бережно собираем коллекции вещей: домашний текстиль, аксессуары для дома и композиции из сухоцветов. Всё то, что создаёт атмосферу уюта и спокойствия в вашем доме.",
      href: "/company/",
      image: { url: "/placeholders/hero.svg", alt: "" },
      sortOrder: 3,
    },
  ];
}

/** Баннер «О нас» в fallback — scrim-оверлей и кастомный CTA. */
export const FALLBACK_ABOUT_BANNER_ID = "fallback-about";
