import type { Metadata } from "next";

import { HomeBanner } from "@/components/home/home-banner";
import { HomeProductRail } from "@/components/home/home-product-rail";
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

  const [firstBanner, ...restBanners] = banners;

  return (
    <main id="main" data-home-snap className="flex flex-1 flex-col">
      <h1 className="sr-only">{HOME_TITLE}</h1>
      {firstBanner ? (
        <HomeBanner
          key={firstBanner.id}
          title={firstBanner.title}
          subtitle={firstBanner.subtitle}
          href={firstBanner.href ?? "/"}
          image={firstBanner.image ?? "/placeholders/hero.svg"}
          overlay={
            firstBanner.id === FALLBACK_ABOUT_BANNER_ID ? "scrim" : "card"
          }
          ctaLabel={
            firstBanner.id === FALLBACK_ABOUT_BANNER_ID
              ? "Подробнее"
              : undefined
          }
          as="h2"
          priority
          isFirst
        />
      ) : null}
      <HomeProductRail />
      {restBanners.map((banner) => {
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
            as="h2"
            priority={false}
            isFirst={false}
          />
        );
      })}
    </main>
  );
}
