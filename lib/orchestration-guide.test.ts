import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..");
const guidePath = path.join(repoRoot, "content/reports/orchestration-guide/guide.md");
const quickNavPath = path.join(repoRoot, "components/GuideQuickNav.tsx");
const copyPagePath = path.join(repoRoot, "components/CopyPage.tsx");

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

describe("Orchestration Guide content and copyable prompt contracts", () => {
  const guideMd = fs.readFileSync(guidePath, "utf8");
  const quickNavSource = fs.readFileSync(quickNavPath, "utf8");
  const copyPageSource = fs.readFileSync(copyPagePath, "utf8");

  it("resolves every internal Markdown anchor and GuideQuickNav jump link to a heading in guide.md", () => {
    const headingIds = new Set<string>();
    for (const line of guideMd.split("\n").slice(2)) {
      const match = line.match(/^#{2,3}\s+(.+)$/);
      if (match) {
        const plain = match[1].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`_]/g, "");
        headingIds.add(slugifyHeading(plain));
      }
    }

    const mdAnchors = [...guideMd.matchAll(/\]\(#([^)]+)\)/g)].map((m) => m[1]);
    const navAnchors = [...quickNavSource.matchAll(/href:\s*"#([^"]+)"/g)].map((m) => m[1]);

    expect(mdAnchors.length).toBeGreaterThan(0);
    expect(navAnchors.length).toBeGreaterThan(0);
    expect(mdAnchors.filter((id) => !headingIds.has(id))).toEqual([]);
    expect(navAnchors.filter((id) => !headingIds.has(id))).toEqual([]);
  });

  it("covers the A-E coordination decision ladder, economic framing, and cross-references", () => {
    expect(guideMd).toContain("What is the least expensive coordination architecture that reliably completes the work?");
    expect(guideMd).toContain("A. No Orchestration");
    expect(guideMd).toContain("B. Lightweight Orchestration");
    expect(guideMd).toContain("C. Existing Workflow Infrastructure");
    expect(guideMd).toContain("D. Thin Economic Scheduling");
    expect(guideMd).toContain("E. Human-Controlled Execution");
    expect(guideMd).toContain("C_{\\text{verified}}");
    expect(guideMd).toContain("https://github.com/gaia-research/gaia-research/issues/242");
    expect(guideMd).toContain("https://github.com/gaia-research/gaia-research/issues/304");
    expect(guideMd).toContain("https://github.com/gaia-research/gaia-research/issues/306");
    expect(guideMd).toContain("https://github.com/gaia-research/gaia-research/issues/308");
    expect(guideMd).toContain("https://github.com/gaia-research/gaia-skill-tree/issues/2158");
    expect(guideMd).toContain("exploratory RFC and Pi-first pilot");
  });

  it("enforces consent-first, repo-aware, model-preserving rules in both Claude Code and Pi copyable prompts", () => {
    const claudeMatch = copyPageSource.match(/export const DEFAULT_CLAUDE_PROMPT = `([\s\S]*?)`;/);
    const piMatch = copyPageSource.match(/export const DEFAULT_PI_PROMPT = `([\s\S]*?)`;/);
    expect(claudeMatch).not.toBeNull();
    expect(piMatch).not.toBeNull();

    for (const prompt of [claudeMatch![1], piMatch![1]]) {
      expect(prompt).toContain("NOT authorization to modify files");
      expect(prompt).toContain("Level A (No orchestration — default)");
      expect(prompt).toContain("Level B (Lightweight orchestration)");
      expect(prompt).toContain("Level C (Existing workflow infrastructure)");
      expect(prompt).toContain("Level D (Thin economic scheduler adapter)");
      expect(prompt).toContain("Level E (Human-controlled execution)");
      expect(prompt).toContain("recommend doing nothing");
      expect(prompt).toContain("Never hardcode models");
      expect(prompt).toContain("<task-id>.json");
      expect(prompt).toContain("15,000–20,000 tokens");
      expect(prompt).not.toContain("PI_CACHE_RETENTION");
    }
  });
});
