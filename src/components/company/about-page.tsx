import Image from "next/image";
import Link from "next/link";

import { InfoTileGrid } from "@/components/content/info-tile-grid";
import { staticBlurProps } from "@/lib/images";
import { Button } from "@/components/ui/button";

const PROMO_TILES = [
  {
    title: "Вакансии",
    description: "Присоединяйтесь к команде MURU",
    href: "#",
  },
  {
    title: "Контакты",
    description: "Свяжитесь с нами — мы открыты к диалогу",
    href: "/company/contacts/",
  },
  {
    title: "Стать партнёром",
    description: "Предложите сотрудничество и развивайте проекты вместе с MURU",
    href: "#",
  },
] as const;

export function AboutPage() {
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

      <InfoTileGrid items={[...PROMO_TILES]} />

      <div>
        <Button render={<Link href="/catalog/" />} size="lg" className="h-11 px-8">
          Перейти в каталог
        </Button>
      </div>
    </div>
  );
}
