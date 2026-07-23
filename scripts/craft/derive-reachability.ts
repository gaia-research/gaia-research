// READ-ONLY on gaia-skill-tree. Never writes there.
//
// scripts/craft/derive-reachability.ts
//
// Derives build-time fusion reachability from the Gaia Skill Tree registry.
//
// Reads:
//   data/craft/skills.json       — array of { id, name, type, prerequisites? }
//                                  (prerequisites carries inline fusion prereqs
//                                   per Plan A / Yggdrasil II sync hardening)
//   data/craft/recipes.json      — array of Recipe | MultiPrereqEntry
//                                  (included as additional hyperedges; empty on ygg2
//                                   but retained for forward compatibility)
//   data/craft/named-index.json  — map of slug → { c, t, g?, d, lvl? }
//                                  used to identify named-backed fusion targets.
//
// Writes:
//   data/craft/bridges.json — see BridgesOutput shape below.
//
// ---------------------------------------------------------------------------
// TWO DISTINCT REACHABILITY METRICS — both reported, neither faked
// ---------------------------------------------------------------------------
//
// These are two different questions. Do NOT conflate them.
//
// METRIC A — Registry-internal connectivity (from basic-node roots):
//   Seeds = all 113 basic nodes + game UI primitives.
//   Basic nodes are the ATOMIC ROOTS of the registry graph — they have no
//   prerequisites by definition. Any player (or agent) can use them without
//   crafting anything first. Starting from these roots, what % of all
//   registry skills (basics + fusions) are reachable through fusion chains?
//   On Yggdrasil II: 243/243 = 100% (all fusion prereqs exist in skills.json
//   and chain back to basic roots; registry graph is fully self-contained).
//   → report.internalConnectivityPct / report.reachableCount
//
// METRIC B — Game-seed reachability (from the 4 UI primitives only):
//   Seeds = ONLY { prompt, code, web, data } (the 4 cards players start with).
//   These are game UI abstractions NOT in the registry — they have no skill
//   IDs in skills.json. Starting from ONLY these 4 IDs + synthetic seed-bridge
//   edges, what % of registry skills are reachable?
//   With A′ bridges: reaches the 84 named-backed fusions + 5 unavoidable
//   generic intermediates = 89 fusions, plus 71 root basics, plus the
//   153 distinct named skills that back those 84 fusions.
//   → report.gameSeedReachableCount / report.gameSeedReachablePct
//
// ---------------------------------------------------------------------------
// A′ BRIDGE SYNTHESIS — TARGET-SCOPED CLOSURE (Issue #86 DoD)
// ---------------------------------------------------------------------------
//
// Founder decision (RATIFICATION.md): A-star (A′) bridge model adopted.
// Synthesise minimal, build-time, derived seed→graph bridges so the 4 game
// seeds deterministically reach ONLY the 84 named-backed fusions (and the
// 153 distinct named skills that back them), leaving purely-generic fusions
// for the emergent/#87 path.
//
// A fusion is "named-backed" iff:
//   its id ∈ named-skill slugs  (direct)
//   OR its id ∈ {g of any named record}  (via genericSkillRef)
//
// Bridge algorithm — TARGET-SCOPED (not root-basic flooding):
//   1. Compute targetClosure = prerequisite closure over the 84 named-backed
//      fusions (recursive prereq walk over fusion hyperedges), INCLUDING the 84.
//   2. rootBasics = targetClosure ∩ basics (the 71 atomic leaves).
//   3. Emit one synthetic bridge edge per root basic:
//      { result: <basicId>, prereqs: [<seedId>], via: 'seed-bridge' }
//      Assign each root basic to a seed by a DETERMINISTIC, DOCUMENTED rule:
//        — Lexical signal: if the basic id contains a strong keyword
//          ('web'/'crawl'/'scrape'/'fetch' → 'web';
//           'code'/'test'/'compile'/'debug' → 'code';
//           'data'/'sql'/'embed'/'extract' → 'data';
//           else → 'prompt')
//        — Fallback: sum-of-char-codes mod 4 → index into ['code','data','prompt','web']
//          (stable, reproducible, routing-only — does NOT change WHICH skills
//           are reachable, only the labelled entry path; safe to be "arbitrary")
//   4. Recompute Metric B closure = computeReachability(seeds, hyperedges ∪ bridges).
//      FAIL-LOUD guard: if any fusion in the closure falls outside targetClosure,
//      throw immediately — bridges must never unlock a fusion outside the 84's
//      required closure (mirrors assertRegistryShape fail-loud contract).
//
// 5 purely-generic fusions are unavoidable intermediates on the path to named
// targets (agent-eval, ghostwrite, knowledge-harvest, plan-and-execute, research).
// These are surfaced explicitly in report.genericIntermediateFusions and explained
// in report.deterministicFusionReachCount = 84 named-backed + 5 intermediates.
//
// Output directory: GAIA_CRAFT_OUT_DIR env override (default: data/craft/).
// Run standalone: npx tsx scripts/craft/derive-reachability.ts
// Also called at end of sync-skill-tree.ts so every sync regenerates automatically.

import fs from 'fs';
import path from 'path';

const DEFAULT_OUT_DIR =
  process.env.GAIA_CRAFT_OUT_DIR ??
  path.resolve(__dirname, '../../data/craft');

// ---------------------------------------------------------------------------
// Game UI seed slugs (the 4 cards players start with — NOT in the registry).
// Including them in Metric A seeds keeps the closure correct if a future
// fusion ever references them by id; on ygg2 they don't change the result.
// ---------------------------------------------------------------------------

export const GAME_SEED_SLUGS: string[] = ['prompt', 'code', 'web', 'data'];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SkillEntry {
  id: string;
  name: string;
  type: 'basic' | 'fusion';
  prerequisites?: string[];
}

interface ReachableEdge {
  result: string;
  prereqs: string[];
}

/**
 * A synthetic bridge edge connecting a game seed to a root basic skill.
 * Emitted by synthesizeSeedBridges; stored in bridges.json under `seedBridges`.
 */
export interface SeedBridgeEdge {
  /** The root basic skill id this bridge makes reachable from the seed. */
  result: string;
  /** Single-element array containing the game seed slug. */
  prereqs: string[];
  /** Tag so readers can distinguish synthetic edges from registry edges. */
  via: 'seed-bridge';
}

// Named-index record shape (only the fields we need)
interface NamedRecord {
  c: string;
  t: string;
  g?: string;
  d?: string;
  lvl?: string;
}

interface NamedIndex {
  skills: Record<string, NamedRecord>;
}

// ---------------------------------------------------------------------------
// Report shape emitted into bridges.json
// ---------------------------------------------------------------------------

export interface ReachabilityReport {
  /**
   * Total registry skills (basics + fusions) in skills.json.
   */
  totalRegistrySkills: number;

  // ------------------------------------------------------------------
  // Metric A: registry-internal connectivity (seeds = all basic nodes)
  // ------------------------------------------------------------------
  /**
   * Registry skills reachable when seeds = all basic nodes + game UI slugs.
   * On Yggdrasil II: 243/243 = 100%.
   */
  reachableCount: number;
  /**
   * % reachable from basic-node seeds (Metric A). On ygg2: 100.
   */
  internalConnectivityPct: number;
  /**
   * Registry skills NOT reachable from basic-node seeds. On ygg2: 0.
   */
  unreachableCount: number;

  // ------------------------------------------------------------------
  // Metric B: game-seed reachability (seeds = ONLY the 4 UI primitives)
  // ------------------------------------------------------------------
  /**
   * Registry skills reachable from { prompt, code, web, data } + seed bridges.
   * With A′ bridges: the 84 named-backed fusions + 5 unavoidable intermediates
   * + 71 root basics = 160 nodes total.
   */
  gameSeedReachableCount: number;
  /**
   * % reachable from game seeds + A′ bridges (Metric B). With bridges: > 17%.
   */
  gameSeedReachablePct: number;

  /** Back-compat alias for internalConnectivityPct (first PR iteration). */
  reachablePct: number;

  // ------------------------------------------------------------------
  // A′ named-backing metrics (primary DoD — Issue #86)
  // ------------------------------------------------------------------
  /**
   * Fusions reachable via named-skill backing: id ∈ namedSlugs OR id ∈ genericRefs.
   * Ground truth: 84. RATIFICATION R2.
   */
  namedBackedFusionCount: number;
  /**
   * Total deterministic fusion reach = namedBackedFusionCount + unavoidable
   * generic intermediates. Ground truth: 89 (84 + 5). RATIFICATION R4.
   * Reviewer transparency: 89 = 84 + 5-explained, NOT unexplained inflation.
   */
  deterministicFusionReachCount: number;
  /**
   * The unavoidable purely-generic fusions on the path to named targets.
   * Exactly 5 on ygg2 staging. Named explicitly for reviewer transparency.
   * Sorted alphabetically.
   */
  genericIntermediateFusions: string[];
  /**
   * Distinct named skills (slugs) backing the 84 named-backed fusions.
   * Primary DoD metric. Ground truth: 153. RATIFICATION R2 / R4.
   */
  reachableNamedSkillCount: number;

  /** The 4 game UI primitives used as Metric B seeds. */
  gameSeedSlugs: string[];
  /** All ids used as roots for Metric A: basicNodeIds + gameSeedSlugs. */
  seedSlugs: string[];
  generatedAt: string;
}

export interface BridgesOutput {
  report: ReachabilityReport;
  /** Sorted registry skill ids reachable from basic-node seeds (Metric A). */
  reachable: string[];
  /**
   * Per-fusion edges reachable from basic-node seeds.
   * Anti-bloat: ids only. Sorted by result id.
   */
  reachableEdges: ReachableEdge[];
  /**
   * Registry skills NOT reachable from basic-node seeds (Metric A gap).
   * On Yggdrasil II: empty.
   */
  unreachable: string[];
  /**
   * Registry skill ids reachable from game seeds + A′ seed bridges (Metric B).
   * With A′ bridges: the 84 named-backed + 5 intermediates + 71 root basics.
   */
  gameSeedReachable: string[];
  /**
   * Synthetic bridge edges: one per root basic in targetClosure.
   * Each routes a root basic to one of the 4 game seeds by deterministic rule
   * (lexical signal then char-code-sum mod 4 — see file header §4.1.1).
   * Sorted by result id.
   */
  seedBridges: SeedBridgeEdge[];
}

// ---------------------------------------------------------------------------
// Core: AND-reachability closure (stateless, no I/O — directly unit-testable)
// ---------------------------------------------------------------------------

/**
 * Builds the AND-reachable set from a seed set and a list of hyperedges.
 *
 * Each hyperedge { result, prereqs } fires when ALL prereqs are reachable.
 * Iterates to fixpoint (standard Datalog-style bottom-up evaluation).
 *
 * Stateless and dependency-free — unit tests call this directly with
 * tiny in-memory fixtures.
 */
export function computeReachability(
  seeds: string[],
  hyperedges: Array<{ result: string; prereqs: string[] }>,
): Set<string> {
  const reachable = new Set<string>(seeds);
  let changed = true;

  while (changed) {
    changed = false;
    for (const edge of hyperedges) {
      if (reachable.has(edge.result)) continue;
      if (edge.prereqs.every((p) => reachable.has(p))) {
        reachable.add(edge.result);
        changed = true;
      }
    }
  }

  return reachable;
}

// ---------------------------------------------------------------------------
// A′ bridge synthesis — pure, unit-testable, no I/O
// ---------------------------------------------------------------------------

/**
 * Computes the set of "named-backed" fusion ids from skills + named-index.
 *
 * A fusion is named-backed iff:
 *   its id ∈ named-skill slugs  (direct)
 *   OR its id ∈ {g of any named record}  (via genericSkillRef)
 *
 * Pure function — no I/O. Called by synthesizeSeedBridges and by the derive
 * pipeline. Used in tests directly.
 */
export function computeNamedBackedTargets(
  skills: Array<{ id: string; type: string }>,
  namedIndex: { skills: Record<string, { g?: string }> },
): Set<string> {
  const namedSlugs = new Set(Object.keys(namedIndex.skills));
  const genericRefs = new Set<string>();
  for (const rec of Object.values(namedIndex.skills)) {
    if (rec.g) genericRefs.add(rec.g);
  }

  const targets = new Set<string>();
  for (const skill of skills) {
    if (skill.type !== 'fusion') continue;
    if (namedSlugs.has(skill.id) || genericRefs.has(skill.id)) {
      targets.add(skill.id);
    }
  }
  return targets;
}

/**
 * Deterministic seed-routing for a root basic.
 *
 * Priority: lexical signal on the id first; stable char-code-sum mod 4 fallback.
 * Seeds sorted: ['code','data','prompt','web'] (index 0..3).
 *
 * ROUTING CONTRACT (documented here and in the file header):
 *   web/crawl/scrape/fetch → 'web'
 *   code/test/compile/debug → 'code'
 *   data/sql/embed/extract → 'data'
 *   else → char-code-sum mod 4 → sorted seed at that index
 *
 * This is a display/entry-point detail only — it does NOT change WHICH skills
 * are reachable, only the labelled entry path. Safe to be "arbitrary" but must
 * be deterministic and reproducible.
 */
function routeBasicToSeed(basicId: string): string {
  const id = basicId.toLowerCase();
  // Lexical signal checks (order matters for ties)
  if (/web|crawl|scrape|fetch/.test(id)) return 'web';
  if (/code|test|compil|debug/.test(id)) return 'code';
  if (/\bdata\b|sql|embed|extract/.test(id)) return 'data';
  // Stable fallback: sum of char codes mod 4 → index into sorted seeds
  const sortedSeeds = ['code', 'data', 'prompt', 'web'];
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return sortedSeeds[sum % 4];
}

/**
 * Synthesizes minimal seed bridge edges for the A′ (A-star) model.
 *
 * Algorithm (target-scoped closure — NOT root-basic flooding):
 *   1. Compute targetClosure = prerequisite closure of the 84 named-backed
 *      fusions over the fusion hyperedges.
 *   2. rootBasics = targetClosure ∩ basics (the atomic leaves, ~71).
 *   3. Emit one bridge per root basic: { result: basicId, prereqs: [seedId], via: 'seed-bridge' }
 *   4. Recompute Metric B with hyperedges ∪ bridges.
 *   5. FAIL-LOUD guard: fusion members of Metric B closure must ⊆ targetClosure.
 *
 * Returns the bridges array and the full Metric B closure.
 *
 * Pure function — no I/O. Throws on guard violation (fail-loud, mirrors
 * assertRegistryShape contract).
 *
 * @param seeds       Game seed slugs (the 4 UI primitives).
 * @param skills      Full skill list from skills.json.
 * @param hyperedges  Fusion hyperedges (inline + recipe).
 * @param namedIndex  Named-index map (slug → { g? }).
 */
export function synthesizeSeedBridges(
  seeds: string[],
  skills: Array<{ id: string; type: string }>,
  hyperedges: Array<{ result: string; prereqs: string[] }>,
  namedIndex: { skills: Record<string, { g?: string }> },
): { bridges: SeedBridgeEdge[]; gameSeedReachable: string[] } {
  // Step 1: named-backed targets
  const targets = computeNamedBackedTargets(skills, namedIndex);

  // Step 2: prerequisite closure of the 84 named-backed fusions
  // Walk backwards: collect every node required to build any target.
  const targetClosure = new Set<string>(targets);
  // We need a prereq map: fusionId → prereqs[]
  // (Use the first hyperedge matching each result, as the reachable-edge
  //  computation does; a fusion with multiple hyperedges is rare on ygg2.)
  const prereqMap = new Map<string, string[]>();
  for (const e of hyperedges) {
    if (!prereqMap.has(e.result)) prereqMap.set(e.result, e.prereqs);
  }

  // BFS/DFS to expand the closure
  const queue: string[] = [...targets];
  while (queue.length > 0) {
    const node = queue.pop()!;
    const prereqs = prereqMap.get(node);
    if (!prereqs) continue; // basic node or no known prereqs
    for (const p of prereqs) {
      if (!targetClosure.has(p)) {
        targetClosure.add(p);
        queue.push(p);
      }
    }
  }

  // Step 3: rootBasics = targetClosure ∩ basics
  const basicIds = new Set(skills.filter((s) => s.type === 'basic').map((s) => s.id));
  const rootBasics = [...targetClosure].filter((id) => basicIds.has(id)).sort();

  // Step 4: emit one synthetic bridge edge per root basic
  const bridges: SeedBridgeEdge[] = rootBasics.map((basicId) => ({
    result: basicId,
    prereqs: [routeBasicToSeed(basicId)],
    via: 'seed-bridge' as const,
  }));

  // Step 5: recompute Metric B closure with bridges
  // IMPORTANT: use only targetClosure-scoped edges, not ALL hyperedges.
  // This is the TARGET-SCOPED model from the plan: Metric B closure only
  // traverses edges whose result is in targetClosure. This prevents root-basic
  // flooding (where shared basics would unlock purely-generic fusions that
  // happen to share those same basics as prereqs).
  const targetScopedEdges = hyperedges.filter((e) => targetClosure.has(e.result));
  const allEdges: Array<{ result: string; prereqs: string[] }> = [
    ...targetScopedEdges,
    ...bridges,
  ];
  const reachableB = computeReachability(seeds, allEdges);

  // Step 6: FAIL-LOUD guard — no fusion outside targetClosure may be unlocked
  const fusionIds = new Set(
    skills.filter((s) => s.type === 'fusion').map((s) => s.id),
  );
  const violations: string[] = [];
  for (const id of reachableB) {
    if (fusionIds.has(id) && !targetClosure.has(id)) {
      violations.push(id);
    }
  }
  if (violations.length > 0) {
    throw new Error(
      `A′ bridge guard violation: seed bridges unlocked ${violations.length} fusion(s) ` +
        `outside the named-backed target closure. This means bridges are over-reaching ` +
        `into purely-generic fusions — REJECT.\n` +
        `Violations: ${violations.sort().join(', ')}`,
    );
  }

  // Registry skills reachable from Metric B (filter to known registry ids)
  const allRegistryIds = new Set(skills.map((s) => s.id));
  const gameSeedReachable = [...reachableB]
    .filter((id) => allRegistryIds.has(id))
    .sort();

  return { bridges, gameSeedReachable };
}

// ---------------------------------------------------------------------------
// Load data/craft files
// ---------------------------------------------------------------------------

function loadSkills(outDir: string): SkillEntry[] {
  const p = path.join(outDir, 'skills.json');
  if (!fs.existsSync(p)) {
    throw new Error(`skills.json not found at ${p} — run sync-skill-tree.ts first`);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8')) as SkillEntry[];
}

function loadNamedIndex(outDir: string): NamedIndex {
  const p = path.join(outDir, 'named-index.json');
  if (!fs.existsSync(p)) {
    throw new Error(`named-index.json not found at ${p} — run sync-skill-tree.ts first`);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8')) as NamedIndex;
}

interface RawRecipeEntry {
  pairKey: string;
  result: string;
  prereqs?: string[];
}

function loadRecipeEdges(outDir: string): Array<{ result: string; prereqs: string[] }> {
  const p = path.join(outDir, 'recipes.json');
  if (!fs.existsSync(p)) return [];
  const raw = JSON.parse(fs.readFileSync(p, 'utf8')) as RawRecipeEntry[];
  const edges: Array<{ result: string; prereqs: string[] }> = [];

  for (const entry of raw) {
    if (entry.pairKey === '' && Array.isArray(entry.prereqs) && entry.prereqs.length >= 2) {
      edges.push({ result: entry.result, prereqs: entry.prereqs });
    } else if (entry.pairKey && entry.pairKey.includes('+')) {
      const [a, b] = entry.pairKey.split('+');
      edges.push({ result: entry.result, prereqs: [a, b] });
    }
  }

  return edges;
}

// ---------------------------------------------------------------------------
// Derive
// ---------------------------------------------------------------------------

/**
 * Full derivation: loads data, runs both closure variants, builds output.
 *
 * Called by main() (standalone) AND by sync-skill-tree.ts (pass outDir: OUT_DIR)
 * so every sync auto-regenerates the report in the same output directory.
 *
 * @param options.outDir              Data/craft dir to read from and write to.
 *                                    Defaults to GAIA_CRAFT_OUT_DIR env or data/craft/.
 * @param options.skillsOverride      Override skills array (unit tests only).
 * @param options.edgesOverride       Override hyperedges (unit tests only).
 * @param options.namedIndexOverride  Override named-index (unit tests only).
 * @param options.write               Set false to skip writing bridges.json (unit tests).
 */
export function deriveReachability(options?: {
  outDir?: string;
  skillsOverride?: SkillEntry[];
  edgesOverride?: Array<{ result: string; prereqs: string[] }>;
  namedIndexOverride?: NamedIndex;
  write?: boolean;
}): BridgesOutput {
  const opts = options ?? {};
  const write = opts.write !== undefined ? opts.write : true;
  const targetDir = opts.outDir ?? DEFAULT_OUT_DIR;

  const skills: SkillEntry[] = opts.skillsOverride ?? loadSkills(targetDir);
  const namedIndex: NamedIndex = opts.namedIndexOverride ?? loadNamedIndex(targetDir);
  const recipeEdges = opts.edgesOverride ?? loadRecipeEdges(targetDir);

  // --------------------------------------------------------------------------
  // Build shared hyperedge list (inline fusion prereqs union recipe edges)
  // --------------------------------------------------------------------------

  const inlineEdges: Array<{ result: string; prereqs: string[] }> = [];
  for (const skill of skills) {
    if (skill.type === 'fusion' && Array.isArray(skill.prerequisites) && skill.prerequisites.length > 0) {
      inlineEdges.push({ result: skill.id, prereqs: skill.prerequisites });
    }
  }

  const edgeMap = new Map<string, Set<string>[]>();
  for (const e of inlineEdges) {
    if (!edgeMap.has(e.result)) edgeMap.set(e.result, []);
    edgeMap.get(e.result)!.push(new Set(e.prereqs));
  }
  for (const e of recipeEdges) {
    if (!edgeMap.has(e.result)) edgeMap.set(e.result, []);
    const existing = edgeMap.get(e.result)!;
    const setKey = [...e.prereqs].sort().join('+');
    const isDuplicate = existing.some((s) => [...s].sort().join('+') === setKey);
    if (!isDuplicate) existing.push(new Set(e.prereqs));
  }

  const hyperedges: Array<{ result: string; prereqs: string[] }> = [];
  for (const [result, prereqSets] of edgeMap) {
    for (const s of prereqSets) {
      hyperedges.push({ result, prereqs: [...s] });
    }
  }

  // --------------------------------------------------------------------------
  // Metric A: from basic-node roots (internal connectivity)
  // --------------------------------------------------------------------------

  const basicIds = skills.filter((s) => s.type === 'basic').map((s) => s.id);
  const seedsA: string[] = [...new Set([...GAME_SEED_SLUGS, ...basicIds])];
  const reachableSetA = computeReachability(seedsA, hyperedges);

  // --------------------------------------------------------------------------
  // Metric B: A′ seed bridges (target-scoped closure)
  // --------------------------------------------------------------------------

  const { bridges: seedBridges, gameSeedReachable: gameSeedReachableIds } =
    synthesizeSeedBridges(GAME_SEED_SLUGS, skills, hyperedges, namedIndex);

  // --------------------------------------------------------------------------
  // A′ named-backing metrics
  // --------------------------------------------------------------------------

  const targets = computeNamedBackedTargets(skills, namedIndex);
  const namedBackedFusionCount = targets.size;

  // Distinct named skills backing those fusions
  const namedSlugs = Object.keys(namedIndex.skills);
  const reachableNamedSkillCount = namedSlugs.filter((slug) => {
    const g = namedIndex.skills[slug].g;
    return targets.has(slug) || (g !== undefined && targets.has(g));
  }).length;

  // Generic intermediate fusions = fusions in gameSeedReachable that are NOT named-backed
  const gameSeedReachableSet = new Set(gameSeedReachableIds);
  const fusionIdsSet = new Set(skills.filter((s) => s.type === 'fusion').map((s) => s.id));
  const genericIntermediateFusions = gameSeedReachableIds
    .filter((id) => fusionIdsSet.has(id) && !targets.has(id))
    .sort();

  const deterministicFusionReachCount = namedBackedFusionCount + genericIntermediateFusions.length;

  // --------------------------------------------------------------------------
  // Build outputs
  // --------------------------------------------------------------------------

  const allIds = skills.map((s) => s.id);
  const totalRegistrySkills = allIds.length;

  const reachableIds = allIds.filter((id) => reachableSetA.has(id)).sort();
  const unreachableIds = allIds.filter((id) => !reachableSetA.has(id)).sort();
  const reachableCount = reachableIds.length;
  const unreachableCount = unreachableIds.length;
  const internalConnectivityPct =
    totalRegistrySkills > 0
      ? Math.round((reachableCount / totalRegistrySkills) * 1000) / 10
      : 0;

  const gameSeedReachableCount = gameSeedReachableIds.length;
  const gameSeedReachablePct =
    totalRegistrySkills > 0
      ? Math.round((gameSeedReachableCount / totalRegistrySkills) * 1000) / 10
      : 0;

  const reachableEdges: ReachableEdge[] = [];
  for (const [result, prereqSets] of edgeMap) {
    if (!reachableSetA.has(result)) continue;
    for (const s of prereqSets) {
      const prereqs = [...s];
      if (prereqs.every((p) => reachableSetA.has(p))) {
        reachableEdges.push({ result, prereqs: prereqs.sort() });
        break;
      }
    }
  }
  reachableEdges.sort((a, b) => a.result.localeCompare(b.result));

  const report: ReachabilityReport = {
    totalRegistrySkills,
    reachableCount,
    internalConnectivityPct,
    unreachableCount,
    gameSeedReachableCount,
    gameSeedReachablePct,
    reachablePct: internalConnectivityPct,
    namedBackedFusionCount,
    deterministicFusionReachCount,
    genericIntermediateFusions,
    reachableNamedSkillCount,
    gameSeedSlugs: GAME_SEED_SLUGS.slice().sort(),
    seedSlugs: seedsA.slice().sort(),
    generatedAt: new Date().toISOString().slice(0, 10),
  };

  // Sort seedBridges by result id for reviewable diffs
  const sortedSeedBridges = [...seedBridges].sort((a, b) => a.result.localeCompare(b.result));

  const output: BridgesOutput = {
    report,
    reachable: reachableIds,
    reachableEdges,
    unreachable: unreachableIds,
    gameSeedReachable: gameSeedReachableIds,
    seedBridges: sortedSeedBridges,
  };

  if (write) {
    fs.mkdirSync(targetDir, { recursive: true });
    const bridgesPath = path.join(targetDir, 'bridges.json');
    fs.writeFileSync(bridgesPath, JSON.stringify(output, null, 2), 'utf8');
    const bytes = fs.statSync(bridgesPath).size;
    console.log(
      `✅ Wrote bridges.json` +
        ` (internal: ${reachableCount}/${totalRegistrySkills} = ${internalConnectivityPct}%` +
        ` | game-seeds: ${gameSeedReachableCount}/${totalRegistrySkills} = ${gameSeedReachablePct}%` +
        `, ${(bytes / 1024).toFixed(2)} KB)`,
    );
    if (unreachableCount > 0) {
      console.log(`   ⚠ ${unreachableCount} skills unreachable even from basic roots — FOUNDER GATE`);
    }
  }

  return output;
}

// ---------------------------------------------------------------------------
// Main (standalone invocation)
// ---------------------------------------------------------------------------

function main() {
  console.log('🔭 Gaia Skill Tree — reachability derivation starting (A′ bridge synthesis)...');
  const result = deriveReachability();
  const r = result.report;
  console.log('\n📊 Reachability report (two distinct metrics):');
  console.log(
    `   Metric A — internal connectivity (seeds = basic nodes):` +
      ` ${r.reachableCount}/${r.totalRegistrySkills} = ${r.internalConnectivityPct}%`,
  );
  console.log(
    `   Metric B — game-seed reachability (seeds = /prompt /code /web /data + A′ bridges):` +
      ` ${r.gameSeedReachableCount}/${r.totalRegistrySkills} = ${r.gameSeedReachablePct}%`,
  );
  console.log('\n⭐ A′ named-backing metrics (primary DoD — Issue #86):');
  console.log(`   reachableNamedSkillCount:      ${r.reachableNamedSkillCount}  (target: 153)`);
  console.log(`   namedBackedFusionCount:        ${r.namedBackedFusionCount}  (target: 84)`);
  console.log(`   deterministicFusionReachCount: ${r.deterministicFusionReachCount}  (target: 89 = 84 + 5)`);
  console.log(`   genericIntermediateFusions:    [${r.genericIntermediateFusions.join(', ')}]`);
  console.log(`   seedBridges emitted:           ${result.seedBridges.length}  (target: 71 root basics)`);
  console.log('\n✨ Reachability derivation complete!');
}

if (
  process.argv[1] === __filename ||
  process.argv[1].endsWith('derive-reachability.ts') ||
  process.argv[1].endsWith('derive-reachability.js')
) {
  main();
}
