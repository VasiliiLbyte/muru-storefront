/**
 * M7 STOP-1: baseline measurements A–G → e2e/m7-baseline-ah.json
 * Product code unchanged. Use project mobile-393 + PLAYWRIGHT_BASE_URL.
 */
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const LISTING = "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/";
const OUT = path.join("e2e", "m7-baseline-ah.json");

test.use({
  browserName: "chromium",
  viewport: { width: 393, height: 852 },
  launchOptions: {
    args: ["--disable-http2"],
  },
});

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-393",
    "M7 baseline measure: mobile-393 only",
  );
});

test("M7 baseline A–G measurements", async ({ page }) => {
  const report: Record<string, unknown> = {
    viewport: { width: 393, height: 852 },
    env: {
      NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE ?? null,
      MURU_API_BASE: process.env.MURU_API_BASE ?? null,
    },
  };

  await page.goto(LISTING, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const card = page.locator("article").first();
  await expect(card).toBeVisible({ timeout: 20000 });

  const A = await page.evaluate(() => {
    const header = document.querySelector("header")!;
    const cardEl = document.querySelector("article")!;
    const h1 = document.querySelector("h1")!;
    const crumb =
      Array.from(document.querySelectorAll("nav")).find((n) =>
        n.querySelector('a[href*="catalog"]'),
      ) ?? document.querySelector("nav");
    const hr = header.getBoundingClientRect();
    const cr = cardEl.getBoundingClientRect();
    const h1r = h1.getBoundingClientRect();
    const crr = crumb?.getBoundingClientRect();
    const serviceTop =
      Math.min(crr?.top ?? h1r.top, h1r.top) + window.scrollY;
    const serviceBottom =
      Math.max(crr?.bottom ?? h1r.bottom, h1r.bottom) + window.scrollY;
    return {
      cardTopDoc: cr.top + window.scrollY,
      headerBottomDoc: hr.bottom + window.scrollY,
      gapHeaderToCard_doc: cr.top + window.scrollY - (hr.bottom + window.scrollY),
      gapHeaderToCard_viewport: cr.top - hr.bottom,
      serviceBlockHeight: serviceBottom - serviceTop,
      headerHeight: hr.height,
    };
  });
  report.A = { listing: LISTING, ...A };

  const addBtn = card.getByRole("button", { name: /корзин/i });
  const addBox = await addBtn.boundingBox();
  const cardBox = await card.boundingBox();
  const imgBox = await card.locator(".aspect-square").first().boundingBox();
  report.B = {
    cardHeight: cardBox?.height ?? null,
    addToCart: addBox
      ? {
          width: addBox.width,
          height: addBox.height,
          x: addBox.x,
          y: addBox.y,
          text: ((await addBtn.textContent()) ?? "").trim(),
        }
      : null,
    image: imgBox
      ? { width: imgBox.width, height: imgBox.height, y: imgBox.y }
      : null,
    overlayHeightPx: addBox?.height ?? null,
  };

  const C = await page.evaluate(() => {
    const cards = document.querySelectorAll("article");
    const grid = cards[0]?.parentElement;
    const gridRect = grid?.getBoundingClientRect();
    const filtersButton = Array.from(document.querySelectorAll("button")).find(
      (b) => /Фильтры/i.test(b.textContent ?? ""),
    );
    const toolbar =
      filtersButton?.closest(".mb-8") ??
      filtersButton?.parentElement?.parentElement ??
      filtersButton?.parentElement;
    const toolbarRect = toolbar?.getBoundingClientRect();
    const gridBottomDoc = gridRect
      ? gridRect.bottom + window.scrollY
      : null;
    const toolbarTopDoc = toolbarRect
      ? toolbarRect.top + window.scrollY
      : null;
    return {
      gridBottomDoc,
      toolbarTopDoc,
      toolbarBelowGrid:
        toolbarTopDoc != null && gridBottomDoc != null
          ? toolbarTopDoc >= gridBottomDoc - 4
          : null,
      filtersText: filtersButton?.textContent?.trim() ?? null,
    };
  });
  report.C = C;

  const focusables = await page.evaluate(() => {
    const header = document.querySelector("header");
    if (!header) return [];
    return Array.from(header.querySelectorAll("a, button, input")).map(
      (el) => {
        const he = el as HTMLElement;
        const style = window.getComputedStyle(he);
        const rect = he.getBoundingClientRect();
        return {
          tag: he.tagName.toLowerCase(),
          name:
            he.getAttribute("aria-label") ||
            (he as HTMLInputElement).name ||
            (he.textContent ?? "").trim().slice(0, 48),
          tabIndex: he.tabIndex,
          visible:
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            Number(style.opacity) !== 0 &&
            rect.width > 0 &&
            rect.height > 0,
        };
      },
    );
  });

  await page.locator("body").click({ position: { x: 5, y: 5 } });
  const focusOrder: string[] = [];
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || !el.closest("header")) return null;
      return `${el.tagName.toLowerCase()}:${
        el.getAttribute("aria-label") ||
        (el as HTMLInputElement).name ||
        (el.textContent ?? "").trim().slice(0, 40)
      }`;
    });
    if (info && !focusOrder.includes(info)) focusOrder.push(info);
  }
  report.D = {
    headerQuerySelectorCandidates: focusables,
    realTabOrderInHeader: focusOrder,
  };

  report.E = {
    roleSearchCountListing: await page.locator('[role="search"]').count(),
  };

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  const home = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll('a[href^="/catalog/"]'),
    ) as HTMLAnchorElement[];
    const productLinks = links.filter((a) => {
      const parts = a.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
      return parts[0] === "catalog" && parts.length >= 4;
    });
    const h1s = Array.from(document.querySelectorAll("h1"));
    return {
      productLinkCount: productLinks.length,
      productHrefs: productLinks.slice(0, 10).map((a) => a.pathname),
      h1Count: h1s.length,
      h1Texts: h1s.map((h) => (h.textContent ?? "").trim()),
      firstSectionHeading: (
        document.querySelector("main section h1, main section h2")
          ?.textContent ?? ""
      ).trim(),
    };
  });
  report.F = {
    productLinkCount: home.productLinkCount,
    sample: home.productHrefs,
  };
  report.G = {
    h1Count: home.h1Count,
    h1Texts: home.h1Texts,
    firstSectionHeading: home.firstSectionHeading,
  };
  (report.E as Record<string, number>).roleSearchCountHome = await page
    .locator('[role="search"]')
    .count();

  await page.goto("/login/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  (report.E as Record<string, number>).roleSearchCountLogin = await page
    .locator('[role="search"]')
    .count();

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log("M7_BASELINE_JSON\n" + JSON.stringify(report, null, 2));

  expect(A.gapHeaderToCard_viewport).toBeGreaterThan(0);
  expect(home.h1Count).toBe(1);
});
