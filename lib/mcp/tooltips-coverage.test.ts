import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { TOOLTIPS, contextFromPathname } from "../../components/MilimPet/tooltips";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Recursively find all page.tsx files under app/ directory. */
function findPages(dir: string, baseDir: string = dir): string[] {
  const files = readdirSync(dir);
  let pages: string[] = [];

  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      pages = pages.concat(findPages(fullPath, baseDir));
    } else if (file === "page.tsx") {
      pages.push(fullPath);
    }
  }

  return pages;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Mascot Tooltip Page Coverage", () => {
  it("verifies every page route has a mapped tooltip context with active dialog lines", () => {
    // Resolve the absolute path to the app directory
    const appDir = join(__dirname, "../../app");
    const pageFiles = findPages(appDir);

    expect(pageFiles.length).toBeGreaterThan(0);

    for (const pageFile of pageFiles) {
      // Determine the route pathname from the file path relative to the app directory
      // e.g. "app/labs/context-diet/page.tsx" -> "/labs/context-diet"
      const relPath = relative(appDir, pageFile);
      const routeDir = relPath.slice(0, -9); // remove "/page.tsx" or "page.tsx"
      const pathname = routeDir === "" ? "/" : `/${routeDir}`;

      // Get mapped context
      const context = contextFromPathname(pathname);

      // Assert context has defined tooltips
      const pool = TOOLTIPS[context];
      expect(pool).toBeDefined();
      expect(Array.isArray(pool)).toBe(true);
      expect(pool.length).toBeGreaterThan(0);

      // Verify each tooltip line structure
      for (const tooltip of pool) {
        expect(typeof tooltip.text).toBe("string");
        expect(tooltip.text.length).toBeGreaterThan(0);

        if (tooltip.link) {
          expect(typeof tooltip.link.text).toBe("string");
          expect(tooltip.link.text.length).toBeGreaterThan(0);
          expect(typeof tooltip.link.href).toBe("string");
          expect(tooltip.link.href.length).toBeGreaterThan(0);

          // The link text must be a verbatim substring of the tooltip text
          expect(tooltip.text).toContain(tooltip.link.text);
        }
      }
    }
  });
});
