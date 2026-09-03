"use client";

import { useEffect, useRef } from "react";

const FLAG = "homeSimplified";

/**
 * Ставит `data-home-simplified` на `<html>`, когда первый баннер прокручен.
 * Шапка на десктопной главной по этому признаку становится прозрачной
 * (макет `сайт_2.pdf`: «при прокручивании упрощается»).
 *
 * Сам сентинел — 1px высотой (нулевую площадь IntersectionObserver
 * не отслеживает), ставится сразу после первого баннера.
 */
export function HomeHeaderSentinel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    const root = document.documentElement;
    if (!node) return;

    const apply = (simplified: boolean) => {
      if (simplified) root.dataset[FLAG] = "";
      else delete root.dataset[FLAG];
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Упрощаем, когда сентинел ушёл ВЫШЕ вьюпорта (а не когда он под ним).
        apply(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      apply(false);
    };
  }, []);

  return <div ref={ref} aria-hidden className="h-px w-full shrink-0" />;
}
