#!/usr/bin/env node
/**
 * Lighthouse audit for key storefront pages.
 * Requires production build: NEXT_PUBLIC_API_MOCKING=enabled npm run build
 * Usage: node scripts/lighthouse-audit.mjs [--url=http://localhost:3000] [--ci]
 *
 * Default: report-only (exit 0). With --ci: exit 1 on a11y/best-practices/seo < 90.
 * Performance is never blocking (no real product photos yet).
 */

import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import process from "node:process";

const THRESHOLD = 90;
const CI_MODE = process.argv.includes("--ci");
const BASE_URL = process.argv
  .find((arg) => arg.startsWith("--url="))
  ?.split("=")[1]
  ?.replace(/\/$/, "") ?? "http://localhost:3000";

const PAGES = [
  { name: "home", path: "/" },
  { name: "catalog-root", path: "/catalog/" },
  {
    name: "catalog-listing",
    path: "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/",
  },
  {
    name: "product-pdp",
    path: "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/vazy-i-kuvshiny-01/",
  },
  { name: "basket", path: "/basket/", skipSeo: true },
  { name: "search", path: "/search/", skipSeo: true },
  { name: "contacts", path: "/company/contacts/" },
];

const CATEGORIES = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
];

/** Categories that can fail the build in --ci mode. Performance is informational only. */
const BLOCKING_CATEGORIES = ["accessibility", "best-practices", "seo"];

async function runAudit(url, categories = CATEGORIES) {
  const chrome = await launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });

  try {
    const runnerResult = await lighthouse(url, {
      logLevel: "error",
      output: "json",
      port: chrome.port,
      onlyCategories: categories,
    });

    return runnerResult?.lhr;
  } finally {
    await chrome.kill();
  }
}

function score(lhr, category) {
  return Math.round((lhr.categories[category]?.score ?? 0) * 100);
}

function blockingCategoriesFor(page) {
  const cats = page.skipSeo
    ? BLOCKING_CATEGORIES.filter((cat) => cat !== "seo")
    : BLOCKING_CATEGORIES;
  return cats;
}

async function main() {
  const ciFailures = [];
  const notes = [];

  const modeLabel = CI_MODE
    ? `CI mode (threshold ≥${THRESHOLD} for a11y, best-practices, seo)`
    : "Report only (performance shown, not gated; use --ci to fail on threshold)";

  console.log(`Lighthouse audit — ${modeLabel}\n`);

  for (const page of PAGES) {
    const url = `${BASE_URL}${page.path}`;
    process.stdout.write(`${page.name} (${url})… `);

    const categories = page.skipSeo
      ? CATEGORIES.filter((cat) => cat !== "seo")
      : CATEGORIES;

    const lhr = await runAudit(url, categories);
    if (!lhr) {
      console.log("FAILED (no result)");
      if (CI_MODE) {
        ciFailures.push({ page: page.name, error: "no result" });
      }
      continue;
    }

    const scores = Object.fromEntries(
      categories.map((cat) => [cat, score(lhr, cat)]),
    );

    const line = categories.map((cat) => {
      const s = scores[cat];
      const label = cat.replace("-", " ");
      return `${label}: ${s}`;
    }).join(" | ");

    const blocking = blockingCategoriesFor(page);
    const belowBlocking = blocking.filter((cat) => scores[cat] < THRESHOLD);
    const belowPerf =
      scores.performance !== undefined && scores.performance < THRESHOLD;

    if (belowBlocking.length > 0) {
      console.log(`FAIL — ${line}`);
      if (CI_MODE) {
        ciFailures.push({ page: page.name, scores, below: belowBlocking });
      }
    } else if (belowPerf) {
      console.log(`OK — ${line} (performance below ${THRESHOLD}, informational)`);
      notes.push({
        page: page.name,
        note: `performance=${scores.performance}`,
      });
    } else {
      console.log(`OK — ${line}`);
    }
  }

  console.log("");

  if (notes.length > 0) {
    console.log(
      `${notes.length} page(s) with performance below ${THRESHOLD} (informational):`,
    );
    for (const n of notes) {
      console.log(`  - ${n.page}: ${n.note}`);
    }
    console.log("");
  }

  if (CI_MODE && ciFailures.length > 0) {
    console.error(
      `${ciFailures.length} page(s) below threshold ${THRESHOLD} (a11y/best-practices/seo):`,
    );
    for (const f of ciFailures) {
      if (f.error) {
        console.error(`  - ${f.page}: ${f.error}`);
      } else {
        console.error(
          `  - ${f.page}: ${f.below.map((c) => `${c}=${f.scores[c]}`).join(", ")}`,
        );
      }
    }
    process.exit(1);
  }

  if (CI_MODE) {
    console.log("All gated categories passed.");
  } else {
    console.log("Report complete (exit 0). Use --ci to fail on threshold.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
