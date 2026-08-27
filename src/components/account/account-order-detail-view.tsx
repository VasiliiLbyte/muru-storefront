"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AccountShell } from "@/components/account/account-shell";
import {
  AccountApiError,
  accountFetchJson,
} from "@/lib/account/account-fetch";
import {
  CustomerOrderDetailSchema,
  orderStatusProgress,
  type CustomerOrderDetail,
} from "@/lib/schemas/account";
import { z } from "zod";

function cdekTrackingUrl(track: string) {
  return `https://www.cdek.ru/ru/tracking?order_id=${encodeURIComponent(track)}`;
}

function deliveryLabel(
  mode: CustomerOrderDetail["deliveryMode"],
  option: CustomerOrderDetail["deliveryOption"],
): string {
  if (mode === "pickup") return "Самовывоз";
  const opt = (option ?? "").toLowerCase();
  if (opt.includes("pvz")) return "ПВЗ СДЭК";
  if (mode === "delivery" || opt.includes("courier") || opt.includes("door")) {
    return "Курьер СДЭК";
  }
  return "Доставка";
}

function formatMoney(n: number) {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

function OrderProgress({ status }: { status: string }) {
  const { step, total } = orderStatusProgress(status);
  const pct = total > 0 && step > 0 ? Math.round((step / total) * 100) : 0;
  if (step <= 0 || ["Отменён", "Возврат"].includes(status)) return null;

  return (
    <div
      className="mt-3 h-1.5 w-full bg-surface"
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Статус: ${status}`}
    >
      <div
        className="h-full bg-brand transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function AccountOrderDetailView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(null);
    setOrder(null);

    (async () => {
      try {
        const raw = await accountFetchJson(`orders/${orderId}`);
        if (cancelled) return;
        const parsed = z
          .object({ order: CustomerOrderDetailSchema })
          .parse(raw);
        setOrder(parsed.order);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof AccountApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof AccountApiError
              ? err.message
              : "Не удалось загрузить заказ",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const backLink = (
    <Link
      href="/account/orders/"
      className="inline-flex text-small text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
    >
      ← К заказам
    </Link>
  );

  if (loading) {
    return (
      <AccountShell title={`Заказ № ${orderId}`}>
        <div className="space-y-4">
          {backLink}
          <p className="text-body text-text-muted">Загрузка…</p>
        </div>
      </AccountShell>
    );
  }

  if (notFound) {
    return (
      <AccountShell title={`Заказ № ${orderId}`}>
        <div className="space-y-4">
          {backLink}
          <p className="text-body text-text-heading" role="alert">
            Заказ не найден
          </p>
          <p className="text-body text-text-muted">
            Возможно, заказ принадлежит другому аккаунту или был удалён.
          </p>
          <Link
            href="/account/orders/"
            className="inline-flex text-body text-brand transition-colors hover:text-brand-hover focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            Вернуться к списку заказов
          </Link>
        </div>
      </AccountShell>
    );
  }

  if (error || !order) {
    return (
      <AccountShell title={`Заказ № ${orderId}`}>
        <div className="space-y-4">
          {backLink}
          <p className="text-body text-destructive" role="alert">
            {error ?? "Не удалось загрузить заказ"}
          </p>
        </div>
      </AccountShell>
    );
  }

  const itemsSum = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <AccountShell title={`Заказ № ${order.id}`}>
      <div className="space-y-8">
        {backLink}

        <section className="border border-border px-4 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-body text-text-heading">
              {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-body text-brand">{order.status}</p>
          </div>
          <OrderProgress status={order.status} />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg text-text-heading">
            Товары
          </h2>
          {order.items.length === 0 ? (
            <p className="text-body text-text-muted">Нет позиций.</p>
          ) : (
            <ul className="divide-y divide-border border border-border">
              {order.items.map((item) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <li
                    key={`${item.sku}-${item.name}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
                  >
                    <p className="text-body text-text-primary">
                      {item.name}
                      <span className="text-text-muted">
                        {" "}
                        · {item.quantity} × {formatMoney(item.price)}
                      </span>
                    </p>
                    <p className="text-body text-text-heading">
                      {formatMoney(lineTotal)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg text-text-heading">
            Доставка
          </h2>
          <div className="space-y-1 border border-border px-4 py-4 text-body text-text-secondary">
            <p className="text-text-heading">
              {deliveryLabel(order.deliveryMode, order.deliveryOption)}
            </p>
            {order.deliveryCity ? <p>{order.deliveryCity}</p> : null}
            {order.pvzAddress ? (
              <p>
                {order.pvzAddress}
                {order.pvzCode ? ` (${order.pvzCode})` : null}
              </p>
            ) : order.address ? (
              <p>{order.address}</p>
            ) : null}
            {order.deliveryEta ? <p>Срок: {order.deliveryEta}</p> : null}
            {order.deliveryPrice != null ? (
              <p>Стоимость: {formatMoney(order.deliveryPrice)}</p>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg text-text-heading">
            Трек-номер
          </h2>
          <div className="border border-border px-4 py-4 text-body">
            {order.trackNumber ? (
              <a
                href={cdekTrackingUrl(order.trackNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand transition-colors hover:text-brand-hover focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                {order.trackNumber}
              </a>
            ) : (
              <p className="text-text-muted">
                Трек-номер появится после отправки
              </p>
            )}
            {order.cdekStatus ? (
              <p className="mt-1 text-small text-text-muted">
                Статус СДЭК: {order.cdekStatus}
              </p>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg text-text-heading">
            Оплата
          </h2>
          <div className="border border-border px-4 py-4 text-body text-text-secondary">
            {order.paidAt ? (
              <p>
                Оплачено{" "}
                {new Date(order.paidAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            ) : (
              <p>Ожидает оплаты</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg text-text-heading">Итого</h2>
          <dl className="space-y-2 border border-border px-4 py-4 text-body">
            <div className="flex justify-between gap-4 text-text-secondary">
              <dt>Товары</dt>
              <dd>{formatMoney(itemsSum)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-text-secondary">
              <dt>Доставка</dt>
              <dd>
                {order.deliveryPrice != null
                  ? formatMoney(order.deliveryPrice)
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-2 text-text-heading">
              <dt>Итого</dt>
              <dd>{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </AccountShell>
  );
}
