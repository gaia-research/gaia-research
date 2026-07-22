import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

afterEach(() => vi.restoreAllMocks());

describe("/api/context-diet/github", () => {
  it("rejects arbitrary fetch targets before calling fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const response = await GET(new Request("https://research.gaiaskilltree.com/api/context-diet/github?url=https%3A%2F%2Fexample.com%2Fsecret"));
    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("discovers only bounded agent-context files", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ private: false, default_branch: "main" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ tree: [
        { type: "blob", path: "CLAUDE.md", size: 9000 },
        { type: "blob", path: "README.md", size: 1000 },
        { type: "blob", path: "nested/AGENTS.md", size: 210000 },
      ] }), { status: 200 }));
    const response = await GET(new Request("https://research.gaiaskilltree.com/api/context-diet/github?url=https%3A%2F%2Fgithub.com%2Forg%2Frepo"));
    expect(response.status).toBe(200);
    expect((await response.json()).files).toEqual([{ name: "CLAUDE.md", size: 9000, url: "https://github.com/org/repo/blob/main/CLAUDE.md" }]);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("rejects oversized GitHub API responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response("x".repeat(128_001), { status: 200 }));
    const response = await GET(new Request("https://research.gaiaskilltree.com/api/context-diet/github?url=https%3A%2F%2Fgithub.com%2Forg%2Frepo"));
    expect(response.status).toBe(413);
  });
});
