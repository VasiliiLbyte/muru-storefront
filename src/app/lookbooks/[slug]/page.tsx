import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/catalog/product-grid";
import { ContentShell } from "@/components/content/content-shell";
import { LookbookHeroHotspots } from "@/components/inspiration/lookbook-hero-hotspots";
import { getLookbook, getLookbooks, getProductBySku } from "@/lib/api/endpoints";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { lookbooks as staticLookbooks } from "@/lib/content/lookbooks";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const items = await getLookbooks();
    if (items.length > 0) {
      return items.map((lb) => ({ slug: lb.slug }));
    }
  } catch (err) {
    console.warn(
      "[lookbooks] generateStaticParams failed, static fallback",
      err,
    );
  }
  return staticLookbooks.map((lb) => ({ slug: lb.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const lookbook = await getLookbook(slug);
    return buildPageMetadata({
      title: lookbook.seo.title,
      description: lookbook.seo.description,
      path: `/lookbooks/${slug}/`,
      ogImage: lookbook.cover?.url,
    });
  } catch {
    return { title: "Страница не найдена" };
  }
}

export default async function LookbookDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let lookbook;
  try {
    lookbook = await getLookbook(slug);
  } catch {
    notFound();
  }

  const heroImage = lookbook.cover ?? lookbook.images[0];
  const hotspots = lookbook.hotspots ?? [];
  const uniqueSkus = [...new Set(hotspots.map((h) => h.product.sku))];

  const products = (
    await Promise.all(
      uniqueSkus.map(async (sku) => {
        try {
          return await getProductBySku(sku);
        } catch {
          return null;
        }
      }),
    )
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const productsBySku = Object.fromEntries(products.map((p) => [p.sku, p]));

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={lookbook.title}
        breadcrumbs={contentBreadcrumbs(
          { name: "Вдохновение", href: "/lookbooks/" },
          { name: lookbook.title, href: `/lookbooks/${slug}/` },
        )}
      >
        {lookbook.description ? (
          <p className="mb-10 max-w-3xl text-body text-text-secondary">
            {lookbook.description}
          </p>
        ) : null}

        {heroImage ? (
          <LookbookHeroHotspots
            cover={heroImage}
            title={lookbook.title}
            hotspots={hotspots}
            productsBySku={productsBySku}
          />
        ) : null}

        {products.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-6 font-display text-h2 text-text-heading">
              Предметы на фото
            </h2>
            <ProductGrid products={products} />
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lookbook.images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative aspect-[4/5] overflow-hidden bg-surface"
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${lookbook.title} — кадр ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                priority={index === 0 && !heroImage}
                placeholder={image.blurDataURL ? "blur" : undefined}
                blurDataURL={image.blurDataURL}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </ContentShell>
    </main>
  );
}
