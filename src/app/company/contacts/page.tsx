import type { Metadata } from "next";

import { ContactsPageContent } from "@/components/contacts/contacts-page-content";
import { ContentShell } from "@/components/content/content-shell";
import { getStaticPage } from "@/lib/api/endpoints";
import { companyCrumb, contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("contacts");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/company/contacts/",
  });
}

export default async function ContactsPage() {
  const page = await getStaticPage("contacts");

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={page.title}
        breadcrumbs={contentBreadcrumbs(
          companyCrumb(),
          { name: page.title, href: "/company/contacts/" },
        )}
      >
        <ContactsPageContent />
      </ContentShell>
    </main>
  );
}
