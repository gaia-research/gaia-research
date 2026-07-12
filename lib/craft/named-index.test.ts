/**
 * lib/craft/named-index.test.ts
 *
 * Unit tests for the ground-truth named-skill accessor (lib/craft/named-index.ts).
 *
 * Real data used (from gaia-skill-tree/registry/named-skills.json, cached into
 * data/craft/named-index.json by scripts/craft/sync-skill-tree.ts):
 *   - "scrape"      → garrytan, title "Gstack Scrape — Structured Web Extraction"
 *   - "design-html" → garrytan, title "Design to Production HTML"
 */

import { describe, it, expect } from 'vitest';
import { lookupNamedSkill, namedContributor } from './named-index';

describe('lookupNamedSkill', () => {
  it('returns the real registry fields for a known slug (scrape → garrytan)', () => {
    const skill = lookupNamedSkill('scrape');
    expect(skill).toBeDefined();
    expect(skill!.contributor).toBe('garrytan');
    // Ground-truth title + description (not invented text).
    expect(skill!.title).toBe('Gstack Scrape — Structured Web Extraction');
    expect(skill!.title.length).toBeGreaterThan(0);
    expect(skill!.description).toBeTruthy();
    expect(skill!.description.length).toBeGreaterThan(20);
    // Optional enrichment fields present for this entry.
    expect(skill!.genericSkillRef).toBe('web-scrape');
    expect(skill!.level).toBeTruthy();
  });

  it('returns real fields for another known slug (design-html → garrytan)', () => {
    const skill = lookupNamedSkill('design-html');
    expect(skill).toBeDefined();
    expect(skill!.contributor).toBe('garrytan');
    expect(skill!.title).toBe('Design to Production HTML');
    expect(skill!.description).toBeTruthy();
  });

  it('always carries a non-empty title and description for a hit', () => {
    const skill = lookupNamedSkill('scrape')!;
    expect(typeof skill.title).toBe('string');
    expect(typeof skill.description).toBe('string');
    expect(skill.title.trim()).not.toBe('');
    expect(skill.description.trim()).not.toBe('');
  });

  it('returns undefined for a nonsense slug', () => {
    expect(lookupNamedSkill('unicorn-dust-9000')).toBeUndefined();
  });

  it('returns undefined for an empty slug', () => {
    expect(lookupNamedSkill('')).toBeUndefined();
  });

  it('does not leak the on-disk short keys (c/t/g/d/lvl)', () => {
    const skill = lookupNamedSkill('scrape') as unknown as Record<string, unknown>;
    expect(skill.c).toBeUndefined();
    expect(skill.t).toBeUndefined();
    expect(skill.d).toBeUndefined();
    expect(skill.contributor).toBeDefined();
    expect(skill.title).toBeDefined();
    expect(skill.description).toBeDefined();
  });
});

describe('namedContributor', () => {
  it('returns the contributor handle for a known slug', () => {
    expect(namedContributor('scrape')).toBe('garrytan');
    expect(namedContributor('design-html')).toBe('garrytan');
  });

  it('agrees with lookupNamedSkill().contributor for a known slug', () => {
    expect(namedContributor('scrape')).toBe(lookupNamedSkill('scrape')!.contributor);
  });

  it('returns undefined for a nonsense slug', () => {
    expect(namedContributor('unicorn-dust-9000')).toBeUndefined();
  });

  it('returns undefined for an empty slug', () => {
    expect(namedContributor('')).toBeUndefined();
  });
});
