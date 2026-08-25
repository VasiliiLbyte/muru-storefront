import { Montserrat } from "next/font/google";

/**
 * Шрифты MURU (FRONT-P1).
 *
 * Источник истины — docs/DESIGN.md:
 * дисплей и тело набраны одним семейством Montserrat (веса 300/400/500/600).
 * Montserrat — self-hosted через next/font/google
 * (Next качает файлы на сборке и раздаёт со своего домена — без обращений к Google).
 *
 * CSS-переменные привязаны к Tailwind @theme токенам в src/app/globals.css:
 *   --font-sans     → основной текст
 *   --font-display  → дисплей/заголовки (то же семейство Montserrat; 600 для headings)
 *   --font-mono     → моноширинный (системный стек, см. globals.css)
 */
export const fontSans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const fontVariables = fontSans.variable;
