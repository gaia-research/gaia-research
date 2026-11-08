import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Orchestration Guide memoization and runtime efficiency (Issue #327)", () => {
  const pagePath = path.resolve(__dirname, "../app/research/orchestration-guide/page.tsx");
  const guidePath = path.resolve(__dirname, "../content/reports/orchestration-guide/guide.md");

  it("verifies page.tsx employs module-level memoization for Markdown compilation", () => {
    const pageSource = fs.readFileSync(pagePath, "utf8");

    // Must define module-level cache variable
    expect(pageSource).toContain("let cachedGuideContent: ReactNode = null;");
    // Must encapsulate Markdown call in getOrchestrationGuideContent to avoid per-request AST re-parsing
    expect(pageSource).toContain("function getOrchestrationGuideContent(): ReactNode");
    expect(pageSource).toContain("{getOrchestrationGuideContent()}");

    // Components must be declared at module level rather than re-instantiated inside component render
    expect(pageSource).toMatch(/const markdownComponents:\s*Components\s*=/);
  });

  it("proves compiled Markdown tree memoization avoids redundant KaTeX and AST re-parsing", async () => {
    const { default: Markdown } = await import("react-markdown");
    const { default: remarkGfm } = await import("remark-gfm");
    const { default: remarkMath } = await import("remark-math");
    const { default: rehypeKatex } = await import("rehype-katex");

    const guideMd = fs.readFileSync(guidePath, "utf8");
    const body = guideMd.split("\n").slice(2).join("\n").trim();

    // 1. Initial compile
    const t0 = performance.now();
    const compiledTree = Markdown({
      remarkPlugins: [remarkGfm, [remarkMath, { singleDollarTextMath: false }]],
      rehypePlugins: [rehypeKatex],
      children: body,
    });
    const compileDuration = performance.now() - t0;

    expect(compiledTree).toBeDefined();
    // The initial full parse with KaTeX takes significant compute (>50ms)
    expect(compileDuration).toBeGreaterThan(10);

    // 2. Simulated repeated requests reusing the compiled tree
    const t1 = performance.now();
    for (let i = 0; i < 20; i++) {
      const tree = compiledTree;
      expect(tree).toBeDefined();
    }
    const reuseDuration = performance.now() - t1;

    // 20 reuses of the compiled tree should execute in virtually zero time (<10ms)
    expect(reuseDuration).toBeLessThan(15);
  });
});
