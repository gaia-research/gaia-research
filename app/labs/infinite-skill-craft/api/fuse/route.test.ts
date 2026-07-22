/**
 * app/labs/infinite-skill-craft/api/fuse/route.test.ts
 *
 * Unit tests for the fuse route POST handler.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAllNamedSkillSlugs } from '@/lib/craft/named-index';

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(),
}));

import { getCloudflareContext } from '@opennextjs/cloudflare';

describe('POST /labs/infinite-skill-craft/api/fuse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCloudflareContext).mockRejectedValue(new Error('No Cloudflare context'));
  });

  it('returns 400 when body is invalid JSON or missing parameters', async () => {
    const reqInvalid = new Request('http://localhost/api/fuse', {
      method: 'POST',
      body: 'invalid-json',
    });
    const resInvalid = await POST(reqInvalid);
    expect(resInvalid.status).toBe(400);

    const reqMissing = new Request('http://localhost/api/fuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 'prompt' }),
    });
    const resMissing = await POST(reqMissing);
    expect(resMissing.status).toBe(400);
  });

  it('resolves starter recipe deterministically without calling AI', async () => {
    const req = new Request('http://localhost/api/fuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 'prompt', b: 'code' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tier).toBe('canonical');
    expect(data.name).toBe('/codegen');
  });

  it('passes targeted similarity candidates into AI prompt during emergent resolution', async () => {
    const mockAiRun = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        name: '/scrape',
        emoji: '🕷️',
        blurb: 'Web extraction boss',
        description: 'Extracts web data',
        passesSkillCheck: true,
      }),
    });
    const mockKv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(getCloudflareContext).mockResolvedValue({
      env: {
        AI: { run: mockAiRun },
        CRAFT_KV: mockKv,
      } as any,
      cf: {} as any,
      ctx: { waitUntil: vi.fn() } as any,
    });

    const req = new Request('http://localhost/api/fuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 'custom-skill-x', b: 'custom-skill-y' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockAiRun).toHaveBeenCalledTimes(1);

    const callArgs = mockAiRun.mock.calls[0][1];
    const systemMessage = callArgs.messages.find((m: any) => m.role === 'system');
    expect(systemMessage).toBeDefined();

    expect(systemMessage.content).toContain('CONVERGENCE GRAVITY');
  });

  it('injects real ground-truth slugs (not invented ones) as candidates for a recognisable pair', async () => {
    const mockAiRun = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        name: '/scrape',
        emoji: '🕷️',
        blurb: 'Web extraction boss',
        description: 'Extracts web data',
        passesSkillCheck: true,
      }),
    });
    const mockKv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(getCloudflareContext).mockResolvedValue({
      env: {
        AI: { run: mockAiRun },
        CRAFT_KV: mockKv,
      } as any,
      cf: {} as any,
      ctx: { waitUntil: vi.fn() } as any,
    });

    const req = new Request('http://localhost/api/fuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 'web', b: 'scrape' }),
    });

    await POST(req);

    const systemMessage = mockAiRun.mock.calls[0][1].messages.find(
      (m: any) => m.role === 'system'
    );
    const allSlugs = new Set(getAllNamedSkillSlugs());

    // Pull out the comma-joined vocabulary list embedded after the
    // "PREFER that exact name" instruction and check every candidate is a
    // real registry slug — the attractor system must only ever point devs at
    // skills that actually exist in gaia-skill-tree.
    const match = systemMessage.content.match(/PREFER that exact name so devs recognise it: (.+)\./);
    expect(match).toBeTruthy();
    const injectedSlugs = match![1].split(', ').map((s: string) => s.trim());
    expect(injectedSlugs.length).toBeGreaterThan(0);
    for (const slug of injectedSlugs) {
      expect(allSlugs.has(slug)).toBe(true);
    }
    // The obviously relevant real skill should be discoverable for this pair.
    expect(injectedSlugs).toContain('scrape');
  });

  it('promotes an emergent fusion to canonical when the AI names a real registry skill (discovery path)', async () => {
    const mockAiRun = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        name: '/scrape',
        emoji: '🕷️',
        blurb: 'Web extraction boss',
        description: 'Extracts web data',
        passesSkillCheck: true,
      }),
    });
    const mockKv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(getCloudflareContext).mockResolvedValue({
      env: {
        AI: { run: mockAiRun },
        CRAFT_KV: mockKv,
      } as any,
      cf: {} as any,
      ctx: { waitUntil: vi.fn() } as any,
    });

    const req = new Request('http://localhost/api/fuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 'web', b: 'scrape' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.tier).toBe('canonical');
    expect(data.contributor).toBe('garrytan');
    expect(data.skillTreeUrl).toContain('garrytan');
    expect(data.skillTreeUrl).toContain('scrape');
    expect(data.experimental).toBe(false);
  });

  it('does NOT promote to canonical when the AI invents a name absent from the registry', async () => {
    const mockAiRun = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        name: '/quantum-blorp-synthesizer',
        emoji: '✨',
        blurb: 'Made-up nonsense name',
        description: 'Not a real skill in gaia-skill-tree',
        passesSkillCheck: true,
      }),
    });
    const mockKv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(getCloudflareContext).mockResolvedValue({
      env: {
        AI: { run: mockAiRun },
        CRAFT_KV: mockKv,
      } as any,
      cf: {} as any,
      ctx: { waitUntil: vi.fn() } as any,
    });

    const req = new Request('http://localhost/api/fuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 'quantum', b: 'blorp' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.tier).not.toBe('canonical');
    expect(data.contributor).toBeUndefined();
    expect(data.skillTreeUrl).toBeUndefined();
  });

  it('handles AI run exceptions defensively with experimental fallback (never 500s)', async () => {
    const mockAiRun = vi.fn().mockRejectedValue(new Error('Workers AI model overloaded'));
    const mockKv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(getCloudflareContext).mockResolvedValue({
      env: {
        AI: { run: mockAiRun },
        CRAFT_KV: mockKv,
      } as any,
      cf: {} as any,
      ctx: { waitUntil: vi.fn() } as any,
    });

    const req = new Request('http://localhost/api/fuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 'foo-a', b: 'bar-b' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.tier).toBe('emergent');
    expect(data.passesSkillCheck).toBe(false);
    expect(data.experimental).toBe(true);
  });
});
