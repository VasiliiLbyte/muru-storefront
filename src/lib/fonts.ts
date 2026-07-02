import { Mulish } from "next/font/google";

/**
 * Шрифты MURU (Промпт 2).
 *
 * Источник истины — docs/DESIGN.md (computed font-family с живого muru.ru):
 * дисплей и тело набраны одним семейством Mulish (веса 300/400/500).
 * Mulish — вариативный шрифт, self-hosted через next/font/google
 * (Next качает файлы на сборке и раздаёт со своего домена — без обращений к Google).
 *
 * CSS-переменные привязаны к Tailwind @theme токенам в src/app/globals.css:
 *   --font-sans     → основной текст
 *   --font-display  → дисплей/заголовки (то же семейство Mulish)
 *   --font-mono     → моноширинный (системный стек, см. globals.css)
 */
export const fontSans = Mulish({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const fontVariables = fontSans.variable;
