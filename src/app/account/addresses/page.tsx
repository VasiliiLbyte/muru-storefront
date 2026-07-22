import type { Metadata } from "next";

import { AccountAddressesView } from "@/components/account/account-addresses-view";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Адреса доставки",
    description: "Адреса доставки личного кабинета MURU.",
    path: "/account/addresses/",
    robots: { index: false, follow: false },
  });
}

export default function AccountAddressesPage() {
  return <AccountAddressesView />;
}
