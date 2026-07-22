import type { Metadata } from "next";

import { AccountFavoritesView } from "@/components/account/account-favorites-view";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Избранное",
    description: "Избранное личного кабинета MURU.",
    path: "/account/favorites/",
    robots: { index: false, follow: false },
  });
}

export default function AccountFavoritesPage() {
  return <AccountFavoritesView />;
}
