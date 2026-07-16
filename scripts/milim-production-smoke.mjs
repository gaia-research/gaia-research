#!/usr/bin/env node
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const args = readArgs(process.argv.slice(2));
const baseURL = new URL(args["base-url"] ?? "http://127.0.0.1:3000").href;
const playwright = loadPlaywright(args["pw-path"] ?? process.env.PW_PATH);
const timeout = 20_000;
const expressions = ["neutral", "joyful-winker", "demon-lord-smirk", "starry-awe", "chaos-gremlin"];
const scenes = ["cyber-slime-lab-v1", "slime-reactor-halo-v1", "dragon-signal-observatory-v1"];
const motions = ["idle", "greet", "point"];

const browser = await playwright.chromium.launch({ headless: true });
try {
  await verifyHomepage(browser);
  await verifyQaMatrix(browser);
  await verifyFallbacks(browser);
  await verifyNoWebGLFallback(browser);
  await verifyPetHandoff(browser);
  console.log(JSON.stringify({ ok: true, baseURL, checks: ["homepage-fixed-scene", "qa-matrix", "fallbacks", "no-webgl", "pet-handoff"] }));
} finally {
  await browser.close();
}

async function verifyHomepage(browser) {
  const page = await newPage(browser);
  try {
    await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout });
    await page.locator(".milim-hero .live-stage").waitFor({ state: "attached", timeout });
    await page.waitForFunction(() => document.querySelector(".milim-hero .live-stage")?.dataset.player === "ready", undefined, { timeout });
    const forbidden = [".milim-scene-picker", ".status-rail", ".lab-plate", ".orbit", ".spark-field", ".sprite-reflection", ".milim-hero-bubble"];
    for (const selector of forbidden) {
      if (await page.locator(selector).count()) throw new Error(`Homepage still exposes ${selector}`);
    }
  } finally { await page.context().close(); }
}

async function verifyQaMatrix(browser) {
  const page = await newPage(browser);
  try {
    for (const scene of scenes) {
      for (const expression of expressions) {
        await gotoQa(page, `scene=${scene}&expression=${expression}`);
        await page.evaluate(({ scene, expression }) => window.__MILIM_QA__?.run({ scene, expression, motion: "idle" }), { scene, expression });
      }
    }
    for (const motion of motions) {
      await page.evaluate((motion) => window.__MILIM_QA__?.run({ motion }), motion);
    }
    const snapshot = await page.evaluate(() => window.__MILIM_QA__?.snapshot());
    if (!snapshot?.ready || snapshot.events.length < motions.length) throw new Error("Milim QA console did not expose executable semantic controls");
  } finally { await page.context().close(); }
}

async function verifyFallbacks(browser) {
  const page = await newPage(browser);
  try {
    for (const mode of ["fallback", "reduced-motion", "missing-release"]) {
      await gotoQa(page, `mode=${mode}`);
      await page.waitForFunction(() => document.querySelector(".milim-qa-stage")?.dataset.player === "fallback", undefined, { timeout });
    }
  } finally { await page.context().close(); }
}

async function verifyNoWebGLFallback(browser) {
  const page = await newPage(browser);
  try {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function getContext(type, ...rest) {
        if (type === "webgl2") return null;
        return original.call(this, type, ...rest);
      };
    });
    await gotoQa(page, "");
    await page.waitForFunction(() => document.querySelector(".milim-qa-stage")?.dataset.player === "fallback", undefined, { timeout });
  } finally { await page.context().close(); }
}

async function verifyPetHandoff(browser) {
  const page = await newPage(browser);
  try {
    await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout });
    await page.waitForFunction(() => document.querySelector(".milim-hero .live-stage")?.dataset.player === "ready", undefined, { timeout });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForFunction(() => document.querySelector(".gaia-web-pet")?.dataset.heroHidden === "false", undefined, { timeout });
  } finally { await page.context().close(); }
}

async function gotoQa(page, query) {
  await page.goto(new URL(`/milim/qa${query ? `?${query}` : ""}`, baseURL).href, { waitUntil: "domcontentloaded", timeout });
  await page.waitForFunction(() => window.__MILIM_QA__ !== undefined, undefined, { timeout });
  await page.waitForFunction(() => window.__MILIM_QA__?.snapshot().ready === true || document.querySelector(".milim-qa-stage")?.dataset.player === "fallback", undefined, { timeout });
}

async function newPage(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  return context.newPage();
}

function loadPlaywright(configuredPath) {
  for (const candidate of [configuredPath, "playwright"].filter(Boolean)) {
    try { const loaded = require(candidate); if (loaded?.chromium) return loaded; } catch {}
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
