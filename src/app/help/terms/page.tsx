import type { Metadata } from "next";

import { ContentShell } from "@/components/content/content-shell";
import { StaticProse } from "@/components/content/static-prose";
import { getStaticPage } from "@/lib/api/endpoints";
import { contentBreadcrumbs, helpCrumb } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("terms");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/help/terms/",
  });
}

export default async function TermsPage() {
  const page = await getStaticPage("terms");

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={page.title}
        breadcrumbs={contentBreadcrumbs(helpCrumb(), {
          name: page.title,
          href: "/help/terms/",
        })}
      >
        <StaticProse html={page.body} />
      </ContentShell>
    </main>
  );
}
