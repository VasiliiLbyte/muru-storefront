import type { Metadata } from "next";
import Link from "next/link";

import { CatalogProductFeed } from "@/components/catalog/catalog-product-feed";
import { SearchSuggestions } from "@/components/search/search-suggestions";
import { getCategories, searchProducts } from "@/lib/api/endpoints";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { catalogHref } from "@/lib/site";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  return buildPageMetadata({
    title: query ? `Поиск: ${query}` : "Поиск",
    description: query
      ? `Результаты поиска по запросу «${query}» в каталоге MURU.`
      : "Поиск по каталогу MURU.",
    path: "/search/",
    robots: { index: false, follow: true },
  });
}

function pluralizeProducts(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return `${n} товара`;
  return `${n} товаров`;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, page } = await searchParams;
  const query = q?.trim();
  const pageNum = Number(page) || 1;

  if (!query || query.length < 2) {
    const categories = await getCategories();
    const topCategories = categories
      .filter((c) => !c.parentSlug)
      .slice(0, 3);

    return (
      <main
        id="main"
        className="mx-auto w-full max-w-[1564px] flex-1 px-4 py-16 sm:px-8"
      >
        <h1 className="mb-4 font-display text-display text-text-heading">
          Поиск
        </h1>
        <p className="mb-8 text-body text-text-secondary">
          Введите запрос в поле поиска (минимум 2 символа).
        </p>

        {topCategories.length > 0 && (
          <div className="mb-12">
            <p className="mb-3 text-caption font-medium text-text-muted">
              Популярные категории
            </p>
            <ul className="flex flex-wrap gap-2">
              {topCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={catalogHref.top(cat.slug)}
                    className="inline-flex items-center border border-border px-4 py-2 text-small text-text-primary transition-colors hover:border-brand hover:text-brand"
                  >
                    {cat.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SearchSuggestions />
      </main>
    );
  }

  const results = await searchProducts({
    q: query,
    page: pageNum,
    pageSize: 24,
  });

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-[1564px] flex-1 px-4 py-16 sm:px-8"
    >
      <h1 className="mb-2 font-display text-display text-text-heading">
        Результаты поиска
      </h1>
      <p className="mb-8 text-body text-text-secondary">
        {results.total > 0
          ? `${pluralizeProducts(results.total)} по запросу «${query}»`
          : `Ничего не найдено по запросу «${query}»`}
      </p>

      {results.items.length > 0 ? (
        <CatalogProductFeed
          initialItems={results.items}
          total={results.total}
          pageSize={results.pageSize}
          page={results.page}
          query={{ q: query }}
        />
      ) : (
        <EmptySearchState />
      )}
    </main>
  );
}

async function EmptySearchState() {
  const categories = await getCategories();
  const topCategories = categories
    .filter((c) => !c.parentSlug)
    .slice(0, 3);

  return (
    <div className="py-12">
      <p className="mb-6 text-body text-text-secondary">
        Попробуйте изменить запрос или перейдите в одну из категорий:
      </p>
      {topCategories.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {topCategories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={catalogHref.top(cat.slug)}
                className="inline-flex items-center border border-border px-4 py-2 text-small text-text-primary transition-colors hover:border-brand hover:text-brand"
              >
                {cat.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
