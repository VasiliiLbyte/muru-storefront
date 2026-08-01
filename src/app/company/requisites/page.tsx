import type { Metadata } from "next";

import { RequisitesTable } from "@/components/company/requisites-table";
import { ContentShell } from "@/components/content/content-shell";
import { getRequisites, getStaticPage } from "@/lib/api/endpoints";
import { companyCrumb, contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("requisites");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/company/requisites/",
  });
}

export default async function RequisitesPage() {
  const [page, rows] = await Promise.all([
    getStaticPage("requisites"),
    getRequisites(),
  ]);

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={page.title}
        breadcrumbs={contentBreadcrumbs(
          companyCrumb(),
          { name: page.title, href: "/company/requisites/" },
        )}
      >
        <RequisitesTable rows={rows} />
      </ContentShell>
    </main>
  );
}
