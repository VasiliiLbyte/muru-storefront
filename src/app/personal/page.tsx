import type { Metadata } from "next";
import Link from "next/link";

import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Личный кабинет",
    description:
      "Личный кабинет MURU — настройки, избранное и история покупок.",
    path: "/personal/",
    robots: { index: false, follow: false },
  });
}

export default function PersonalPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[1564px] px-4 pb-16 sm:px-8">
        <h1 className="mb-8 pt-8 font-display text-display text-text-heading">
          Личный кабинет
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          Веб-авторизация в версии витрины ещё не подключена. Для просмотра
          избранного перейдите на страницу <Link href="/personal/favorite/">избранное</Link>.
        </p>
      </div>
    </main>
  );
}
