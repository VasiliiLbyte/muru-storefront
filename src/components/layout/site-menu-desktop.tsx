"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { CatalogNavNode } from "@/lib/catalog/catalog-nav";
import { catalogHref, mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Десктопное меню за бургером (макет дизайнера, 2026-09-03).
 *
 * Две колонки: слева каталог, справа подкатегории выбранного раздела.
 * Внизу — вторичная навигация. Раздел подсвечивается по наведению,
 * поэтому список подкатегорий меняется без клика.
 */
export function SiteMenuDesktop({
  catalogTree,
  onNavigate,
}: {
  catalogTree: CatalogNavNode[];
  onNavigate: () => void;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const active =
    catalogTree.find((c) => c.slug === activeSlug) ?? catalogTree[0] ?? null;

  return (
    <div className="hidden min-h-0 flex-1 flex-col lg:flex">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-10">
        {/* Каталог */}
        <nav aria-label="Каталог" className="flex flex-col gap-1 overflow-y-auto">
          <Link
            href="/new/"
            onClick={onNavigate}
            className="py-1.5 text-[13px] leading-5 tracking-[0.08em] text-text-primary uppercase transition-colors hover:text-brand"
          >
            Новинки
          </Link>

          {catalogTree.map((node) => {
            const isActive = active?.slug === node.slug;
            return (
              <Link
                key={node.slug}
                href={catalogHref.top(node.slug)}
                onClick={onNavigate}
                onMouseEnter={() => setActiveSlug(node.slug)}
                onFocus={() => setActiveSlug(node.slug)}
                className={cn(
                  "flex items-center justify-between gap-3 py-1.5 text-[13px] leading-5 tracking-[0.08em] uppercase transition-colors",
                  isActive ? "text-brand" : "text-text-primary hover:text-brand",
                )}
              >
                {node.title}
                {isActive && node.children?.length ? (
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Подкатегории выбранного раздела */}
        <div className="flex flex-col gap-1 overflow-y-auto">
          {active ? (
            <>
              <Link
                href={catalogHref.top(active.slug)}
                onClick={onNavigate}
                className="py-1.5 text-[15px] leading-6 font-light text-text-primary transition-colors hover:text-brand"
              >
                Все товары
              </Link>
              {(active.children ?? []).map((child) => (
                <Link
                  key={child.slug}
                  href={catalogHref.sub(active.slug, child.slug)}
                  onClick={onNavigate}
                  className="py-1.5 text-[15px] leading-6 font-light text-text-primary transition-colors hover:text-brand"
                >
                  {child.title}
                </Link>
              ))}
            </>
          ) : null}
        </div>
      </div>

      {/* Вторичная навигация — прижата к низу панели */}
      <nav
        aria-label="Разделы сайта"
        className="mt-10 flex flex-col gap-1 border-t border-border pt-6"
      >
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="py-1 text-[13px] leading-5 tracking-[0.08em] text-text-secondary uppercase transition-colors hover:text-brand"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
