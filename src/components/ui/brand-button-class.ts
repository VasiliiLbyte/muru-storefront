/**
 * Размер брендовой (зелёной) кнопки.
 *
 * Мобайл: сам элемент честных 44px — иначе палец не попадает, и это ловит
 * гейт `e2e/mobile-tap-targets.spec.ts` (он меряет рамку элемента, поэтому
 * трюк с расширением зоны через `::before` его не удовлетворяет). Зелёная
 * подложка при этом рисуется псевдоэлементом высотой 20px по центру —
 * визуально кнопка вровень с логотипом, как просил дизайнер.
 *
 * Десктоп: обычная сплошная кнопка 32px, псевдоэлемент выключен.
 */
export const brandButtonSize = [
  "relative isolate h-11 bg-transparent px-8 text-[13px] leading-none",
  "before:absolute before:inset-x-0 before:top-1/2 before:-z-10 before:h-5",
  "before:-translate-y-1/2 before:bg-brand before:content-['']",
  "hover:bg-transparent hover:before:bg-brand-hover",
  "lg:h-8 lg:bg-brand lg:before:hidden lg:hover:bg-brand-hover",
].join(" ");
