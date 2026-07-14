import type { Metadata } from "next";

import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ContentShell } from "@/components/content/content-shell";
import { getProducts, getStaticPage } from "@/lib/api/endpoints";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { ProductListQuerySchema } from "@/lib/schemas";

export const revalidate = 300;

const PAGE_SIZE = 24;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("gifts");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/gifts/",
  });
}

export default async function GiftsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const pageParam = sp.page;
  const pageRaw = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const query = ProductListQuerySchema.parse({
    page: pageRaw ?? undefined,
    pageSize: PAGE_SIZE,
    sort: "new",
    giftGuide: true,
  });

  const [page, listing] = await Promise.all([
    getStaticPage("gifts"),
    getProducts(query),
  ]);

  const totalPages = Math.max(1, Math.ceil(listing.total / listing.pageSize));

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={page.title}
        breadcrumbs={contentBreadcrumbs({ name: page.title, href: "/gifts/" })}
      >
        {listing.items.length > 0 ? (
          <>
            <ProductGrid products={listing.items} />
            {totalPages > 1 ? (
              <CatalogPagination
                pathname="/gifts/"
                query={{ sort: "new", giftGuide: true }}
                page={listing.page}
                pageSize={listing.pageSize}
                total={listing.total}
                className="mt-10"
              />
            ) : null}
          </>
        ) : (
          <p className="py-12 text-center text-body text-text-muted">
            Пока нет товаров в подборке подарков
          </p>
        )}
      </ContentShell>
    </main>
  );
}
