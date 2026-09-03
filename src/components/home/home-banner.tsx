import Link from "next/link";

import { HomeBannerMedia } from "@/components/home/home-banner-media";
import { Button } from "@/components/ui/button";
import { glassPlaqueClass } from "@/components/ui/glass-plaque";
import { cn } from "@/lib/utils";

export type HomeBannerProps = {
  image: { url: string; alt?: string } | string;
  /** Optional background video; `image` is used as poster / reduced-motion fallback. */
  video?: { url: string } | null;
  title: string;
  subtitle?: string;
  href: string;
  ctaLabel?: string;
  priority?: boolean;
  overlay?: "card" | "scrim";
  /** Первый баннер: высота под полной шапкой (utility + sticky) — desktop only. */
  isFirst?: boolean;
  as?: "h1" | "h2";
};

/**
 * Десктопная плашка с текстом. На мобиле плашки нет (см. `MobileBannerCopy`).
 */
function DesktopBannerCopy({
  title,
  subtitle,
  href,
  ctaLabel,
  HeadingTag,
  isScrim,
}: {
  title: string;
  subtitle?: string;
  href: string;
  ctaLabel: string;
  HeadingTag: "h1" | "h2";
  isScrim: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[568px] flex-col items-center gap-1 px-10 py-14 text-center",
        isScrim ? "bg-black/35 backdrop-blur-[1px]" : glassPlaqueClass,
      )}
    >
      <HeadingTag
        className={cn(
          "font-display text-[36px] leading-[44px] font-light tracking-normal uppercase",
          isScrim ? "text-text-inverse" : "text-text-heading",
        )}
      >
        {title}
      </HeadingTag>
      {subtitle ? (
        <p
          className={cn(
            "text-[16px] leading-5 font-light",
            isScrim ? "text-text-inverse/90" : "text-text-secondary",
          )}
        >
          {subtitle}
        </p>
      ) : null}
      <Button
        render={<Link href={href} />}
        className="mt-4 h-[45px] px-8 text-[14px] leading-[17px] font-light"
      >
        {ctaLabel}
      </Button>
    </div>
  );
}

/**
 * Мобильный текст баннера — поверх фото, белым, без плашки и без кнопки
 * (макет `сайт_2.pdf`, 2026-08-28). Тап по всему баннеру ведёт по `href`.
 */
function MobileBannerCopy({
  title,
  subtitle,
  HeadingTag,
}: {
  title: string;
  subtitle?: string;
  HeadingTag: "h1" | "h2";
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2 px-8 text-center [text-shadow:0_1px_14px_rgba(0,0,0,0.38)]">
      <HeadingTag className="font-display text-[26px] leading-[34px] font-light tracking-[0.06em] text-text-inverse uppercase">
        {title}
      </HeadingTag>
      {subtitle ? (
        <p className="text-pretty text-[16px] leading-[22px] font-light text-text-inverse">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Full-bleed баннер главной.
 * Mobile (&lt;lg): фото на весь экран (`100svh`, object-cover) + текст поверх, без плашки.
 * Desktop (≥lg): overlay card + scroll-snap (object-cover full-bleed).
 */
export function HomeBanner({
  image,
  video,
  title,
  subtitle,
  href,
  ctaLabel = "Подробнее",
  priority = false,
  overlay = "card",
  isFirst = false,
  as: HeadingTag = "h2",
}: HomeBannerProps) {
  const src = typeof image === "string" ? image : image.url;
  const alt = typeof image === "object" ? (image.alt ?? "") : "";
  const isScrim = overlay === "scrim";

  return (
    <section
      className={cn(
        "relative isolate block overflow-hidden",
        // Mobile: полноэкранный баннер. svh, а не dvh — чтобы не дёргалось
        // при появлении/скрытии адресной строки на iOS.
        "h-[100svh] min-h-[100svh]",
        isFirst
          ? "lg:h-[calc(100dvh-var(--home-offset-first))] lg:min-h-[calc(100dvh-var(--home-offset-first))]"
          : "lg:h-[calc(100dvh-var(--home-offset-rest))] lg:min-h-[calc(100dvh-var(--home-offset-rest))] lg:snap-start lg:snap-always lg:scroll-mt-[var(--home-offset-rest)]",
      )}
    >
      <div className="absolute inset-0 bg-white lg:bg-transparent">
        <HomeBannerMedia
          imageUrl={src}
          alt={alt}
          videoUrl={video?.url}
          priority={priority}
        />
      </div>

      {/* Скрим только на мобиле: белый текст поверх произвольного фото из CMS */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-black/25 via-black/5 to-black/35 lg:hidden"
      />

      {/* Mobile: текст по центру экрана поверх фото */}
      <div className="absolute inset-0 z-10 flex items-center justify-center lg:hidden">
        <MobileBannerCopy
          title={title}
          subtitle={subtitle}
          HeadingTag={HeadingTag}
        />
      </div>

      {/* Кнопки на мобиле нет — кликабелен весь баннер */}
      <Link
        href={href}
        aria-label={title}
        className="absolute inset-0 z-20 lg:hidden"
      />

      {/* Desktop overlay card centered in viewport slide */}
      <div className="relative z-10 mx-auto hidden h-full w-full max-w-[1564px] items-center px-4 py-16 sm:px-8 lg:flex">
        <DesktopBannerCopy
          title={title}
          subtitle={subtitle}
          href={href}
          ctaLabel={ctaLabel}
          HeadingTag={HeadingTag}
          isScrim={isScrim}
        />
      </div>
    </section>
  );
}
