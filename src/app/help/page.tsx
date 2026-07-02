import type { Metadata } from "next";

import { ContentShell } from "@/components/content/content-shell";
import { InfoTileGrid } from "@/components/content/info-tile-grid";
import { getStaticPage } from "@/lib/api/endpoints";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 300;

const HELP_TILES = [
  { title: "Доставка", description: "Условия и сроки доставки", href: "#" },
  { title: "Отзывы", description: "Мнения покупателей", href: "#" },
  {
    title: "Условия обслуживания",
    description: "Правила работы с заказами",
    href: "#",
  },
  {
    title: "Корпоративные подарки",
    description: "Подарки для компаний и мероприятий",
    href: "#",
  },
  { title: "Возврат", description: "Порядок возврата товаров", href: "#" },
  {
    title: "Подарочные карты",
    description: "Электронные и физические карты",
    href: "#",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("help");
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/help/",
  });
}

export default async function HelpPage() {
  const page = await getStaticPage("help");

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={page.title}
        breadcrumbs={contentBreadcrumbs({ name: page.title, href: "/help/" })}
      >
        <p className="mb-8 max-w-3xl text-body text-text-secondary">
          В MURU мы стремимся сделать каждую покупку простой и приятной. На этой
          странице собрана важная информация для клиентов: условия доставки и
          обслуживания, отзывы, подарочные карты и корпоративные подарки.
          Нейтральный текст-плейсхолдер.
        </p>
        <InfoTileGrid items={[...HELP_TILES]} />
      </ContentShell>
    </main>
  );
}
