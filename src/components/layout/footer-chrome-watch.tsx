"use client";

import { useEffect } from "react";

/**
 * Помечает `<html>`, до какого этажа хрома главной дошёл подвал:
 *
 * • `data-footer-chrome-actions` — верх подвала поднялся до нижнего ряда иконок;
 * • `data-footer-chrome-header`  — и до шапки с бургером и логотипом.
 *
 * Нужно мобильной главной: шапка и нижний ряд иконок лежат поверх фото белым,
 * а над светлым подвалом это читается как грязь. Перекраска в брендовый
 * зелёный идёт последовательно — сначала иконки, потом логотип (см.
 * `globals.css`). Признаки ставим всегда, применяет их только главная.
 */
export function FooterChromeWatch() {
  useEffect(() => {
    const footer = document.querySelector("footer");
    const root = document.documentElement;
    if (!footer) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const footerTop = footer.getBoundingClientRect().top;
      const actions = document.querySelector("[data-header-actions]");
      const header = document.querySelector("[data-app-header]");

      const actionsTop = actions
        ? actions.getBoundingClientRect().top
        : Number.POSITIVE_INFINITY;
      const headerBottom = header
        ? header.getBoundingClientRect().bottom
        : Number.NEGATIVE_INFINITY;

      if (footerTop <= actionsTop) root.dataset.footerChromeActions = "";
      else delete root.dataset.footerChromeActions;

      if (footerTop <= headerBottom) root.dataset.footerChromeHeader = "";
      else delete root.dataset.footerChromeHeader;
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      delete root.dataset.footerChromeActions;
      delete root.dataset.footerChromeHeader;
    };
  }, []);

  return null;
}
