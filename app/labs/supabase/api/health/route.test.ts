/**
 * app/labs/supabase/api/health/route.test.ts
 *
 * Unit tests for the Supabase integration health & diagnostic endpoint.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelect = vi.fn();
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockClient = { from: mockFrom } as any;

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServiceClient: vi.fn(() => mockClient),
}));

import { GET } from "./route";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSupabaseServiceClient).mockReturnValue(mockClient);
});

describe("GET /labs/supabase/api/health", () => {
  it("returns ONLINE status when all tables are accessible", async () => {
    // craft_stats call
    mockSelect.mockImplementationOnce(() =>
      Promise.resolve({
        data: [{ key: "total_fusions", value: 4312 }, { key: "cache_hits", value: 120 }],
        error: null,
      })
    );
    // craft_fusion_events call
    mockSelect.mockImplementationOnce(() =>
      Promise.resolve({ count: 500, error: null })
    );
    // submissions call
    mockSelect.mockImplementationOnce(() =>
      Promise.resolve({ count: 42, error: null })
    );

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("ONLINE");
    expect(data.tables.craft_stats.accessible).toBe(true);
    expect(data.tables.craft_stats.count).toBe(4312);
    expect(data.tables.craft_fusion_events.accessible).toBe(true);
    expect(data.tables.submissions.accessible).toBe(true);
  });

  it("returns OFFLINE status when getSupabaseServiceClient returns null", async () => {
    vi.mocked(getSupabaseServiceClient).mockReturnValue(null);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("OFFLINE");
    expect(data.env.hasServiceClient).toBe(false);
  });

  it("returns DEGRADED status when a table query fails", async () => {
    // craft_stats succeeds
    mockSelect.mockImplementationOnce(() =>
      Promise.resolve({
        data: [{ key: "total_fusions", value: 100 }],
        error: null,
      })
    );
    // craft_fusion_events fails
    mockSelect.mockImplementationOnce(() =>
      Promise.resolve({ count: null, error: { message: "Table missing" } })
    );
    // submissions succeeds
    mockSelect.mockImplementationOnce(() =>
      Promise.resolve({ count: 10, error: null })
    );

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("DEGRADED");
    expect(data.tables.craft_fusion_events.accessible).toBe(false);
  });
});
