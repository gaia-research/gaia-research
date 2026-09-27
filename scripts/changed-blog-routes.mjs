#!/usr/bin/env node
// Convert changed paths to active blog page routes, deduplicated for PAGES.
// Draft-only content and routes deleted by this change are not public routes.
// Example: git diff --name-only BASE...HEAD | node scripts/changed-blog-routes.mjs
import { existsSync } from "node:fs";
import { join } from "node:path";

let input = "";
for await (const chunk of process.stdin) input += chunk;

const routes = new Set();
for (const file of input.split(/\r?\n/)) {
  const match = file.trim().match(/^(?:app|content)\/blog\/([^/]+)\//);
  if (!match) continue;
  const page = join("app", "blog", match[1], "page.tsx");
  if (existsSync(page)) routes.add(`/blog/${match[1]}`);
}
process.stdout.write([...routes].sort().join(","));
