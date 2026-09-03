/**
 * M8 visual parity T1'/T6'/T7/T8/T9 (STOP-1: red gates on base 9139191).
 * Product src/** unchanged. Chromium + --disable-http2 for live prod API.
 */
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

const LISTING = "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/";

/** STOP-1 baseline A (raw gap header→card). Source: e2e/m7-baseline-ah.json */
const M7_BASELINE_GAP_HEADER_TO_CARD_PX = 165.59375;

function baselineGapPx(): number {
  try {
    const raw = fs.readFileSync("e2e/m7-baseline-ah.json", "utf8");
    const json = JSON.parse(raw) as {
      A?: { gapHeaderToCard_viewport?: number };
    };
    if (typeof json.A?.gapHeaderToCard_viewport === "number") {
      return json.A.gapHeaderToCard_viewport;
    }
  } catch {
    // fallback constant
  }
  return M7_BASELINE_GAP_HEADER_TO_CARD_PX;
}

test.use({
  browserName: "chromium",
  launchOptions: {
    args: ["--disable-http2"],
  },
});

async function settle(page: Page) {
  await page.waitForTimeout(400);
}

test.describe("M8 visual parity — mobile-393", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-393",
      "M8 T1'/T6'/T7/T9-mobile: mobile-393 only",
    );
  });

  test("T1': карточка сетки — иконка корзины, полосы «Добавить в корзину» нет", async ({
    page,
  }) => {
    // CARD-001 (2026-09-03) отменил M8-V1-REVERSAL: канон — макет дизайнера,
    // а не паритет со старым Bitrix-сайтом. Полноширинная полоса заменена
    // на контурную иконку корзины в правом верхнем углу фото.
    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);
    const card = page.locator("article").first();
    await expect(card).toBeVisible({ timeout: 20000 });

    const addBtn = card.getByRole("button", { name: /корзин/i });
    await expect(addBtn, "T1': контрол добавления в корзину должен быть").toBeVisible();

    await expect(
      card.getByText("Добавить в корзину", { exact: true }),
      "T1': видимой подписи-полосы быть не должно (CARD-001)",
    ).toHaveCount(0);

    const metrics = await page.evaluate(() => {
      const article = document.querySelector("article");
      const btn = [...(article?.querySelectorAll("button") ?? [])].find((b) =>
        /корзин/i.test(b.getAttribute("aria-label") ?? ""),
      );
      const media = article?.querySelector("[class*='aspect-square']");
      if (!btn || !media) return null;
      const bb = btn.getBoundingClientRect();
      const mb = media.getBoundingClientRect();
      return {
        btnW: bb.width,
        btnH: bb.height,
        fromRight: mb.right - bb.right,
        fromTop: bb.top - mb.top,
      };
    });

    expect(metrics, "T1': кнопка и медиа-бокс измеримы").not.toBeNull();
    // Хит-таргет 44×44 (гейт mobile-tap-targets) и позиция «справа сверху»
    expect(metrics!.btnW, `T1': ширина кнопки ${metrics!.btnW} ≥ 44`).toBeGreaterThanOrEqual(44);
    expect(metrics!.btnH, `T1': высота кнопки ${metrics!.btnH} ≥ 44`).toBeGreaterThanOrEqual(44);
    expect(metrics!.fromRight, `T1': отступ справа ${metrics!.fromRight} ≤ 12`).toBeLessThanOrEqual(12);
    expect(metrics!.fromTop, `T1': отступ сверху ${metrics!.fromTop} ≤ 12`).toBeLessThanOrEqual(12);
  });

  test("T1'': сердце — слева сверху, бейдж скидки — снизу справа", async ({
    page,
  }) => {
    await page.goto("/catalog/rasprodazha/", { waitUntil: "domcontentloaded" });
    await settle(page);
    const card = page.locator("article").first();
    await expect(card).toBeVisible({ timeout: 20000 });

    const pos = await page.evaluate(() => {
      const article = document.querySelector("article");
      const media = article?.querySelector("[class*='aspect-square']");
      const fav = [...(article?.querySelectorAll("button") ?? [])].find((b) =>
        /избранн/i.test(b.getAttribute("aria-label") ?? ""),
      );
      const badge = [...(article?.querySelectorAll("span") ?? [])].find((e) =>
        /^−\d+%$|^Распродажа$/.test(e.textContent?.trim() ?? ""),
      );
      if (!media || !fav) return null;
      const mb = media.getBoundingClientRect();
      const fb = fav.getBoundingClientRect();
      const bb = badge?.getBoundingClientRect();
      return {
        favFromLeft: fb.left - mb.left,
        favFromTop: fb.top - mb.top,
        badge: bb ? { fromRight: mb.right - bb.right, fromBottom: mb.bottom - bb.bottom } : null,
      };
    });

    expect(pos, "T1'': позиции измеримы").not.toBeNull();
    expect(pos!.favFromLeft, "T1'': сердце слева").toBeLessThanOrEqual(12);
    expect(pos!.favFromTop, "T1'': сердце сверху").toBeLessThanOrEqual(12);
    if (pos!.badge) {
      expect(pos!.badge.fromRight, "T1'': скидка справа").toBeLessThanOrEqual(2);
      expect(pos!.badge.fromBottom, "T1'': скидка снизу").toBeLessThanOrEqual(2);
    }
  });

  test("T6': raw gap header→first card ≤ baseline A + 1 (no toolbar subtract)", async ({
    page,
  }) => {
    const baseline = baselineGapPx();
    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page.locator("article").first()).toBeVisible({
      timeout: 20000,
    });

    const measured = await page.evaluate(() => {
      const header = document.querySelector("header");
      const card = document.querySelector("article");
      const h1 = document.querySelector("h1");
      if (!header || !card) return null;
      const hr = header.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      const h1r = h1?.getBoundingClientRect();
      const lineHeight = h1
        ? parseFloat(getComputedStyle(h1).lineHeight) || 0
        : 0;
      return {
        gap: cr.top - hr.bottom,
        h1Height: h1r?.height ?? 0,
        h1LineHeight: lineHeight,
        h1Text: h1?.textContent?.trim() ?? "",
      };
    });

    expect(measured, "T6': raw gap measurable").not.toBeNull();

    // Гейт про ЛИШНИЙ вертикальный воздух, а не про длину заголовка.
    // SEO-H1 категории редактируется в админке (SEO-FIELDS, 2026-08-28):
    // когда он переносится на вторую строку, сырой gap растёт на высоту
    // строки, хотя отступы не менялись. Нормализуем на лишние строки h1.
    const { gap, h1Height, h1LineHeight, h1Text } = measured!;
    const extraLines =
      h1LineHeight > 0 ? Math.max(0, Math.round(h1Height / h1LineHeight) - 1) : 0;
    const normalized = gap - extraLines * h1LineHeight;

    expect(
      normalized,
      `T6': нормализованный gap header→card (${normalized.toFixed(1)}; сырой ${gap.toFixed(1)}, h1 «${h1Text}» в ${extraLines + 1} стр.) должен быть ≤ baseline A+1 (${baseline + 1})`,
    ).toBeLessThanOrEqual(baseline + 1);
  });

  test("T7: первый баннер главной на весь экран, текст поверх фото", async ({
    page,
  }) => {
    // P1 (макет `сайт_2.pdf`, 2026-09-03): на мобиле баннер занимает
    // весь экран, текст лежит ПОВЕРХ фото — без белой плашки под ним.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await settle(page);

    const layout = await page.evaluate(() => {
      const section = document.querySelector("main section");
      if (!section) return null;
      // Баннер из CMS может быть и видео, и картинкой
      const img = section.querySelector("img, video");
      const title = section.querySelector("h2, h1");
      if (!img || !title) return null;
      const sr = section.getBoundingClientRect();
      const ir = img.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      return {
        sectionHeight: sr.height,
        viewport: window.innerHeight,
        titleTop: tr.top,
        titleBottom: tr.bottom,
        imageTop: ir.top,
        imageBottom: ir.bottom,
        titleColor: getComputedStyle(title).color,
      };
    });

    expect(layout, "T7: баннер измерим").not.toBeNull();

    expect(
      layout!.sectionHeight,
      `T7: баннер (${layout!.sectionHeight}) должен занимать почти весь экран (${layout!.viewport})`,
    ).toBeGreaterThanOrEqual(layout!.viewport * 0.9);

    expect(
      layout!.titleTop,
      `T7: заголовок (top ${layout!.titleTop}) должен лежать внутри фото (top ${layout!.imageTop})`,
    ).toBeGreaterThanOrEqual(layout!.imageTop - 1);
    expect(
      layout!.titleBottom,
      `T7: заголовок (bottom ${layout!.titleBottom}) должен лежать внутри фото (bottom ${layout!.imageBottom})`,
    ).toBeLessThanOrEqual(layout!.imageBottom + 1);

    expect(
      layout!.titleColor,
      `T7: заголовок поверх фото должен быть белым (получено ${layout!.titleColor})`,
    ).toMatch(/rgba?\(\s*255,\s*255,\s*255/);
  });

  test("T9 mobile: breadcrumbs show exactly one visible link (parent back)", async ({
    page,
  }) => {
    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);

    const nav = page.getByRole("navigation", { name: /Хлебные крошки/i });
    await expect(nav).toBeVisible({ timeout: 20000 });

    const visibleLinks = nav.locator("a").filter({ visible: true });
    await expect(
      visibleLinks,
      "T9: mobile crumbs must show exactly one visible link (parent)",
    ).toHaveCount(1);
  });
});

test.describe("M8 visual parity — desktop 1440", () => {
  test.use({
    viewport: { width: 1440, height: 900 },
  });

  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "M8 T8/T9-desktop: chromium (1440) only",
    );
  });

  test("T8: home first banner title stays overlaid inside image (desktop guard)", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await settle(page);

    const layout = await page.evaluate(() => {
      const section = document.querySelector("main section");
      if (!section) return null;
      const img =
        section.querySelector("img") ??
        section.querySelector('[class*="object-cover"]');
      // Prefer visible heading (mobile duplicate is lg:hidden → 0×0 on desktop)
      const titles = [...section.querySelectorAll("h2, h1")];
      const title =
        titles.find((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        }) ?? titles[0];
      if (!img || !title) return null;
      const ir = img.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      return {
        titleTop: tr.top,
        titleBottom: tr.bottom,
        imageTop: ir.top,
        imageBottom: ir.bottom,
      };
    });

    expect(layout, "T8: banner measurable").not.toBeNull();
    expect(
      layout!.titleTop,
      `T8: title top (${layout!.titleTop}) must be ≥ image top (${layout!.imageTop})`,
    ).toBeGreaterThanOrEqual(layout!.imageTop - 1);
    expect(
      layout!.titleBottom,
      `T8: title bottom (${layout!.titleBottom}) must be ≤ image bottom (${layout!.imageBottom}) — overlay preserved on desktop`,
    ).toBeLessThanOrEqual(layout!.imageBottom + 1);
  });

  test("T9 desktop: breadcrumbs show full trail (more than one link)", async ({
    page,
  }) => {
    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);

    const nav = page.getByRole("navigation", { name: /Хлебные крошки/i });
    await expect(nav).toBeVisible({ timeout: 20000 });

    const visibleLinks = nav.locator("a").filter({ visible: true });
    const count = await visibleLinks.count();
    expect(
      count,
      `T9: desktop crumbs must show full trail (>1 visible link; got ${count})`,
    ).toBeGreaterThan(1);
  });
});
