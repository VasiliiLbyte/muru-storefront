import type { Metadata } from "next";

import { AccountHomeView } from "@/components/account/account-home-view";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Личный кабинет",
    description: "Личный кабинет MURU.",
    path: "/account/",
    robots: { index: false, follow: false },
  });
}

export default function AccountPage() {
  return <AccountHomeView />;
}
