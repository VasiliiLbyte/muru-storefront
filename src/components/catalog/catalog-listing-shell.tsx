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
import type { TaxonomyNode } from "@/lib/taxonomy";
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
  subcategories?: TaxonomyNode[];
  parentSlug?: string;
  categories: Category[];
  listing: ProductListResponse;
  query: ProductListQueryInput;
  pathname: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1564px] px-4 sm:px-8", className)}>
      <Breadcrumbs items={breadcrumbs} className="mb-6 pt-8" />
      <h1 className="mb-8 font-display text-display text-text-heading">{title}</h1>

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
          <div className="mb-10 flex flex-col gap-8">
            <ProductGrid
              products={listing.items}
              className="order-1 lg:order-2"
            />
            <Suspense
              fallback={
                <div
                  className="order-2 h-24 animate-pulse rounded-sm bg-surface lg:order-1"
                  aria-hidden="true"
                />
              }
            >
              <CatalogToolbar
                facets={listing.facets}
                className="order-2 lg:order-1"
              />
            </Suspense>
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
