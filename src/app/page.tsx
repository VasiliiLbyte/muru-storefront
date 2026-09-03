import type { Metadata } from "next";
import type { ReactNode } from "react";

import { HomeBanner } from "@/components/home/home-banner";
import { HomeCategoryTiles } from "@/components/home/home-category-tiles";
import { getHomeBanners } from "@/lib/api/endpoints";
import { FALLBACK_ABOUT_BANNER_ID } from "@/lib/content/home-banners";

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
  const banners = (await getHomeBanners()).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  // Плитка категорий идёт сразу после баннера «Новинки» (HOME-001).
  const novinkiIndex = banners.findIndex((b) => /новинк/i.test(b.title));
  const tilesAfterIndex = novinkiIndex >= 0 ? novinkiIndex : 0;

  const nodes: ReactNode[] = [];
  banners.forEach((banner, index) => {
    const isAboutFallback = banner.id === FALLBACK_ABOUT_BANNER_ID;
    const isFirst = index === 0;
    nodes.push(
      <HomeBanner
        key={banner.id}
        title={banner.title}
        subtitle={banner.subtitle}
        href={banner.href ?? "/"}
        image={banner.image ?? "/placeholders/hero.svg"}
        video={banner.video}
        overlay={isAboutFallback ? "scrim" : "card"}
        ctaLabel={isAboutFallback ? "Подробнее" : undefined}
        as="h2"
        priority={isFirst}
        isFirst={isFirst}
      />,
    );
    if (index === tilesAfterIndex) {
      nodes.push(<HomeCategoryTiles key="home-category-tiles" />);
    }
  });

  // Нет баннеров — плитка категорий всё равно даёт вход в каталог
  if (banners.length === 0) {
    nodes.push(<HomeCategoryTiles key="home-category-tiles" />);
  }

  return (
    <main id="main" data-home-snap className="flex flex-1 flex-col max-lg:pb-12">
      <h1 className="sr-only">{HOME_TITLE}</h1>
      {nodes}
    </main>
  );
}
