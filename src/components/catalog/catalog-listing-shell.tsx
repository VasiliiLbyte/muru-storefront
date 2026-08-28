import { Suspense } from "react";

import {
  Breadcrumbs,
  catalogBreadcrumbBase,
} from "@/components/catalog/breadcrumbs";
import { CatalogProductFeed } from "@/components/catalog/catalog-product-feed";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { CategoryGrid } from "@/components/catalog/category-grid";
import { StaticProse } from "@/components/content/static-prose";
import type { ProductListQueryInput, ProductListResponse } from "@/lib/schemas";
import type { Category } from "@/lib/schemas";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import type { CatalogNavNode } from "@/lib/catalog/catalog-nav";
import { cn } from "@/lib/utils";

export function CatalogListingShell({
  variant,
  seoH1,
  seoIntroTop,
  seoTextBottom,
  breadcrumbs,
  subcategories,
  parentSlug,
  categories,
  listing,
  query,
  className,
}: {
  variant: "hub" | "listing";
  seoH1: string;
  seoIntroTop?: string;
  seoTextBottom?: string;
  breadcrumbs: BreadcrumbItem[];
  subcategories?: CatalogNavNode[];
  parentSlug?: string;
  categories: Category[];
  listing: ProductListResponse;
  /** Filter/sort fields for BFF load-more (without relying on page). */
  query: ProductListQueryInput;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1564px] px-4 sm:px-8", className)}>
      <Breadcrumbs items={breadcrumbs} className="mb-1 pt-2 lg:mb-6 lg:pt-8" />
      <h1
        className={cn(
          // parity: muru.ru mobile h1.switcher-title — 24px / 300 / uppercase
          "mb-2 font-display text-[24px] leading-[29px] font-light text-text-heading uppercase",
          "lg:mb-8 lg:text-display lg:leading-[var(--text-display--line-height)]",
        )}
      >
        {seoH1}
      </h1>

      {variant === "hub" ? (
        subcategories && parentSlug && subcategories.length > 0 ? (
          <CategoryGrid
            parentSlug={parentSlug}
            subcategories={subcategories}
            categories={categories}
          />
        ) : (
          <p className="py-12 text-center text-body text-text-muted">
            Скоро здесь появятся товары
          </p>
        )
      ) : (
        <>
          {/* Toolbar above grid in DOM (mobile sticky CB = this shell, not a short flex). */}
          <Suspense
            fallback={
              <div
                className="mb-1 min-h-[57px] animate-pulse rounded-sm bg-surface lg:mb-8 lg:min-h-[138px]"
                aria-hidden="true"
              />
            }
          >
            <CatalogToolbar facets={listing.facets} />
          </Suspense>

          <CatalogProductFeed
            className="mb-10"
            initialItems={listing.items}
            total={listing.total}
            pageSize={listing.pageSize}
            page={listing.page}
            query={query}
          />

          {(seoIntroTop?.trim() || seoTextBottom?.trim()) ? (
            <div className="mt-12 border-t border-border pt-8">
              {seoIntroTop?.trim() ? (
                <p className="mb-3 text-[12px] leading-relaxed text-text-muted">
                  {seoIntroTop}
                </p>
              ) : null}
              {seoTextBottom?.trim() ? (
                <StaticProse html={seoTextBottom} variant="seo-footer" />
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export { catalogBreadcrumbBase };
