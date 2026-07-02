import type { Metadata } from "next";

import { FavoriteView } from "@/components/favorites/favorite-view";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Избранное",
    description: "Избранные товары MURU — сохраняйте то, что нравится.",
    path: "/personal/favorite/",
    robots: { index: false, follow: false },
  });
}

export default function FavoritePage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <FavoriteView />
    </main>
  );
}
