// Focused capture of the redesigned RegistryHandoff ("take root") section.
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  process.env.PW_PATH ? pathToFileURL(process.env.PW_PATH).href : "playwright"
);

const BASE = process.env.BASE_URL || "http://localhost:3011";
const OUT = "scripts/.visual-check";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

async function grab(label, opts, name, scrollFrac) {
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  // Drive the scroll timeline: land the section mid-viewport so branches draw in.
  const box = await page.locator("#skill-tree").boundingBox();
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), box.y - 120);
  await page.waitForTimeout(900);
  await page.locator("#skill-tree").screenshot({ path: `${OUT}/${name}.png` });
  console.log(`  📸 ${name}  (${label})`);
  // sanity: count rendered branch/node elements
  const b = await page.locator(".tree-branches path").count();
  const n = await page.locator(".tree-nodes circle").count();
  console.log(`     branches=${b} nodes=${n}`);
  await context.close();
}

console.log("── take-root section ──");
await grab("desktop, scrolled in", { viewport: { width: 1280, height: 860 } }, "07-takeroot-desktop");
await grab("reduced-motion (static)", { viewport: { width: 1280, height: 860 }, reducedMotion: "reduce" }, "08-takeroot-reduced");
await grab("mobile 700", { viewport: { width: 700, height: 900 } }, "09-takeroot-700");

await browser.close();
console.log("✅ done");
