import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { InfoTileGrid } from "@/components/content/info-tile-grid";
import { StaticProse } from "@/components/content/static-prose";
import { Button } from "@/components/ui/button";
import { staticBlurProps } from "@/lib/images";
import type { CompanySections, Image as ImageData } from "@/lib/schemas";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

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
    <section
      className={cn(
        "relative flex w-full min-h-[70vh] items-center justify-center overflow-hidden bg-surface lg:min-h-[80vh]",
      )}
    >
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          {...staticBlurProps()}
        />
      ) : (
        <Image
          src="/placeholders/hero.svg"
          alt=""
          fill
          sizes="100vw"
          {...staticBlurProps()}
          className="object-cover"
        />
      )}
      <div className="absolute top-0 left-0 z-10 w-full max-w-[1564px] px-4 pt-8 sm:px-8 [&_ol]:text-white [&_a]:text-white/90 [&_a:hover]:text-white [&_span]:text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <div className="relative z-10 mx-4 w-full max-w-[560px] bg-background px-10 py-12 text-center sm:px-14 sm:py-16">
        <h1 className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] leading-[1.2] font-normal tracking-[0.08em] text-text-heading uppercase">
          {heading}
        </h1>
        <StaticProse html={text} className="mt-4 text-center [&_p:last-child]:mb-0" />
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
    <section className="relative flex w-full min-h-[70vh] items-center overflow-hidden lg:min-h-[80vh]">
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
      <div className="relative z-10 mx-auto w-full max-w-[1080px] px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => {
            const href =
              PROMO_HREFS[index] ?? PROMO_HREFS[PROMO_HREFS.length - 1];
            return (
              <div
                key={card.key}
                className="flex aspect-[5/4] flex-col gap-3 bg-background p-6 sm:p-8"
              >
                <h3 className="font-display text-h3 font-normal tracking-[0.08em] text-text-heading uppercase">
                  {card.title}
                </h3>
                <p className="text-body text-text-secondary">{card.text}</p>
                <Button
                  render={<Link href={href} />}
                  size="sm"
                  className="mt-auto self-start"
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
