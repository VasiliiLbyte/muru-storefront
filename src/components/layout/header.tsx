import { FavoritesSessionBridge } from "@/components/favorites/favorites-session-bridge";
import { getCategories } from "@/lib/api/endpoints";
import {
  categoriesToNavTree,
  type CatalogNavNode,
} from "@/lib/catalog/catalog-nav";
import { FooterChromeWatch } from "@/components/layout/footer-chrome-watch";
import { MobileMenu } from "@/components/layout/mobile-menu";
import type { SiteContacts } from "@/lib/site";
import { cn } from "@/lib/utils";

import { HeaderActions } from "./header-actions";
import { Logo } from "./logo";

const headerGridClass = "mx-auto w-full max-w-[1564px] px-4 sm:px-8";

/**
 * Шапка сайта — одинакова на всех страницах: бургер, логотип, иконки.
 *
 * Верхняя строка с навигацией и телефоном, кнопка «Каталог» и поле поиска
 * убраны — всё это живёт в меню за бургером, поиск открывается по иконке.
 *
 * Покраска — в `globals.css`:
 *   • обычные страницы — белый фон, зелёный логотип, тёмные иконки;
 *   • главная — прозрачный оверлей поверх кадра, белый логотип и иконки;
 *   • главная при наведении — тот же белый вид, что и на остальных страницах.
 */
export async function Header({ contacts }: { contacts: SiteContacts }) {
  // Дерево каталога считаем на сервере: клиентский фетч упирался в CORS
  // (прод-API не пускает сторонние origin) и давал пустое меню на первый кадр.
  let catalogTree: CatalogNavNode[] = [];
  try {
    catalogTree = categoriesToNavTree(await getCategories());
  } catch (err) {
    console.warn("[header] categories fetch failed", err);
  }

  return (
    <>
      <FavoritesSessionBridge />
      <FooterChromeWatch />

      <header
        data-app-header
        className="sticky top-0 z-40 bg-white pt-safe-header transition-colors duration-200"
      >
        <div className={headerGridClass}>
          <div
            data-header-bar
            className={cn(
              "flex h-14 items-center gap-2 lg:h-20 lg:gap-4",
            )}
          >
            {/* -ml-3 гасит внутренний отступ кнопки: хит-таргет остаётся
                44×44, но сам глиф встаёт на линию сетки контейнера. */}
            <div data-header-burger className="-ml-3">
              <MobileMenu contacts={contacts} catalogTree={catalogTree} />
            </div>

            {/* Мобайл (кроме главной): иконки идут сразу после бургера,
                логотип уезжает вправо. На главной иконки живут в нижнем
                ряду, там порядок задаётся в globals.css. */}
            <HeaderActions className="order-2 ml-2 shrink-0 max-lg:order-1 lg:order-3 lg:mr-[-2px] lg:ml-auto" />

            {/* max-w на мобиле не ставим: бокс 72px сплющивал вордмарк
                (натуральные пропорции 103:19). object-contain в `Logo`
                страхует на узких экранах — сжимается, но не искажается. */}
            <Logo className="order-3 ml-auto min-w-0 shrink max-lg:order-2 max-lg:pl-2 lg:order-2 lg:ml-0 lg:shrink-0 [&_img]:h-6 [&_img]:w-auto" />
          </div>
        </div>
      </header>
    </>
  );
}
