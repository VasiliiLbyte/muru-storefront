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
        "flex flex-col gap-6 border border-border bg-surface p-6 lg:sticky lg:top-24",
        className,
      )}
    >
      <h2 className="font-display text-h2 text-text-heading">Итого</h2>

      <dl className="flex flex-col gap-3 text-body">
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
    </aside>
  );
}
