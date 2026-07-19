#!/usr/bin/env node
import { resolvePlaywright } from "./resolve-playwright.mjs";

const args = readArgs(process.argv.slice(2));
const baseUrl = new URL(args["base-url"] ?? "http://127.0.0.1:3010").href;
const playwright = resolvePlaywright(args["pw-path"] ?? process.env.PW_PATH);
const browser = await playwright.chromium.launch({ headless: true });

try {
  await verifyExplicitFallbacks();
  await verifyLiveAndLifecycle();
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
    await requireLiveTracer(page);
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
    for (const mode of ["fallback", "reduced-motion"]) {
      await goto(page, `mode=${mode}`);
      await page.waitForFunction(() => document.querySelector(".milim-qa-stage")?.dataset.player === "fallback", undefined, { timeout: 5_000 });
    }

    const missingRequests = [];
    page.on("request", (request) => {
      if (request.url().includes("/milim/releases/missing/release.json")) missingRequests.push(request.url());
    });
    await goto(page, "mode=missing-release");
    await page.waitForFunction(() => document.querySelector(".milim-qa-stage")?.dataset.player === "fallback", undefined, { timeout: 5_000 });
    if (missingRequests.length === 0) throw new Error("Missing-release QA did not request the missing manifest URL.");
    const statuses = await page.evaluate(() => window.__MILIM_QA__?.snapshot().statuses ?? []);
    if (!statuses.includes("error")) throw new Error(`Missing-release QA did not report loader error status: ${statuses.join(", ")}`);
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

async function requireLiveTracer(page) {
  await page.waitForFunction(() => {
    const state = document.querySelector(".milim-qa-stage")?.dataset.player;
    return state === "ready" || state === "fallback";
  }, undefined, { timeout: 20_000 });
  if (await page.locator(".milim-qa-stage").getAttribute("data-player") !== "ready") {
    throw new Error("Pinned compatibility-2 tracer is unavailable or rejected; promote a fresh release before Phase 2 browser acceptance.");
  }
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
