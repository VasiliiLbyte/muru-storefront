"use client";

import { useEffect } from "react";

/**
 * Запускает MSW browser-worker в dev (или при NEXT_PUBLIC_API_MOCKING=enabled)
 * для клиентских фетчей. В проде ничего не делает.
 *
 * Не блокирует рендер: серверные фетчи (Server Components) перехватывает
 * Node-сервер MSW из instrumentation.ts, поэтому ждать старта воркера не нужно.
 */
const MOCKING_ENABLED =
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled" ||
  process.env.NODE_ENV === "development";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!MOCKING_ENABLED) return;

    const startWorker = () => {
      void (async () => {
        const { worker } = await import("@/mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass",
          serviceWorker: { url: "/mockServiceWorker.js" },
        });
      })();
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => startWorker());
    } else {
      setTimeout(startWorker, 1);
    }
  }, []);

  return <>{children}</>;
}
