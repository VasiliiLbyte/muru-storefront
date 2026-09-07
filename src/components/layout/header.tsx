import { FavoritesSessionBridge } from "@/components/favorites/favorites-session-bridge";
import { getCategories } from "@/lib/api/endpoints";
import {
  categoriesToNavTree,
  type CatalogNavNode,
} from "@/lib/catalog/catalog-nav";
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

            <Logo className="min-w-0 max-w-[4.5rem] shrink lg:max-w-none lg:shrink-0 [&_img]:h-5 [&_img]:w-auto lg:[&_img]:h-6" />

            {/* -mr-[2px] — та же компенсация с правого края */}
            <HeaderActions className="ml-auto shrink-0 lg:mr-[-2px]" />
          </div>
        </div>
      </header>
    </>
  );
}
