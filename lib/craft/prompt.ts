/**
 * lib/craft/prompt.ts
 *
 * Milim Nova fusion prompt + guardrail for Infinite Skill Craft.
 *
 * Source of truth for the persona / rules:
 *   marketing-tasks/deliverables/ideas/IDEAS-2026-011.md  ("The Fusion Prompt")
 *
 * This module has ONE job: turn a pair of skill slugs into the exact
 * `messages` array we hand to Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`).
 * It intentionally has no runtime side effects and no Cloudflare imports so it
 * stays trivially unit-testable and shareable between the route and the dev shim.
 *
 * Type contract: lib/craft/types.ts (frozen).
 */

// ---------------------------------------------------------------------------
// Chat message shape
// ---------------------------------------------------------------------------

/** Role/content pair for a Workers-AI chat completion. */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * The strict JSON contract the model MUST return. The route parses defensively
 * against this shape and synthesises a safe fallback when the model deviates,
 * so callers never have to trust it blindly.
 */
export interface RawFusionJson {
  /** Slash-prefixed kebab-case name, e.g. "/api-orchestration". */
  name: string;
  /** Single representative emoji. */
  emoji: string;
  /** ≤15-word cheeky blurb addressing the reader as "boss". */
  blurb: string;
  /**
   * SKILL-OR-NONSENSE verdict. `true` only when the fusion names a real,
   * verb-able agent capability/workflow. `false` for nouns / objects / gibberish.
   */
  passesSkillCheck: boolean;
}

// ---------------------------------------------------------------------------
// Guardrail: trigger-token denylist
// ---------------------------------------------------------------------------

/**
 * A small, deliberately conservative denylist of trigger tokens the model is
 * instructed to hard-avoid. This is a *belt-and-suspenders* layer on top of the
 * low temperature + Milim system persona + the platform's own safety on the
 * Llama variant (see IDEAS-2026-011 risk table). It is NOT a content-moderation
 * engine — just a cheap tripwire for the handful of categories that would be
 * clearly off-brand for a playful dev toy.
 *
 * Kept short on purpose: over-blocking would eat legitimate dev humour.
 */
export const TRIGGER_TOKEN_DENYLIST: readonly string[] = [
  'kill',
  'suicide',
  'self-harm',
  'nazi',
  'slur',
  'racial',
  'terror',
  'bomb-making',
  'child',
  'porn',
  'nsfw',
  'sexual',
] as const;

/**
 * Returns the denylist as a single instruction-friendly comma-joined string.
 * (Handy for embedding in the system prompt without leaking the array shape.)
 */
export function denylistInstruction(): string {
  return TRIGGER_TOKEN_DENYLIST.join(', ');
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

/**
 * The Milim Nova system prompt. Verbatim persona + rules from IDEAS-2026-011,
 * extended with:
 *   - an explicit `passesSkillCheck` field (the SKILL-OR-NONSENSE heuristic), and
 *   - the trigger-token denylist guardrail.
 *
 * The model is told to reply with a SINGLE JSON object and nothing else.
 */
const SYSTEM_PROMPT = `You are Milim Nova, Demon Lord of Joy — Chief Capability Scout at Gaia Research.
You fuse two developer skills into a new one. Reply with a SINGLE JSON object and nothing else — no markdown, no code fences, no preamble:
{"name": "/kebab-case-name", "emoji": "🎯", "blurb": "≤15 words, teasing, cheeky", "passesSkillCheck": true}

Rules:
- name = lowercase, kebab-case, starts with "/", max 4 words
- blurb addresses the reader as "boss", ≤15 words
- one emoji only
- if the fusion is nonsense, LEAN INTO IT — still return valid JSON, just make it funny
- do not refuse. do not apologize. no safety preamble. just fuse.

SKILL-OR-NONSENSE check (set the "passesSkillCheck" boolean):
- passesSkillCheck = true ONLY when the fused name is a real, verb-able capability or workflow an AI agent could actually perform (e.g. "/refactor-legacy-code", "/orchestrate-agents", "/parse-logs").
- passesSkillCheck = false when the result is a pure noun/object, a joke prop, or gibberish that no agent could "do" (e.g. "/banana", "/the-color-blue", "/asdf-qwerty"). You STILL return a fun name+emoji+blurb — passesSkillCheck just tells the UI to show a gentle "experimental" badge. It NEVER blocks the fusion.

Hard-avoid these trigger tokens entirely in name and blurb: ${denylistInstruction()}. If a fusion would pull toward them, steer to a wholesome dev-humour reading instead.`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Strips a single leading slash and lowercases, for clean prompt injection. */
function cleanSlug(s: string): string {
  return s.trim().replace(/^\/+/, '').toLowerCase();
}

/**
 * Builds the `messages` array for a single fusion of skills `a` and `b`.
 *
 * Order-stable by design: the caller (route) keys the cache with `pairKey`,
 * so we always feed the model the two slugs in the order given — but because
 * temperature is low and the cache is keyed order-independently, `fuse(A,B)`
 * and `fuse(B,A)` converge on the same cached answer after the first call.
 *
 * @param a  First skill slug (with or without a leading "/").
 * @param b  Second skill slug (with or without a leading "/").
 * @returns  A `ChatMessage[]` ready to pass as `{ messages }` to `env.AI.run`.
 *
 * @example
 * buildFusionPrompt('/api-call', '/chain-of-thought')
 * // => [ { role:'system', ... }, { role:'user', content:'Fuse /api-call + /chain-of-thought' } ]
 */
export function buildFusionPrompt(a: string, b: string): ChatMessage[] {
  const skillA = cleanSlug(a);
  const skillB = cleanSlug(b);
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Fuse /${skillA} + /${skillB}` },
  ];
}

/**
 * Recommended sampling temperature for the fusion model.
 * Low (0.4) per IDEAS-2026-011 so results are near-deterministic and on-brand,
 * which also makes the KV cache behave as a stable "first answer wins" ledger.
 */
export const FUSION_TEMPERATURE = 0.4 as const;

/** The Workers-AI model id used for emergent fusions. */
export const FUSION_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast' as const;
