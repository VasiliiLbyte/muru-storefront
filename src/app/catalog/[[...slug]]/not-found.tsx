import Link from "next/link";

import { catalogHref } from "@/lib/site";

export default function CatalogNotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-[1564px] flex-1 flex-col items-start px-4 py-16 sm:px-8"
    >
      <h1 className="mb-4 font-display text-display text-text-heading">
        Страница не найдена
      </h1>
      <p className="mb-8 max-w-md text-body text-text-secondary">
        В каталоге нет такой категории или товара. Проверьте адрес или вернитесь
        в каталог.
      </p>
      <Link
        href={catalogHref.root}
        className="inline-flex min-h-11 items-center text-body text-brand underline-offset-4 hover:underline"
      >
        Перейти в каталог
      </Link>
    </main>
  );
}
