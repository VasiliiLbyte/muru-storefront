import { collectSitemapUrls } from "@/lib/seo/sitemap-urls";

export const revalidate = 300;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toXml(entries: Awaited<ReturnType<typeof collectSitemapUrls>>): string {
  const urls = entries
    .map((entry) => {
      const lastmod =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified
            ? new Date(entry.lastModified).toISOString()
            : undefined;
      return [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        entry.changeFrequency
          ? `    <changefreq>${entry.changeFrequency}</changefreq>`
          : null,
        entry.priority != null ? `    <priority>${entry.priority}</priority>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/** Runtime sitemap: Latin URLs from API. API down → 503 (not empty 200). */
export async function GET() {
  try {
    const entries = await collectSitemapUrls();
    return new Response(toXml(entries), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("[sitemap.xml] failed to collect URLs", err);
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
