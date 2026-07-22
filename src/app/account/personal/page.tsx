import type { Metadata } from "next";

import { AccountPersonalView } from "@/components/account/account-personal-view";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Персональные данные",
    description: "Персональные данные личного кабинета MURU.",
    path: "/account/personal/",
    robots: { index: false, follow: false },
  });
}

export default function AccountPersonalPage() {
  return <AccountPersonalView />;
}
