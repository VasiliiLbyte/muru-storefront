import type { Metadata } from "next";

import { ContentShell } from "@/components/content/content-shell";
import { MediaCard } from "@/components/home/media-card";
import { getCollections } from "@/lib/api/endpoints";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Коллекции — MURU",
    description: "Коллекции MURU — сезонные подборки декора и предметов для дома.",
    path: "/landings/",
  });
}

export default async function LandingsPage() {
  const collections = await getCollections();

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title="Коллекции"
        breadcrumbs={contentBreadcrumbs({ name: "Коллекции", href: "/landings/" })}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <MediaCard
              key={collection.slug}
              href={`/landings/${collection.slug}/`}
              image={collection.heroImage}
              title={collection.title}
              subtitle={collection.subtitle}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ))}
        </div>
      </ContentShell>
    </main>
  );
}
