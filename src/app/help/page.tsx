import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ContentShell } from "@/components/content/content-shell";
import { HelpHero } from "@/components/content/help-hero";
import { HelpTileGrid } from "@/components/content/help-tile-grid";
import { StaticProse } from "@/components/content/static-prose";
import { getStaticPage } from "@/lib/api/endpoints";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

const HELP_TILES = [
  { title: "Доставка", href: "#" },
  { title: "Отзывы", href: "#" },
  { title: "Условия обслуживания", href: "#" },
  { title: "Корпоративные подарки", href: "#" },
  { title: "Возврат", href: "#" },
  { title: "Подарочные карты", href: "#" },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("help");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/help/",
    ogImage: page.heroImage?.url,
  });
}

export default async function HelpPage() {
  const page = await getStaticPage("help");
  const hasHero = Boolean(page.heroImage?.url);
  const breadcrumbs = contentBreadcrumbs({
    name: page.title,
    href: "/help/",
  });

  if (hasHero && page.heroImage) {
    return (
      <main id="main" className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-[1564px] px-4 sm:px-8">
          <Breadcrumbs items={breadcrumbs} className="mb-6 pt-8" />
        </div>
        <HelpHero
          title={page.title}
          bodyHtml={page.body}
          image={page.heroImage}
        />
        <ContentShell
          title={page.title}
          breadcrumbs={breadcrumbs}
          showTitle={false}
          showBreadcrumbs={false}
        >
          <HelpTileGrid className="mt-10" items={[...HELP_TILES]} />
        </ContentShell>
      </main>
    );
  }

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell title={page.title} breadcrumbs={breadcrumbs}>
        <StaticProse html={page.body} className="mb-10" />
        <HelpTileGrid items={[...HELP_TILES]} />
      </ContentShell>
    </main>
  );
}
