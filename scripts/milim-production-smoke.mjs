#!/usr/bin/env node
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const args = readArgs(process.argv.slice(2));
const baseURL = new URL(args["base-url"] ?? "http://127.0.0.1:3000").href;
const playwright = loadPlaywright(args["pw-path"] ?? process.env.PW_PATH);
const timeout = 20_000;

const scenes = [
  { number: 1, label: "Cyber-Slime Laboratory" },
  { number: 2, label: "Slime Reactor Halo" },
  { number: 3, label: "Dragon Signal Observatory" },
];

const browser = await playwright.chromium.launch({ headless: true });
try {
  await verifyLiveRelease(browser);
  await verifyReducedMotionFallback(browser);
  await verifyRuntimeReducedMotionChange(browser);
  await verifyNoWebGLFallback(browser);
  await verifyPetHandoff(browser);
  console.log(JSON.stringify({ ok: true, baseURL, checks: ["ready", "scenes", "reduced-motion", "runtime-reduced-motion", "no-webgl", "pet-handoff"] }));
} finally {
  await browser.close();
}

async function verifyLiveRelease(browser) {
  const page = await newPage(browser);
  try {
    await gotoHome(page);
    await waitForPlayer(page, "ready");
    for (const scene of scenes) await verifyScene(page, scene);
  } finally {
    await page.context().close();
  }
}

async function verifyReducedMotionFallback(browser) {
  const page = await newPage(browser, { reducedMotion: "reduce" });
  try {
    await gotoHome(page);
    await waitForPlayer(page, "fallback");
    await page.waitForFunction(() => !document.querySelector(".milim-scene-picker"), undefined, { timeout });
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".milim-live-canvas")).display === "none", undefined, { timeout });
  } finally {
    await page.context().close();
  }
}

async function verifyRuntimeReducedMotionChange(browser) {
  const page = await newPage(browser);
  try {
    await gotoHome(page);
    await waitForPlayer(page, "ready");
    await verifyScene(page, scenes[1]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitForPlayer(page, "fallback");
    await page.waitForFunction(() => !document.querySelector(".milim-scene-picker"), undefined, { timeout });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await waitForPlayer(page, "ready");
    await expectConfirmedScene(page, scenes[0]);
    await page.waitForFunction(() => document.querySelector(".milim-live-canvas")?.dataset.live === "shown", undefined, { timeout });
  } finally {
    await page.context().close();
  }
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
    await gotoHome(page);
    await waitForPlayer(page, "fallback");
    await page.waitForFunction(() => !document.querySelector(".milim-scene-picker"), undefined, { timeout });
  } finally {
    await page.context().close();
  }
}

async function verifyPetHandoff(browser) {
  const page = await newPage(browser);
  try {
    await gotoHome(page);
    await waitForPlayer(page, "ready");
    await page.evaluate(() => {
      const stage = document.querySelector(".live-stage");
      if (!stage) throw new Error("Milim hero stage is missing");
      const rect = stage.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + rect.bottom - rect.height * 0.29);
    });
    await page.waitForFunction(() => {
      const stage = document.querySelector(".live-stage");
      const pet = document.querySelector(".gaia-web-pet");
      return stage?.dataset.dormant === "true" && pet?.dataset.heroHidden === "false";
    }, undefined, { timeout });
  } finally {
    await page.context().close();
  }
}

async function verifyScene(page, { number, label }) {
  const selector = `.milim-scene-choice[aria-label^="Scene ${number}: ${label}"]`;
  await page.locator(selector).waitFor({ state: "visible", timeout });
  const selected = await page.locator(selector).getAttribute("aria-pressed");
  if (selected !== "true") {
    await page.locator(selector).click();
  }
  await expectConfirmedScene(page, { number, label });
}

async function expectConfirmedScene(page, { number, label }) {
  const selector = `.milim-scene-choice[aria-label^="Scene ${number}: ${label}"]`;
  await page.waitForFunction(
    ({ selector: selectedSelector }) => {
      const stage = document.querySelector(".live-stage");
      const control = document.querySelector(selectedSelector);
      return stage?.dataset.player === "ready"
        && document.querySelector(".milim-live-canvas")?.dataset.live === "shown"
        && control?.getAttribute("aria-pressed") === "true";
    },
    { selector },
    { timeout },
  );
}

async function gotoHome(page) {
  await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout });
  await page.locator(".live-stage").waitFor({ state: "attached", timeout });
}

async function waitForPlayer(page, state) {
  await page.waitForFunction(
    (expected) => document.querySelector(".live-stage")?.dataset.player === expected,
    state,
    { timeout },
  );
}

async function newPage(browser, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  return context.newPage();
}

function loadPlaywright(configuredPath) {
  for (const candidate of [configuredPath, "playwright"].filter(Boolean)) {
    try {
      const loaded = require(candidate);
      if (loaded?.chromium) return loaded;
    } catch {}
  }
  throw new Error("Playwright 1.61.1 was not found. Set PW_PATH to its package directory or install it in CI with npm install --no-save --no-package-lock playwright@1.61.1.");
}

function readArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) throw new Error(`Unknown argument: ${arg}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
    result[arg.slice(2)] = value;
    index += 1;
  }
  return result;
}
