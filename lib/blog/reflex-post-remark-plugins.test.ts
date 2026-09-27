import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { reflexPostRemarkPlugins } from "./reflex-post-remark-plugins";

function walk(node: any, visit: (node: any) => void) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

describe("reflex post Markdown math handling", () => {
  it("keeps currency links as prose and still recognizes display math", () => {
    const markdown =
      "[$40 million seed round](https://example.com) and **$0.042 per million input tokens**.\n\n$$\nx^2\n$$";
    const tree = unified()
      .use(remarkParse)
      .use(reflexPostRemarkPlugins)
      .parse(markdown);
    const nodes: any[] = [];
    walk(tree, (node) => nodes.push(node));

    expect(nodes.some((node) => node.type === "link" && node.children.some((child: any) => child.value === "$40 million seed round"))).toBe(true);
    expect(nodes.some((node) => node.type === "math" && node.value === "x^2")).toBe(true);
    expect(nodes.some((node) => node.type === "inlineMath")).toBe(false);
  });
});
