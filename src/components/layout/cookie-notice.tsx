"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  acceptAnalyticsCookies,
  hasCookieConsentChoice,
  rejectAnalyticsCookies,
} from "@/lib/cookie-notice";

/**
 * Cookie consent bar: technical cookies always; analytics (Yandex Metrika) only after accept.
 *
 * Visibility is deferred past the LCP window. PSI (2026-09-23) named this
 * dialog copy as the LCP element on home and category pages
 * (`lcp-breakdown-insight`: ~2.3s / ~1.3s element render delay on the
 * cookie <p>), which blocked hero/category paint metrics.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasCookieConsentChoice()) return;

    let cancelled = false;
    const show = () => {
      if (!cancelled) setVisible(true);
    };

    // Prefer idle; hard timeout keeps consent discoverable if the main
    // thread stays busy (Lighthouse mobile typically stays busy >2s).
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(show, { timeout: 4000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(show, 3500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  if (!visible) return null;

  function onAccept() {
    acceptAnalyticsCookies();
    setVisible(false);
  }

  function onReject() {
    rejectAnalyticsCookies();
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Настройки cookies"
      aria-modal="false"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm pb-safe"
    >
      <div className="mx-auto flex max-w-[1564px] flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-body text-text-secondary">
          Технические cookies нужны для работы сайта (корзина, вход). Cookies
          аналитики (Яндекс.Метрика) помогают улучшать сервис — они
          подключаются только после вашего согласия. Подробнее — в{" "}
          <Link
            href="/legal/privacy/"
            className="text-text-heading underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            политике обработки персональных данных
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-11 sm:min-w-[8rem]"
            onClick={onReject}
          >
            Отклонить
          </Button>
          <Button
            type="button"
            size="lg"
            className="min-h-11 sm:min-w-[8rem]"
            onClick={onAccept}
          >
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
}
