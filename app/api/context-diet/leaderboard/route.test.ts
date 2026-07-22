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

import { GET, POST } from "./route";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSupabaseServiceClient).mockReturnValue(mockClient);
  mockInsert.mockResolvedValue({ error: null });
  mockLimit.mockResolvedValue({ data: [], error: null });
});

describe("/api/context-diet/leaderboard", () => {
  it("accepts only normalized aggregate metrics", async () => {
    const request = new Request("https://research.gaiaskilltree.com/api/context-diet/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json", origin: "https://research.gaiaskilltree.com" },
      body: JSON.stringify({
        tokensBefore: 1_000,
        tokensAfter: 400,
        reductionPct: 60,
        strategyKey: "recommended",
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
      tokensBefore: 1_000,
      tokensAfter: 400,
      reductionPct: 60,
      strategyKey: "recommended",
      handle: "nova",
    });
    expect(JSON.stringify(row)).not.toContain("private");
    expect(JSON.stringify(row)).not.toContain("must never");
  });

  it("rejects cross-origin browser submissions", async () => {
    const request = new Request("https://research.gaiaskilltree.com/api/context-diet/leaderboard", {
      method: "POST",
      headers: { origin: "https://example.com" },
      body: JSON.stringify({ tokensBefore: 10, tokensAfter: 5, reductionPct: 50 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
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
