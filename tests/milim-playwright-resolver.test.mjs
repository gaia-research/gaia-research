import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { findCachedPlaywrightPaths } from "../scripts/resolve-playwright.mjs";

test("cached Playwright discovery returns the newest npx install first", async () => {
  const homeDirectory = await mkdtemp(join(tmpdir(), "milim-playwright-"));
  const older = join(homeDirectory, ".npm", "_npx", "older", "node_modules", "playwright", "index.js");
  const newer = join(homeDirectory, ".npm", "_npx", "newer", "node_modules", "playwright", "index.js");

  try {
    await mkdir(join(older, ".."), { recursive: true });
    await mkdir(join(newer, ".."), { recursive: true });
    await writeFile(older, "module.exports = {};");
    await writeFile(newer, "module.exports = {};");
    await utimes(older, new Date(1_000), new Date(1_000));
    await utimes(newer, new Date(2_000), new Date(2_000));

    assert.deepEqual(findCachedPlaywrightPaths({ homeDirectory }), [newer, older]);
  } finally {
    await rm(homeDirectory, { recursive: true, force: true });
  }
});
