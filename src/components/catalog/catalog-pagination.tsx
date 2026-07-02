import Link from "next/link";

import { listingQueryString } from "@/lib/catalog/search-params";
import type { ProductListQueryInput } from "@/lib/schemas";
import { cn } from "@/lib/utils";

function pageRange(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current]);
  for (let i = current - 2; i <= current + 2; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  return [...pages].sort((a, b) => a - b);
}

export function CatalogPagination({
  pathname,
  query,
  page,
  pageSize,
  total,
  className,
}: {
  pathname: string;
  query: ProductListQueryInput;
  page: number;
  pageSize: number;
  total: number;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages = pageRange(page, totalPages);

  const hrefFor = (p: number) =>
    `${pathname}${listingQueryString(query, p)}`;

  return (
    <nav
      aria-label="Пагинация"
      className={cn(
        "mt-10 flex flex-col items-center gap-4 border-t border-border pt-8",
        className,
      )}
    >
      <p className="text-small text-text-secondary">
        Страница {page} из {totalPages}
        <span className="sr-only">, всего товаров: {total}</span>
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              className="inline-flex h-9 min-w-9 items-center justify-center px-2 text-small text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              rel="prev"
            >
              Назад
            </Link>
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex h-9 min-w-9 items-center justify-center px-2 text-small text-text-secondary"
            >
              Назад
            </span>
          )}
        </li>
        {pages.map((p, i) => {
          const prev = pages[i - 1];
          const gap = prev !== undefined && p - prev > 1;
          return (
            <li key={p} className="flex items-center gap-1">
              {gap ? (
                <span aria-hidden="true" className="px-1 text-text-muted">
                  …
                </span>
              ) : null}
              {p === page ? (
                <span
                  aria-current="page"
                  className="inline-flex h-9 min-w-9 items-center justify-center bg-brand px-2 text-small font-medium text-text-inverse"
                >
                  {p}
                </span>
              ) : (
                <Link
                  href={hrefFor(p)}
                  className="inline-flex h-9 min-w-9 items-center justify-center px-2 text-small text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {p}
                </Link>
              )}
            </li>
          );
        })}
        <li>
          {page < totalPages ? (
            <Link
              href={hrefFor(page + 1)}
              className="inline-flex h-9 min-w-9 items-center justify-center px-2 text-small text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              rel="next"
            >
              Вперёд
            </Link>
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex h-9 min-w-9 items-center justify-center px-2 text-small text-text-secondary"
            >
              Вперёд
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
