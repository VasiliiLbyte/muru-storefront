# ТЗ: Storefront MURU (Phase 3) — визуальный клон muru.ru на Next.js

> Документ-спека для Cursor. Лежит в корне нового репозитория `muru-storefront`.
> Рабочий принцип: **визуально практически 1:1 с muru.ru, техническая основа — с нуля и чисто.**

---

## 0. Принципы и контекст

**Что строим.** Публичную витрину MURU на современном headless-стеке, которая заменит текущий сайт на Bitrix (muru.ru). Витрина — отдельное приложение, источник данных в перспективе — общий backend (single source of truth) и CRM. Phase 3.

**Пять принципов (неизменны на весь проект):**

1. **Визуально ≈ 1:1 с muru.ru.** Композиция, сетки, типографика, цвет, отступы, состояния, микроанимации, порядок блоков — воспроизводим как на живом сайте. Заказчику обещан «тот же сайт».
2. **Техоснова — чистая, не клонируем дефекты.** Сайт-донор тащит ~19 SEO/тех-проблем из аудита. Их не переносим, а сразу делаем правильно (метаданные, H1, sitemap, перфоманс, доступная разметка). Глазу разницы нет — поисковику есть.
3. **Контент НЕ копируем.** Тексты товаров, описания, фотографии каталога **не скрейпим с muru.ru**. Верстаем под *форму* контента (карточка = картинка-плейсхолдер + заголовок + цена + атрибуты), наполнение придёт из БД/CRM. Допустимы только нейтральные плейсхолдеры в фикстурах.
4. **Чекаут — бэкенд-центричный (решение обновлено).** Веб-оплаты в v1 нет. Витрина = каталог + товар + корзина; оформление = вызов backend-API `createOrder` — заказ создаётся на бэке (как и из Mini App, с `source: "site"`), сумма пересчитывается на сервере (CRM-спек §7.2). Telegram — канал уведомлений от бэка (CRM §7.6), а НЕ место оплаты; deeplink-передачу корзины НЕ делаем. Способ завершения оплаты (веб-поток YooKassa / иное) подключается, когда поднимется бэкенд.
5. **Источник истины:** живой muru.ru (визуальный таргет) → брендбук (бренд-константы: лого, палитра, шрифты) → `DESIGN.md` (измеренные токены). При конфликте бренд-айдентика за брендбуком, верстка за muru.ru.

**Источники для Cursor (кладутся в `/docs`, см. раздел 3):** `BRANDBOOK.pdf`, `DESIGN.md` (снят с живого сайта), `muru-url-inventory.csv` (Screaming Frog), `reference-screenshots/` (по одному скрину на тип страницы, desktop + mobile).

---

## 1. Стек

| Слой | Решение | Примечание |
|---|---|---|
| Фреймворк | **Next.js 16.2.x** (App Router), пин на патч ≥ 16.2.6 | в 16.2.6 закрыты 13 advisories; пинить точную версию |
| React | 19.2 (идёт с Next 16) | React Compiler 1.0 стабилен — включить |
| Язык | TypeScript, `strict: true` | |
| Стили | Tailwind CSS v4 (CSS-first `@theme`) | если Mini App на v3 и нужен паритет токенов — согласовать версию |
| UI-примитивы | shadcn/ui (Radix + Tailwind) | Sheet, Dialog, Accordion и т.п. |
| Шрифты | `next/font` (self-hosted) | конкретные семейства — из DESIGN.md, не угадывать |
| Картинки | `next/image` | priority на LCP, корректные `sizes`, blur-плейсхолдер |
| Данные | Server Components + `fetch` с ISR (`revalidate`) | против будущего backend, сейчас — моки |
| Валидация | Zod (как в Mini App) | runtime-схемы для всех ответов API |
| Корзина/избранное | Zustand + `persist` (localStorage) | client state |
| Моки | MSW (Mock Service Worker) | один слой для dev и тестов |
| Тесты | Playwright (e2e/визуал) + Vitest (unit) | |
| Качество | ESLint + Prettier (strict) | |
| Деплой | см. раздел 8 (Vercel vs Beget/152-ФЗ) | решить до go-live |

---

## 2. Структура репозитория

```
muru-storefront/
├─ .cursor/
│  ├─ mcp.json                     # MCP-серверы (Playwright, токены)
│  └─ rules/
│     ├─ 00-project.mdc
│     ├─ 10-design-system.mdc
│     ├─ 20-content-policy.mdc
│     ├─ 30-seo.mdc
│     ├─ 40-accessibility.mdc
│     └─ 50-api-contract.mdc
├─ docs/
│  ├─ BRANDBOOK.pdf                # кладёшь ты
│  ├─ DESIGN.md                    # снят с muru.ru (designmd.cc / dembrandt)
│  ├─ muru-url-inventory.csv       # экспорт Screaming Frog
│  └─ reference-screenshots/       # *.png по типам страниц (desktop+mobile)
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/              # home, company, help, gifts, lookbooks, landings
│  │  ├─ catalog/
│  │  ├─ basket/
│  │  ├─ personal/
│  │  ├─ legal/
│  │  ├─ _styleguide/              # внутренняя страница QA токенов/примитивов
│  │  ├─ sitemap.ts
│  │  ├─ robots.ts
│  │  └─ layout.tsx
│  ├─ components/
│  │  ├─ ui/                       # shadcn
│  │  ├─ layout/                   # Header, MegaMenu, MobileMenu, Footer
│  │  ├─ catalog/                  # ProductCard, ProductGrid, Filters, Breadcrumbs
│  │  ├─ product/                  # Gallery, AddToCart, Attributes
│  │  └─ home/                     # Hero, SectionBlock
│  ├─ lib/
│  │  ├─ api/                      # типизированный клиент + endpoints
│  │  ├─ schemas/                  # zod
│  │  ├─ cart/                     # store
│  │  ├─ seo/                      # jsonld, metadata defaults
│  │  └─ taxonomy.ts               # дерево категорий (seed)
│  ├─ mocks/                       # MSW handlers + fixtures
│  └─ styles/
├─ next.config.ts
├─ tailwind/ (или globals.css с @theme)
└─ package.json
```

---

## 3. Подготовка (сделать ДО первого промпта)

### 3.1 Создать проект
```bash
npx create-next-app@latest muru-storefront \
  --ts --app --tailwind --eslint --src-dir --use-npm --turbopack
cd muru-storefront
npm install next@16.2.7   # пин на актуальный патч (проверь npm show next version)
```

### 3.2 Снять референсы с живого сайта и положить в `/docs`
- **DESIGN.md** — открыть `https://designmd.cc`, ввести `https://muru.ru`, скачать `DESIGN.md` (читает живой DOM/CSSOM: CSS-переменные, computed-стили, брейкпоинты, hover/focus, контрасты). Положить в `docs/`.
  Альтернатива/дополнение — CLI: `npx dembrandt https://muru.ru` (Playwright под капотом, токены в JSON по W3C-стандарту; снять desktop и mobile).
- **muru-url-inventory.csv** — прогнать muru.ru в Screaming Frog, экспортировать полный список URL + статусы + метаданные. Это детерминированный источник IA и карты редиректов (а не «угадывание» структуры LLM-ом).
- **reference-screenshots/** — по одному полному скриншоту на каждый тип страницы (главная, листинг категории, листинг подкатегории, карточка товара, корзина, контакты, коллекция, лукбук) в desktop и mobile. Можно руками или через Playwright MCP (см. ниже).
- **BRANDBOOK.pdf** — положить как есть.

### 3.3 Подключить MCP-серверы в Cursor (`.cursor/mcp.json`)
```jsonc
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
    // Токены с живого сайта: Design Inspiration MCP (YonasValentin, на glama.ai)
    // тул design_extract_tokens — под капотом dembrandt, поддерживает dark/mobile.
    // Точную команду запуска взять со страницы сервера на Glama и добавить сюда.
  }
}
```
- **Playwright MCP** — чтобы Cursor сам ходил по muru.ru, снимал скриншоты по типам страниц и читал computed-стили при сверке.
- **Design Inspiration MCP** (опц.) — извлечение токенов прямо из Cursor. Детерминированный фолбэк — CLI `dembrandt` из п. 3.2.
- Если бренд есть в **Figma** — подключён Figma MCP, путь Figma→код точнее screenshot→код. Если только PDF — пропускаем.

### 3.4 Создать `.cursor/rules/*.mdc`

**`00-project.mdc`**
```md
---
description: Базовые принципы проекта muru-storefront
alwaysApply: true
---
- Это headless-витрина MURU на Next.js 16 (App Router, TS strict). Заменяет сайт на Bitrix (muru.ru).
- Цель: визуально практически 1:1 с muru.ru, но техоснова чистая. Дефекты muru.ru НЕ воспроизводим.
- Источник истины: живой muru.ru (визуал) > docs/BRANDBOOK.pdf (бренд-константы) > docs/DESIGN.md (токены).
- Перед версткой любой страницы — сверяйся с docs/reference-screenshots/ и docs/DESIGN.md.
- Структуру маршрутов и таксономию бери из docs/muru-url-inventory.csv и src/lib/taxonomy.ts.
- Никаких localStorage-запретов тут нет (это не sandbox-артефакт) — клиентское состояние корзины/избранного persist'ить в localStorage.
```

**`10-design-system.mdc`**
```md
---
description: Дизайн-система и токены
alwaysApply: true
---
- Все цвета/типографика/отступы/радиусы/тени — через Tailwind @theme токены из docs/DESIGN.md и брендбука.
- Шрифты — self-hosted через next/font. Семейства брать из DESIGN.md (computed font-family), НЕ угадывать.
- Эстетика: editorial / slow-living (как в Mini App: Cormorant Garamond для дисплея, мягкая оливковая палитра,
  тень типа cardSurface). Если muru.ru использует те же — переиспользуем для бренд-консистентности.
- Микроанимации сдержанные, с обязательной поддержкой prefers-reduced-motion.
- Запрещены произвольные «дефолтные» Tailwind-цвета вне токенов.
```

**`20-content-policy.mdc`**
```md
---
description: Политика контента
alwaysApply: true
---
- НЕ скрейпить и НЕ копировать тексты/описания/фотографии товаров с muru.ru.
- Верстать под ФОРМУ контента; данные приходят из API (сейчас — MSW-моки).
- В фикстурах — только нейтральные плейсхолдеры (дженерик-декор, серые/blur-изображения).
- Реальные тексты страниц «О нас/Контакты» допустимо заменить на lorem-плейсхолдер той же длины/структуры.
```

**`30-seo.mdc`**
```md
---
description: SEO-требования (чего НЕ было на Bitrix)
alwaysApply: true
---
- Уникальные title/description на каждый маршрут через generateMetadata. Никаких "MURU/MURU" заглушек.
- Ровно один <h1> на страницу.
- canonical, OpenGraph, Twitter — на всех публичных страницах.
- JSON-LD: Organization (layout), Product (карточка), BreadcrumbList (каталог), ItemList (листинги).
- sitemap.ts и robots.ts — динамические (из taxonomy + товаров).
- trailingSlash: true (паритет с SEF-URL muru.ru для будущих 301).
- redirects(): карта старых Bitrix-URL (/include/*.php и пр.) на новые чистые URL.
- LCP-картинки — priority; никакого lazy на первый экран.
```

**`40-accessibility.mdc`**
```md
---
description: Доступность
alwaysApply: true
---
- Семантические теги, корректные роли/aria, фокус-стейты видимы.
- Контраст ≥ WCAG AA (сверять с парами из DESIGN.md).
- Клавиатурная навигация для меню, фильтров, галереи, корзины.
- alt у изображений (для товаров — из данных, для декора — пустой alt).
```

**`50-api-contract.mdc`**
```md
---
description: Контракт данных — north star для будущего backend
alwaysApply: true
---
- Все типы данных и Zod-схемы — в src/lib/schemas. Это контракт, под который позже поднимется реальный backend/CRM.
- Поля проектировать 1С/CommerceML-ready: external_id, unit, sku — присутствуют в моделях.
- Любой фетч проходит через src/lib/api/* и валидируется Zod на рантайме.
- Дев и тесты работают на MSW; переключение на реальный API — сменой base URL, без правок компонентов.
```

---

## 4. Карта маршрутов (зеркало muru.ru, trailingSlash)

| Маршрут | Тип | Источник |
|---|---|---|
| `/` | Home (hero «Лето в доме» + блоки) | mock |
| `/catalog/` | Все категории | taxonomy |
| `/catalog/[...slug]/` | Catch-all: категория / подкатегория / товар (резолвится по глубине slug через taxonomy+API) | mock |
| `/company/` | О нас | mock/плейсхолдер |
| `/company/contacts/` | Контакты (карта — НЕ Yandex deprecated API; Leaflet, как PVZ-карта в Mini App) | mock |
| `/company/requisites/` | Реквизиты | плейсхолдер |
| `/lookbooks/` + `/lookbooks/[slug]/` | Вдохновение | mock |
| `/landings/` + `/landings/[slug]/` | Коллекции | mock |
| `/gifts/` | Гид по подаркам | mock |
| `/help/` (+ `/help/[slug]/` при необходимости) | Клиентам | mock |
| `/basket/` | Корзина → передача в Telegram | client state |
| `/personal/favorite/` | Избранное (client-side) | localStorage |
| `/personal/` | Аккаунт — заглушка (веб-авторизации в v1 нет) | stub |
| `/legal/privacy/`, `/legal/offer/` | Юр. страницы (чистые URL) + 301 с `/include/*.php` | плейсхолдер |
| `/search/` | Поиск (если есть на muru.ru) → контракт API | mock |

**Реальный URL-паттерн карточки товара** уточнить по `muru-url-inventory.csv` (типичный Bitrix: `/catalog/{category}/{subcategory}/{element}/`). Catch-all `[...slug]` это покрывает: резолвер по длине пути и проверке slug против taxonomy/API определяет, что рендерить (категория / подкатегория / товар).

**Таксономия (seed для `src/lib/taxonomy.ts`):**
```
vazy-i-aksessuary    → vazy-i-kuvshiny, podsvechniki
interer              → postery, predmety-dekora, svet
kompleksnye-nabory   → korporativnye-podarki
kukhnya-i-stolovaya  → kukhonnye-aksessuary, podsvechniki1, posuda, servirovka,
                       tekstil-dlya-kukhni-i-stolovoy, khranenie-i-poryadok
naturalnyy-dekor     → korziny-i-pletenye-izdeliya, svechi, sukhotsvety
podarochnye-karty    → (нет подкатегорий)
rasprodazha          → (нет подкатегорий)
tekstil              → spalnya
floristika-dlya-doma → gorshki-i-kashpo, floristicheskiy-instrument
```

---

## 5. Модель данных / API-контракт (черновик, north star)

Финализируется в Промпте 3. Ключевые сущности (Zod + TS):

- **Category** `{ id, slug, title, parentSlug?, sortOrder, seo: Seo, image?, external_id? }`
- **Product** `{ id, sku, slug, title, price, oldPrice?, currency, images: Image[], shortDescription?, description?, attributes: { material?, dimensions?: {l,w,h,unit}, weight?, color?: string[] }, categorySlugs: string[], inStock, isOnSale, unit, external_id?, seo: Seo }`
- **ProductListResponse** `{ items: Product[], total, page, pageSize, facets?: Facet[] }` (+ query: `category`, `subcategory`, `sort`, `page`, фильтры)
- **Collection / Landing**, **Lookbook**, **StaticPage** — по форме muru.ru
- **Seo** `{ title, description, ogImage? }`
- **Cart** (client) `{ items: { sku, qty }[] }` → **checkout handoff**: `POST /api/cart` → `{ cartId }` → deeplink в Telegram

Контракт спроектировать так, чтобы реальный backend лёг сменой base URL без правок UI.

---

## 6. Последовательные промпты для Cursor

> Применять по одному, после каждого — верификация (Desktop Commander + визуальная сверка с `docs/reference-screenshots/`). Каждый промпт — самодостаточный, paste-ready.

### Промпт 1 — Скаффолд и базовая конфигурация
```
Настрой базу проекта muru-storefront (Next.js 16 App Router, TS strict уже инициализирован).
1. Зафиксируй next на версии 16.2.x (актуальный патч), включи React Compiler.
2. next.config.ts: trailingSlash: true; настрой images (remotePatterns под будущий image-проксі), 
   заголовки безопасности (заготовка под раздел hardening).
3. tsconfig: strict, paths-алиас "@/*".
4. Установи и инициализируй: shadcn/ui, zod, zustand, msw, @types/*. Настрой ESLint+Prettier (strict).
5. Подключи next/font (заготовка; конкретные семейства добавим в Промпте 2 из docs/DESIGN.md).
6. Создай каркас директорий по структуре из ТЗ (src/app, components, lib, mocks, styles).
Не верстай страницы. Только конфигурация и пустые заглушки.
Критерий: npm run dev стартует, npm run lint и tsc проходят без ошибок.
```

### Промпт 2 — Дизайн-токены, тема, styleguide
```
Прочитай docs/DESIGN.md и docs/BRANDBOOK.pdf. Собери дизайн-систему.
1. Опиши Tailwind v4 @theme токены: палитра (включая мягкий оливковый бренд-цвет), типографика 
   (дисплейный шрифт — по DESIGN.md, тело — по DESIGN.md), шкала отступов, радиусы, тени (включая 
   мягкую "карточную" тень).
2. Подключи шрифты через next/font (self-hosted), привяжи к токенам.
3. Сконфигурируй shadcn на эти токены (тема).
4. Создай внутреннюю страницу /_styleguide, рендерящую ВСЕ токены и базовые примитивы 
   (кнопки, инпут, карточка, типографика H1..H6, body) — для визуальной сверки с muru.ru.
Эстетика: editorial/slow-living. Микроанимации сдержанные, с prefers-reduced-motion.
Критерий: /_styleguide визуально соответствует характеру muru.ru (шрифты, цвета, тени, ритм).
```

### Промпт 3 — Контракт данных и Zod-схемы
```
Создай типизированный контракт данных в src/lib/schemas (Zod) и src/lib/api (клиент).
Сущности: Category, Product, ProductListResponse (с пагинацией/фасетами/сортировкой), 
Collection, Lookbook, StaticPage, Seo, Cart. См. раздел 5 ТЗ.
Поля 1С/CommerceML-ready: external_id, unit, sku обязательно присутствуют.
api-клиент: базовый fetch-обёртка с runtime-валидацией Zod, base URL из env 
(NEXT_PUBLIC_API_BASE), методы: getCategories, getCategory, getProducts(query), getProduct(slug),
getCollections/getCollection, getLookbooks/getLookbook, getStaticPage(slug), createCart(items).
Также src/lib/taxonomy.ts — дерево категорий из ТЗ (seed).
Критерий: tsc проходит; схемы экспортируют и типы, и валидаторы.
```

### Промпт 4 — MSW-моки и фикстуры
```
Настрой MSW (dev + тесты) с хендлерами под ВСЕ методы api-клиента из Промпта 3.
Фикстуры — нейтральные плейсхолдеры (НЕ копировать контент muru.ru): дженерик-товары декора, 
серые/blur-изображения (локальные SVG-плейсхолдеры или solid + blurDataURL), цены, атрибуты.
Категории/подкатегории — строго по taxonomy. На каждую подкатегорию 8–16 товаров.
Включи MSW в dev (browser worker) и подготовь node-сервер для Vitest.
Критерий: при запущенном dev все методы api отдают валидные (по Zod) данные из моков.
```

### Промпт 5 — Каркас layout (Header, MegaMenu, MobileMenu, Footer)
```
Свёрстай общий каркас 1:1 с muru.ru (сверяйся с docs/reference-screenshots/ header+footer).
Header: лого, верхнее меню (О нас, Вдохновение, Коллекции, Гид по подаркам, Клиентам, Контакты), 
телефон, иконки Войти / Избранное (счётчик) / Корзина (счётчик).
Каталожное мега-меню/дропдаун с категориями и подкатегориями из taxonomy (как на muru.ru).
Мобильное меню — через shadcn Sheet.
Footer: колонки ссылок + контакты (адрес 192102, СПб, ул. Дубровская 13; телефон; e-mail; режим работы) 
+ юр. ссылки (Политика ПДн, Оферта) + копирайт. Без упоминания разработчика Bitrix.
Семантика, доступность, адаптив. Меню — sticky как на доноре (проверь поведение).
Критерий: header и footer визуально совпадают с muru.ru на desktop и mobile.
```

### Промпт 6 — Главная страница
```
Свёрстай главную 1:1 с muru.ru (docs/reference-screenshots/home). Блоки в том же порядке:
hero «Лето в доме» (с CTA «Подробнее» → /catalog/), «Новые коллекции», «Коллекции MURU», 
«Вдохновение», блок «О нас». Данные — из моков (коллекции/лукбуки/категории).
Hero-изображение — next/image priority (LCP). Тексты — плейсхолдер той же структуры.
generateMetadata для главной (нормальные title/description).
Критерий: композиция, отступы, типографика, порядок блоков совпадают с донором; LCP-картинка priority.
```

### Промпт 7 — Листинг каталога (категория и подкатегория)
```
Реализуй catch-all src/app/catalog/[...slug]/page.tsx.
Резолвер по глубине slug: /catalog/ → все категории; /catalog/{cat}/ → подкатегории + товары; 
/catalog/{cat}/{sub}/ → товары подкатегории. Товар — отдельной веткой (Промпт 8).
Компоненты: ProductGrid, ProductCard (1:1 с карточкой muru.ru: изображение, заголовок, цена, 
старая цена/бейдж распродажи, иконка избранного), Breadcrumbs, сортировка и фильтры 
(если есть на доноре — повторить; иначе базовая сортировка), пагинация.
Данные — getProducts(query) из моков, SSR + revalidate.
SEO: generateMetadata (по категории), JSON-LD BreadcrumbList + ItemList, один H1.
Критерий: листинги визуально совпадают с muru.ru; фильтр/сортировка/пагинация работают на моках.
```

### Промпт 8 — Карточка товара (PDP)
```
Свёрстай страницу товара (ветка catch-all для товара) 1:1 с muru.ru (docs/reference-screenshots/product).
Галерея изображений, заголовок, цена/старая цена, атрибуты (материал, габариты, цвет — из данных), 
кнопка «В корзину», блок «оформление в Telegram» (текст-подсказка), похожие товары, breadcrumbs.
JSON-LD Product (+ offers, availability). generateMetadata по товару. Один H1.
Изображения — next/image с корректными sizes; первое — приоритетное.
Критерий: PDP совпадает с донором; добавление в корзину обновляет счётчик; Product JSON-LD валиден.
```

### Промпт 9 — Корзина (бэкенд-центричное оформление)
```
Доработай корзину витрины. БЕЗ Telegram — оформление = вызов backend-API (заглушка), способ оплаты отложен.
1. Расширь src/stores/cart-store.ts: removeItem(sku), updateQty(sku, qty) (qty<=0 удаляет), clear(); селекторы суммы и итога. persist "muru-cart" и useCartCount не ломать.
2. /basket/ 1:1 с muru.ru: строки (изображение, название, цена, qty-степпер, удалить), итоги, пустое состояние; мини-корзина в шапке. Товары тянуть по SKU.
3. Контракт оформления (оплату НЕ реализовывать): OrderDraft {items:[{sku,qty}], promoCode?}, CheckoutResponse {orderId, status, redirectUrl?}; lib/api createOrder(draft) -> POST */orders; MSW-хендлер */orders. Кнопка «Оформить заказ»: createOrder; есть redirectUrl — переход, иначе «Оформление будет доступно после подключения бэкенда».
4. Удалить остатки старого TG-хендоффа: telegram-hint, createCart, CartCreateResponse, */cart + createCartId.
Критерий: корзина persist'ится и считает суммы; createOrder проходит по контракту на моках; нет Telegram-deeplink.
```

### Промпт 10 — Избранное (client-side)
```
Реализуй избранное на клиенте (Zustand + persist, localStorage).
Тоггл-иконка на ProductCard и PDP; страница /personal/favorite/ со списком (как на muru.ru).
Заглушка /personal/ (аккаунт) — без веб-авторизации в v1, нейтральная страница-плейсхолдер.
Критерий: избранное persist'ится; счётчик в header обновляется.
```

### Промпт 11 — Контентные и статические страницы
```
Свёрстай по reference-screenshots (контент — плейсхолдер, форму повторить):
- /company/ (О нас), /company/requisites/ (Реквизиты)
- /company/contacts/ (Контакты): карта через Leaflet (как PVZ-карта Mini App), НЕ устаревший Yandex Maps API; 
  адрес, телефон, e-mail, режим работы, форма «Заказать звонок» (UI; сабмит — мок).
- /help/ (Клиентам), /gifts/ (Гид по подаркам)
- /landings/ + /landings/[slug]/ (Коллекции), /lookbooks/ + /lookbooks/[slug]/ (Вдохновение) — из моков
- /legal/privacy/, /legal/offer/ — плейсхолдер-структура
generateMetadata на каждую. Один H1.
Критерий: страницы визуально совпадают с донором; карта работает без Yandex API.
```

### Промпт 12 — SEO-инфраструктура
```
Закрой SEO целиком (то, чего не было на Bitrix).
1. generateMetadata на всех маршрутах: уникальные title/description, canonical, OG/Twitter.
2. src/app/sitemap.ts — динамический (категории, подкатегории, товары, статика).
3. src/app/robots.ts.
4. JSON-LD: Organization (layout), Product (PDP), BreadcrumbList (каталог), ItemList (листинги).
5. next.config.ts redirects(): карта старых URL muru.ru на новые 
   (/include/licenses_detail.php → /legal/privacy/, /include/offer_detail.php → /legal/offer/, и пр. 
   по muru-url-inventory.csv). trailingSlash: true.
6. Аудит: ровно один H1 на каждой странице.
Критерий: sitemap/robots отдаются; rich-results проходят валидацию; редиректы работают (308/301).
```

### Промпт 13 — Перфоманс и доступность
```
Пройди перфоманс/a11y.
- next/image везде, корректные sizes, priority только на LCP, blur-плейсхолдеры.
- font-display и предзагрузка шрифтов.
- loading.tsx / скелетоны на уровне маршрутов каталога.
- Прогон axe (a11y) и Lighthouse; цель: Performance/Accessibility/Best Practices/SEO ≥ 90.
- prefers-reduced-motion для всех анимаций.
Критерий: Lighthouse ≥ 90 по всем категориям на ключевых страницах; axe без критичных нарушений.
```

### Промпт 14 — Тесты (Playwright + Vitest)
```
Подготовь тест-сьют (переиспользуй MSW).
- Playwright: smoke по каждому типу страницы; проверка наличия ровно одного H1, мета-тегов, JSON-LD; 
  сценарий «добавить в корзину → /basket/ → клик хендоффа формирует корректный deeplink»; 
  проект под мобильный viewport. Опционально — визуальные снапшоты против docs/reference-screenshots/.
- Vitest: юниты на api-клиент (Zod-валидация), cart store, резолвер catch-all каталога.
Критерий: npm run test и e2e зелёные на моках.
```

### Промпт 15 — Прод-хардненинг и деплой-конфиг
```
Подготовь к продакшену.
- Заголовки безопасности в next.config.ts/middleware: CSP (с учётом Leaflet/шрифтов/Telegram), 
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS.
- Env-конфиг (.env.example): NEXT_PUBLIC_API_BASE, домен бота, флаги.
- README: запуск, переключение моки↔реальный API (смена base URL), деплой.
- Деплой-заметка: зафиксировать выбор хостинга (Vercel vs Beget VPS) с учётом latency в РФ и 152-ФЗ — 
  см. раздел 8 ТЗ.
Критерий: сборка прод-режима проходит; securityheaders-профиль чистый.
```

---

## 7. Чек-лист соответствия и устранённые дефекты

**Визуальная сверка (по каждому типу страницы против `docs/reference-screenshots/`):** шапка/меню/подвал, сетки и отступы, типографика и шрифты, палитра и тени, состояния (hover/focus/active), порядок блоков главной, карточка товара, корзина, мобильная адаптивность.

**Дефекты muru.ru, которые мы НЕ переносим, а исправляем:**
- заглушки метатегов (`description: MURU`, `keywords: MURU`) → уникальные метаданные;
- отсутствие H1 → ровно один H1 на странице;
- нет sitemap → динамический `sitemap.ts` + `robots.ts`;
- lazy-loaded LCP → priority на первый экран;
- устаревший Yandex Maps API → Leaflet;
- открытый `/bitrix/admin/` → отсутствует как класс (нет Bitrix);
- ошибки SEF / нет аналитики / нет structured data → чистые URL + 301-карта + JSON-LD + слот под аналитику.

---

## 8. Что подтвердить перед стартом

1. **URL-паттерн карточки товара.** Уточнить по `muru-url-inventory.csv` (вероятно `/catalog/{cat}/{sub}/{element}/`). От этого зависит резолвер catch-all и карта 301. Сейчас в ТЗ заложено самое вероятное; поправить после краула.
2. **Шрифты.** Брать фактические `font-family` из `DESIGN.md` (не угадывать). Если совпадают с Mini App (Cormorant Garamond для дисплея) — переиспользуем для бренд-консистентности.
3. **Хостинг прод.** Mini App-фронт — на Vercel; для публичной РФ-витрины взвесить Vercel (latency/доступность в РФ) против Beget VPS. Персональные данные (заказы/клиенты) в любом случае живут в РФ-бэкенде (152-ФЗ). v1 собирает минимум ПДн (корзина уходит в Telegram, избранное — клиентское), так что Vercel ок для dev/preview; решение по прод-хостингу — до go-live.
4. **Поиск и фильтры.** Подтвердить, есть ли на muru.ru поиск и фасетные фильтры в листингах — повторяем ровно то, что есть.
