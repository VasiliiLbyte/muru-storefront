import Link from "next/link";

import { catalogHref } from "@/lib/site";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Хлебные крошки" className={cn("text-small", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 ? (
                <span aria-hidden="true" className="text-text-muted">
                  /
                </span>
              ) : null}
              {isLast ? (
                <span aria-current="page" className="text-text-secondary">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Базовые крошки: Главная → Каталог. */
export function catalogBreadcrumbBase(): BreadcrumbItem[] {
  return [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: catalogHref.root },
  ];
}
