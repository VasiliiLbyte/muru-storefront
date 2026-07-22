import type { Metadata } from "next";

import { AccountOrdersView } from "@/components/account/account-orders-view";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Заказы",
    description: "Заказы личного кабинета MURU.",
    path: "/account/orders/",
    robots: { index: false, follow: false },
  });
}

export default function AccountOrdersPage() {
  return <AccountOrdersView />;
}
