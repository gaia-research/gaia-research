// One-off visual verification of the home reshape + ci-churn report page.
// Not wired into any build — run manually against a dev server:
//   npx next dev -p 3010  (in another shell)
//   node scripts/visual-check.mjs
// Playwright isn't a project dependency — pass its module path via PW_PATH.
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  process.env.PW_PATH ? pathToFileURL(process.env.PW_PATH).href : "playwright"
);

const BASE = process.env.BASE_URL || "http://localhost:3010";
const OUT = "scripts/.visual-check";
mkdirSync(OUT, { recursive: true });

const shots = [];
const shot = async (page, name) => {
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  shots.push(file);
  console.log("  📸", file);
};

const browser = await chromium.launch();

async function ctx(opts, label, fn) {
  console.log(`\n── ${label} ──`);
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await fn(page);
  if (errors.length) console.log("  ⚠ console errors:", errors);
  else console.log("  ✓ no console errors");
  await context.close();
}

// 1. Desktop home — full page (skills + ledger + directives)
await ctx({ viewport: { width: 1280, height: 900 } }, "desktop home (1280)", async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await shot(page, "01-home-desktop");

  // Assert the skills section rendered 3 cards
  const cards = await page.locator(".skill-card").count();
  const installs = await page.locator(".skill-install").allInnerTexts();
  const names = await page.locator(".skill-card h3").allInnerTexts();
  console.log(`  skill cards: ${cards}`);
  console.log(`  names: ${JSON.stringify(names)}`);
  console.log(`  installs:`, installs.map((t) => t.trim()));

  // Ledger rows
  const rows = await page.locator("#ledger tbody tr").count();
  console.log(`  ledger rows: ${rows}`);

  // Milim fallback: sprite should be shown, canvas hidden or absent-frame
  const spriteState = await page.locator(".milim-sprite").getAttribute("data-live").catch(() => "no-sprite");
  const canvasState = await page.locator(".milim-live-canvas").getAttribute("data-live").catch(() => "no-canvas");
  console.log(`  milim sprite data-live=${spriteState}  canvas data-live=${canvasState}`);
});

// 2. Skills section close-up (scroll into view)
await ctx({ viewport: { width: 1280, height: 900 } }, "skills section", async (page) => {
  await page.goto(`${BASE}/#skills`, { waitUntil: "load" });
  await page.locator("#skills").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.locator("#skills").screenshot({ path: `${OUT}/02-skills-section.png` });
  shots.push(`${OUT}/02-skills-section.png`);
  console.log("  📸", `${OUT}/02-skills-section.png`);
});

// 3. Tablet (1200) and mobile (700) responsive
await ctx({ viewport: { width: 1200, height: 900 } }, "tablet (1200)", async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await shot(page, "03-home-1200");
});
await ctx({ viewport: { width: 700, height: 900 } }, "mobile (700)", async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await shot(page, "04-home-700");
});

// 4. Reduced motion — sprite must stay visible, canvas hidden
await ctx({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" }, "reduced-motion", async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  const spriteState = await page.locator(".milim-sprite").getAttribute("data-live").catch(() => "no-sprite");
  const canvasVisible = await page.locator(".milim-live-canvas").isVisible().catch(() => false);
  console.log(`  reduced-motion: sprite data-live=${spriteState}  canvas visible=${canvasVisible}`);
  await page.locator(".hero").screenshot({ path: `${OUT}/05-reduced-motion-hero.png` });
  shots.push(`${OUT}/05-reduced-motion-hero.png`);
  console.log("  📸", `${OUT}/05-reduced-motion-hero.png`);
});

// 5. CI-churn report page
await ctx({ viewport: { width: 1280, height: 900 } }, "ci-churn report", async (page) => {
  const resp = await page.goto(`${BASE}/research/ci-churn`, { waitUntil: "load" });
  console.log(`  HTTP ${resp.status()}`);
  await page.waitForTimeout(500);
  await shot(page, "06-ci-churn");
  const h1 = await page.locator("h1").first().innerText();
  const h2 = await page.locator(".report-body h2").count();
  const pre = await page.locator(".report-body pre").count();
  const links = await page.locator(".report-links a").allInnerTexts();
  console.log(`  h1: ${JSON.stringify(h1)}`);
  console.log(`  report h2 sections: ${h2}  code blocks: ${pre}`);
  console.log(`  report links: ${JSON.stringify(links)}`);
});

await browser.close();
console.log(`\n✅ done — ${shots.length} screenshots in ${OUT}/`);
