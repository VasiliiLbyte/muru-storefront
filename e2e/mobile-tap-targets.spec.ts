import { test, expect, type Page, type Locator } from "@playwright/test";

import { KEY_MOBILE_ROUTES } from "./mobile-routes";

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name === "chromium", "mobile baseline only");
});

/**
 * Relaxed 44×height / ≥24 width only for these selectors (nav/footer text links).
 * Everything else must be ≥44×44.
 */
const TEXT_LINK_RELAX_SELECTORS = [
  /* utility / footer text links: tall hit area but narrow width */
  "footer a",
  "nav[aria-label='Верхнее меню'] a",
  /* intentional text crumbs — height ≥44 via min-h-11 */
  "nav[aria-label='Хлебные крошки'] a",
] as const;

/**
 * Catalog ATC bar — muru.ru E2 is 36px tall × full image width (M8-1 parity).
 * Allowed: height ≥36 and width ≥44 (full-bleed strip).
 */
const CATALOG_ATC_RELAX_SELECTORS = [
  'article button[aria-label*="корзин"]',
] as const;

/**
 * Hard-exclude Next.js / Turbopack dev overlays and the visually-hidden skip link
 * (1×1 until focused — not a real mobile tap target in the resting UI).
 */
const HARD_EXCLUDE_SELECTORS = [
  "nextjs-portal",
  "#__next-build-watcher",
  "#next-logo",
  'a[href="#main"]',
] as const;

type TapViolation = {
  path: string;
  selector: string;
  width: number;
  height: number;
};

async function isHardExcluded(el: Locator): Promise<boolean> {
  return el
    .evaluate((node, sels) => {
      for (const sel of sels) {
        if (node.matches(sel) || node.closest(sel)) return true;
      }
      // Next.js / Turbopack floating "Issues" badge (not always under nextjs-portal)
      const aria = (node.getAttribute("aria-label") ?? "").toLowerCase();
      if (
        aria.includes("issues overlay") ||
        aria.includes("issues badge") ||
        aria.includes("next.js")
      ) {
        return true;
      }
      return false;
    }, [...HARD_EXCLUDE_SELECTORS])
    .catch(() => false);
}

async function isVisibleInteractive(el: Locator): Promise<boolean> {
  if (!(await el.isVisible().catch(() => false))) return false;
  const box = await el.boundingBox();
  if (!box || box.width <= 0 || box.height <= 0) return false;
  const opacity = await el.evaluate((node) => {
    const style = window.getComputedStyle(node);
    return Number.parseFloat(style.opacity || "1");
  });
  return opacity > 0;
}

async function matchesRelaxAllowList(el: Locator): Promise<"text" | "atc" | false> {
  for (const sel of TEXT_LINK_RELAX_SELECTORS) {
    if (
      await el.evaluate((node, s) => node.matches(s), sel).catch(() => false)
    ) {
      return "text";
    }
  }
  for (const sel of CATALOG_ATC_RELAX_SELECTORS) {
    if (
      await el.evaluate((node, s) => node.matches(s), sel).catch(() => false)
    ) {
      return "atc";
    }
  }
  return false;
}

function passesTapTarget(
  width: number,
  height: number,
  relaxed: "text" | "atc" | false,
): boolean {
  if (width >= 44 && height >= 44) return true;
  if (relaxed === "text" && height >= 44 && width >= 24) return true;
  // parity: muru.ru button.to_cart — 36× full image width
  if (relaxed === "atc" && height >= 36 && width >= 44) return true;
  return false;
}

async function collectTapViolations(
  page: Page,
  path: string,
): Promise<TapViolation[]> {
  const violations: TapViolation[] = [];
  const locator = page.locator("a, button, [role=button], input, select");
  const count = await locator.count();

  for (let i = 0; i < count; i += 1) {
    const el = locator.nth(i);
    if (await isHardExcluded(el)) continue;
    if (!(await isVisibleInteractive(el))) continue;

    const box = await el.boundingBox();
    if (!box) continue;

    const relaxed = await matchesRelaxAllowList(el);
    if (passesTapTarget(box.width, box.height, relaxed)) continue;

    const selector = await el.evaluate((node) => {
      const tag = node.tagName.toLowerCase();
      const id = node.id ? `#${node.id}` : "";
      const role = node.getAttribute("role");
      const aria = node.getAttribute("aria-label");
      const text = (node.textContent ?? "").trim().slice(0, 40);
      return [tag + id, role ? `[role=${role}]` : "", aria ?? text]
        .filter(Boolean)
        .join(" ");
    });

    violations.push({
      path,
      selector,
      width: Math.round(box.width),
      height: Math.round(box.height),
    });
  }

  return violations;
}

test("tap-targets: interactive controls meet 44×44 (or allow-list)", async ({
  page,
}) => {
  const all: TapViolation[] = [];

  for (const path of KEY_MOBILE_ROUTES) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);
    all.push(...(await collectTapViolations(page, path)));
  }

  const summary = all
    .map((v) => `${v.path} → ${v.selector} (${v.width}×${v.height})`)
    .join("\n");

  expect(all, `tap-target violations (${all.length}):\n${summary}`).toEqual(
    [],
  );
});
