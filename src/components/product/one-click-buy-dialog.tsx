"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { WebDeliveryFields } from "@/components/checkout/web-delivery-fields";
import { useWebDelivery } from "@/components/checkout/use-web-delivery";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { createWebPayment } from "@/lib/api/endpoints";
import {
  PENDING_WEB_CHECKOUT_SOURCE_KEY,
  PENDING_WEB_PAYMENT_ID_KEY,
} from "@/lib/checkout/constants";
import { formatPrice } from "@/lib/format";
import { staticBlurProps } from "@/lib/images";
import type { Product } from "@/lib/schemas";

const textareaClassName =
  "flex min-h-20 w-full min-w-0 rounded-sm border border-input bg-background px-2 py-2 text-body text-foreground transition-[color,border-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70";

function isEmailValid(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.includes("@") && trimmed.includes(".");
}

function isPhoneValid(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

export function OneClickBuyDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const calcItems = useMemo(
    () => [{ sku: product.sku, quantity: 1 }],
    [product.sku],
  );
  const delivery = useWebDelivery(calcItems);

  const image = product.images[0];
  const deliverySum = delivery.selectedTariff?.deliverySum ?? 0;
  const totalEstimate = product.price + deliverySum;

  const formValid =
    recipientName.trim().length >= 2 &&
    isPhoneValid(recipientPhone) &&
    isEmailValid(email) &&
    consentAccepted &&
    delivery.deliveryValid;

  const canSubmit = formValid && !submitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    const cdek = delivery.cdekPayloadFields();
    if (!cdek) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      items: [{ sku: product.sku, quantity: 1 }],
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
      sessionStorage.setItem(PENDING_WEB_CHECKOUT_SOURCE_KEY, "one-click");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <div className="grid max-h-[90vh] grid-cols-1 overflow-y-auto lg:grid-cols-2">
          <div className="flex flex-col gap-4 border-b border-border bg-surface p-6 lg:border-r lg:border-b-0">
            <div className="relative aspect-square w-full max-w-sm overflow-hidden bg-background">
              {image ? (
                <Image
                  src={image.url}
                  alt={image.alt ?? product.title}
                  fill
                  sizes="(min-width: 1024px) 28rem, 90vw"
                  className="object-cover"
                  {...staticBlurProps()}
                />
              ) : null}
            </div>
            <div>
              <p className="font-display text-h2 text-text-heading">
                {product.title}
              </p>
              <p className="mt-2 text-h2 font-medium text-text-heading">
                {formatPrice(product.price, product.currency)}
              </p>
              {delivery.selectedTariff ? (
                <dl className="mt-4 flex flex-col gap-1 text-small text-text-secondary">
                  <div className="flex justify-between gap-4">
                    <dt>Доставка</dt>
                    <dd className="text-text-heading">
                      {formatPrice(deliverySum)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Итого (ориентир)</dt>
                    <dd className="font-medium text-text-heading">
                      {formatPrice(totalEstimate)}
                    </dd>
                  </div>
                </dl>
              ) : null}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 p-6 pt-12 sm:pt-6"
            noValidate
          >
            <DialogHeader>
              <DialogTitle className="font-display text-h2 tracking-[0.08em] text-text-heading uppercase">
                Купить в 1 клик
              </DialogTitle>
              <DialogDescription className="text-small text-text-secondary">
                Оформление без корзины. Оплата через ЮKassa.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="one-click-name"
                className="text-body text-text-secondary"
              >
                ФИО
              </label>
              <Input
                id="one-click-name"
                type="text"
                autoComplete="name"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="one-click-phone"
                className="text-body text-text-secondary"
              >
                Телефон
              </label>
              <Input
                id="one-click-phone"
                type="tel"
                autoComplete="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="one-click-email"
                className="text-body text-text-secondary"
              >
                E-mail
              </label>
              <Input
                id="one-click-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="one-click-comment"
                className="text-body text-text-secondary"
              >
                Комментарий
              </label>
              <textarea
                id="one-click-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={textareaClassName}
              />
            </div>

            <WebDeliveryFields
              delivery={delivery}
              idPrefix="one-click"
              mapClassName="max-h-[280px] overflow-hidden"
              showDeliverySum
            />

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
                  onClick={(e) => e.stopPropagation()}
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
              className="h-11 w-full bg-brand text-body text-text-inverse hover:bg-brand-hover"
            >
              {submitting ? "Переход к оплате…" : "Оплатить"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
