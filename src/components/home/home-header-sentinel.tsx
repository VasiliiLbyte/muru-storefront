"use client";

import { useEffect, useRef } from "react";

const FLAG = "homeSimplified";

/**
 * Ставит `data-home-simplified` на `<html>`, когда первый баннер уехал
 * за шапку. Шапка на десктопной главной по этому признаку становится
 * прозрачной (макет `сайт_2.pdf`: «при прокручивании упрощается»).
 *
 * Сентинел (1px) стоит сразу после первого баннера, то есть его позиция
 * и есть нижняя кромка баннера.
 *
 * Намеренно НЕ `IntersectionObserver`: тот уведомляет только о пересечении
 * порога, а сентинел встаёт ровно на границу root'а — в позиции привязки
 * второго баннера он оказывается на y ≈ −1 при нижней кромке root'а на 900,
 * из-за чего состояние «не пересекается» не меняется и колбэк не приходит.
 * Прямая проверка позиции по скроллу детерминирована для любого способа
 * прокрутки (колесо, scrollTo, клавиатура, snap-анимация).
 */
export function HomeHeaderSentinel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    const root = document.documentElement;
    if (!node) return;

    let frame = 0;
    let current: boolean | null = null;

    const apply = (simplified: boolean) => {
      if (current === simplified) return;
      current = simplified;
      if (simplified) root.dataset[FLAG] = "";
      else delete root.dataset[FLAG];
    };

    const measure = () => {
      frame = 0;
      const header = document.querySelector("[data-app-header]");
      const headerHeight = header
        ? header.getBoundingClientRect().height
        : 0;
      // Порог — нижняя кромка шапки, а не верх вьюпорта: шапка sticky и
      // перекрывает первые ~126px, баннер под ней уже не виден.
      apply(node.getBoundingClientRect().top <= headerHeight);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      delete root.dataset[FLAG];
    };
  }, []);

  return <div ref={ref} aria-hidden className="h-px w-full shrink-0" />;
}
