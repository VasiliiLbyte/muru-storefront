import type { Metadata } from "next";

import { ContentShell } from "@/components/content/content-shell";
import { StaticProse } from "@/components/content/static-prose";
import { getStaticPage } from "@/lib/api/endpoints";
import { contentBreadcrumbs, toSentenceCaseRu } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("consent");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/legal/consent/",
  });
}

export default async function ConsentPage() {
  const page = await getStaticPage("consent");

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={page.title}
        breadcrumbs={contentBreadcrumbs({
          name: toSentenceCaseRu(page.title),
          href: "/legal/consent/",
        })}
      >
        <StaticProse html={page.body} />
      </ContentShell>
    </main>
  );
}
