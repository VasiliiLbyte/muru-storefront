import type { Metadata } from "next";
import Image from "next/image";
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
        breadcrumbs={contentBreadcrumbs(
          { name: "Коллекции", href: "/landings/" },
          { name: collection.title, href: `/landings/${slug}/` },
        )}
      >
        {collection.heroImage ? (
          <div className="relative mb-10 aspect-[21/9] w-full overflow-hidden bg-surface">
            <Image
              src={collection.heroImage.url}
              alt={collection.heroImage.alt ?? collection.title}
              fill
              sizes="100vw"
              priority
              placeholder={
                collection.heroImage.blurDataURL ? "blur" : undefined
              }
              blurDataURL={collection.heroImage.blurDataURL}
              className="object-cover"
            />
          </div>
        ) : null}

        {collection.description ? (
          <p className="mb-10 max-w-3xl text-body text-text-secondary">
            {collection.description}
          </p>
        ) : null}

        <ProductGrid products={products} />
      </ContentShell>
    </main>
  );
}
