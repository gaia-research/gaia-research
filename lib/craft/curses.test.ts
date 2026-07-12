/**
 * lib/craft/curses.test.ts
 *
 * Unit tests for the Curse catalogue in lib/craft/curses.ts.
 *
 * Covers:
 *   - CLEANSE_LABEL is a non-empty string
 *   - All 6 known curse ids return defined Curse objects from getCurse()
 *   - Every CURSES entry has required fields: id, name, emoji, blurb, effect
 *   - getCurse returns undefined for unknown ids
 *   - isCurseId, allCurseIds, and makeActiveCurse helpers
 */

import { describe, it, expect } from 'vitest';
import {
  CURSES,
  CLEANSE_LABEL,
  CLEANSE_INACTIVE_LABEL,
  getCurse,
  isCurseId,
  allCurseIds,
  makeActiveCurse,
} from './curses';

/** The 6 curse ids specified in the v0 brief. */
const KNOWN_CURSE_IDS = [
  'parse-html-with-regex',
  'force-push-main',
  'friday-deploy',
  'kubernetes-for-todo-app',
  'mongodb-is-web-scale',
  'undefined-is-not-a-function',
] as const;

describe('CLEANSE_LABEL', () => {
  it('is a non-empty string', () => {
    expect(typeof CLEANSE_LABEL).toBe('string');
    expect(CLEANSE_LABEL.length).toBeGreaterThan(0);
  });

  it('contains a broom emoji and the word Cleanse', () => {
    expect(CLEANSE_LABEL).toContain('🧹');
    expect(CLEANSE_LABEL).toContain('Cleanse');
  });
});

describe('CLEANSE_INACTIVE_LABEL', () => {
  it('is a non-empty string', () => {
    expect(typeof CLEANSE_INACTIVE_LABEL).toBe('string');
    expect(CLEANSE_INACTIVE_LABEL.length).toBeGreaterThan(0);
  });
});

describe('CURSES catalogue', () => {
  it('contains exactly the 6 known v0 curse ids', () => {
    const ids = Object.keys(CURSES);
    expect(ids.length).toBe(6);
    for (const id of KNOWN_CURSE_IDS) {
      expect(ids, `expected CURSES to contain "${id}"`).toContain(id);
    }
  });

  it('every CURSES entry has id, name, emoji, blurb, and effect', () => {
    for (const [key, curse] of Object.entries(CURSES)) {
      expect(curse.id, `CURSES["${key}"] missing id`).toBeTruthy();
      expect(curse.name, `CURSES["${key}"] missing name`).toBeTruthy();
      expect(curse.emoji, `CURSES["${key}"] missing emoji`).toBeTruthy();
      expect(curse.blurb, `CURSES["${key}"] missing blurb`).toBeTruthy();
      expect(curse.effect, `CURSES["${key}"] missing effect`).toBeTruthy();
    }
  });

  it('every curse id matches its map key', () => {
    for (const [key, curse] of Object.entries(CURSES)) {
      expect(curse.id).toBe(key);
    }
  });
});

describe('getCurse', () => {
  it.each(KNOWN_CURSE_IDS)('returns a defined Curse for id "%s"', (id) => {
    const curse = getCurse(id);
    expect(curse).toBeDefined();
    expect(curse!.id).toBe(id);
  });

  it('returns undefined for an unknown id', () => {
    expect(getCurse('nonexistent-curse')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getCurse('')).toBeUndefined();
  });

  it('returns the parse-html-with-regex curse with correct name and emoji', () => {
    const curse = getCurse('parse-html-with-regex');
    expect(curse!.name).toBe('Eldritch Parse');
    expect(curse!.emoji).toBe('🐙');
  });

  it('returns the force-push-main curse with correct name and emoji', () => {
    const curse = getCurse('force-push-main');
    expect(curse!.name).toBe('Oops Commit');
    expect(curse!.emoji).toBe('💣');
  });

  it('returns the friday-deploy curse with correct name', () => {
    const curse = getCurse('friday-deploy');
    expect(curse!.name).toBe('Friday Afternoon Mode');
  });

  it('returns the kubernetes-for-todo-app curse with correct name', () => {
    const curse = getCurse('kubernetes-for-todo-app');
    expect(curse!.name).toBe('Sidecar Explosion');
  });

  it('returns the mongodb-is-web-scale curse with correct name', () => {
    const curse = getCurse('mongodb-is-web-scale');
    expect(curse!.name).toBe('Write Concern: None');
  });

  it('returns the undefined-is-not-a-function curse with correct name', () => {
    const curse = getCurse('undefined-is-not-a-function');
    expect(curse!.name).toBe('JS Runtime');
  });
});

describe('isCurseId', () => {
  it.each(KNOWN_CURSE_IDS)('returns true for known id "%s"', (id) => {
    expect(isCurseId(id)).toBe(true);
  });

  it('returns false for an unknown id', () => {
    expect(isCurseId('not-a-real-curse')).toBe(false);
  });
});

describe('allCurseIds', () => {
  it('returns all 6 curse ids', () => {
    const ids = allCurseIds();
    expect(ids.length).toBe(6);
    for (const id of KNOWN_CURSE_IDS) {
      expect(ids).toContain(id);
    }
  });
});

describe('makeActiveCurse', () => {
  it('returns an object with the correct id', () => {
    const active = makeActiveCurse('force-push-main');
    expect(active.id).toBe('force-push-main');
  });

  it('sets remainingTriggers to 3 for force-push-main (count-down curse)', () => {
    const active = makeActiveCurse('force-push-main');
    expect(active.remainingTriggers).toBe(3);
  });

  it('sets remainingTriggers to null for indefinite curses', () => {
    for (const id of KNOWN_CURSE_IDS) {
      if (id === 'force-push-main') continue;
      const active = makeActiveCurse(id);
      expect(active.remainingTriggers, `expected null for "${id}"`).toBeNull();
    }
  });

  it('sets appliedAt as a recent unix-ms timestamp', () => {
    const before = Date.now();
    const active = makeActiveCurse('parse-html-with-regex');
    const after = Date.now();
    expect(active.appliedAt).toBeGreaterThanOrEqual(before);
    expect(active.appliedAt).toBeLessThanOrEqual(after);
  });
});
