"use client";

import type { CartTotals } from "@/lib/cart/totals";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/schemas";
import { cn } from "@/lib/utils";

import { BasketCheckout } from "./basket-checkout";

export function BasketSummary({
  items,
  totals,
  className,
}: {
  items: CartItem[];
  totals: CartTotals;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex flex-col gap-3 border-border bg-surface",
        // Mobile: fixed bottom bar
        "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-30 max-lg:border-t max-lg:p-4 max-lg:pb-safe",
        // Desktop: in-column sticky
        "lg:sticky lg:top-24 lg:gap-6 lg:p-6",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1564px] flex-col gap-3 lg:mx-0 lg:max-w-none lg:gap-6">
        <div className="flex items-baseline justify-between gap-4 lg:block">
          <h2 className="font-display text-h2 text-text-heading">Итого</h2>
          <p className="font-medium text-text-heading lg:hidden">
            {formatPrice(totals.subtotal)}
          </p>
        </div>

        <dl className="hidden flex-col gap-3 text-body lg:flex">
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Позиций</dt>
            <dd className="text-text-heading">{totals.lineCount}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Единиц</dt>
            <dd className="text-text-heading">{totals.unitCount}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-3">
            <dt className="font-medium text-text-heading">Сумма</dt>
            <dd className="font-medium text-text-heading">
              {formatPrice(totals.subtotal)}
            </dd>
          </div>
        </dl>

        <BasketCheckout items={items} disabled={totals.unitCount === 0} />
      </div>
    </aside>
  );
}
