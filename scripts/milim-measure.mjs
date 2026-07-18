#!/usr/bin/env node
import { createRequire } from "node:module";
import { FRAME_INTERVAL_BUDGET_MS, evaluateFrameBudget } from "./milim-measure-core.mjs";

const require = createRequire(import.meta.url);
const args = readArgs(process.argv.slice(2));
const baseUrl = new URL(args["base-url"] ?? "http://127.0.0.1:3010").href;
const sampleCount = Number(args["frame-samples"] ?? 90);
const playwright = loadPlaywright(args["pw-path"] ?? process.env.PW_PATH);
const browser = await playwright.chromium.launch({ headless: true });

try {
  const desktop = await measure("desktop", { width: 1280, height: 900 }, FRAME_INTERVAL_BUDGET_MS.desktop);
  const mobile = await measure("mobile", { width: 390, height: 844 }, FRAME_INTERVAL_BUDGET_MS.mobile);
  const report = { ok: desktop.ok && mobile.ok, baseUrl, sampleCount, desktop, mobile };
  console.log(JSON.stringify(report));
  if (!report.ok) process.exitCode = 1;
} finally {
  await browser.close();
}

async function measure(name, viewport, budgetMs) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  try {
    await page.goto(new URL("/milim/qa?expression=joyful-winker", baseUrl).href, { waitUntil: "networkidle", timeout: 20_000 });
    await page.waitForFunction(() => {
      const state = document.querySelector(".milim-qa-stage")?.dataset.player;
      return state === "ready" || state === "fallback";
    }, undefined, { timeout: 20_000 });
    if (await page.locator(".milim-qa-stage").getAttribute("data-player") !== "ready") {
      throw new Error("Pinned compatibility-2 tracer is unavailable or rejected; frame measurement cannot pass without a live release.");
    }
    const intervals = await page.evaluate(async (count) => new Promise((resolve) => {
      const result = [];
      let previous = performance.now();
      const tick = (now) => {
        result.push(now - previous);
        previous = now;
        if (result.length >= count) resolve(result.slice(1));
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), sampleCount);
    return { name, ...evaluateFrameBudget(intervals, budgetMs) };
  } catch (error) {
    return { name, count: 0, p50: null, p95: null, budgetMs, ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    await context.close();
  }
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
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--")) throw new Error(`Invalid argument: ${key ?? "<missing>"}`);
    values[key.slice(2)] = value;
    index += 1;
  }
  return values;
}
