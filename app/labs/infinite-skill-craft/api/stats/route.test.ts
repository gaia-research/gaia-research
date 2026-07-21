/**
 * app/labs/infinite-skill-craft/api/stats/route.test.ts
 *
 * Unit tests for the stats route GET handler.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMaybeSingle = vi.fn();
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockClient = { from: mockFrom } as any;

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServiceClient: vi.fn(() => mockClient),
}));

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn().mockRejectedValue(new Error('No Cloudflare context')),
}));

import { GET } from './route';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSupabaseServiceClient).mockReturnValue(mockClient);
  vi.mocked(getCloudflareContext).mockRejectedValue(new Error('No Cloudflare context'));
});

describe('GET /labs/infinite-skill-craft/api/stats', () => {
  it('returns count from Supabase craft_stats when present', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { value: 1234 }, error: null });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ count: 1234 });
    expect(mockFrom).toHaveBeenCalledWith('craft_stats');
    expect(mockSelect).toHaveBeenCalledWith('value');
    expect(mockEq).toHaveBeenCalledWith('key', 'total_fusions');
  });

  it('falls back to KV when Supabase returns null data', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const mockKv = { get: vi.fn().mockResolvedValue('5678') };
    vi.mocked(getCloudflareContext).mockResolvedValue({
      env: { CRAFT_KV: mockKv } as any,
      cf: {} as any,
      ctx: {} as any,
    });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ count: 5678 });
    expect(mockKv.get).toHaveBeenCalledWith('stats:total-fusions');
  });

  it('falls back to 0 when both Supabase and KV are unavailable', async () => {
    vi.mocked(getSupabaseServiceClient).mockReturnValue(null);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ count: 0 });
  });

  it('handles Supabase query error gracefully without 500ing', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ count: 0 });
  });
});
