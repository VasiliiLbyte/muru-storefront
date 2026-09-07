/**
 * Размер брендовой кнопки.
 *
 * Десктоп: 24px — вровень с логотипом. Это ровно минимум WCAG 2.2 SC 2.5.8
 * (Target Size Minimum, 24×24 CSS px), ниже опускаться нельзя.
 * Мобайл: 44px — минимум для пальца и гейт `e2e/mobile-tap-targets.spec.ts`.
 */
export const brandButtonSize =
  "h-11 px-8 text-[14px] leading-[17px] lg:h-6 lg:text-[13px]";
