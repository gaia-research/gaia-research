import { existsSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);

/** Match visual-audit's Windows and Unix npx-cache discovery, newest first. */
export function findCachedPlaywrightPaths({ homeDirectory = homedir() } = {}) {
  const roots = [
    join(homeDirectory, "AppData", "Local", "npm-cache", "_npx"),
    join(homeDirectory, ".npm", "_npx"),
  ];
  return roots.flatMap((root) => {
    if (!existsSync(root)) return [];
    return readdirSync(root)
      .map((directory) => join(root, directory, "node_modules", "playwright", "index.js"))
      .filter((candidate) => existsSync(candidate));
  }).sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs);
}

export function resolvePlaywright(configuredPath) {
  const candidates = [configuredPath, "playwright", ...findCachedPlaywrightPaths()].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const loaded = require(candidate);
      if (loaded?.chromium) return loaded;
    } catch { /* try the next supported resolution surface */ }
  }
  throw new Error("Could not resolve Playwright from the explicit path, installed packages, or npx cache.");
}
