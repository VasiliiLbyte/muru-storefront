import type { Metadata } from "next";

import { ContentShell } from "@/components/content/content-shell";
import { StaticProse } from "@/components/content/static-prose";
import { getStaticPage } from "@/lib/api/endpoints";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("offer");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/legal/offer/",
  });
}

export default async function OfferPage() {
  const page = await getStaticPage("offer");

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={page.title}
        breadcrumbs={contentBreadcrumbs({
          name: page.title,
          href: "/legal/offer/",
        })}
      >
        <StaticProse html={page.body} />
      </ContentShell>
    </main>
  );
}
