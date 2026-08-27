"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    ym?: (
      counterId: number,
      method: string,
      ...args: unknown[]
    ) => void;
  }
}

type YandexMetrikaProps = {
  counterId: string;
};

/**
 * Yandex Metrika for App Router: init once, then hit on client navigations (SPA).
 * Counter id comes from NEXT_PUBLIC_YANDEX_METRIKA_ID — omit component when unset.
 */
export function YandexMetrika({ counterId }: YandexMetrikaProps) {
  const id = Number(counterId);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipFirstHit = useRef(true);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    // init() already records the first view; only hit on client navigations.
    if (skipFirstHit.current) {
      skipFirstHit.current = false;
      return;
    }
    if (typeof window.ym !== "function") return;
    const url =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    window.ym(id, "hit", url);
  }, [id, pathname, searchParams]);

  if (!Number.isFinite(id) || id <= 0) return null;

  return (
    <>
      <Script id={`yandex-metrika-${id}`} strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=${id}", "ym");
ym(${id}, "init", {
  ssr: true,
  webvisor: true,
  clickmap: true,
  ecommerce: "dataLayer",
  accurateTrackBounce: true,
  trackLinks: true
});`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://mc.yandex.ru/watch/${id}`}
          style={{ position: "absolute", left: "-9999px" }}
          alt=""
        />
      </noscript>
    </>
  );
}
