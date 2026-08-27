import type { Metadata } from "next";

import { AccountOrderDetailView } from "@/components/account/account-order-detail-view";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildPageMetadata({
    title: `Заказ № ${id}`,
    description: "Детали заказа личного кабинета MURU.",
    path: `/account/orders/${id}/`,
    robots: { index: false, follow: false },
  });
}

export default async function AccountOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AccountOrderDetailView orderId={id} />;
}
