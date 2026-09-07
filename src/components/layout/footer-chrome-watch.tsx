"use client";

import { useEffect } from "react";

/**
 * Помечает `<html>` атрибутом `data-footer-visible`, когда подвал в кадре.
 *
 * Нужно мобильной главной: там шапка и нижний ряд иконок лежат поверх фото
 * белым цветом со скримом. Над светлым подвалом это читается как грязь,
 * поэтому по этому признаку хром перекрашивается в брендовый зелёный,
 * а скрим гасится (см. `globals.css`).
 */
export function FooterChromeWatch() {
  useEffect(() => {
    const footer = document.querySelector("footer");
    const root = document.documentElement;
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) root.dataset.footerVisible = "";
        else delete root.dataset.footerVisible;
      },
      { threshold: 0 },
    );

    observer.observe(footer);
    return () => {
      observer.disconnect();
      delete root.dataset.footerVisible;
    };
  }, []);

  return null;
}
