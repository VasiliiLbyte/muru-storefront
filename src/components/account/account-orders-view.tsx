"use client";

import { useEffect, useState } from "react";

import { AccountShell } from "@/components/account/account-shell";
import {
  AccountApiError,
  accountFetchJson,
} from "@/lib/account/account-fetch";
import {
  CustomerOrderSummarySchema,
  isActiveOrderStatus,
  orderStatusProgress,
  type CustomerOrderSummary,
} from "@/lib/schemas/account";
import { z } from "zod";

const OrdersSchema = z.array(CustomerOrderSummarySchema);

function OrderCard({ order }: { order: CustomerOrderSummary }) {
  const { step, total } = orderStatusProgress(order.status);
  const pct = total > 0 && step > 0 ? Math.round((step / total) * 100) : 0;

  return (
    <li className="border border-border px-4 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-body text-text-heading">Заказ № {order.id}</p>
        <p className="text-body text-text-secondary">
          {order.total.toLocaleString("ru-RU")} ₽
        </p>
      </div>
      <p className="mt-1 text-small text-text-muted">
        {new Date(order.createdAt).toLocaleDateString("ru-RU")} · {order.status}
      </p>
      {step > 0 && !["Отменён", "Возврат"].includes(order.status) ? (
        <div
          className="mt-3 h-1.5 w-full bg-surface"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`Статус: ${order.status}`}
        >
          <div
            className="h-full bg-brand transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </li>
  );
}

export function AccountOrdersView() {
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await accountFetchJson("orders");
        if (!cancelled) {
          setOrders(
            z.object({ orders: OrdersSchema }).parse(raw).orders,
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AccountApiError
              ? err.message
              : "Не удалось загрузить заказы",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const active = orders.filter((o) => isActiveOrderStatus(o.status));
  const done = orders.filter((o) => !isActiveOrderStatus(o.status));

  return (
    <AccountShell title="Заказы">
      {loading ? (
        <p className="text-body text-text-muted">Загрузка…</p>
      ) : error ? (
        <p className="text-body text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 font-display text-lg text-text-heading">
              Активные
            </h2>
            {active.length === 0 ? (
              <p className="text-body text-text-muted">Нет активных заказов.</p>
            ) : (
              <ul className="space-y-3">
                {active.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="mb-4 font-display text-lg text-text-heading">
              Завершённые
            </h2>
            {done.length === 0 ? (
              <p className="text-body text-text-muted">
                Завершённых заказов пока нет.
              </p>
            ) : (
              <ul className="space-y-3">
                {done.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </AccountShell>
  );
}
