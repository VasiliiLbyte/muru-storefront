import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/catalog/product-grid";
import { ContentShell } from "@/components/content/content-shell";
import { getCollection, getProduct } from "@/lib/api/endpoints";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { collections } from "@/mocks/fixtures/collections";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const collection = await getCollection(slug);
    return buildPageMetadata({
      title: collection.seo.title,
      description: collection.seo.description,
      path: `/landings/${slug}/`,
      ogImage: collection.heroImage?.url,
    });
  } catch {
    return { title: "Страница не найдена" };
  }
}

export default async function LandingDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let collection;
  try {
    collection = await getCollection(slug);
  } catch {
    notFound();
  }

  const products = (
    await Promise.all(
      (collection.productSlugs ?? []).map(async (productSlug) => {
        try {
          return await getProduct(productSlug);
        } catch {
          return null;
        }
      }),
    )
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={collection.title}
        titleAlign="center"
        breadcrumbs={contentBreadcrumbs(
          { name: "Коллекции", href: "/landings/" },
          { name: collection.title, href: `/landings/${slug}/` },
        )}
      >
        {collection.description ? (
          <p className="mb-10 max-w-3xl text-body text-text-secondary">
            {collection.description}
          </p>
        ) : null}

        <ProductGrid products={products} className="lg:grid-cols-3" />
      </ContentShell>
    </main>
  );
}
