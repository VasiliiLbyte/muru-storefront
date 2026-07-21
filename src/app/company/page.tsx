import type { Metadata } from "next";

import { AboutPage } from "@/components/company/about-page";
import { ContentShell } from "@/components/content/content-shell";
import { getStaticPage } from "@/lib/api/endpoints";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("company");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/company/",
  });
}

export default async function CompanyPage() {
  const page = await getStaticPage("company");

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={page.title}
        breadcrumbs={contentBreadcrumbs({ name: page.title, href: "/company/" })}
      >
        <AboutPage sections={page.sections} />
      </ContentShell>
    </main>
  );
}
