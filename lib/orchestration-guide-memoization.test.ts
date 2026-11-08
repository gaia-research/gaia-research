import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeGuideFigures from "./rehype-guide-figures";
import rehypeTableLabels from "./rehype-table-labels";
import { createMarkdownMemoizer } from "./orchestration-guide-memoizer";

describe("Orchestration Guide memoization and runtime mitigation (Issue #327)", () => {
  const pagePath = path.resolve(__dirname, "../app/research/orchestration-guide/page.tsx");
  const guidePath = path.resolve(__dirname, "../content/reports/orchestration-guide/guide.md");

  it("verifies createMarkdownMemoizer compiles exactly once and supports cache invalidation", () => {
    const mockCompiler = vi.fn(() => ({ type: "rendered-tree", id: Math.random() }));
    const memoizer = createMarkdownMemoizer(mockCompiler);

    expect(memoizer.getCompileCount()).toBe(0);
    expect(mockCompiler).not.toHaveBeenCalled();

    // First call: compiles
    const firstResult = memoizer.get();
    expect(memoizer.getCompileCount()).toBe(1);
    expect(mockCompiler).toHaveBeenCalledTimes(1);

    // Repeated calls: return identical instance without re-compiling
    for (let i = 0; i < 10; i++) {
      const repeatedResult = memoizer.get();
      expect(repeatedResult).toBe(firstResult);
    }
    expect(memoizer.getCompileCount()).toBe(1);
    expect(mockCompiler).toHaveBeenCalledTimes(1);

    // Reset clears cache, next call re-compiles
    memoizer.reset();
    const refreshedResult = memoizer.get();
    expect(memoizer.getCompileCount()).toBe(2);
    expect(mockCompiler).toHaveBeenCalledTimes(2);
    expect(refreshedResult).not.toBe(firstResult);
  });

  it("verifies real full-pipeline Markdown+KaTeX compilation preserves AST parity and figures", async () => {
    const rawGuide = fs.readFileSync(guidePath, "utf8");
    const guideBody = rawGuide.split("\n").slice(2).join("\n").trim();

    const compilePipeline = () => {
      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath, { singleDollarTextMath: false })
        .use(remarkRehype)
        .use(rehypeGuideFigures)
        .use(rehypeKatex)
        .use(rehypeTableLabels);
      const hast = processor.runSync(processor.parse(guideBody));
      return JSON.stringify(hast);
    };

    const memoizer = createMarkdownMemoizer(compilePipeline);

    // First compile
    const output1 = memoizer.get();
    expect(memoizer.getCompileCount()).toBe(1);

    // Repeated calls
    const output2 = memoizer.get();
    expect(memoizer.getCompileCount()).toBe(1);
    expect(output1).toBe(output2);

    // Output parity and figure assertions
    expect(output1).toContain('"data-figure":"cost-equation"');
    expect(output1).toContain('"data-figure":"ttl-compare"');
    expect(output1).toContain('"data-figure":"ttl-cases"');
    expect(output1).toContain("katex-display");
    expect(output1.length).toBeGreaterThan(50000);
  });

  it("verifies page.tsx integrates createMarkdownMemoizer to guard against isolate re-parsing", () => {
    const pageSource = fs.readFileSync(pagePath, "utf8");

    expect(pageSource).toContain("import { createMarkdownMemoizer } from \"@/lib/orchestration-guide-memoizer\";");
    expect(pageSource).toContain("const guideContentMemoizer = createMarkdownMemoizer<ReactNode>");
    expect(pageSource).toContain("function getOrchestrationGuideContent(): ReactNode");
    expect(pageSource).toContain("{getOrchestrationGuideContent()}");
  });
});
