#!/usr/bin/env node
/**
 * SEO-018: verify evidence CSV old_404 URLs return a single 301 to the
 * corrected canon, and that the canon returns 200.
 *
 * Usage: node scripts/check-seo018-redirects.mjs <base-url>
 * Example: node scripts/check-seo018-redirects.mjs http://localhost:3000
 *          node scripts/check-seo018-redirects.mjs https://muru.ru
 *
 * Evidence (gitignored locally): muru-docs/data/evidence/seo018-moved-products-301-candidates-20260925.csv
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SERT_SLUGS = new Set([
  "podarochnyy-sertifikat-5000",
  "podarochnyy-sertifikat-10000",
  "podarochnyy-sertifikat-15000",
]);

function pathOf(url) {
  try {
    const u = new URL(url.trim());
    let p = u.pathname;
    if (!p.endsWith("/")) p += "/";
    return p;
  } catch {
    let p = url.trim();
    if (!p.startsWith("/")) p = `/${p}`;
    if (!p.endsWith("/")) p += "/";
    return p;
  }
}

function expectedTarget(oldPath, newLiveRaw) {
  const slug = oldPath.replace(/\/$/, "").split("/").pop();
  if (SERT_SLUGS.has(slug)) {
    return `/catalog/podarochnye-karty/podarochnye-karty/${slug}/`;
  }
  if (newLiveRaw.includes("|")) {
    const alts = newLiveRaw.split("|").map(pathOf);
    const three = alts.filter((a) => a.split("/").filter(Boolean).length === 4);
    return three[0] ?? alts[0];
  }
  return pathOf(newLiveRaw);
}

function parseEvidence(csvPath) {
  const text = readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  const header = lines[0].split(",");
  const oi = header.indexOf("old_404");
  const ni = header.indexOf("new_live");
  if (oi < 0 || ni < 0) throw new Error(`Bad CSV header: ${lines[0]}`);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    // new_live may contain `|` but not commas except as separator of two cols
    const line = lines[i];
    const firstComma = line.indexOf(",");
    if (firstComma < 0) continue;
    const oldUrl = line.slice(0, firstComma);
    const newLive = line.slice(firstComma + 1);
    const oldPath = pathOf(oldUrl);
    const newPath = expectedTarget(oldPath, newLive);
    rows.push({ oldPath, newPath, line: i + 1 });
  }
  return rows;
}

async function fetchHead(url) {
  const res = await fetch(url, { redirect: "manual", method: "GET" });
  return {
    status: res.status,
    location: res.headers.get("location"),
  };
}

function locationPath(location, base) {
  if (!location) return null;
  try {
    const u = new URL(location, base);
    let p = u.pathname;
    if (!p.endsWith("/")) p += "/";
    return p;
  } catch {
    return location;
  }
}

async function main() {
  const base = (process.argv[2] ?? "").replace(/\/$/, "");
  if (!base) {
    console.error("Usage: node scripts/check-seo018-redirects.mjs <base-url>");
    process.exit(2);
  }

  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const candidates = [
    join(
      root,
      "..",
      "muru-docs",
      "data",
      "evidence",
      "seo018-moved-products-301-candidates-20260925.csv",
    ),
    "/Users/vasilii/Desktop/code /muru-docs/data/evidence/seo018-moved-products-301-candidates-20260925.csv",
  ];
  const csvPath = candidates.find((p) => existsSync(p));
  if (!csvPath) {
    console.error("Evidence CSV not found. Tried:\n" + candidates.join("\n"));
    process.exit(2);
  }

  const rows = parseEvidence(csvPath);
  console.log(`Checking ${rows.length} evidence rows against ${base}`);

  let pass = 0;
  let fail = 0;
  const failures = [];

  for (const row of rows) {
    const oldUrl = `${base}${row.oldPath}`;
    const head = await fetchHead(oldUrl);
    const loc = locationPath(head.location, base);

    let ok = head.status === 301 && loc === row.newPath;
    let detail = `redirect ${head.status} → ${loc ?? "(none)"} (want 301 → ${row.newPath})`;

    if (ok) {
      const dest = await fetchHead(`${base}${row.newPath}`);
      if (dest.status !== 200) {
        ok = false;
        detail = `canon status ${dest.status} (want 200) for ${row.newPath}`;
      } else {
        detail = `301 → 200`;
      }
    }

    if (ok) {
      pass += 1;
    } else {
      fail += 1;
      failures.push({ oldPath: row.oldPath, detail });
      console.error(`FAIL ${row.oldPath}: ${detail}`);
    }
  }

  console.log(`\nResult: ${pass}/${rows.length} pass, ${fail} fail`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
