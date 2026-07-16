"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getWebPaymentStatus } from "@/lib/api/endpoints";
import {
  PENDING_WEB_CHECKOUT_SOURCE_KEY,
  PENDING_WEB_PAYMENT_ID_KEY,
} from "@/lib/checkout/constants";
import { useCartStore } from "@/stores/cart-store";

type Status = "checking" | "succeeded" | "canceled" | "timeout" | "missing";

export default function CheckoutReturnPage() {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clear);
  const [status, setStatus] = useState<Status>("checking");
  const attemptsRef = useRef(0);

  useEffect(() => {
    const paymentId = sessionStorage.getItem(PENDING_WEB_PAYMENT_ID_KEY);
    if (!paymentId) {
      setStatus("missing");
      return;
    }

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const clearPendingKeys = () => {
      sessionStorage.removeItem(PENDING_WEB_PAYMENT_ID_KEY);
      sessionStorage.removeItem(PENDING_WEB_CHECKOUT_SOURCE_KEY);
    };

    const poll = async () => {
      if (stopped) return;
      attemptsRef.current += 1;
      try {
        const res = await getWebPaymentStatus(paymentId);
        if (res.status === "succeeded") {
          const source = sessionStorage.getItem(PENDING_WEB_CHECKOUT_SOURCE_KEY);
          clearPendingKeys();
          if (source !== "one-click") {
            clearCart();
          }
          setStatus("succeeded");
          return;
        }
        if (res.status === "canceled") {
          clearPendingKeys();
          setStatus("canceled");
          return;
        }
      } catch {
        /* keep polling */
      }
      if (attemptsRef.current >= 40) {
        setStatus("timeout");
        return;
      }
      timer = setTimeout(poll, 3000);
    };

    void poll();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [clearCart]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[1564px] flex-col items-center justify-center gap-4 px-4 text-center">
      {status === "checking" ? (
        <>
          <div className="size-10 animate-spin rounded-full border-4 border-border border-t-brand" />
          <p className="text-body text-text-secondary">Проверяем оплату…</p>
          <p className="text-small text-text-muted">
            Это займёт несколько секунд. Не закрывайте страницу.
          </p>
        </>
      ) : null}
      {status === "succeeded" ? (
        <>
          <p className="font-display text-h2 text-text-heading">Заказ оплачен</p>
          <p className="text-body text-text-secondary">
            Мы свяжемся с вами для уточнения деталей доставки.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-body text-brand underline underline-offset-2"
          >
            На главную
          </button>
        </>
      ) : null}
      {status === "canceled" ? (
        <>
          <p className="font-display text-h2 text-text-heading">Платёж не завершён</p>
          <button
            type="button"
            onClick={() => router.push("/checkout/")}
            className="text-body text-brand underline underline-offset-2"
          >
            Попробовать снова
          </button>
        </>
      ) : null}
      {status === "timeout" ? (
        <>
          <p className="text-body text-text-secondary">Платёж ещё обрабатывается</p>
          <p className="text-small text-text-muted">
            Если оплата прошла, мы напишем вам на указанный e-mail.
          </p>
        </>
      ) : null}
      {status === "missing" ? (
        <>
          <p className="text-body text-text-secondary">
            Не удалось найти информацию о платеже
          </p>
          <button
            type="button"
            onClick={() => router.push("/checkout/")}
            className="text-body text-brand underline underline-offset-2"
          >
            Вернуться к оформлению
          </button>
        </>
      ) : null}
    </div>
  );
}
