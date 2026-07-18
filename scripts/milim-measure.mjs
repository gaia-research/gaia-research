#!/usr/bin/env node
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import {
  describeInactiveFrames,
  installMilimFrameProbe,
  installMilimLongTaskProbe,
  summarize,
} from "./milim-measure-core.mjs";

const require = createRequire(import.meta.url);
const args = readArgs(process.argv.slice(2));
if ("require-cache-headers" in args) {
  throw new Error("Local measurement cannot prove edge cache headers. Run milim-cache-headers.mjs --edge-url https://… instead.");
}
const baseURL = new URL(args["base-url"] ?? "http://127.0.0.1:3000").href;
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
    await page.addInitScript(installMilimFrameProbe);
    await page.addInitScript(installMilimLongTaskProbe);
    const start = performance.now();
    await page.goto(new URL("/milim/qa?scene=cyber-slime-lab-v2&expression=neutral&measure=1", baseURL).href, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__MILIM_QA__?.snapshot().ready === true, undefined, { timeout: 20_000 });
    startups.push(performance.now() - start);
    await page.waitForFunction(() => window.__MILIM_FRAME_PROBE__?.intervals.length >= 120, undefined, { timeout: 10_000 });
    const telemetry = await page.evaluate(() => {
      const transfer = performance.getEntriesByType("resource")
        .filter((entry) => entry.name.includes("/milim/releases/"))
        .reduce((total, entry) => total + (entry.transferSize ?? 0), 0);
      return {
        times: window.__MILIM_FRAME_PROBE__.intervals.slice(-120),
        longTasks: [...window.__MILIM_LONG_TASKS__],
        transfer,
      };
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
      await page.waitForTimeout(100);
      const before = await page.evaluate(() => ({ ...window.__MILIM_FRAME_PROBE__ }));
      const observationMs = 500;
      await page.waitForTimeout(observationMs);
      const after = await page.evaluate(() => ({ ...window.__MILIM_FRAME_PROBE__ }));
      offscreen = {
        lifecycle: await page.evaluate(() => window.__MILIM_QA__?.snapshot().lifecycle ?? null),
        ...describeInactiveFrames(before, after, observationMs),
      };
    }
    await context.close();
  }
  const cachePolicy = await verifyDeclaredCachePolicy();
  const report = {
    ok: offscreen?.lifecycle?.running === false && offscreen?.inactive === true && cachePolicy.ok,
    baseURL,
    method: "Performance API + Milim-owned requestAnimationFrame instrumentation; no gl.readPixels",
    startupMs: summarize(startups),
    transferBytes: summarize(transfers),
    frameIntervalMs: summarize(frames),
    longTaskMs: summarize(longTasks),
    offscreen,
    cachePolicy,
  };
  console.log(JSON.stringify(report));
  if (!report.ok) process.exitCode = 1;
} finally {
  await browser.close();
}

async function verifyDeclaredCachePolicy() {
  const declared = await readFile(new URL("../public/_headers", import.meta.url), "utf8");
  const immutable = /\/milim\/releases\/\*\s+Cache-Control: public, max-age=31536000, immutable/s.test(declared);
  const revalidate = /\/milim\/current\.json\s+Cache-Control: public, max-age=0, must-revalidate/s.test(declared);
  return {
    ok: immutable && revalidate,
    proof: "repository-policy-only",
    edgeVerified: false,
    note: "Run scripts/milim-cache-headers.mjs against the deployed HTTPS edge URL for enforcement proof.",
    immutable,
    revalidate,
  };
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
