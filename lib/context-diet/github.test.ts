import { describe, expect, it } from "vitest";
import { isAgentContextPath, parsePublicGitHubUrl, readBoundedResponse } from "./github";

describe("GitHub context URL safety", () => {
  it("accepts public repository and recognized file URLs", () => {
    expect(parsePublicGitHubUrl("https://github.com/gaia-research/skill-context-diet")).toEqual({ owner: "gaia-research", repo: "skill-context-diet" });
    expect(parsePublicGitHubUrl("https://github.com/org/repo/blob/main/.github/copilot-instructions.md")).toEqual({ owner: "org", repo: "repo", ref: "main", path: ".github/copilot-instructions.md" });
    expect(isAgentContextPath("packages/a/AGENTS.md")).toBe(true);
    expect(isAgentContextPath(".cursor/rules/frontend.mdc")).toBe(true);
  });

  it("rejects non-GitHub, credentials, and unrelated files", () => {
    expect(() => parsePublicGitHubUrl("https://example.com/org/repo")).toThrow(/Only public/);
    expect(() => parsePublicGitHubUrl("https://user:pass@github.com/org/repo")).toThrow(/Only public/);
    expect(() => parsePublicGitHubUrl("https://github.com/org/repo/blob/main/README.md")).toThrow(/recognized/);
  });

  it("stops reading a streamed response beyond the byte cap", async () => {
    const response = new Response("123456");
    await expect(readBoundedResponse(response, 5)).rejects.toThrow(/too large/);
  });
});
