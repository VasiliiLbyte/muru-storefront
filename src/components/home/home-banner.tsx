import Link from "next/link";

import { HomeBannerMedia } from "@/components/home/home-banner-media";
import { Button } from "@/components/ui/button";
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

function BannerCopy({
  title,
  subtitle,
  href,
  ctaLabel,
  HeadingTag,
  isScrim,
  variant,
}: {
  title: string;
  subtitle?: string;
  href: string;
  ctaLabel: string;
  HeadingTag: "h1" | "h2";
  isScrim: boolean;
  variant: "mobile" | "desktop";
}) {
  const isMobile = variant === "mobile";
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col items-center gap-1 text-center",
        isMobile
          ? // parity: muru.ru mobile .mp-front-wrapper — padding 24px, white, full width
            "bg-white px-6 py-6"
          : cn(
              "max-w-[568px] px-4 py-8 sm:px-16 sm:py-10",
              isScrim ? "bg-black/35 backdrop-blur-[1px]" : "bg-white",
            ),
      )}
    >
      <HeadingTag
        className={cn(
          "font-display font-light tracking-normal uppercase",
          isMobile
            ? // parity: muru.ru mobile h2.font_36 — ~26px / 300 / uppercase
              "text-[26px] leading-[34px] text-text-heading"
            : cn(
                "text-[36px] leading-[44px]",
                isScrim ? "text-text-inverse" : "text-text-heading",
              ),
        )}
      >
        {title}
      </HeadingTag>
      {subtitle ? (
        <p
          className={cn(
            "text-[16px] leading-5 font-light",
            isMobile
              ? "text-text-secondary"
              : isScrim
                ? "text-text-inverse/90"
                : "text-text-secondary",
          )}
        >
          {subtitle}
        </p>
      ) : null}
      <Button
        render={<Link href={href} />}
        className={cn(
          "mt-4 h-[45px] text-[14px] leading-[17px] font-light",
          // parity: muru.ru mobile a.btn.btn-lg — ~141×45 / 14px
          isMobile ? "min-w-[141px] px-8" : "px-8",
        )}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}

/**
 * Full-bleed баннер главной.
 * Mobile (&lt;lg): stacked photo (4:3 contain + white) + text below.
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
        "relative isolate overflow-hidden",
        "flex flex-col",
        "lg:block",
        isFirst
          ? "lg:h-[calc(100dvh-var(--home-offset-first))] lg:min-h-[calc(100dvh-var(--home-offset-first))]"
          : "lg:h-[calc(100dvh-var(--home-offset-rest))] lg:min-h-[calc(100dvh-var(--home-offset-rest))] lg:snap-start lg:snap-always lg:scroll-mt-[var(--home-offset-rest)]",
      )}
    >
      {/* Shared media: 4:3 contain on mobile, fill section on desktop */}
      <div
        className={cn(
          "relative aspect-[4/3] w-full shrink-0 bg-white",
          "lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:bg-transparent",
        )}
      >
        <HomeBannerMedia
          imageUrl={src}
          alt={alt}
          videoUrl={video?.url}
          priority={priority}
        />
      </div>

      {/* Mobile text under photo */}
      <div className="relative z-10 w-full lg:hidden">
        <BannerCopy
          title={title}
          subtitle={subtitle}
          href={href}
          ctaLabel={ctaLabel}
          HeadingTag={HeadingTag}
          isScrim={isScrim}
          variant="mobile"
        />
      </div>

      {/* Desktop overlay card centered in viewport slide */}
      <div className="relative z-10 mx-auto hidden h-full w-full max-w-[1564px] items-center px-4 py-16 sm:px-8 lg:flex">
        <BannerCopy
          title={title}
          subtitle={subtitle}
          href={href}
          ctaLabel={ctaLabel}
          HeadingTag={HeadingTag}
          isScrim={isScrim}
          variant="desktop"
        />
      </div>
    </section>
  );
}
