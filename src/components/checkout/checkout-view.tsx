"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { WebDeliveryFields } from "@/components/checkout/web-delivery-fields";
import { useWebDelivery } from "@/components/checkout/use-web-delivery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { createWebPayment } from "@/lib/api/endpoints";
import { toWebCheckoutItems } from "@/lib/cart/checkout-mapping";
import { hydrateCartProducts } from "@/lib/cart/hydrate";
import { computeCartTotals } from "@/lib/cart/totals";
import {
  PENDING_WEB_CHECKOUT_SOURCE_KEY,
  PENDING_WEB_PAYMENT_ID_KEY,
} from "@/lib/checkout/constants";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/schemas";
import { useCartItems, useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const textareaClassName =
  "flex min-h-24 w-full min-w-0 rounded-sm border border-input bg-background px-2 py-2 text-body text-foreground transition-[color,border-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70";

function isEmailValid(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.includes("@") && trimmed.includes(".");
}

function isPhoneValid(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

export function CheckoutView() {
  const router = useRouter();
  const items = useCartItems();
  const removeItem = useCartStore((s) => s.removeItem);

  const [cartHydrated, setCartHydrated] = useState(false);
  const [hydratedKey, setHydratedKey] = useState("");
  const [productsBySku, setProductsBySku] = useState<Map<string, Product>>(
    () => new Map(),
  );

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const skusKey = useMemo(
    () => items.map((i) => i.sku).sort().join(","),
    [items],
  );

  const loadingProducts = items.length > 0 && hydratedKey !== skusKey;
  const activeProducts =
    items.length === 0 ? new Map<string, Product>() : productsBySku;
  const visibleItems = useMemo(
    () => items.filter((i) => activeProducts.has(i.sku)),
    [items, activeProducts],
  );
  const totals = computeCartTotals(visibleItems, activeProducts);

  const calcItems = useMemo(
    () => visibleItems.map((i) => ({ sku: i.sku, quantity: i.qty })),
    [visibleItems],
  );

  const delivery = useWebDelivery(calcItems);

  useEffect(() => {
    const finish = () => setCartHydrated(true);
    const unsub = useCartStore.persist.onFinishHydration(finish);
    if (useCartStore.persist.hasHydrated()) {
      finish();
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    if (items.length === 0) {
      router.replace("/basket/");
    }
  }, [cartHydrated, items.length, router]);

  useEffect(() => {
    if (items.length === 0) return;

    let cancelled = false;

    hydrateCartProducts(items.map((i) => i.sku)).then((map) => {
      if (cancelled) return;

      for (const item of items) {
        if (!map.has(item.sku)) removeItem(item.sku);
      }

      setProductsBySku(map);
      setHydratedKey(skusKey);
    });

    return () => {
      cancelled = true;
    };
  }, [skusKey, items, removeItem]);

  const formValid =
    recipientName.trim().length >= 2 &&
    isPhoneValid(recipientPhone) &&
    isEmailValid(email) &&
    consentAccepted &&
    delivery.deliveryValid;

  const canSubmit =
    formValid &&
    visibleItems.length > 0 &&
    !submitting &&
    !loadingProducts &&
    cartHydrated;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    const cdek = delivery.cdekPayloadFields();
    if (!cdek) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      items: toWebCheckoutItems(items),
      deliveryMode: "delivery" as const,
      ...cdek,
      comment: comment.trim(),
      birthDate: null,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      email: email.trim(),
    };

    try {
      const { paymentId, confirmationUrl } = await createWebPayment(payload);
      sessionStorage.setItem(PENDING_WEB_PAYMENT_ID_KEY, paymentId);
      sessionStorage.setItem(PENDING_WEB_CHECKOUT_SOURCE_KEY, "cart");
      window.location.assign(confirmationUrl);
      return;
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Не удалось создать платёж. Попробуйте позже.",
      );
      setSubmitting(false);
    }
  };

  if (!cartHydrated || (items.length === 0 && cartHydrated)) {
    return (
      <div className="mx-auto w-full max-w-[1564px] px-4 pb-16 sm:px-8">
        <p className="pt-8 text-body text-text-muted">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1564px] px-4 pb-16 sm:px-8">
      <h1 className="mb-8 pt-8 font-display text-display text-text-heading">
        Оформление заказа
      </h1>

      {loadingProducts ? (
        <p className="text-body text-text-muted">Загрузка корзины…</p>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="checkout-recipient-name"
                className="text-body text-text-secondary"
              >
                ФИО получателя
              </label>
              <Input
                id="checkout-recipient-name"
                name="recipientName"
                type="text"
                autoComplete="name"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="checkout-recipient-phone"
                className="text-body text-text-secondary"
              >
                Телефон
              </label>
              <Input
                id="checkout-recipient-phone"
                name="recipientPhone"
                type="tel"
                autoComplete="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="checkout-email"
                className="text-body text-text-secondary"
              >
                E-mail
              </label>
              <Input
                id="checkout-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <WebDeliveryFields delivery={delivery} idPrefix="checkout" />

            <div className="flex flex-col gap-2">
              <label
                htmlFor="checkout-comment"
                className="text-body text-text-secondary"
              >
                Комментарий к заказу
              </label>
              <textarea
                id="checkout-comment"
                name="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={textareaClassName}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-body text-text-secondary">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded-sm border-input accent-brand"
              />
              <span>
                Я соглашаюсь с{" "}
                <Link
                  href="/legal/privacy/"
                  className="text-text-heading underline-offset-2 transition-colors hover:text-brand hover:underline"
                >
                  условиями обработки персональных данных
                </Link>
              </span>
            </label>

            {submitError ? (
              <p className="text-small text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className="h-11 w-full lg:hidden"
            >
              {submitting ? "Переход к оплате…" : "Оплатить"}
            </Button>
          </form>

          <aside
            className={cn(
              "flex h-fit flex-col gap-6 border border-border bg-surface p-6 lg:sticky lg:top-24",
            )}
          >
            <h2 className="font-display text-h2 text-text-heading">
              Ваш заказ
            </h2>

            <ul className="flex flex-col gap-4 border-b border-border pb-4">
              {visibleItems.map((item) => {
                const product = activeProducts.get(item.sku);
                if (!product) return null;
                return (
                  <li
                    key={item.sku}
                    className="flex flex-col gap-1 border-b border-border pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="text-body text-text-heading">{product.title}</p>
                    <p className="text-small text-text-secondary">
                      {item.qty} × {formatPrice(product.price, product.currency)}
                    </p>
                    <p className="text-body font-medium text-text-heading">
                      {formatPrice(
                        product.price * item.qty,
                        product.currency,
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>

            <dl className="flex flex-col gap-3 text-body">
              <div className="flex justify-between gap-4 border-t border-border pt-3">
                <dt className="font-medium text-text-heading">Сумма</dt>
                <dd className="font-medium text-text-heading">
                  {formatPrice(totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Доставка</dt>
                <dd className="text-text-heading">
                  {delivery.selectedTariff
                    ? formatPrice(delivery.selectedTariff.deliverySum)
                    : "—"}
                </dd>
              </div>
            </dl>

            <p className="text-small text-text-muted">
              Итоговая сумма будет подтверждена при оплате.
            </p>

            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              disabled={!canSubmit}
              className="hidden h-11 w-full lg:flex"
            >
              {submitting ? "Переход к оплате…" : "Оплатить"}
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
