import type { Metadata } from "next";

import { ProductGrid } from "@/components/catalog/product-grid";
import { ContentShell } from "@/components/content/content-shell";
import { getProducts, getStaticPage } from "@/lib/api/endpoints";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("gifts");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/gifts/",
  });
}

export default async function GiftsPage() {
  const [page, listing] = await Promise.all([
    getStaticPage("gifts"),
    getProducts({ sort: "new", pageSize: 12 }),
  ]);

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={page.title}
        breadcrumbs={contentBreadcrumbs({ name: page.title, href: "/gifts/" })}
      >
        <ProductGrid products={listing.items} />
      </ContentShell>
    </main>
  );
}
