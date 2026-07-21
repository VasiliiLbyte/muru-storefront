import Image from "next/image";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { StaticProse } from "@/components/content/static-prose";
import { staticBlurProps } from "@/lib/images";
import type { PartnersSections } from "@/lib/schemas";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";

export function PartnersPageContent({
  hero,
  breadcrumbs,
}: {
  hero: PartnersSections["hero"];
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <section className="relative w-full bg-surface">
      <div className="relative w-full">
        {hero.image?.url ? (
          <Image
            src={hero.image.url}
            alt={hero.image.alt ?? ""}
            width={hero.image.width ?? 1920}
            height={hero.image.height ?? 1080}
            priority
            sizes="100vw"
            className="h-auto w-full object-contain"
            {...staticBlurProps()}
          />
        ) : (
          <div className="aspect-video w-full bg-surface" aria-hidden />
        )}
        <div className="absolute top-0 left-0 z-10 w-full max-w-[1564px] px-4 pt-8 sm:px-8 [&_ol]:text-white [&_a]:text-white/90 [&_a:hover]:text-white [&_span]:text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <div className="absolute top-1/2 left-1/2 z-10 flex w-[calc(100%-2rem)] max-w-[700px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 bg-background px-[70px] py-10 text-center max-md:px-8 max-md:py-8 max-sm:static max-sm:mx-auto max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0">
          <h1 className="text-[24px] leading-[29px] font-light tracking-normal text-[#6B6B6B] uppercase">
            {hero.heading}
          </h1>
          {hero.text ? (
            <StaticProse
              html={hero.text}
              className="text-center text-[#5B5B5B] [&_p:last-child]:mb-0"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
