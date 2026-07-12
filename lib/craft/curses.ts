/**
 * lib/craft/curses.ts
 *
 * Curse definitions for Infinite Skill Craft.
 *
 * A Curse is a funny cosmetic gremlin applied to the player's session when a
 * cursed Easter Egg is discovered. Curses are NEVER punishing — they are the
 * game's personality core. Every curse is instantly cleansable with 🧹.
 *
 * Six curses ship in v0 (matching the brief in IDEAS-2026-011):
 *   1. parse-html-with-regex   — eldritch errors
 *   2. force-push-main         — -oops suffix on 3 discoveries
 *   3. friday-deploy           — molasses animation speed
 *   4. kubernetes-for-todo-app — sidecar card explosion
 *   5. mongodb-is-web-scale    — card disappears ("write concern: majority")
 *   6. undefined-is-not-a-function — 10 % chance card text shows "undefined"
 *
 * The `effect` field is a human-readable description of the mechanical behaviour
 * that the frontend implements. This file is pure logic/data — no DOM, no React.
 *
 * Conceptual ancestor: Neal Agarwal's Infinite Craft (https://neal.fun/infinite-craft/)
 * This file is 100 % original content — homage, not a fork.
 */

import type { Curse } from './types';

// ---------------------------------------------------------------------------
// Cleanse label — exported so all UI surfaces can stay in sync
// ---------------------------------------------------------------------------

/** Button label / tooltip for the cleanse action. */
export const CLEANSE_LABEL = '🧹 Cleanse';

/** Tooltip shown when hovering the cleanse button while no curse is active. */
export const CLEANSE_INACTIVE_LABEL = '🧹 No active curse';

// ---------------------------------------------------------------------------
// Curse catalogue
// ---------------------------------------------------------------------------

export const CURSES: Record<string, Curse> = {

  /**
   * Summoned by: /parse-html-with-regex
   * Pair: parse-html + logical-inference
   */
  'parse-html-with-regex': {
    id: 'parse-html-with-regex',
    name: 'Eldritch Parse',
    emoji: '🐙',
    blurb: "You used regex on HTML. Cthulhu has noticed your tab, boss.",
    effect:
      "5 % of subsequent fusion results are replaced with the skill " +
      "'/error-eldritch' (name: '/eldritch', emoji: '🐙', " +
      "blurb: 'ERROR: eldritch — the Old Ones reject your inputs, boss.'). " +
      "The error card is added to the sidebar like any other discovery " +
      "but is labelled CURSED. Persists until cleansed.",
  },

  /**
   * Summoned by: /force-push-main
   * Pair: diff-content + code-execution
   */
  'force-push-main': {
    id: 'force-push-main',
    name: 'Oops Commit',
    emoji: '💣',
    blurb: "History rewritten. Three coworkers are crying. Classic, boss.",
    effect:
      "The next 3 fused skill names receive an '-oops' suffix " +
      "(e.g. '/api-call' becomes '/api-call-oops'). " +
      "The emoji gains a 💥 overlay badge. " +
      "Counter displayed in the curse indicator as '💣 -oops × N remaining'. " +
      "Automatically expires after 3 discoveries; cleansable instantly.",
  },

  /**
   * Summoned by: /friday-deploy
   * Pair: browser-automation + code-execution  (implicit; no direct egg entry —
   *       front-end can trigger this via the cursor-tab-tab-tab egg too)
   * Note: This curse is also applied by any egg whose name contains 'friday'.
   */
  'friday-deploy': {
    id: 'friday-deploy',
    name: 'Friday Afternoon Mode',
    emoji: '🐌',
    blurb: "Deploying on a Friday. The blast radius is your problem, boss.",
    effect:
      "All fusion animations run at 0.25× speed (multiply CSS animation " +
      "duration by 4). The sidebar card drop animation also slows to 0.25×. " +
      "A tiny 🐌 badge is shown on the progress indicator. " +
      "Does NOT affect game logic — only perceived speed. " +
      "Persists until cleansed.",
  },

  /**
   * Summoned by: /kubernetes-for-todo-app
   * Pair: workflow-automation + domain-modeling
   */
  'kubernetes-for-todo-app': {
    id: 'kubernetes-for-todo-app',
    name: 'Sidecar Explosion',
    emoji: '☸️',
    blurb: "47 pods spun up. All running 'sleep infinity', boss.",
    effect:
      "When ANY fusion completes while this curse is active, " +
      "5 additional 'sidecar' cards are injected into the sidebar alongside " +
      "the real result. Sidecar cards are named '/sidecar-N' (N = 1-5) " +
      "with emoji ☸️ and blurb 'Unnecessary infrastructure, boss.' " +
      "They are inert — cannot be fused, but ARE deletable. " +
      "One fusion = one real card + 5 sidecar noise cards. " +
      "Persists until cleansed.",
  },

  /**
   * Summoned by: /mongodb-is-web-scale
   * Pair: data-visualize + statistical-analysis
   */
  'mongodb-is-web-scale': {
    id: 'mongodb-is-web-scale',
    name: 'Write Concern: None',
    emoji: '🥭',
    blurb: "A card disappeared. Write concern was 'majority'. It wasn't, boss.",
    effect:
      "After each fusion, there is a 15 % chance that one random existing " +
      "sidebar card (excluding the 4 seed primitives and the just-added card) " +
      "is silently removed from the sidebar. " +
      "A one-second toast reads: '🥭 MongoDB says: write acknowledged. " +
      "(it was not)'. " +
      "Cards lost to this curse are NOT permanently gone — they can be " +
      "re-discovered by fusing again. " +
      "Persists until cleansed.",
  },

  /**
   * Summoned by: /undefined-is-not-a-function
   * Pair: error-interpretation + generate-text
   */
  'undefined-is-not-a-function': {
    id: 'undefined-is-not-a-function',
    name: 'JS Runtime',
    emoji: '🫥',
    blurb: "TypeError in production. Stack trace is 400 lines of webpack, boss.",
    effect:
      "10 % of fused card NAME fields are replaced with the literal string " +
      "'undefined' in the UI render (the underlying data is untouched). " +
      "The emoji is replaced with 🫥. " +
      "Hovering the card reveals the real name as a tooltip " +
      "('Actual value: /real-name-here, boss.'). " +
      "Purely cosmetic — discovery ledger records the real name. " +
      "Persists until cleansed.",
  },

};

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/**
 * Look up a single Curse by its id.
 *
 * Returns `undefined` when the id is not in the catalogue — callers should
 * treat a missing curse as "no active gremlin" and log a warning.
 *
 * @example
 * getCurse('force-push-main')
 * // => { id: 'force-push-main', name: 'Oops Commit', emoji: '💣', ... }
 */
export function getCurse(id: string): Curse | undefined {
  return CURSES[id];
}

/**
 * Returns true when the given id maps to a known curse.
 *
 * Useful for type-narrowing in the fusion engine before calling getCurse.
 */
export function isCurseId(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(CURSES, id);
}

/**
 * Returns all curse ids currently in the catalogue.
 *
 * The frontend can iterate this to render a "curse codex" screen.
 */
export function allCurseIds(): string[] {
  return Object.keys(CURSES);
}

/**
 * Descriptor shape used by the client-side curse state manager.
 * Kept flat so it serialises cleanly into localStorage / session storage.
 */
export interface ActiveCurse {
  /** Curse id — key into CURSES. */
  id: string;
  /** Unix-ms timestamp when the curse was first applied. */
  appliedAt: number;
  /**
   * For count-down curses (e.g. 'force-push-main'), the number of
   * affected events remaining before the curse auto-expires.
   * `null` for indefinite curses (cleanse-only expiry).
   */
  remainingTriggers: number | null;
}

/**
 * Returns a fresh ActiveCurse descriptor for the given curse id.
 *
 * `remainingTriggers` is pre-populated for the one count-down curse
 * ('force-push-main' = 3 triggers); all others are indefinite.
 */
export function makeActiveCurse(id: string): ActiveCurse {
  const COUNTDOWN: Record<string, number> = {
    'force-push-main': 3,
  };
  return {
    id,
    appliedAt: Date.now(),
    remainingTriggers: COUNTDOWN[id] ?? null,
  };
}
