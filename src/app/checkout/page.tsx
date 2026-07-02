import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/checkout-view";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Оформление заказа",
    description: "Оформление заказа в интернет-магазине MURU.",
    path: "/checkout/",
  });
}

export default function CheckoutPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <CheckoutView />
    </main>
  );
}
