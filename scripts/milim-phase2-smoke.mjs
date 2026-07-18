#!/usr/bin/env node
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const args = readArgs(process.argv.slice(2));
const baseUrl = new URL(args["base-url"] ?? "http://127.0.0.1:3010").href;
const playwright = loadPlaywright(args["pw-path"] ?? process.env.PW_PATH);
const browser = await playwright.chromium.launch({ headless: true });

try {
  await verifyLiveAndLifecycle();
  await verifyExplicitFallbacks();
  await verifyReducedMotion();
  await verifyNoWebGl();
  console.log(JSON.stringify({ ok: true, baseUrl, checks: ["live", "visibility", "missing-release", "context-loss", "reduced-motion", "no-webgl"] }));
} finally {
  await browser.close();
}

async function verifyLiveAndLifecycle() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    await goto(page, "");
    await page.waitForFunction(() => window.__MILIM_QA__?.snapshot().ready === true, undefined, { timeout: 20_000 });
    await page.evaluate(() => { const spacer = document.createElement("div"); spacer.style.height = "1400px"; document.body.append(spacer); window.scrollTo(0, document.body.scrollHeight); });
    await page.waitForFunction(() => window.__MILIM_QA__?.snapshot().lifecycle?.running === false, undefined, { timeout: 5_000 });
    await page.evaluate(() => window.__MILIM_QA__?.forceContextLoss());
    await page.waitForFunction(() => document.querySelector(".milim-qa-stage")?.dataset.player === "fallback", undefined, { timeout: 5_000 });
  } finally { await context.close(); }
}

async function verifyExplicitFallbacks() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    for (const mode of ["fallback", "reduced-motion", "missing-release"]) {
      await goto(page, `mode=${mode}`);
      await page.waitForFunction(() => document.querySelector(".milim-qa-stage")?.dataset.player === "fallback", undefined, { timeout: 5_000 });
    }
  } finally { await context.close(); }
}

async function verifyReducedMotion() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => { if (request.url().includes("/milim/releases/")) requests.push(request.url()); });
  try {
    await goto(page, "");
    await page.waitForFunction(() => document.querySelector(".milim-qa-stage")?.dataset.player === "fallback", undefined, { timeout: 5_000 });
    if (requests.length) throw new Error(`Reduced motion requested the promoted release: ${requests.join(", ")}`);
  } finally { await context.close(); }
}

async function verifyNoWebGl() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function getContext(type, ...rest) { return type === "webgl2" ? null : original.call(this, type, ...rest); };
    });
    await goto(page, "");
    await page.waitForFunction(() => document.querySelector(".milim-qa-stage")?.dataset.player === "fallback", undefined, { timeout: 20_000 });
  } finally { await context.close(); }
}

async function goto(page, query) {
  await page.goto(new URL(`/milim/qa${query ? `?${query}` : ""}`, baseUrl).href, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForFunction(() => window.__MILIM_QA__ !== undefined, undefined, { timeout: 10_000 });
}

function loadPlaywright(configuredPath) {
  for (const candidate of [configuredPath, "playwright"].filter(Boolean)) {
    try { const loaded = require(candidate); if (loaded?.chromium) return loaded; } catch {}
  }
  throw new Error("Playwright was not found. Set PW_PATH or install the CI-only package.");
}

function readArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]; const value = argv[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--")) throw new Error(`Invalid argument: ${key ?? "<missing>"}`);
    values[key.slice(2)] = value; index += 1;
  }
  return values;
}
