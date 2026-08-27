"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  dismissCookieNotice,
  isCookieNoticeDismissed,
} from "@/lib/cookie-notice";

/**
 * Fixed bottom info bar about technical cookies.
 * Client-only after mount; persists dismiss in localStorage.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isCookieNoticeDismissed()) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        dismissCookieNotice();
        setVisible(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  if (!visible) return null;

  function onDismiss() {
    dismissCookieNotice();
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label="Уведомление о cookies"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm pb-safe"
    >
      <div className="mx-auto flex max-w-[1564px] flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-body text-text-secondary">
          Мы используем технические cookies, необходимые для работы сайта, а
          также cookies аналитики (Яндекс.Метрика) для улучшения сервиса.
          Подробнее — в{" "}
          <Link
            href="/legal/privacy/"
            className="text-text-heading underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            политике обработки персональных данных
          </Link>
          .
        </p>
        <Button
          type="button"
          size="lg"
          className="min-h-11 shrink-0 sm:min-w-[8rem]"
          onClick={onDismiss}
        >
          Понятно
        </Button>
      </div>
    </div>
  );
}
