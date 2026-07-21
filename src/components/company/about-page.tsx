import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { InfoTileGrid } from "@/components/content/info-tile-grid";
import { StaticProse } from "@/components/content/static-prose";
import { Button } from "@/components/ui/button";
import { staticBlurProps } from "@/lib/images";
import type { CompanySections, Image as ImageData } from "@/lib/schemas";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";

const PROMO_HREFS = [
  "/company/vacancy/",
  "/company/contacts/",
  "/company/partners/",
] as const;

const FALLBACK_PROMO_TILES = [
  {
    title: "Вакансии",
    description: "Присоединяйтесь к команде MURU",
    href: PROMO_HREFS[0],
  },
  {
    title: "Контакты",
    description: "Свяжитесь с нами — мы открыты к диалогу",
    href: PROMO_HREFS[1],
  },
  {
    title: "Стать партнёром",
    description: "Предложите сотрудничество и развивайте проекты вместе с MURU",
    href: PROMO_HREFS[2],
  },
] as const;

function CompanyHeroSection({
  heading,
  text,
  image,
  breadcrumbs,
}: NonNullable<CompanySections["hero"]> & {
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <section className="relative w-full bg-surface">
      <div className="relative w-full">
        {image?.url ? (
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
        ) : (
          <div className="aspect-video w-full bg-surface" aria-hidden />
        )}
        <div className="absolute top-0 left-0 z-10 w-full max-w-[1564px] px-4 pt-8 sm:px-8 [&_ol]:text-white [&_a]:text-white/90 [&_a:hover]:text-white [&_span]:text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <div className="absolute top-1/2 left-1/2 z-10 flex w-[calc(100%-2rem)] max-w-[700px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 bg-background px-[70px] py-10 text-center max-md:px-8 max-md:py-8 max-sm:static max-sm:mx-auto max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0">
          <h1 className="text-[24px] leading-[29px] font-light tracking-normal text-[#6B6B6B] uppercase">
            {heading}
          </h1>
          {text ? (
            <StaticProse
              html={text}
              className="text-center text-[#5B5B5B] [&_p:last-child]:mb-0"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CompanyMissionSection({
  label,
  heading,
  text,
  images,
}: NonNullable<CompanySections["mission"]>) {
  const shown =
    images?.filter((i): i is ImageData => Boolean(i?.url)) ?? [];

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <div className="max-w-xl">
        {label ? (
          <p className="mb-3 text-caption font-medium tracking-[0.12em] text-text-muted uppercase">
            {label}
          </p>
        ) : null}
        <h2 className="mb-4 font-display text-h3 text-text-heading">{heading}</h2>
        <StaticProse html={text} />
      </div>
      {shown.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {shown.map((image, index) => (
            <MissionImage key={`${image.url}-${index}`} image={image} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MissionImage({ image }: { image: ImageData }) {
  return (
    <div className="bg-surface p-2">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image.url}
          alt={image.alt ?? ""}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          {...staticBlurProps()}
        />
      </div>
    </div>
  );
}

function CompanyPromoSection({
  image,
  cards,
}: NonNullable<CompanySections["promo"]>) {
  return (
    <section className="relative w-full aspect-video overflow-hidden max-lg:aspect-auto max-lg:py-12">
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt ?? ""}
          fill
          sizes="100vw"
          className="object-cover"
          {...staticBlurProps()}
        />
      ) : null}
      <div className="absolute inset-0 z-10 flex items-center justify-center max-lg:relative max-lg:inset-auto">
        <div className="flex w-full max-w-[1564px] flex-row flex-wrap justify-center gap-5 px-8">
          {cards.map((card, index) => {
            const href =
              PROMO_HREFS[index] ?? PROMO_HREFS[PROMO_HREFS.length - 1];
            return (
              <div
                key={card.key}
                className="flex w-full max-w-[370px] flex-1 flex-col items-start gap-32 bg-white p-6 text-left max-lg:gap-16"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] leading-[calc(1em+8px)] font-light tracking-normal text-[#6B6B6B] uppercase">
                    {card.title}
                  </h3>
                  <p className="text-base leading-5 font-light text-[#5B5B5B]">
                    {card.text}
                  </p>
                </div>
                <Button
                  render={<Link href={href} />}
                  size="sm"
                  className="h-[38px] self-start rounded-none px-4 text-[15px] font-medium hover:bg-[#52602F]"
                >
                  Подробнее
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AboutPageFallback({
  breadcrumbs,
}: {
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1564px] flex-col gap-12 px-4 pb-16 sm:px-8 md:gap-16">
      <Breadcrumbs items={breadcrumbs} className="pt-8" />
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface md:aspect-[21/9]">
        <Image
          src="/placeholders/hero.svg"
          alt=""
          fill
          sizes="100vw"
          {...staticBlurProps()}
          className="object-cover"
        />
      </div>

      <section className="max-w-3xl">
        <h1 className="mb-4 font-display text-h2 text-text-heading">О нас</h1>
        <p className="mb-4 text-body text-text-secondary">
          MURU — интернет-магазин декора и предметов для дома, где каждый элемент
          выбран с вниманием к деталям. Нейтральный текст-плейсхолдер той же
          структуры и длины, что и на витрине.
        </p>
        <p className="text-body text-text-secondary">
          В каталоге — домашний текстиль, аксессуары, композиции из природных
          материалов и предметы интерьера, которые создают атмосферу уюта и
          спокойствия.
        </p>
      </section>

      <section className="max-w-3xl">
        <h2 className="mb-4 font-display text-h2 text-text-heading">
          Создаём атмосферу дома
        </h2>
        <p className="mb-4 text-body text-text-secondary">
          Мы верим, что дом — это пространство, где важна каждая деталь. Наша
          миссия — помочь создать интерьер, отражающий ваш индивидуальный стиль.
        </p>
        <p className="text-body text-text-secondary">
          Коллекции MURU объединяют эстетику, натуральные материалы и
          функциональность в гармоничное единство вашего дома.
        </p>
      </section>

      <InfoTileGrid items={[...FALLBACK_PROMO_TILES]} />
    </div>
  );
}

export function AboutPage({
  sections,
  breadcrumbs,
}: {
  sections?: CompanySections | null;
  breadcrumbs: BreadcrumbItem[];
}) {
  if (!sections) {
    return <AboutPageFallback breadcrumbs={breadcrumbs} />;
  }

  return (
    <div className="flex flex-col">
      {sections.hero ? (
        <CompanyHeroSection {...sections.hero} breadcrumbs={breadcrumbs} />
      ) : (
        <div className="mx-auto w-full max-w-[1564px] px-4 pt-8 sm:px-8">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      {sections.mission ? (
        <div className="mx-auto w-full max-w-[1564px] px-4 pt-12 pb-16 sm:px-8 md:pt-16">
          <CompanyMissionSection {...sections.mission} />
        </div>
      ) : null}
      {sections.promo ? <CompanyPromoSection {...sections.promo} /> : null}
    </div>
  );
}
