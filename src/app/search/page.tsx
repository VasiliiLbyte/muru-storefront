import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/page-metadata";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Поиск",
    description: "Поиск по каталогу MURU.",
    path: "/search/",
  });
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim();

  return (
    <main id="main" className="mx-auto w-full max-w-[1564px] flex-1 px-4 py-16 sm:px-8">
      <h1 className="mb-4 font-display text-display text-text-heading">Поиск</h1>
      {query ? (
        <p className="text-body text-text-secondary">
          Результаты по запросу «{query}» появятся после подключения поиска к
          бэкенду.
        </p>
      ) : (
        <p className="text-body text-text-secondary">
          Раздел в разработке. Введите запрос в поле поиска в шапке сайта.
        </p>
      )}
    </main>
  );
}
