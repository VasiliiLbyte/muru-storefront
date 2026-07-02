import type { Metadata } from "next";

import { BasketView } from "@/components/basket/basket-view";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Корзина",
    description: "Корзина покупок MURU — предметы декора для дома.",
    path: "/basket/",
  });
}

export default function BasketPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <BasketView />
    </main>
  );
}
