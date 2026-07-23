// READ-ONLY on gaia-skill-tree. Never writes there.
//
// scripts/craft/derive-reachability.ts
//
// Derives build-time fusion reachability from the Gaia Skill Tree registry.
//
// Reads:
//   data/craft/skills.json  — array of { id, name, type, prerequisites? }
//                             (prerequisites carries inline fusion prereqs
//                              per Plan A / Yggdrasil II sync hardening)
//   data/craft/recipes.json — array of Recipe | MultiPrereqEntry
//                              (included as additional hyperedges; empty on ygg2
//                               but retained for forward compatibility)
//
// Writes:
//   data/craft/bridges.json — see BridgesOutput shape below.
//
// ---------------------------------------------------------------------------
// TWO DISTINCT REACHABILITY METRICS — both reported, neither faked
// ---------------------------------------------------------------------------
//
// These are two different questions. Do NOT conflate them. The PR surfaces
// both explicitly so the founder can make an informed decision (see §2.5
// in the plan, "genuine-gap decision — HUMAN GATE").
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
//   IDs in skills.json. Starting from ONLY these 4 IDs, what % of registry
//   skills are reachable through the fusion graph?
//   On Yggdrasil II: 0/243 = 0% (no fusion prereq references a game seed ID).
//   This is the metric #86 targets: "meaningfully higher than today's ~17%."
//   (The old 17% was from hand-authored starter-recipes.ts combos, not the
//    registry fusion graph — but the spirit of #86 is this question.)
//   → report.gameSeedReachableCount / report.gameSeedReachablePct
//
// FOUNDER GATE: #86 asks for coverage "meaningfully higher than today's ~17%"
//   measured from the game seeds. The honest Metric B answer on ygg2 is 0%.
//   The 100% Metric A proves the registry graph is internally connected —
//   but it measures a different thing (internal connectivity, not game-seed
//   reachability). Decision needed before merge:
//     Option A: synthesize derived bridges from game seeds into the registry
//               (auto-generate shortest seed→registry path for each basic node).
//     Option B: accept 0% as the deterministic registry answer; let organic
//               emergent discovery (#87) cover the gap.
//   → Do NOT auto-resolve in code. Surface in PR, get explicit yes/no.
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
   * Registry skills reachable from { prompt, code, web, data } ONLY.
   * On Yggdrasil II: 0 (no fusion prereq references a game-seed ID).
   * This is the metric #86 targets ("meaningfully higher than ~17%").
   *
   * FOUNDER GATE: current value 0% on ygg2. Explicit decision required
   * before merge: synthesize bridges from game seeds, or accept emergent-only?
   */
  gameSeedReachableCount: number;
  /**
   * % reachable from game seeds only (Metric B). Honest value on ygg2: 0%.
   */
  gameSeedReachablePct: number;

  /** Back-compat alias for internalConnectivityPct (first PR iteration). */
  reachablePct: number;

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
   * Registry skill ids reachable from game seeds ONLY (Metric B).
   * On Yggdrasil II: empty (0%). The honest game-seed coverage number.
   */
  gameSeedReachable: string[];
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
// Load data/craft files
// ---------------------------------------------------------------------------

function loadSkills(outDir: string): SkillEntry[] {
  const p = path.join(outDir, 'skills.json');
  if (!fs.existsSync(p)) {
    throw new Error(`skills.json not found at ${p} — run sync-skill-tree.ts first`);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8')) as SkillEntry[];
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
 * @param options.outDir          Data/craft dir to read from and write to.
 *                                Defaults to GAIA_CRAFT_OUT_DIR env or data/craft/.
 * @param options.skillsOverride  Override skills array (unit tests only).
 * @param options.edgesOverride   Override hyperedges (unit tests only).
 * @param options.write           Set false to skip writing bridges.json (unit tests).
 */
export function deriveReachability(options?: {
  outDir?: string;
  skillsOverride?: SkillEntry[];
  edgesOverride?: Array<{ result: string; prereqs: string[] }>;
  write?: boolean;
}): BridgesOutput {
  const opts = options ?? {};
  const write = opts.write !== undefined ? opts.write : true;
  const targetDir = opts.outDir ?? DEFAULT_OUT_DIR;

  const skills: SkillEntry[] = opts.skillsOverride ?? loadSkills(targetDir);
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
  // Metric B: from game seeds only
  // --------------------------------------------------------------------------

  const reachableSetB = computeReachability(GAME_SEED_SLUGS, hyperedges);

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

  const gameSeedReachableIds = allIds.filter((id) => reachableSetB.has(id)).sort();
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
    gameSeedSlugs: GAME_SEED_SLUGS.slice().sort(),
    seedSlugs: seedsA.slice().sort(),
    generatedAt: new Date().toISOString().slice(0, 10),
  };

  const output: BridgesOutput = {
    report,
    reachable: reachableIds,
    reachableEdges,
    unreachable: unreachableIds,
    gameSeedReachable: gameSeedReachableIds,
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
    if (gameSeedReachableCount === 0) {
      console.log(
        `   ⚠ FOUNDER GATE (Metric B = DoD target): 0/${totalRegistrySkills} registry skills` +
          ` reachable from game seeds. #86 targets >17%. Decision needed before merge.`,
      );
    }
  }

  return output;
}

// ---------------------------------------------------------------------------
// Main (standalone invocation)
// ---------------------------------------------------------------------------

function main() {
  console.log('🔭 Gaia Skill Tree — reachability derivation starting...');
  const result = deriveReachability();
  const r = result.report;
  console.log('\n📊 Reachability report (two distinct metrics):');
  console.log(
    `   Metric A — internal connectivity (seeds = basic nodes):` +
      ` ${r.reachableCount}/${r.totalRegistrySkills} = ${r.internalConnectivityPct}%`,
  );
  console.log(
    `   Metric B — game-seed reachability (seeds = /prompt /code /web /data only):` +
      ` ${r.gameSeedReachableCount}/${r.totalRegistrySkills} = ${r.gameSeedReachablePct}%`,
  );
  console.log(
    `\n   ⚠ FOUNDER GATE: #86 DoD target is Metric B > 17%.` +
      ` Current: ${r.gameSeedReachablePct}%.`,
  );
  if (r.gameSeedReachablePct === 0) {
    console.log('     Option A: synthesize derived bridges from game seeds into the registry graph.');
    console.log('     Option B: accept as emergent-only (#87) and document the boundary.');
    console.log('     Explicit yes/no required before merge.');
  }
  console.log('\n✨ Reachability derivation complete!');
}

if (
  process.argv[1] === __filename ||
  process.argv[1].endsWith('derive-reachability.ts') ||
  process.argv[1].endsWith('derive-reachability.js')
) {
  main();
}
