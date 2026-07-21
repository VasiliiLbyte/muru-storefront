import type { Metadata } from "next";

import { PartnersPageContent } from "@/components/company/partners-page";
import { ContentShell } from "@/components/content/content-shell";
import { StaticProse } from "@/components/content/static-prose";
import { getStaticPage } from "@/lib/api/endpoints";
import { companyCrumb, contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { isPartnersSections } from "@/lib/schemas";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

const PAGE_PATH = "/company/partners/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("partners");
  const heroImage = isPartnersSections(page.sections)
    ? page.sections.hero.image?.url
    : undefined;
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: PAGE_PATH,
    ogImage: page.heroImage?.url ?? heroImage,
  });
}

export default async function PartnersPage() {
  const page = await getStaticPage("partners");
  const breadcrumbs = contentBreadcrumbs(
    companyCrumb(),
    { name: page.title, href: PAGE_PATH },
  );

  if (isPartnersSections(page.sections)) {
    return (
      <main id="main" className="flex flex-1 flex-col">
        <PartnersPageContent
          hero={page.sections.hero}
          breadcrumbs={breadcrumbs}
        />
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
