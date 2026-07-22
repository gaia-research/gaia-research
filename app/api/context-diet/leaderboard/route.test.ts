import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLimit = vi.fn();
const mockOrder = vi.fn(() => ({ limit: mockLimit }));
const mockEq = vi.fn(() => ({ order: mockOrder }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({ select: mockSelect, insert: mockInsert }));
const mockClient = { from: mockFrom } as any;

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServiceClient: vi.fn(() => mockClient),
}));
vi.mock("@/lib/context-diet/github", () => ({
  fetchPublicGitHubContext: vi.fn(),
  parsePublicGitHubUrl: (input: string) => {
    const match = input.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
    if (!match) throw new Error("invalid GitHub evidence");
    return { owner: match[1], repo: match[2], ref: match[3], path: match[4] };
  },
}));

import { GET, POST } from "./route";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { fetchPublicGitHubContext } from "@/lib/context-diet/github";

const beforeUrl = "https://github.com/gaia-research/gaia-skill-tree/blob/1111111111111111111111111111111111111111/CLAUDE.md";
const afterUrl = "https://github.com/gaia-research/gaia-skill-tree/blob/2222222222222222222222222222222222222222/CLAUDE.md";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSupabaseServiceClient).mockReturnValue(mockClient);
  mockInsert.mockResolvedValue({ error: null });
  mockLimit.mockResolvedValue({ data: [], error: null });
  vi.mocked(fetchPublicGitHubContext)
    .mockResolvedValueOnce({ owner: "gaia-research", repo: "gaia-skill-tree", ref: "1", path: "CLAUDE.md", content: "a".repeat(1_000) })
    .mockResolvedValueOnce({ owner: "gaia-research", repo: "gaia-skill-tree", ref: "2", path: "CLAUDE.md", content: "a".repeat(400) });
});

describe("/api/context-diet/leaderboard", () => {
  it("derives ranked metrics from public before and after evidence", async () => {
    const request = new Request("https://research.gaiaskilltree.com/api/context-diet/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json", origin: "https://research.gaiaskilltree.com" },
      body: JSON.stringify({
        beforeUrl,
        afterUrl,
        handle: "nova!",
        text: "must never be stored",
        path: "/private/CLAUDE.md",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(mockInsert).toHaveBeenCalledOnce();
    const row = mockInsert.mock.calls[0][0];
    expect(row.payload).toEqual({
      kind: "context-diet",
      labId: "lab-001",
      tokensBefore: 250,
      tokensAfter: 100,
      reductionPct: 60,
      strategyKey: "verified-public-git",
      handle: "nova",
      verified: true,
      evidence: { beforeUrl, afterUrl },
    });
    expect(JSON.stringify(row)).not.toContain("private");
    expect(JSON.stringify(row)).not.toContain("must never");
  });

  it("rejects cross-origin browser submissions", async () => {
    const request = new Request("https://research.gaiaskilltree.com/api/context-diet/leaderboard", {
      method: "POST",
      headers: { origin: "https://example.com" },
      body: JSON.stringify({ beforeUrl, afterUrl }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("rejects invented client metrics without public evidence", async () => {
    const response = await POST(new Request(
      "https://research.gaiaskilltree.com/api/context-diet/leaderboard",
      { method: "POST", body: JSON.stringify({ tokensBefore: 10_000, tokensAfter: 1 }) },
    ));
    expect(response.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns ranked rows through the server client", async () => {
    const rows = [{ id: "1", kind: "context-diet", reduction_pct: 60 }];
    mockLimit.mockResolvedValueOnce({ data: rows, error: null });
    const response = await GET(new Request(
      "https://research.gaiaskilltree.com/api/context-diet/leaderboard?limit=10",
    ));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, rows });
    expect(mockEq).toHaveBeenCalledWith("kind", "context-diet");
  });

  it("returns 503 without server Supabase configuration", async () => {
    vi.mocked(getSupabaseServiceClient).mockReturnValue(null);
    const response = await GET(new Request(
      "https://research.gaiaskilltree.com/api/context-diet/leaderboard",
    ));
    expect(response.status).toBe(503);
  });
});
