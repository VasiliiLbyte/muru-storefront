"use client";

import { Suspense, useEffect, useState } from "react";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  isAnalyticsConsentGranted,
} from "@/lib/cookie-notice";

import { YandexMetrika } from "./yandex-metrika";

/**
 * Loads Yandex Metrika only after the user accepts analytics cookies.
 * Counter id from NEXT_PUBLIC_YANDEX_METRIKA_ID — omitted when unset.
 */
export function YandexMetrikaGate() {
  const counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    function syncConsent() {
      setAnalyticsAllowed(isAnalyticsConsentGranted());
    }

    syncConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    };
  }, []);

  if (!counterId || !analyticsAllowed) return null;

  return (
    <Suspense fallback={null}>
      <YandexMetrika counterId={counterId} />
    </Suspense>
  );
}
