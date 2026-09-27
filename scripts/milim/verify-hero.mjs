#!/usr/bin/env node
/*
 * Evidence capture for the hero Milim (Rive): responsive frames, expressions,
 * gestures, reduced motion, offscreen pause, console errors, network weight.
 *   BASE_URL=http://localhost:3010 node scripts/milim/verify-hero.mjs <outdir>
 */
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const PW = process.env.PLAYWRIGHT_DIR || path.join(os.homedir(), ".npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs");
const { chromium } = await import(PW);
const base = process.env.BASE_URL || "http://localhost:3010";
const out = path.resolve(process.argv[2] || "scripts/.milim-evidence"); fs.mkdirSync(out, { recursive: true });
const report = { base, when: new Date().toISOString(), viewports: {}, errors: [], checks: {} };
const browser = await chromium.launch({ args: ["--use-angle=metal"] });

async function open(vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: opts.dpr || 1, reducedMotion: opts.reducedMotion || "no-preference", hasTouch: !!opts.touch, isMobile: !!opts.touch });
  const page = await ctx.newPage();
  const errs = []; page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); }); page.on("pageerror", (e) => errs.push(e.message));
  const bytes = {}; page.on("response", async (r) => { const u = r.url(); if (/\.(riv|wasm)$|milim-.*\.webp|rive/.test(u)) { try { bytes[u.replace(base, "")] = (await r.body()).length; } catch {} } });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  return { ctx, page, errs, bytes };
}
const stage = (p) => p.locator(".live-stage");
const waitLive = (p) => p.waitForFunction(() => document.querySelector(".live-stage")?.dataset.live === "shown", null, { timeout: 20000 });

for (const [name, vp, touch] of [["desktop", { width: 1440, height: 900 }], ["tablet", { width: 834, height: 1112 }, true], ["mobile", { width: 390, height: 844 }, true]]) {
  const { ctx, page, errs, bytes } = await open(vp, { touch, dpr: 2 });
  let live = true; try { await waitLive(page); } catch { live = false; }
  await page.waitForTimeout(1200);
  await stage(page).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(out, `vp-${name}-page.png`) });
  await stage(page).screenshot({ path: path.join(out, `vp-${name}-stage.png`) });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  report.viewports[name] = { live, running: await stage(page).getAttribute("data-running"), horizontalOverflowPx: overflow, bytes };
  report.errors.push(...errs.map((e) => `${name}: ${e}`));
  await ctx.close();
}

// Expressions + gestures + gaze on desktop, driven through the poke/tooltip-free path.
{
  const { ctx, page } = await open({ width: 1280, height: 900 });
  await waitLive(page); await page.waitForTimeout(3500); // let the hello greet finish
  const box = await stage(page).boundingBox();
  const s = async (n) => stage(page).screenshot({ path: path.join(out, n + ".png") });
  await page.mouse.move(box.x - 300, box.y + 80); await page.waitForTimeout(900); await s("look-left");
  await page.mouse.move(box.x + box.width + 400, box.y + box.height); await page.waitForTimeout(900); await s("look-right-down");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.2); await page.waitForTimeout(900); await s("look-center");
  await page.locator(".milim-poke").click(); await page.waitForTimeout(250); await s("poke-surprised");
  await page.waitForTimeout(700); await s("poke-celebrate");
  await ctx.close();
}

// Reduced motion: runtime never loads, poster stands in.
{
  const { ctx, page, bytes } = await open({ width: 1280, height: 900 }, { reducedMotion: "reduce" });
  await page.waitForTimeout(2500);
  await stage(page).screenshot({ path: path.join(out, "reduced-motion.png") });
  report.checks.reducedMotion = { live: await stage(page).getAttribute("data-live"), runtimeRequested: Object.keys(bytes).some((u) => /\.(riv|wasm)$/.test(u)) };
  await ctx.close();
}

// Offscreen: scroll away -> paused; back -> running.
{
  const { ctx, page } = await open({ width: 1280, height: 900 });
  await waitLive(page); await page.waitForTimeout(800);
  const before = await stage(page).getAttribute("data-running");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(800);
  const away = await stage(page).getAttribute("data-running");
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
  const back = await stage(page).getAttribute("data-running");
  report.checks.offscreen = { before, away, back };
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
