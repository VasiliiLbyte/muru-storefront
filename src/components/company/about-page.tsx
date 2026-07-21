import Image from "next/image";
import Link from "next/link";

import { InfoTileGrid } from "@/components/content/info-tile-grid";
import { StaticProse } from "@/components/content/static-prose";
import { Button } from "@/components/ui/button";
import { staticBlurProps } from "@/lib/images";
import type { CompanySections, Image as ImageData } from "@/lib/schemas";
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

function CatalogCta() {
  return (
    <div>
      <Button render={<Link href="/catalog/" />} size="lg" className="h-11 px-8">
        Перейти в каталог
      </Button>
    </div>
  );
}

function CompanyHeroSection({
  heading,
  body,
  backgroundImage,
}: NonNullable<CompanySections["hero"]>) {
  return (
    <section
      className={cn(
        "relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-surface aspect-[16/9] md:aspect-[21/9]",
      )}
    >
      {backgroundImage?.url ? (
        <Image
          src={backgroundImage.url}
          alt={backgroundImage.alt ?? ""}
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
      <div className="relative z-10 mx-4 w-full max-w-xl bg-background px-8 py-10 text-center sm:px-12 sm:py-12">
        <h2 className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] leading-[1.2] font-normal tracking-[0.08em] text-text-heading uppercase">
          {heading}
        </h2>
        <StaticProse html={body} className="mt-4 text-left [&_p:last-child]:mb-0" />
      </div>
    </section>
  );
}

function CompanyMissionSection({
  label,
  heading,
  body,
  images,
}: NonNullable<CompanySections["mission"]>) {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
      <div className="max-w-3xl">
        {label ? (
          <p className="mb-3 text-caption font-medium tracking-[0.12em] text-text-muted uppercase">
            {label}
          </p>
        ) : null}
        <h2 className="mb-4 font-display text-h2 text-text-heading">{heading}</h2>
        <StaticProse html={body} />
      </div>
      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <MissionImage key={`${image.url}-${index}`} image={image} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MissionImage({ image }: { image: ImageData }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-surface">
      <Image
        src={image.url}
        alt={image.alt ?? ""}
        fill
        sizes="(max-width: 1024px) 50vw, 25vw"
        className="object-cover"
        {...staticBlurProps()}
      />
    </div>
  );
}

function CompanyPromoSection({
  backgroundImage,
  cards,
}: NonNullable<CompanySections["promo"]>) {
  const items = cards.map((card, index) => ({
    title: card.title,
    description: card.description,
    href: PROMO_HREFS[index] ?? PROMO_HREFS[PROMO_HREFS.length - 1],
  }));

  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      {backgroundImage?.url ? (
        <>
          <Image
            src={backgroundImage.url}
            alt={backgroundImage.alt ?? ""}
            fill
            sizes="100vw"
            className="object-cover"
            {...staticBlurProps()}
          />
          <div className="absolute inset-0 bg-background/80" aria-hidden />
        </>
      ) : null}
      <div className="relative z-10">
        <InfoTileGrid items={items} />
      </div>
    </section>
  );
}

function AboutPageFallback() {
  return (
    <div className="flex flex-col gap-12 md:gap-16">
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
        <h2 className="mb-4 font-display text-h2 text-text-heading">О нас</h2>
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
      <CatalogCta />
    </div>
  );
}

export function AboutPage({
  sections,
}: {
  sections?: CompanySections | null;
}) {
  if (!sections) {
    return <AboutPageFallback />;
  }

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {sections.hero ? <CompanyHeroSection {...sections.hero} /> : null}
      {sections.mission ? <CompanyMissionSection {...sections.mission} /> : null}
      {sections.promo ? <CompanyPromoSection {...sections.promo} /> : null}
      <CatalogCta />
    </div>
  );
}
