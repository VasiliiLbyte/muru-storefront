import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import { HomeBanner } from "@/components/home/home-banner";
import { getCollections, getLookbooks } from "@/lib/api/endpoints";
import { catalogHref } from "@/lib/site";

import { buildPageMetadata } from "@/lib/seo/page-metadata";

const HOME_TITLE = "MURU — натуральный декор и предметы интерьера для дома";
const HOME_DESCRIPTION =
  "MURU — интернет-магазин предметов декора для дома: домашний текстиль, аксессуары, композиции из природных материалов. Атмосфера уюта и спокойствия.";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
    titleAbsolute: true,
  });
}

// ISR: страница пересобирается раз в 5 минут (в dev данные из MSW-моков).
export const revalidate = 300;

export default async function Home() {
  const [collections, lookbooks] = await Promise.all([
    getCollections(),
    getLookbooks(),
  ]);

  const newsImage = collections[0]?.heroImage ?? "/placeholders/hero.svg";
  const inspImage = lookbooks[0]?.cover ?? "/placeholders/hero.svg";

  return (
    <main id="main" className="flex flex-1 flex-col">
      <Hero />

      <HomeBanner
        title="Новинки"
        subtitle="Свежие идеи вашего интерьера"
        href="/landings/"
        image={newsImage}
        overlay="card"
      />

      <HomeBanner
        title="Коллекции MURU"
        subtitle="Аксессуары для дома, которые создают атмосферу"
        href={catalogHref.root}
        image="/placeholders/hero.svg"
        overlay="card"
      />

      <HomeBanner
        title="Вдохновение"
        subtitle="Идеи для уюта и стильной сервировки"
        href="/lookbooks/"
        image={inspImage}
        overlay="card"
      />

      <HomeBanner
        title="О нас"
        subtitle="MURU — интернет-магазин предметов декора для дома и эстетики пространства. Мы бережно собираем коллекции вещей: домашний текстиль, аксессуары для дома и композиции из сухоцветов. Всё то, что создаёт атмосферу уюта и спокойствия в вашем доме."
        href="/company/"
        image="/placeholders/hero.svg"
        overlay="scrim"
        ctaLabel="Подробнее"
      />
    </main>
  );
}
