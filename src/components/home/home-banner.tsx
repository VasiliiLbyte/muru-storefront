import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { staticBlurProps } from "@/lib/images";
import { cn } from "@/lib/utils";

export type HomeBannerProps = {
  image: { url: string; alt?: string } | string;
  title: string;
  subtitle?: string;
  href: string;
  ctaLabel?: string;
  priority?: boolean;
  overlay?: "card" | "scrim";
  /** Первый баннер: высота под полной шапкой (utility + sticky). */
  isFirst?: boolean;
  as?: "h1" | "h2";
};

/**
 * Full-bleed баннер главной: фоновое фото + центрированная карточка с CTA.
 * Высота = 100dvh − offset шапки; на lg+ — scroll-snap slide.
 */
export function HomeBanner({
  image,
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
        "relative isolate flex items-center justify-center overflow-hidden",
        isFirst
          ? "h-[calc(100dvh-var(--home-offset-first))] min-h-[calc(100dvh-var(--home-offset-first))]"
          : "h-[calc(100dvh-var(--home-offset-rest))] min-h-[calc(100dvh-var(--home-offset-rest))] lg:snap-start lg:snap-always lg:scroll-mt-[var(--home-offset-rest)]",
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        {...staticBlurProps()}
        className="-z-10 object-cover"
      />
      <div className="mx-auto w-full max-w-[1564px] px-4 py-16 sm:px-8">
        <div
          className={cn(
            isScrim
              ? "mx-auto max-w-xl bg-black/35 px-8 py-10 text-center backdrop-blur-[1px] sm:px-12 sm:py-12"
              : "mx-auto max-w-lg bg-background px-8 py-10 text-center sm:px-12 sm:py-12",
          )}
        >
          <HeadingTag
            className={cn(
              "font-display text-[clamp(1.5rem,3.2vw,2.25rem)] leading-[1.15] font-normal tracking-[0.08em] uppercase",
              isScrim ? "text-text-inverse" : "text-text-heading",
            )}
          >
            {title}
          </HeadingTag>
          {subtitle ? (
            <p
              className={cn(
                "mt-3 text-body",
                isScrim ? "text-text-inverse/90" : "text-text-secondary",
              )}
            >
              {subtitle}
            </p>
          ) : null}
          <Button
            render={<Link href={href} />}
            size="lg"
            className="mt-8 h-12 px-10"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
