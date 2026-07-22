"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AccountShell } from "@/components/account/account-shell";
import {
  AccountApiError,
  accountFetchJson,
} from "@/lib/account/account-fetch";
import {
  CustomerOrderSummarySchema,
  CustomerSchema,
  isActiveOrderStatus,
  type Customer,
  type CustomerOrderSummary,
} from "@/lib/schemas/account";
import { z } from "zod";

const OrdersSchema = z.array(CustomerOrderSummarySchema);

export function AccountHomeView() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meRaw, ordersRaw] = await Promise.all([
          accountFetchJson("me"),
          accountFetchJson("orders"),
        ]);
        if (cancelled) return;
        const meParsed = z
          .object({ customer: CustomerSchema })
          .parse(meRaw);
        const ordersParsed = z
          .object({ orders: OrdersSchema })
          .parse(ordersRaw);
        setCustomer(meParsed.customer);
        setOrders(ordersParsed.orders);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AccountApiError
              ? err.message
              : "Не удалось загрузить кабинет",
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

  return (
    <AccountShell title="Личный кабинет">
      {loading ? (
        <p className="text-body text-text-muted">Загрузка…</p>
      ) : error ? (
        <p className="text-body text-destructive" role="alert">
          {error}
        </p>
      ) : customer ? (
        <div className="space-y-10">
          <section className="space-y-2">
            <h2 className="font-display text-xl text-text-heading">
              {customer.fullName}
            </h2>
            <p className="text-body text-text-secondary">{customer.email}</p>
            <p className="text-body text-text-secondary">
              {customer.phone?.trim()
                ? customer.phone
                : "Телефон не указан"}
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/account/favorites/"
              className="border border-border bg-background px-5 py-6 transition-colors hover:border-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="font-display text-lg text-text-heading">
                Избранное
              </span>
              <p className="mt-2 text-small text-text-muted">
                Сохранённые товары
              </p>
            </Link>
            <Link
              href="/account/orders/"
              className="border border-border bg-background px-5 py-6 transition-colors hover:border-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="font-display text-lg text-text-heading">
                Заказы
              </span>
              <p className="mt-2 text-small text-text-muted">
                История и статусы
              </p>
            </Link>
          </section>

          <section>
            <h2 className="mb-4 font-display text-lg text-text-heading">
              Активные заказы
            </h2>
            {active.length === 0 ? (
              <p className="text-body text-text-muted">
                Пока нет активных заказов.
              </p>
            ) : (
              <ul className="space-y-3">
                {active.map((order) => (
                  <li
                    key={order.id}
                    className="border border-border px-4 py-3 text-body"
                  >
                    <span className="text-text-heading">№ {order.id}</span>
                    <span className="mx-2 text-text-muted">·</span>
                    <span className="text-text-secondary">{order.status}</span>
                    <span className="mx-2 text-text-muted">·</span>
                    <span>
                      {order.total.toLocaleString("ru-RU")} ₽
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </AccountShell>
  );
}
