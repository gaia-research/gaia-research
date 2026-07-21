/**
 * lib/craft/telemetry.test.ts
 *
 * Unit tests for the fusion telemetry seam (recordFusionEvent).
 *
 * Supabase and the server client are mocked — no real network calls.
 * These tests verify the three guarantees from issue #45:
 *   1. recordFusionEvent fires on a cache hit
 *   2. recordFusionEvent fires on a fresh (miss) result
 *   3. A Supabase failure never throws or affects the caller
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock @/lib/supabase/server before importing telemetry ───────────────────
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockFrom = vi.fn(() => ({ insert: mockInsert }));
const mockClient = { from: mockFrom } as any;

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServiceClient: vi.fn(() => mockClient),
}));

import { recordFusionEvent } from './telemetry';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Flushes micro-task queue so async IIFE inside recordFusionEvent resolves. */
const flush = () => new Promise<void>((r) => setTimeout(r, 0));

beforeEach(() => {
  vi.clearAllMocks();
  mockInsert.mockResolvedValue({ error: null });
  vi.mocked(getSupabaseServiceClient).mockReturnValue(mockClient);
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('recordFusionEvent', () => {
  it('inserts a row with correct fields on a cache hit', async () => {
    recordFusionEvent('canonical', true, 'api-call+tool-use');
    await flush();

    expect(mockFrom).toHaveBeenCalledWith('craft_fusion_events');
    expect(mockInsert).toHaveBeenCalledWith({
      tier: 'canonical',
      cache_hit: true,
      pair_key: 'api-call+tool-use',
    });
  });

  it('inserts a row with correct fields on a fresh (miss) result', async () => {
    recordFusionEvent('emergent', false, 'prompt+code');
    await flush();

    expect(mockFrom).toHaveBeenCalledWith('craft_fusion_events');
    expect(mockInsert).toHaveBeenCalledWith({
      tier: 'emergent',
      cache_hit: false,
      pair_key: 'prompt+code',
    });
  });

  it('registers the write with waitUntil when cfCtx is provided', async () => {
    const waitUntil = vi.fn();
    recordFusionEvent('easteregg', false, 'a+b', { waitUntil });
    await flush();

    expect(waitUntil).toHaveBeenCalledOnce();
    // The argument must be a Promise
    expect(waitUntil.mock.calls[0][0]).toBeInstanceOf(Promise);
  });

  it('does not call waitUntil when cfCtx is absent', async () => {
    // Should not throw — just a plain void call
    expect(() => recordFusionEvent('canonical', true, 'a+b')).not.toThrow();
    await flush();
    expect(mockInsert).toHaveBeenCalledOnce();
  });

  it('returns void synchronously — never awaited by the caller', () => {
    const result = recordFusionEvent('emergent', false, 'x+y');
    expect(result).toBeUndefined();
  });

  it('does not throw when getSupabaseServiceClient returns null', async () => {
    vi.mocked(getSupabaseServiceClient).mockReturnValue(null);

    expect(() => recordFusionEvent('canonical', false, 'a+b')).not.toThrow();
    await flush();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('does not throw when Supabase insert rejects', async () => {
    mockInsert.mockRejectedValue(new Error('Supabase down'));

    expect(() => recordFusionEvent('emergent', false, 'a+b')).not.toThrow();
    // Should resolve quietly — no unhandled rejection
    await expect(flush()).resolves.toBeUndefined();
  });

  it('does not throw when Supabase insert returns an error object', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'RLS violation' } });

    expect(() => recordFusionEvent('canonical', true, 'a+b')).not.toThrow();
    await flush();
    // Insert was still called — error object alone doesn't throw
    expect(mockInsert).toHaveBeenCalledOnce();
  });
});
