#!/usr/bin/env node
// Gaia Research visual audit harness.
// Screenshots every key page across desktop + mobile viewports, detects
// horizontal cut-off (document scrollWidth > viewport) and its true culprit,
// and collects console/page errors. Writes screenshots + report.json.
//
// Usage (a Next dev server must already be running):
//   BASE_URL=http://localhost:3010 node scripts/visual-audit.mjs
//
// Options via env:
//   BASE_URL   dev server origin (default http://localhost:3000)
//   PAGES      comma-separated paths (default: home, ci-churn, context-diet, labs)
//   WIDTHS     comma-separated viewport widths (default 320,360,390,414,768,1280)
//   LABEL      output subfolder name under scripts/.visual-audit/ (default "run")
//   PW_PATH    absolute path to a playwright module (auto-resolved if omitted)
//
// Playwright is intentionally NOT a project dependency (keeps the Cloudflare
// bundle lean). This script resolves it from: (1) PW_PATH, (2) a normal
// require/import, (3) the most recent npx cache under the user's home.
import { mkdirSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { homedir } from "node:os";

async function resolveChromium() {
  // 1. explicit override
  if (process.env.PW_PATH) {
    const m = await import(pathToFileURL(process.env.PW_PATH).href);
    return m.chromium ?? m.default?.chromium;
  }
  // 2. plain resolution (works if playwright is installed somewhere on the path)
  try {
    const m = await import("playwright");
    if (m.chromium ?? m.default?.chromium) return m.chromium ?? m.default?.chromium;
  } catch { /* fall through */ }
  // 3. scan npx cache for the newest playwright install
  const npxCache = join(homedir(), "AppData", "Local", "npm-cache", "_npx");
  const linuxCache = join(homedir(), ".npm", "_npx");
  for (const base of [npxCache, linuxCache]) {
    if (!existsSync(base)) continue;
    const candidates = readdirSync(base)
      .map((d) => join(base, d, "node_modules", "playwright", "index.js"))
      .filter((p) => existsSync(p))
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
    if (candidates.length) {
      const m = await import(pathToFileURL(candidates[0]).href);
      return m.chromium ?? m.default?.chromium;
    }
  }
  throw new Error(
    "Could not resolve Playwright. Install it (npx playwright install) or set PW_PATH " +
      "to an absolute path to a playwright/index.js."
  );
}

const BASE = process.env.BASE_URL || "http://localhost:3000";
const PAGES = (process.env.PAGES || "/,/research/ci-churn,/labs/context-diet,/labs").split(",");
const WIDTHS = (process.env.WIDTHS || "320,360,390,414,768,1280").split(",").map(Number);
const OUT = `scripts/.visual-audit/${process.env.LABEL || "run"}`;
mkdirSync(OUT, { recursive: true });

// Runs in the browser: find the widest element whose own box exceeds the
// viewport AND that is not inside a horizontal-scroll container (those are
// intentional, e.g. .table-wrap / .copy-command-text).
function overflowProbe(vw) {
  const inScrollContainer = (el) => {
    let p = el.parentElement;
    while (p) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === "auto" || ox === "scroll" || ox === "hidden") return true;
      p = p.parentElement;
    }
    return false;
  };
  const bad = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && r.width > 0 && r.height > 0 && !inScrollContainer(el)) {
      const cs = getComputedStyle(el);
      if (cs.visibility !== "hidden" && cs.display !== "none") {
        bad.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && el.className.toString ? el.className.toString() : "").slice(0, 60),
          right: Math.round(r.right),
          width: Math.round(r.width),
        });
      }
    }
  }
  bad.sort((a, b) => b.right - a.right);
  const de = document.documentElement;
  return {
    scrollW: Math.max(de.scrollWidth, document.body.scrollWidth),
    culprits: bad.slice(0, 6),
  };
}

const chromium = await resolveChromium();
const browser = await chromium.launch();
const report = [];
let issues = 0;

for (const path of PAGES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    let status = 0, overflow = null, culprits = [];
    try {
      const resp = await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 30000 });
      status = resp ? resp.status() : 0;
      await page.waitForTimeout(1000);
      const probe = await page.evaluate(overflowProbe, width);
      overflow = probe.scrollW - width;
      culprits = probe.culprits;
    } catch (e) {
      errors.push(`NAV_FAIL: ${String(e)}`);
    }
    const slug = path.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home";
    await page.screenshot({ path: `${OUT}/${slug}__${width}.png`, fullPage: true }).catch(() => {});
    const cutoff = overflow != null && overflow > 1;
    // Non-404 console errors only (the Milim rig bundle 404 is an expected fallback).
    const realErrors = errors.filter((e) => !/404|Failed to load resource/i.test(e));
    const bad = cutoff || realErrors.length || status !== 200;
    if (bad) issues++;
    report.push({ path, width, status, overflow, culprits, errors });
    const mark = bad ? "⚠" : "✓";
    console.log(`  ${mark} ${path} @ ${width}px  (overflow ${overflow}px, HTTP ${status})`);
    if (cutoff) culprits.forEach((c) => console.log(`      · <${c.tag} class="${c.cls}"> right=${c.right} w=${c.width}`));
    if (realErrors.length) realErrors.forEach((e) => console.log(`      ✗ ${e.slice(0, 140)}`));
    await context.close();
  }
}

writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(`\n${issues ? "⚠" : "✅"} ${report.length} checks, ${issues} with issues → ${OUT}/`);
process.exit(issues ? 1 : 0);
