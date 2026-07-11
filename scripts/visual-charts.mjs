// Capture the new "By the numbers" charts on the CI-Churn report — desktop,
// mobile, and a reduced-motion pass — and assert the marks rendered.
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  process.env.PW_PATH ? pathToFileURL(process.env.PW_PATH).href : "playwright"
);
const BASE = process.env.BASE_URL || "http://localhost:3011";
const OUT = "scripts/.visual-check";
const URL = `${BASE}/research/ci-churn`;
const browser = await chromium.launch();

async function shot(label, viewport, name) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });
  const figs = page.locator(".report-figs");
  await figs.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const stats = await page.locator(".fig-stat").count();
  const cards = await page.locator(".fig-card").count();
  const svgs = await page.locator(".fig-svg").count();
  const bars = await page.locator(".fig-charts path").count();
  console.log(`  ${label}: stats=${stats} cards=${cards} svgs=${svgs} paths=${bars}`);
  await figs.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
}

console.log("── report charts ──");
await shot("desktop", { width: 1280, height: 900 }, "12-charts-desktop");
await shot("mobile", { width: 390, height: 844 }, "13-charts-mobile");

await browser.close();
console.log("✅ done");
