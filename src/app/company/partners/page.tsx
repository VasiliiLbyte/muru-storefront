import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ContentShell } from "@/components/content/content-shell";
import { HelpHero } from "@/components/content/help-hero";
import { StaticProse } from "@/components/content/static-prose";
import { getStaticPage } from "@/lib/api/endpoints";
import { companyCrumb, contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

const PAGE_PATH = "/company/partners/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("partners");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: PAGE_PATH,
    ogImage: page.heroImage?.url,
  });
}

export default async function PartnersPage() {
  const page = await getStaticPage("partners");
  const hasHero = Boolean(page.heroImage?.url);
  const breadcrumbs = contentBreadcrumbs(
    companyCrumb(),
    { name: page.title, href: PAGE_PATH },
  );

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
          <StaticProse html={page.body} />
        </ContentShell>
      </main>
    );
  }

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell title={page.title} breadcrumbs={breadcrumbs}>
        <StaticProse html={page.body} />
      </ContentShell>
    </main>
  );
}
