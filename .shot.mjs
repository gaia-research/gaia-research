import { chromium } from "playwright";

const URL = "http://localhost:3002/labs/context-diet";
const OUT = ".shots";
import { mkdirSync } from "fs";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  channel: "chrome",
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, bypassCSP: true });
await ctx.route("**/*", (route) => route.continue());
const page = await ctx.newPage();
await page.goto(URL + "?cb=" + Date.now(), { waitUntil: "networkidle" });
await page.waitForTimeout(600);

// 1. Full page, initial state
await page.screenshot({ path: `${OUT}/01-full-initial.png`, fullPage: true });

// 2. Just the analyzer section, initial
const analyzer = await page.$("#analyzer");
if (analyzer) await analyzer.screenshot({ path: `${OUT}/02-analyzer-initial.png` });

// 3. Paste sample text + click Analyze
const sample = `# CLAUDE.md\n\n## Workflow Discipline\nAlways confirm the branch before building.\n\n## Git Workflow\nCommit or push only when asked.\n\n## Testing\nRun the suite before shipping.\n\n## Versioning\nSemver. Bump on every release.\n`.repeat(6);
await page.fill("textarea.cd-input", sample);
await page.click("button.button.primary");
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/03-full-analyzed.png`, fullPage: true });

// 4. The analyzer console + reduction band region after analyze
const console_ = await page.$(".analyzer-console");
if (console_) await console_.screenshot({ path: `${OUT}/04-console.png` });
const band = await page.$(".reduction-band");
if (band) await band.screenshot({ path: `${OUT}/05-band.png` });

// 5. Open the disclosures
for (const s of await page.$$("details.cd-disclosure > summary")) {
  await s.click().catch(() => {});
}
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/06-full-expanded.png`, fullPage: true });

// 6. Evidence section
const sec = await page.evaluateHandle(() => document.querySelector("#evidence-title")?.closest("section"));
const secEl = sec.asElement();
if (secEl) {
  await secEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800); // let bar-width transitions settle
  await secEl.screenshot({ path: `${OUT}/07-evidence.png` });
}

// 7. Mobile
const m = await ctx.newPage();
await m.setViewportSize({ width: 390, height: 844 });
await m.goto(URL, { waitUntil: "networkidle" });
await m.waitForTimeout(500);
await m.screenshot({ path: `${OUT}/08-mobile-initial.png`, fullPage: true });

await browser.close();
console.log("done");
