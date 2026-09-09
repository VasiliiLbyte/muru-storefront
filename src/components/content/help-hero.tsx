import Image from "next/image";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { StaticProse } from "@/components/content/static-prose";
import { glassPlaqueClass } from "@/components/ui/glass-plaque";
import type { Image as ImageData } from "@/lib/schemas";
import { staticBlurProps } from "@/lib/images";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

const FALLBACK_INTRO =
  "Важная информация для клиентов: доставка, обслуживание, отзывы и подарочные сервисы.";

/**
 * Hero «Клиентам» — один в один с «О нас» (`CompanyHeroSection`): кадр во всю
 * ширину, крошки поверх него, glass-плашка по центру, а на узких экранах она
 * уходит под фото. Отдельной строки с крошками над кадром больше нет.
 */
export function HelpHero({
  title,
  bodyHtml,
  image,
  breadcrumbs,
  className,
}: {
  title: string;
  bodyHtml: string;
  image: ImageData;
  breadcrumbs: BreadcrumbItem[];
  className?: string;
}) {
  const hasBody = Boolean(bodyHtml?.trim());

  return (
    <section className={cn("relative w-full bg-surface", className)}>
      <div className="relative w-full">
        <Image
          src={image.url}
          alt={image.alt ?? ""}
          width={image.width ?? 1920}
          height={image.height ?? 1080}
          priority
          sizes="100vw"
          className="h-auto w-full object-contain"
          {...staticBlurProps()}
        />

        {/* Крошки лежат поверх кадра на всех вьюпортах — как на «О нас» */}
        <div className="absolute top-0 left-0 z-10 w-full max-w-[1564px] px-4 pt-4 sm:px-8 lg:pt-8 [&_ol]:text-white [&_a]:text-white/90 [&_a:hover]:text-white [&_span]:text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        <div
          className={cn(
            "absolute top-1/2 left-1/2 z-10 flex w-[calc(100%-2rem)] max-w-[700px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 px-[70px] py-10 text-center max-md:px-4 max-md:py-8 max-sm:static max-sm:mx-auto max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0",
            glassPlaqueClass,
          )}
        >
          <h1 className="font-display text-h2 font-light tracking-normal text-text-heading uppercase">
            {title}
          </h1>
          {hasBody ? (
            <StaticProse
              html={bodyHtml}
              className="text-center text-text-secondary [&_p:last-child]:mb-0"
            />
          ) : (
            <p className="text-body text-text-secondary">{FALLBACK_INTRO}</p>
          )}
        </div>
      </div>
    </section>
  );
}
