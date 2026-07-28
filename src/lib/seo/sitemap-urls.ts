import type { MetadataRoute } from "next";

import {
  getCategories,
  getCollections,
  getLookbooks,
  getProducts,
} from "@/lib/api/endpoints";
import { categoriesToNavTree } from "@/lib/catalog/catalog-nav";
import { productHref, productPathMatches } from "@/lib/catalog/urls";
import { PUBLIC_STATIC_ROUTES } from "@/lib/seo/static-routes";
import { absoluteUrl, catalogHref } from "@/lib/site";

function sitemapEntry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  };
}

/**
 * Собирает индексируемые URL витрины для sitemap.xml.
 * Категории и товары — только из API / MSW (латинские слаги).
 * При ошибке API пробрасывает исключение (route → 503).
 */
export async function collectSitemapUrls(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PUBLIC_STATIC_ROUTES) {
    entries.push(sitemapEntry(path));
  }

  const categories = await getCategories();
  const tree = categoriesToNavTree(categories);

  for (const top of tree) {
    entries.push(sitemapEntry(catalogHref.top(top.slug)));
    for (const sub of top.children ?? []) {
      entries.push(sitemapEntry(catalogHref.sub(top.slug, sub.slug)));
    }
  }

  const [collections, lookbooks] = await Promise.all([
    getCollections(),
    getLookbooks(),
  ]);

  for (const collection of collections) {
    entries.push(sitemapEntry(`/landings/${collection.slug}/`));
  }

  for (const lookbook of lookbooks) {
    entries.push(sitemapEntry(`/lookbooks/${lookbook.slug}/`));
  }

  let page = 1;
  let total = Infinity;

  while ((page - 1) * 100 < total) {
    const listing = await getProducts({ page, pageSize: 100, sort: "new" });
    total = listing.total;

    for (const product of listing.items) {
      const href = productHref(product, categories);
      const segments = href.replace(/^\/catalog\//, "").replace(/\/$/, "").split("/");
      if (!productPathMatches(product, segments, categories)) continue;

      entries.push({
        ...sitemapEntry(href),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    page += 1;
  }

  return entries;
}
