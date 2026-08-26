import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  Breadcrumbs,
  catalogBreadcrumbBase,
} from "@/components/catalog/breadcrumbs";
import { CATALOG_PRODUCT_GRID_CLASS } from "@/components/catalog/catalog-grid-class";
import { CatalogListingShell } from "@/components/catalog/catalog-listing-shell";
import { ProductPdp } from "@/components/product/product-pdp";
import { MediaCard } from "@/components/home/media-card";
import { JsonLdScript } from "@/components/seo/jsonld-script";
import {
  getCategories,
  getCategory,
  getProduct,
  getProducts,
} from "@/lib/api/endpoints";
import { isCatalogBackendEnabled } from "@/lib/api/catalog-backend";
import { categoriesToNavTree } from "@/lib/catalog/catalog-nav";
import { buildProductBreadcrumbs } from "@/lib/catalog/product-breadcrumbs";
import { parseListingSearchParams } from "@/lib/catalog/search-params";
import { isSaleCategorySlug } from "@/lib/catalog/sale-category";
import { resolveCatalogRoute } from "@/lib/catalog/resolve-route";
import {
  productCategorySlugs,
  productHref,
  productPathMatches,
} from "@/lib/catalog/urls";
import { toSentenceCaseRu } from "@/lib/content/breadcrumbs";
import { breadcrumbJsonLd, itemListJsonLd, productJsonLd } from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { catalogHref } from "@/lib/site";
import { categories as mockCategories } from "@/mocks/fixtures/categories";

export const revalidate = 300;
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  if (isCatalogBackendEnabled()) return [{}];

  const params: { slug?: string[] }[] = [{}];
  const tree = categoriesToNavTree(mockCategories);

  for (const node of tree) {
    params.push({ slug: [node.slug] });
    for (const child of node.children ?? []) {
      params.push({ slug: [node.slug, child.slug] });
    }
  }

  // Предрендер ключевого PDP для аудита; остальные товары — on-demand ISR.
  params.push({
    slug: ["vazy-i-aksessuary", "vazy-i-kuvshiny", "vazy-i-kuvshiny-01"],
  });

  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = slug?.map((s) => decodeURIComponent(s).normalize("NFC"));
  const route = await resolveCatalogRoute(decodedSlug);

  if (!route) {
    return { title: "Страница не найдена" };
  }

  if (route.type === "root") {
    return buildPageMetadata({
      title: "Каталог — MURU",
      description:
        "Каталог предметов декора MURU: вазы, текстиль, кухня и столовая, натуральный декор и подарки.",
      path: catalogHref.root,
    });
  }

  if (route.type === "product") {
    try {
      const product = await getProduct(route.productSlug);
      if (!decodedSlug || !productPathMatches(product, decodedSlug)) {
        return { title: "Страница не найдена" };
      }
      return buildPageMetadata({
        title: product.seo.title,
        description: product.seo.description,
        path: productHref(product),
        ogImage: product.images[0]?.url,
      });
    } catch {
      return { title: "Страница не найдена" };
    }
  }

  const categorySlug =
    route.type === "category" ? route.slug : route.subSlug;

  try {
    const category = await getCategory(categorySlug);
    const path =
      route.type === "category"
        ? catalogHref.top(route.slug)
        : catalogHref.sub(route.parentSlug, route.subSlug);

    return buildPageMetadata({
      title: category.seo.title,
      description: category.seo.description,
      path,
      ogImage: category.image?.url,
    });
  } catch {
    return { title: "Страница не найдена" };
  }
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const decodedSlug = slug?.map((s) => decodeURIComponent(s).normalize("NFC"));
  const route = await resolveCatalogRoute(decodedSlug);

  if (!route) notFound();

  if (route.type === "product") {
    let product;
    try {
      product = await getProduct(route.productSlug);
    } catch {
      notFound();
    }
    if (!decodedSlug || !productPathMatches(product, decodedSlug)) notFound();

    const allCategories = await getCategories();
    const { leaf } = productCategorySlugs(product, allCategories);
    const related = await getProducts({
      subcategory: leaf,
      pageSize: 8,
      sort: "popular",
    });
    const relatedProducts = related.items
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
    const breadcrumbs = buildProductBreadcrumbs(product, allCategories);

    return (
      <main id="main" className="flex flex-1 flex-col">
        <JsonLdScript
          data={[breadcrumbJsonLd(breadcrumbs), productJsonLd(product)]}
        />
        <ProductPdp
          product={product}
          breadcrumbs={breadcrumbs}
          relatedProducts={relatedProducts}
        />
      </main>
    );
  }

  const allCategories = await getCategories();

  if (route.type === "root") {
    const topCategories = allCategories
      .filter((c) => !c.parentSlug)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const breadcrumbs = catalogBreadcrumbBase();
    breadcrumbs[breadcrumbs.length - 1] = {
      name: "Каталог",
      href: catalogHref.root,
    };

    return (
      <main id="main" className="flex flex-1 flex-col pb-16">
        <JsonLdScript data={breadcrumbJsonLd(breadcrumbs)} />
        <div className="mx-auto w-full max-w-[1564px] px-4 sm:px-8">
          <Breadcrumbs items={breadcrumbs} className="mb-6 pt-8" />
          <h1 className="mb-8 font-display text-display text-text-heading">
            Каталог
          </h1>
          <div className={CATALOG_PRODUCT_GRID_CLASS}>
            {topCategories.map((category, index) => (
              <MediaCard
                key={category.slug}
                href={catalogHref.top(category.slug)}
                image={category.image}
                title={category.title}
                imageAspect="aspect-square"
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                priority={index === 0}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const listingQuery = parseListingSearchParams(sp);
  const pathname =
    route.type === "category"
      ? catalogHref.top(route.slug)
      : catalogHref.sub(route.parentSlug, route.subSlug);

  const categorySlug =
    route.type === "category"
      ? route.slug
      : route.type === "subcategory"
        ? route.subSlug
        : undefined;
  const isSaleListing = categorySlug ? isSaleCategorySlug(categorySlug) : false;

  const listQuery = isSaleListing
    ? {
        ...listingQuery,
        pageSize: 8 as const,
        onSale: true as const,
      }
    : {
        ...listingQuery,
        pageSize: 8 as const,
        category: isCatalogBackendEnabled()
          ? route.type === "subcategory"
            ? route.parentSlug
            : route.type === "category"
              ? route.slug
              : undefined
          : route.type === "category"
            ? route.slug
            : undefined,
        subcategory:
          route.type === "subcategory" ? route.subSlug : undefined,
      };

  const listing = await getProducts(listQuery);

  const breadcrumbs = catalogBreadcrumbBase();

  if (route.type === "category") {
    breadcrumbs.push({
      name: toSentenceCaseRu(route.node.title),
      href: catalogHref.top(route.slug),
    });
  } else {
    breadcrumbs.push(
      {
        name: toSentenceCaseRu(route.parentNode.title),
        href: catalogHref.top(route.parentSlug),
      },
      {
        name: toSentenceCaseRu(route.node.title),
        href: catalogHref.sub(route.parentSlug, route.subSlug),
      },
    );
  }

  const title = route.node.title;

  const jsonLd: Record<string, unknown>[] = [breadcrumbJsonLd(breadcrumbs)];
  if (listing.items.length > 0) {
    jsonLd.push(itemListJsonLd(listing.items, pathname));
  }

  const subcategories =
    route.type === "category" ? route.children : undefined;

  const hasSubcategories = (subcategories?.length ?? 0) > 0;

  const variant =
    route.type === "category" && hasSubcategories ? "hub" : "listing";

  return (
    <main id="main" className="flex flex-1 flex-col pb-16">
      <JsonLdScript data={jsonLd} />
      <CatalogListingShell
        variant={variant}
        title={title}
        breadcrumbs={breadcrumbs}
        subcategories={subcategories}
        parentSlug={route.type === "category" ? route.slug : undefined}
        categories={allCategories}
        listing={listing}
        query={listQuery}
      />
    </main>
  );
}
