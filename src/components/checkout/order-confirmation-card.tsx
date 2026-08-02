"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { formatPrice } from "@/lib/format";
import type { WebPaymentOrderSummary } from "@/lib/schemas/order";
import { useCustomerSessionStatus } from "@/stores/customer-session-store";

function deliveryMethodLabel(order: WebPaymentOrderSummary): string {
  if (order.deliveryMode === "pickup") return "Самовывоз";
  return order.deliveryOption?.trim() || "Доставка";
}

type OrderConfirmationCardProps = {
  order: WebPaymentOrderSummary;
};

export function OrderConfirmationCard({ order }: OrderConfirmationCardProps) {
  const router = useRouter();
  const sessionStatus = useCustomerSessionStatus();
  const deliveryAddress =
    order.cdekPvzAddress?.trim() || order.address?.trim() || null;

  return (
    <div className="w-full max-w-xl border border-border bg-surface px-4 py-8 text-left sm:px-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className="flex size-12 items-center justify-center rounded-full border border-brand text-brand"
          aria-hidden
        >
          <Check className="size-6" strokeWidth={1.75} />
        </span>
        <h1 className="font-display text-h2 text-text-heading">
          Заказ оплачен
        </h1>
        <p className="text-body text-text-secondary">№ {order.id}</p>
      </div>

      <ul className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
        {order.items.map((item, index) => {
          const meta = [item.color, item.size].filter(Boolean).join(" · ");
          return (
            <li
              key={`${item.name}-${index}`}
              className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="text-body text-text-heading">{item.name}</p>
                {meta ? (
                  <p className="text-small text-text-muted">{meta}</p>
                ) : null}
              </div>
              <p className="shrink-0 text-body text-text-secondary">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </li>
          );
        })}
      </ul>

      <dl className="mt-6 flex flex-col gap-2 border-t border-border pt-6 text-body">
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Подытог</dt>
          <dd className="text-text-heading">{formatPrice(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Доставка</dt>
          <dd className="text-text-heading">
            {formatPrice(order.deliveryPrice)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 font-medium">
          <dt className="text-text-heading">Итого</dt>
          <dd className="text-text-heading">{formatPrice(order.total)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-1 border-t border-border pt-6 text-body text-text-secondary">
        <p className="text-text-heading">{deliveryMethodLabel(order)}</p>
        {deliveryAddress ? <p>{deliveryAddress}</p> : null}
        {order.recipientName?.trim() ? (
          <p>Получатель: {order.recipientName.trim()}</p>
        ) : null}
        {order.deliveryEta?.trim() ? (
          <p>Срок: {order.deliveryEta.trim()}</p>
        ) : null}
      </div>

      <p className="mt-6 text-center text-small text-text-muted">
        Мы отправили подтверждение на вашу почту
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-body text-brand underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          На главную
        </button>
        {sessionStatus === "authenticated" ? (
          <button
            type="button"
            onClick={() => router.push("/account/orders/")}
            className="text-body text-brand underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Мои заказы
          </button>
        ) : null}
      </div>
    </div>
  );
}
