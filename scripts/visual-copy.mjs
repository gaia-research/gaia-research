// Verify the CopyCommand affordance on both surfaces: click → clipboard has
// the command → button shows "Copied ✓".
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  process.env.PW_PATH ? pathToFileURL(process.env.PW_PATH).href : "playwright"
);
const BASE = process.env.BASE_URL || "http://localhost:3011";
const OUT = "scripts/.visual-check";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();

async function testCopy(url, label, expectSubstr, shotName) {
  await page.goto(`${BASE}${url}`, { waitUntil: "load" });
  const btn = page.locator(".copy-command-btn").first();
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await btn.click();
  await page.waitForTimeout(250);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  const state = await page.locator(".copy-command").first().getAttribute("data-copied");
  const label2 = await btn.innerText();
  const ok = clip === expectSubstr && state === "true";
  console.log(`  ${ok ? "✓" : "✗"} ${label}: clipboard="${clip}" copied=${state} btn="${label2.trim()}"`);
  await page.locator(".copy-command").first().screenshot({ path: `${OUT}/${shotName}.png` });
}

console.log("── copy-command ──");
await testCopy("/", "home skills card", "gaia install gaia-research/skill-context-diet", "10-copy-home");
await testCopy("/research/ci-churn", "report footer", "gaia install gaia-research/skill-ci-churn", "11-copy-report");

await browser.close();
console.log("✅ done");
