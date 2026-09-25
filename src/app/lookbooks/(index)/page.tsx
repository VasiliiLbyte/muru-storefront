import type { Metadata } from "next";

import { ContentShell } from "@/components/content/content-shell";
import { MediaCard } from "@/components/home/media-card";
import { getLookbooks } from "@/lib/api/endpoints";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Вдохновение — MURU",
    description:
      "Вдохновение MURU — визуальные истории об интерьере, сервировке и уюте.",
    path: "/lookbooks/",
  });
}

export default async function LookbooksPage() {
  const lookbooks = await getLookbooks();

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title="Вдохновение"
        breadcrumbs={contentBreadcrumbs({
          name: "Вдохновение",
          href: "/lookbooks/",
        })}
      >
        <div className="grid w-full max-w-[1140px] grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
          {lookbooks.map((lookbook) => (
            <MediaCard
              key={lookbook.slug}
              href={`/lookbooks/${lookbook.slug}/`}
              image={lookbook.cover}
              title={lookbook.title}
              imageAspect="aspect-square"
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            />
          ))}
        </div>
      </ContentShell>
    </main>
  );
}
