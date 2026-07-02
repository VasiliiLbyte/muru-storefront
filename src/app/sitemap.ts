import type { MetadataRoute } from "next";

import { collectSitemapUrls } from "@/lib/seo/sitemap-urls";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return collectSitemapUrls();
}
