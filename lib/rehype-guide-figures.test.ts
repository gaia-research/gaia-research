import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import fs from "node:fs";
import path from "node:path";
import rehypeGuideFigures from "./rehype-guide-figures";

const guide = fs.readFileSync(path.join(__dirname, "../content/reports/orchestration-guide/guide.md"), "utf8");

async function render(md: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath, { singleDollarTextMath: false })
    .use(remarkRehype)
    .use(rehypeGuideFigures)
    .use(rehypeKatex);
  const tree = await processor.run(processor.parse(md));
  // JSON of the hast tree is enough to assert on markers and classes.
  return JSON.stringify(tree);
}

describe("rehype-guide-figures on the real guide", () => {
  it("marks every figure exactly once", async () => {
    const html = await render(guide);
    expect(html.match(/"data-figure":"cost-equation"/g)?.length).toBe(1);
    expect(html.match(/"data-figure":"ttl-compare"/g)?.length).toBe(1);
    expect(html.match(/"data-figure":"ttl-cases"/g)?.length).toBe(1);
    for (const lever of ["execution", "orchestration", "verification", "quota"]) {
      expect(html).toContain(`"data-lever":"${lever}"`);
    }
  });

  it("renders paragraph-only $$ math in display mode and re-sets the objective as aligned rows", async () => {
    const html = await render(guide);
    expect(html).toContain('"math-display-block"');
    expect(html).toContain("katex-display");
    // the objective's annotation keeps the re-set source: aligned rows with s.t.
    expect(html).toMatch(/begin\{aligned\}[^"]*text\{s\.t\.\}/);
  });

  it("leaves inline maths inside sentences inline", async () => {
    const html = await render("Let $$P_{\\text{in}}$$ be the base input price.");
    expect(html).not.toContain("katex-display");
    expect(html).toContain('"tagName":"p"');
  });
});
