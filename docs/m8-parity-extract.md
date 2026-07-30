# M8 STOP-1 — parity extract (E1–E5)

**Date:** 2026-07-30  
**Эталон:** живой `https://muru.ru`  
**Viewport:** Chromium 393×852, `isMobile` + touch  
**UA:**

```
Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15
(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1
```

**Метод:** Playwright `getComputedStyle` / bbox + цитаты HTML; CSS — aspro-premier-mobile cache sheets.  
**Не угадано** — только измеренное / заявленное в CSS.

**Aspro CSS (примеры):**

- `…/aspro-premier-mobile/template_6aefd3930baa5beeed572c84972ab6db/…_v1.css`
- `…/aspro-premier-mobile/default_e28e6c020a1371eb5551ecd570bf6af8/…_v1.css`
- `…/aspro-premier-mobile/page_c864004c3d4ff1f8850fbb79408166f9/…_v1.css`

---

## V1 — ATC на листинге (обязательный curl)

**URL:** `https://muru.ru/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/`  
**Результат:** кнопка корзины **есть**.

HTML-цитата:

```html
<button type="button" class="btn btn-default to_cart animate-load btn-sm btn-wide js-item-action"
  data-action="basket" data-id="993" title="Добавить в корзину"
  data-title="Добавить в корзину" data-title_added="Добавлено в корзину"
  data-notice="1">Добавить в корзину</button>
```

→ подтверждает V1-REVERSAL (M7-1 icon ATC ≠ muru.ru; откат в M8-1).

---

## E1 — листинг: h1 / крошки / отступ к сетке

**URL:** `/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/`

| Что | Селектор | Значение | Цитата / источник |
|---|---|---|---|
| h1 text | `h1.switcher-title` | «Вазы и кувшины» | HTML |
| h1 font-size | `h1.switcher-title` | **24px** | computed |
| h1 font-weight | `h1.switcher-title` | **300** | computed |
| h1 text-transform | `h1.switcher-title` | **uppercase** | computed |
| h1 line-height | `h1.switcher-title` | **29px** | computed |
| h1 margin | `h1.switcher-title` | **0** all sides | computed |
| h1 parent padding | `.page-top.maxwidth-theme` | padding-top/bottom **8px / 32px**; `gap: 16px` (class `gap--16`) | computed |
| Back-link (visible) | `.breadcrumbs__item--mobile` visible | ровно **1** видимый item: «Вазы и аксессуары» → `/catalog/vazy-i-aksessuary/`; «Главная»/«Каталог»/current `display:none` | computed + HTML |
| Back-link size | `a.breadcrumbs__link` | **12px** (`.font_12` → `calc(1rem - 4px)`) | computed + CSS |
| Back-link color | `a.breadcrumbs__link` | secondary ~48% opacity dark (`oklab(… / 0.48)`) | computed |
| Chevron | `i.breadcrumbs__item-arrow` | в DOM есть; CSS `.breadcrumbs__link .breadcrumbs__item-arrow{display:none}` → bbox **0×0** | CSS + computed |
| Mobile crumb hide | `.breadcrumbs__item--mobile…` | `.breadcrumbs__item--mobile.breadcrumbs__item--current,.breadcrumbs__item--mobile:has(a):not(:last-of-type),.breadcrumbs__item--mobile + .category-separator{display:none}` | template CSS |
| h1 → grid gap | h1 bottom → first `.catalog-block__item` top | **≈32px** (h1Bottom 131 → gridTop 163) | bbox |

HTML back-item (видимый):

```html
<div class="breadcrumbs__item … font_12 breadcrumbs__item--mobile" id="bx_breadcrumb_2" …>
  <a class="breadcrumbs__link …" href="/catalog/vazy-i-aksessuary/" …>…Вазы и аксессуары…</a>
</div>
```

---

## E2 — карточка: ATC / dots / favorite

**Карточка:** `.catalog-block__item.js-popup-block`  
**Изображение:** `.image-list` **161.5×161.5**

| Что | Селектор | Значение | Цитата / источник |
|---|---|---|---|
| ATC | `button.btn.to_cart.btn-sm.btn-wide` | текст «Добавить в корзину»; **161.5×36**; ratio to image **1.0** | computed |
| ATC bg | same | **rgb(93, 107, 58)** (`--theme-base-color` / brand) | computed |
| ATC color | same | **rgb(255, 255, 255)** | computed |
| ATC font | same | **14px** / weight **300** / line-height **17px** | computed |
| ATC width rule | `.btn.btn-wide` | `width:100%` | CSS |
| ATC height rule | `.btn.btn-sm` | `--button-height:36px; --button-font-size:.875rem` | CSS |
| Dots | `.section-gallery-nav` | `position:absolute; bottom:**16px**; left/right 0; height **8px** | computed + CSS |
| Dots override | `.catalog_blockMURU_template .section-gallery-nav` | `bottom:16px` | default CSS |
| Dot item | `.section-gallery-nav__item` | **8×8**, radius 5px | CSS |
| Favorite hit | `button[data-action=favorite].item-action__inner--sm` | **20×20** | computed |
| Favorite size CSS | `.item-action__inner` | `--item-action-width:20px; --item-action-height:20px` | CSS |
| Favorite insets | vs `.catalog-block__item` | top **≈14px**, right **≈14px** | bbox |
| Favorite wrap | `.item-action.item-action--vertical.item-action--favorite` | 20×20 | HTML |

ATC HTML — см. V1.

Dots HTML:

```html
<span class="section-gallery-nav">
  <span class="section-gallery-nav__wrapper">
    <span class="section-gallery-nav__item bg-theme-white-hover active"></span>
    …
```

---

## E3 — главная: баннер (mobile)

**URL:** `/`  
**Блок:** `.mp-item__wrapper.mp-item__bgwrapper` (+ class `mobile-bg-hidden` в DOM; отдельного CSS-правила `mobile-bg-hidden` в загруженных sheets **не найдено**)

| Что | Селектор | Значение | Цитата / источник |
|---|---|---|---|
| Layout mobile | `.mp-item__wrapper` | `display:grid; grid-template-rows:**100vw auto**; height:auto` | page CSS |
| Photo row | `.mp-item__bgwrapper` | `grid-row:1; background-size:contain; background-position:top` | page CSS |
| Photo size (computed) | `.mp-item__bgwrapper` first row | ширина **393**; ряд **100vw ≈ 393px** → aspect **1:1**; wrapper total height **584** (= 393 + text) | bbox + CSS |
| Text card | `.mp-front-wrapper` | padding **24px**; bg **#fff** / `var(--white)`; width 100%; text-align center | computed + CSS |
| Title | `h2.font_36.fw-300` | «Лето в доме»; **26px**; weight **300**; **uppercase**; line-height **34px** | computed |
| Title class CSS | `h1,.font_36` | `font-size:clamp(1rem + 10px, 3vw, 1rem + 20px)` | template CSS |
| CTA | `a.btn.btn-default.btn-lg` | «Подробнее»; **141×45**; font **14px**; weight 300; padding `1px 32px` | computed |
| Stacked? | title vs photo row | title top **478** ≥ photo-row bottom **≈454** (61+393) → **текст под фото**, не центр-оверлей | bbox + grid |

Desktop CSS (для справки, не mobile): `.mp-front-wrapper{… padding:40px 64px; max-width:568px}` — оверлей-карточка.

HTML:

```html
<div class="mp-item__wrapper mp-item__bgwrapper mobile-bg-hidden lazyloaded" style="background-image:url(…); …">
  <div class="maxwidth-theme">
    <div class="flexbox flexbox--align-center mp-front-wrapper relative">
      <h2 class="font_36 mb mb--0 fw-300">Лето в доме</h2>
      <div class="Text-Secondary">…</div>
      <a href="/catalog/" class="btn btn-default btn-lg mt mt--16">Подробнее</a>
    </div>
  </div>
</div>
```

---

## E4 — футер

**Селектор корня:** `footer.footer.footer-custom`

| Что | Селектор | Значение | Цитата / источник |
|---|---|---|---|
| Footer padding | `footer.footer` | **64px 0** | computed |
| Logo | `footer svg` | **≈205.7×40**; `fill="none"`; color **rgb(85, 85, 88)** | bbox + HTML |
| Links text-transform | `footer a` (напр. «О нас») | **uppercase** | computed |
| Links font / LH | same | **16px** / line-height **20px** | computed |
| Link class | `a.no-decoration.base-to-title-hover` | — | HTML |
| Vertical rhythm | `.footer__top-part` → `hr.p-block--24` → `.footer__main-part` | hr padding **24px 0** (класс `p-block--24`); parts margin 0 | computed |
| Bottom part | `.footer__bottom-part` | overlaps/follows main (height ≈140) | bbox |

Logo HTML (фрагмент):

```html
<svg viewBox="0 0 205.714 40" width="205.714355" height="40.000000" fill="none" …>
```

---

## E5 — mobile menu

**Открытие:** `.mobileheader__burger`  
**Панель:** `#mobilemenu.mobile-scroll` / `.mobilemenu`

| Что | Селектор | Значение | Цитата / источник |
|---|---|---|---|
| Фон | `#mobilemenu` | computed **rgb(252, 251, 251)**; CSS `background:var(--black_bg_black)` (light theme → near `#fcfbfb`) | computed + CSS |
| Ширина | `#mobilemenu` | **376px** max (`width:376px; max-width:100%`) | CSS `.mmenu_leftside #mobilemenu` |
| Основные ссылки | `a.top-level-link` / `.dark_link.top-level-link.font_15` | **uppercase**; font-size computed **16px**; color **rgb(91, 91, 91)** | computed |
| Примеры текстов | — | О нас, Вдохновение, Коллекции, Гид по подаркам, Клиентам, Контакты | DOM |

CSS:

```css
#mobilemenu{background:#fff;background:var(--black_bg_black);position:fixed;z-index:3002;…}
.mmenu_leftside #mobilemenu{left:-100%;top:0;bottom:0;width:376px;max-width:100%;}
```

---

## Сюрпризы относительно вводных

1. **V1:** полоса «Добавить в корзину» на mobile **подтверждена** (curl + Playwright) — вводная «кнопки нет» опровергнута.
2. **E3:** класс `mobile-bg-hidden` в DOM есть, но CSS-правила с таким именем в загруженных sheets нет; stacking даёт **`grid-template-rows: 100vw auto`** (фото-ряд 1:1, текст ниже) — не «отдельный `<img>` + блок».
3. **E1 chevron:** стрелка в разметке есть, но **скрыта** CSS (`display:none` на `.breadcrumbs__item-arrow` внутри link); визуально — одна parent-ссылка 12px.
4. **Favorite:** квадрат **20×20**, не 44; insets ~14px.
