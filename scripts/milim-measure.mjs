#!/usr/bin/env node
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const args = readArgs(process.argv.slice(2));
const baseURL = new URL(args["base-url"] ?? "http://127.0.0.1:3000").href;
const releaseVersion = args.release ?? JSON.parse(await readFile(new URL("../public/milim/current.json", import.meta.url), "utf8")).release;
const playwright = loadPlaywright(args["pw-path"] ?? process.env.PW_PATH);
const runs = Number(args.runs ?? 5);
const browser = await playwright.chromium.launch({ headless: true });

try {
  const startups = [];
  const transfers = [];
  const frames = [];
  const longTasks = [];
  let offscreen = null;
  for (let run = 0; run < runs; run += 1) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const start = performance.now();
    await page.goto(new URL("/milim/qa?scene=cyber-slime-lab-v2&expression=neutral&measure=1", baseURL).href, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__MILIM_QA__?.snapshot().ready === true, undefined, { timeout: 20_000 });
    startups.push(performance.now() - start);
    const telemetry = await page.evaluate(async () => {
      const longTasks = [];
      const observer = new PerformanceObserver((list) => longTasks.push(...list.getEntries().map((entry) => entry.duration)));
      observer.observe({ type: "longtask", buffered: true });
      const times = [];
      await new Promise((resolve) => {
        let previous = performance.now();
        let remaining = 120;
        const tick = (now) => {
          times.push(now - previous);
          previous = now;
          remaining -= 1;
          if (remaining === 0) resolve(undefined); else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      observer.disconnect();
      const transfer = performance.getEntriesByType("resource")
        .filter((entry) => entry.name.includes("/milim/releases/"))
        .reduce((total, entry) => total + (entry.transferSize ?? 0), 0);
      return { times, longTasks, transfer };
    });
    frames.push(...telemetry.times);
    longTasks.push(...telemetry.longTasks);
    transfers.push(telemetry.transfer);
    if (run === 0) {
      await page.evaluate(() => {
        const spacer = document.createElement("div");
        spacer.style.height = "1200px";
        spacer.setAttribute("data-milim-measure-spacer", "");
        document.body.append(spacer);
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForFunction(() => window.__MILIM_QA__?.snapshot().lifecycle?.running === false, undefined, { timeout: 5_000 });
      offscreen = await page.evaluate(() => window.__MILIM_QA__?.snapshot().lifecycle ?? null);
    }
    await context.close();
  }
  const cache = await verifyCacheHeaders(browser);
  const report = {
    ok: offscreen?.running === false && cache.every((entry) => entry.policyDeclared && (args["require-cache-headers"] !== "1" || entry.serverApplied)),
    baseURL,
    method: "Performance API + requestAnimationFrame; no gl.readPixels",
    startupMs: summarize(startups),
    transferBytes: summarize(transfers),
    frameIntervalMs: summarize(frames),
    longTaskMs: summarize(longTasks),
    offscreen,
    cache,
  };
  console.log(JSON.stringify(report));
  if (!report.ok) process.exitCode = 1;
} finally {
  await browser.close();
}

async function verifyCacheHeaders(browser) {
  const declared = await readFile(new URL("../public/_headers", import.meta.url), "utf8");
  const policyDeclared = /\/milim\/releases\/\*\s+Cache-Control: public, max-age=31536000, immutable/s.test(declared);
  const context = await browser.newContext();
  try {
    return await Promise.all([
      `/milim/releases/${releaseVersion}/release.json`,
      `/milim/releases/${releaseVersion}/player/index.js`,
    ].map(async (pathname) => {
      const response = await context.request.get(new URL(pathname, baseURL).href);
      const cacheControl = response.headers()["cache-control"] ?? "";
      return { pathname, status: response.status(), cacheControl, policyDeclared, serverApplied: response.ok() && /max-age=31536000/.test(cacheControl) && /immutable/.test(cacheControl) };
    }));
  } finally {
    await context.close();
  }
}

function summarize(values) {
  if (values.length === 0) return { count: 0, p50: 0, p95: 0 };
  const sorted = [...values].sort((left, right) => left - right);
  const percentile = (fraction) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
  return { count: sorted.length, p50: percentile(0.5), p95: percentile(0.95) };
}

function loadPlaywright(configuredPath) {
  for (const candidate of [configuredPath, "playwright"].filter(Boolean)) {
    try {
      const loaded = require(candidate);
      if (loaded?.chromium) return loaded;
    } catch {}
  }
  throw new Error("Playwright 1.61.1 was not found. Set PW_PATH or install the CI-only package.");
}

function readArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) throw new Error(`Unknown argument: ${key}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    result[key.slice(2)] = value;
    index += 1;
  }
  return result;
}
