/**
 * lib/craft/types.ts
 *
 * ⚠️  FROZEN CONTRACT — do not edit field shapes once Wave 1+ workers depend on this.
 * All Infinite Skill Craft modules import from here exclusively.
 *
 * Conceptual ancestor: Neal Agarwal's Infinite Craft (https://neal.fun/infinite-craft/)
 * This is an original implementation — a homage, not a fork.
 */

// ---------------------------------------------------------------------------
// Core enumerations
// ---------------------------------------------------------------------------

/**
 * The "rarity tier" of a fused skill result.
 *
 * - `canonical`  — appears in the Gaia Skill Tree registry; has a real skill page.
 * - `easteregg`  — hand-authored surprise combo (fun, memorable, off-registry).
 * - `emergent`   — AI-generated on the fly; may or may not pass the skill check.
 */
export type FusionTier = 'canonical' | 'easteregg' | 'emergent';

// ---------------------------------------------------------------------------
// Domain interfaces
// ---------------------------------------------------------------------------

/**
 * A single skill card shown in the player's inventory / craft grid.
 * Represents either a seed skill or a previously fused result.
 */
export interface SkillCard {
  /** Stable slug — matches the Gaia Skill Tree slug if canonical, else a generated id. */
  id: string;
  /** Human-readable name, e.g. "API Call". */
  name: string;
  /** Slash-command style label shown in-game, e.g. `/api-call`. */
  emoji: string;
  /** One-liner description shown on hover / in the result toast. */
  blurb?: string;
  /** Rarity tier — defaults to `emergent` when unknown. */
  tier?: FusionTier;
  /** Unix-ms timestamp of when this card was first discovered by this browser session. */
  discoveredAt?: number;
}

/**
 * The outcome returned by the fusion engine for a single pair of skills.
 */
export interface FusionResult {
  /** Display name of the fused skill. */
  name: string;
  /** Representative emoji. */
  emoji: string;
  /** Short flavour text / description. */
  blurb: string;
  /** Rarity tier of this result. */
  tier: FusionTier;
  /**
   * True if this is the first time *any* player discovered this combo
   * (determined server-side via the discoveries ledger).
   */
  isFirstDiscovery: boolean;
  /**
   * True if the result name matches a real skill in the Gaia Skill Tree registry.
   * When false the UI shows a gentle "experimental" badge — this NEVER blocks play.
   */
  passesSkillCheck: boolean;
  /**
   * Deep-link to the skill page on gaiaskilltree.com, present only when
   * `passesSkillCheck` is true and contributor/slug are known.
   * Format: `https://gaiaskilltree.com/named/#explorer/{contributor}/{slug}`
   */
  skillTreeUrl?: string;
  /** True when this result carries a curse effect (rare gremlin outcome). */
  cursed?: boolean;
  /** Reference id into the Curse table when `cursed` is true. */
  curseId?: string;
  /**
   * Alias for `!passesSkillCheck` — set explicitly by the engine so the UI
   * can render a badge without re-deriving. NEVER used to block or gate content.
   */
  experimental?: boolean;
}

/**
 * Payload sent from the client to `POST /api/fuse`.
 */
export interface FusionRequest {
  /** Slug / id of the first skill card. */
  a: string;
  /** Slug / id of the second skill card. */
  b: string;
}

/**
 * A "curse" — a rare gremlin effect that applies a funny debuff to the player's
 * session (e.g. card names scramble for 60 s). Purely cosmetic, always reversible.
 */
export interface Curse {
  /** Unique identifier referenced by FusionResult.curseId. */
  id: string;
  /** Short name shown in the UI, e.g. "Skill Rot". */
  name: string;
  /** Emoji representing the curse. */
  emoji: string;
  /** Flavour text describing the curse to the player. */
  blurb: string;
  /** Human-readable description of the mechanical effect (e.g. "card names scramble for 60 s"). */
  effect: string;
}

/**
 * A hand-authored or community-contributed fusion recipe stored in
 * `data/craft/recipes.json` (or the DB in production).
 */
export interface Recipe {
  /**
   * Canonical lookup key — two skill slugs, lowercased, trimmed, sorted
   * alphabetically, joined with `+`.  Produced by `pairKey(a, b)`.
   * Example: `"api-call+observability"`
   */
  pairKey: string;
  /** Result skill name. */
  result: string;
  /** Result emoji. */
  emoji: string;
  /** Result blurb / flavour text. */
  blurb: string;
  /** Gaia Skill Tree contributor handle (when result is canonical). */
  contributor?: string;
  /** Gaia Skill Tree skill slug (when result is canonical). */
  slug?: string;
}

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/**
 * Produces the canonical cache/lookup key for a pair of skill slugs.
 *
 * - Lowercases and trims both inputs.
 * - Sorts them alphabetically so `pairKey("B","A") === pairKey("A","B")`.
 * - Joins with `+`.
 *
 * This is the single source of truth for key derivation — all recipe lookups,
 * cache hits, and discovery-ledger writes must call this function.
 *
 * @example
 * pairKey("API Call", "Observability") // => "api call+observability"
 * pairKey("observability", "API Call") // => "api call+observability"
 */
export function pairKey(a: string, b: string): string {
  const norm = (s: string) => s.toLowerCase().trim();
  return [norm(a), norm(b)].sort().join('+');
}
