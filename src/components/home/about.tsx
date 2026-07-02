import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { staticBlurProps } from "@/lib/images";

/**
 * Блок «О нас» на главной. Текст — нейтральный плейсхолдер той же структуры.
 */
export function About() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-[1564px] grid-cols-1 items-center gap-10 px-4 sm:px-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden bg-background">
          <Image
            src="/placeholders/product.svg"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            {...staticBlurProps()}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-h2 text-text-heading">О нас</h2>
          <p className="text-body text-text-secondary">
            MURU — это бережно собранные коллекции предметов декора и эстетики
            пространства. Мы выбираем вещи, которые создают атмосферу уюта и
            спокойствия в вашем доме.
          </p>
          <p className="text-body text-text-secondary">
            Домашний текстиль, аксессуары для дома и композиции из природных
            материалов — нейтральный текст-плейсхолдер той же структуры и длины,
            что и на витрине.
          </p>
          <div>
            <Button
              render={<Link href="/company/" />}
              variant="outline"
              size="lg"
              className="mt-2 px-8"
            >
              Подробнее о MURU
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
