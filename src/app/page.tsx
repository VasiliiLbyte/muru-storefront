import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import { HomeBanner } from "@/components/home/home-banner";
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

  return (
    <main id="main" className="flex flex-1 flex-col">
      <Hero />

      {banners.map((banner) => {
        const isAboutFallback = banner.id === FALLBACK_ABOUT_BANNER_ID;

        return (
          <HomeBanner
            key={banner.id}
            title={banner.title}
            subtitle={banner.subtitle}
            href={banner.href ?? "/"}
            image={banner.image ?? "/placeholders/hero.svg"}
            overlay={isAboutFallback ? "scrim" : "card"}
            ctaLabel={isAboutFallback ? "Подробнее" : undefined}
          />
        );
      })}
    </main>
  );
}
