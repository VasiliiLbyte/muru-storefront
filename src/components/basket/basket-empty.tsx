import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { catalogHref } from "@/lib/site";
import { cn } from "@/lib/utils";

export function BasketEmpty() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <p className="font-display text-h2 text-text-heading">Корзина пуста</p>
      <p className="max-w-md text-body text-text-secondary">
        Добавьте товары из каталога — они появятся здесь.
      </p>
      <Link
        href={catalogHref.root}
        className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}
      >
        Перейти в каталог
      </Link>
    </div>
  );
}
