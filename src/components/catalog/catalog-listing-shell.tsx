import { Suspense } from "react";

import {
  Breadcrumbs,
  catalogBreadcrumbBase,
} from "@/components/catalog/breadcrumbs";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { CategoryGrid } from "@/components/catalog/category-grid";
import { ProductGrid } from "@/components/catalog/product-grid";
import type { ProductListQueryInput, ProductListResponse } from "@/lib/schemas";
import type { Category } from "@/lib/schemas";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import type { CatalogNavNode } from "@/lib/catalog/catalog-nav";
import { cn } from "@/lib/utils";

export function CatalogListingShell({
  variant,
  title,
  breadcrumbs,
  subcategories,
  parentSlug,
  categories,
  listing,
  query,
  pathname,
  className,
}: {
  variant: "hub" | "listing";
  title: string;
  breadcrumbs: BreadcrumbItem[];
  subcategories?: CatalogNavNode[];
  parentSlug?: string;
  categories: Category[];
  listing: ProductListResponse;
  query: ProductListQueryInput;
  pathname: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1564px] px-4 sm:px-8", className)}>
      <Breadcrumbs items={breadcrumbs} className="mb-3 pt-4 lg:mb-6 lg:pt-8" />
      <h1 className="mb-4 font-display text-h2 text-text-heading lg:mb-8 lg:text-display">
        {title}
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
                className="mb-4 min-h-11 animate-pulse rounded-sm bg-surface lg:mb-8"
                aria-hidden="true"
              />
            }
          >
            <CatalogToolbar facets={listing.facets} />
          </Suspense>

          <div className="mb-10">
            <ProductGrid products={listing.items} />
          </div>

          <CatalogPagination
            pathname={pathname}
            query={query}
            page={listing.page}
            pageSize={listing.pageSize}
            total={listing.total}
          />
        </>
      )}
    </div>
  );
}

export { catalogBreadcrumbBase };
