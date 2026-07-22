// READ-ONLY on gaia-skill-tree. Never writes there.
//
// scripts/craft/sync-skill-tree.ts
//
// Reads the Gaia Skill Tree registry and generates:
//   data/craft/skills.json  — array of { id, name, contributor?, slug?, type }
//   data/craft/recipes.json — array of Recipe objects (2-prereq canonical fusions)
//                             plus multi-prereq entries with `prereqs` array
//   data/craft/named-index.json — LEAN-BUT-RICH slug -> { c, t, g?, d, lvl? } map
//                             (+ unlinked slugs + a derived slugToContributor for
//                             backward-compat) built from
//                             registry/named/<contributor>/<slug>.md frontmatter.
//                             GROUND TRUTH: we store the real registry title (t) and
//                             description (d) so canonical unlocks read as unmistakably
//                             real skills. Anti-bloat: we still store ONLY slug+contributor
//                             for linking and derive skill-tree URLs on the fly, never
//                             full paths per fusion.
//   data/craft/contributors.json — TINY handle->count roster powering the Builders
//                             collection (the contributor "Pokédex"). Shape:
//                             { total, contributors: { <handle>: { count } } } where
//                             count = how many NAMED skills that contributor authored.
//                             Handles + counts ONLY (no titles/urls) — derived from the
//                             same named/ walk as named-index.json.
//
// ---------------------------------------------------------------------------
// Registry schema assumptions — Yggdrasil II (post gaia-skill-tree PR #1185)
// ---------------------------------------------------------------------------
// ⚠️ LANDING GATE — do not merge this branch's PR until BOTH:
//   1. gaia-skill-tree PR #1185 ("Yggdrasil II — staging integration") has
//      actually merged into gaia-skill-tree `main`, and
//   2. a human has reviewed the regenerated data/craft/*.json diff against the
//      real post-merge registry.
//   See docs/plans/epic-89-sub-85-registry-sync-repair-plan-v2-yggdrasil2.md §8.
//   Until #1185 merges, gaia-skill-tree `main` still has the OLD `extra`/
//   `ultimate` layout — running this script against it is expected to abort
//   via the pre-migration layout guard in assertRegistryShape() below, not
//   silently regenerate near-empty/wrong data.
//
// These are the load-bearing assumptions this script makes about the upstream
// registry shape. If any of these ever changes, assertRegistryShape() below is
// designed to abort the sync loudly (before writing output) rather than
// silently regenerate near-empty data. Update this comment when you touch the
// mapping so the next migration is easy to spot.
//
//   - registry/nodes/{basic,fusion}/*.json — generic skill nodes. Yggdrasil II
//     consolidated the old `extra`/`ultimate` tiers into a single `fusion`
//     tier (node `type` field is now `"fusion"`, was `"extra"`/`"ultimate"`).
//     `basic/` is unchanged. Each file: { id, name, type, prerequisites: [] }.
//     We deliberately do NOT support the old dual layout — this branch targets
//     the post-migration schema only (see the landing-gate note above).
//   - registry/combinations.md — NO LONGER READ. On Yggdrasil II this file is
//     an emptied 95-byte header-only stub (and is slated for outright deletion
//     upstream). Fusion recipes are instead derived directly from each fusion
//     node's own `"prerequisites": [...]` array (verified byte-identical field
//     across the old and new schema — see plan §2a) via deriveRecipes() below.
//   - registry/named/<contributor>/<slug>.md — THE authoritative named-skill
//     source (superseded the deleted registry/named-skills.json). YAML
//     frontmatter per file, contract in registry/schema/namedSkill.schema.json.
//     Required frontmatter fields we read: id ("contributor/slug"), name,
//     contributor, genericSkillRef, description, level ("N★"), origin;
//     optional: title (reviewer epithet, only on status: named). Yggdrasil II
//     adds `metaEpoch`/`migrationBatch` fields, but only inside timeline
//     entries we never read — purely additive, non-breaking.
//   - genericSkillRef reverse-map — named skills declare
//     `genericSkillRef: <fusion-node-id>` in frontmatter. A fusion node's
//     recipe result/contributor/slug are recovered by reverse-mapping its id
//     through this field (see buildGenericRefMap()/deriveRecipes() below and
//     plan §3). When a fusion node has NO named ref, the recipe is generic
//     (result = slug = the node's own id, contributor omitted).
//   - registry/real-skills.json — a DIFFERENT, staler provenance catalog
//     (source-repo items, not the named registry). Deliberately NOT used as a
//     source here — see docs/plans/epic-89-sub-85-registry-sync-repair-plan.md §2.
//
// Run: npx tsx scripts/craft/sync-skill-tree.ts
// Env: GAIA_SKILL_TREE_REGISTRY — override the registry root (used by CI, which
//      checks out gaia-skill-tree at an arbitrary path, not a fixed sibling
//      depth). FORCE_RESYNC=1 — bypass the delta-guard sanity assertion (see
//      assertRegistryShape below); use only when a real, reviewed registry
//      contraction is expected.

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { pairKey } from '../../lib/craft/types';
import type { Recipe } from '../../lib/craft/types';

// ---------------------------------------------------------------------------
// Config — path to sibling gaia-skill-tree checkout (READ-ONLY)
// ---------------------------------------------------------------------------

const REGISTRY_ROOT =
  process.env.GAIA_SKILL_TREE_REGISTRY ??
  path.resolve(__dirname, '../../../../../../gaia-skill-tree/registry');
const OUT_DIR = path.resolve(__dirname, '../../data/craft');

// ---------------------------------------------------------------------------
// Types for generated outputs
// ---------------------------------------------------------------------------

interface SkillEntry {
  id: string;
  /** Slash-style display name, e.g. /api-call */
  name: string;
  /** Human-readable name from registry JSON, e.g. "Hypothesis Generation" */
  displayName: string;
  type: 'basic' | 'fusion';
  contributor?: string;
  slug?: string;
  /**
   * Node's own `prerequisites` array (raw slugs), read straight off the
   * registry JSON. INTERNAL ONLY — used by deriveRecipes(); never written to
   * skills.json (kept out of skillsOut's mapped shape below).
   */
  prerequisites?: string[];
}

interface MultiPrereqRecipe {
  pairKey: string;           // empty string — sentinel for "multi"
  result: string;
  emoji: string;
  blurb: string;
  prereqs: string[];          // all prereq slugs
  contributor?: string;
  slug?: string;
}

/**
 * A single lean-but-rich named-skill record keyed by slug. Field names are
 * short on purpose (this map is shipped in the client bundle) but every value
 * is GROUND TRUTH copied verbatim from registry/named/<contributor>/<slug>.md
 * frontmatter.
 */
interface NamedSkillRecord {
  /** contributor handle, e.g. "garrytan". */
  c: string;
  /** real registry title, e.g. "Gstack Scrape — Structured Web Extraction". */
  t: string;
  /** genericSkillRef, e.g. "web-scrape" (optional — omitted when absent). */
  g?: string;
  /** real registry description (what the skill DOES). */
  d: string;
  /** level badge, e.g. "2★" (optional — omitted when absent). */
  lvl?: string;
}

/**
 * Lean-but-rich named-skill index emitted to data/craft/named-index.json.
 *
 * Contract: `skills[slug]` holds the GROUND-TRUTH registry title + description +
 * contributor for every REAL Gaia Skill Tree skill, so canonical fusions can
 * present the real skill rather than invented text. We still derive the
 * skill-tree deep-link on the fly via `skillTreeUrl(contributor, slug)` — we
 * NEVER store a full URL or path per fusion result (anti-bloat).
 *
 * `slugToContributor` is a DERIVED convenience projection kept for backward
 * compatibility with existing consumers that only need the contributor handle.
 */
interface NamedIndex {
  /** ISO date the index was generated. */
  generatedAt: string;
  /** slug -> rich record (contributor + real title/description/genericSkillRef/level). */
  skills: Record<string, NamedSkillRecord>;
  /**
   * DERIVED slug -> contributor handle projection. Kept so existing consumers
   * (route promotion path, tests) keep working without reaching into `skills`.
   */
  slugToContributor: Record<string, string>;
  /**
   * Known skill slugs that have NO usable contributor (e.g. redacted ████████).
   * Kept so consumers can still recognise the slug as "real" even without a link.
   */
  unlinkedSlugs: string[];
}

/**
 * TINY handle -> count roster emitted to data/craft/contributors.json — the
 * data behind the Builders collection (a contributor "Pokédex"). `count` is how
 * many NAMED skills a contributor authored across all buckets. Redacted
 * contributors are excluded (same rule as the named index). We store handles +
 * counts ONLY — no titles, no URLs — so the shipped file stays minimal.
 */
interface ContributorRoster {
  /** Number of distinct contributor handles with at least one named skill. */
  total: number;
  /** handle -> { count } where count = named-skill authorship count. */
  contributors: Record<string, { count: number }>;
}

/** Reverse-map target: the named skill a fusion node's `genericSkillRef` resolves to. */
interface GenericRefTarget {
  contributor: string;
  slug: string;
}

// ---------------------------------------------------------------------------
// Step 1: Load all node JSON files from basic / fusion
// ---------------------------------------------------------------------------

function loadNodes(): SkillEntry[] {
  // Post-migration layout ONLY (Yggdrasil II) — see the header comment's
  // landing-gate note. No `extra`/`ultimate`/`unique` fallback; a pre-migration
  // checkout is caught loudly by the assertRegistryShape() guard instead of
  // silently producing a near-empty basic-only regen.
  const tiers: Array<'basic' | 'fusion'> = ['basic', 'fusion'];
  const entries: SkillEntry[] = [];

  for (const tier of tiers) {
    const dir = path.join(REGISTRY_ROOT, 'nodes', tier);
    if (!fs.existsSync(dir)) {
      console.warn(`⚠ Directory not found: ${dir} — skipping`);
      continue;
    }
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const node = JSON.parse(raw) as {
          id: string;
          name: string;
          type?: string;
          prerequisites?: string[];
        };
        const id = node.id ?? path.basename(file, '.json');
        const name = node.name ?? id;
        entries.push({
          id,
          name: `/${id}`,   // slash-style
          displayName: name,
          type: tier,
          prerequisites: Array.isArray(node.prerequisites) ? node.prerequisites : [],
        });
      } catch (e) {
        console.warn(`⚠ Failed to parse ${file}: ${e}`);
      }
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Step 2: Load and assign emojis — use emoji-map.json if available
// ---------------------------------------------------------------------------

function loadEmojiMap(): Record<string, string> {
  const emojiPath = path.join(OUT_DIR, 'emoji-map.json');
  if (fs.existsSync(emojiPath)) {
    try {
      return JSON.parse(fs.readFileSync(emojiPath, 'utf8')) as Record<string, string>;
    } catch {
      // ignore parse errors — fall back to hardcoded defaults
    }
  }
  return {};
}

const EMOJI_DEFAULTS: Record<string, string> = {
  'api-call': '⚡',
  'chain-of-thought': '🧠',
  'browser-control': '🌐',
  'code-execution': '💻',
  'web-search': '🔍',
  'summarize': '📝',
  'classify': '🏷️',
  'extract-entities': '🔬',
  'code-generation': '⚙️',
  'evaluate-output': '⚖️',
  'plan-decompose': '🗺️',
  'tool-use': '🔧',
  'translate': '🌍',
  'generate-text': '✍️',
  'embed-text': '🧩',
  'retrieve': '📥',
  'parse-json': '📋',
  'parse-html': '🏗️',
  'format-output': '🖨️',
  'diff-content': '🔀',
  'refactor-code': '🔄',
  'generate-sql': '🗃️',
  'sentiment-analysis': '💭',
  'question-answer': '💬',
  'memory-manage': '🗄️',
  'route-intent': '🎯',
  'parallel-execution': '⚡⚡',
  'document-editing': '📄',
  'requirements-analysis': '📊',
  'error-interpretation': '🚨',
  'self-critique': '🪞',
  'structured-output': '📐',
  'tool-select': '🧰',
  'math-reason': '🔢',
  'logical-inference': '🔗',
  'research': '🔭',
  'write-report': '📊',
  'autonomous-web-research': '🕷️',
  'code-review-pipeline': '👁️',
  'automated-testing': '🧪',
  'browser-automation': '🤖',
  'workflow-automation': '⚙️',
  'parse-pdf': '📑',
  'image-generate': '🎨',
  'speech-to-text': '🎤',
  'text-to-speech': '🔊',
  'vector-search': '🔭',
  'knowledge-graph-construction': '🕸️',
  'security-audit': '🔐',
  'statistical-analysis': '📈',
  'hypothesis-generate': '💡',
  'swarm-topology-management': '🐝',
  'worker-agent-dispatch': '👷',
  'context-compression': '🗜️',
  'computer-use': '🖥️',
};

/** Look up emoji for a skill slug. Checks emoji-map.json first, then hardcoded defaults. */
function makeGetEmoji(emojiMap: Record<string, string>) {
  return function getEmoji(slug: string): string {
    // Slash-style lookup
    if (emojiMap[`/${slug}`]) return emojiMap[`/${slug}`];
    // Plain slug in defaults
    if (EMOJI_DEFAULTS[slug]) return EMOJI_DEFAULTS[slug];
    return '✨';
  };
}

// ---------------------------------------------------------------------------
// Step 3: Build recipe blurb from result skill name
// ---------------------------------------------------------------------------

function makeBlurb(resultSlug: string, prereqSlugs: string[]): string {
  const prereqNames = prereqSlugs.map(p => `/${p}`).join(' + ');
  return `Fuse ${prereqNames} to unlock /${resultSlug}.`;
}

// ---------------------------------------------------------------------------
// Step 4: Named-skill source — registry/named/<contributor>/<slug>.md
//
// READ-ONLY on gaia-skill-tree. One YAML-frontmatter file per named skill.
// Frontmatter fields are GROUND TRUTH, copied verbatim (clamped for bundle
// size) so canonical unlocks read as real skills. There are no redacted
// (████████) directories in the .md source today, but the unlinkedSlugs field
// is kept for shape/back-compat and always emitted as [] here.
// ---------------------------------------------------------------------------

function isRedacted(s: string | undefined): boolean {
  return !!s && /█/.test(s);
}

/** Trims + clamps a free-text registry field to a bundle-friendly length. */
function cleanText(raw: unknown, max: number): string {
  if (typeof raw !== 'string') return '';
  const t = raw.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max).trimEnd() : t;
}

/** The frontmatter fields we actually consume from a named-skill .md file. */
interface NamedFrontmatter {
  id?: string;
  name?: string;
  contributor?: string;
  origin?: boolean;
  genericSkillRef?: string;
  status?: string;
  title?: string;
  level?: string;
  description?: string;
}

/**
 * Slice the `---\n...\n---` YAML frontmatter block off the top of a markdown
 * file and parse it. Returns `undefined` if the file has no frontmatter block
 * or the block fails to parse (caller should warn + skip, never throw here —
 * a single malformed file shouldn't abort the whole sync; the global sanity
 * gate in assertRegistryShape() is what catches a systemic shape change).
 */
function parseFrontmatter(raw: string): NamedFrontmatter | undefined {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return undefined;
  try {
    const doc = yaml.load(match[1]);
    return (doc && typeof doc === 'object' ? doc : undefined) as NamedFrontmatter | undefined;
  } catch {
    return undefined;
  }
}

/** One parsed named-skill source file, ready to feed the index + roster + genericRef builders. */
interface NamedSkillFile {
  /** Contributor handle, taken from the directory name (== frontmatter contributor). */
  contributor: string;
  /** Skill slug, taken from the filename (basename, no `.md`). */
  slug: string;
  frontmatter: NamedFrontmatter;
}

/**
 * Walk `REGISTRY_ROOT/named/<contributor>/<slug>.md`, sorted contributor dirs
 * then sorted filenames (deterministic across runs), parsing frontmatter for
 * each file. Shared by buildNamedIndex(), buildContributorRoster(), and
 * buildGenericRefMap() so none of the three can ever drift on what counts as
 * "one named skill" or on walk order.
 */
function listNamedSkillFiles(): NamedSkillFile[] {
  const namedRoot = path.join(REGISTRY_ROOT, 'named');
  const files: NamedSkillFile[] = [];

  if (!fs.existsSync(namedRoot)) {
    console.warn(`⚠ named/ directory not found at: ${namedRoot} — emitting empty file list`);
    return files;
  }

  const contributorDirs = fs
    .readdirSync(namedRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const contributor of contributorDirs) {
    if (isRedacted(contributor)) continue;
    const dir = path.join(namedRoot, contributor);
    const mdFiles = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .sort();

    for (const file of mdFiles) {
      const slug = path.basename(file, '.md');
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const frontmatter = parseFrontmatter(raw);
        if (!frontmatter) {
          console.warn(`⚠ No parseable frontmatter in ${contributor}/${file} — skipping`);
          continue;
        }
        // The id field, when present, is the authoritative "<contributor>/<slug>"
        // pair. It should agree with the on-disk location; warn (don't abort a
        // single file) if it doesn't — the global sanity gate catches systemic drift.
        if (frontmatter.id) {
          const idSlug = frontmatter.id.split('/')[1];
          if (idSlug && idSlug !== slug) {
            console.warn(
              `⚠ ${contributor}/${file}: frontmatter id "${frontmatter.id}" disagrees ` +
                `with filename slug "${slug}" — using filename`,
            );
          }
        }
        files.push({ contributor, slug, frontmatter });
      } catch (e) {
        console.warn(`⚠ Failed to read/parse ${contributor}/${file}: ${e} — skipping`);
      }
    }
  }

  return files;
}

/**
 * Generic collision-resolution reducer shared by buildNamedIndex() (keyed by
 * skill slug) and buildGenericRefMap() (keyed by genericSkillRef) — identical
 * policy so the two can never disagree: first file wins in walk order
 * (contributor asc, then slug asc — see listNamedSkillFiles()), UNLESS a
 * later file has `origin: true` and the currently-held winner does not, in
 * which case the origin file takes over.
 */
function reduceByKeyPreferOrigin<T>(
  files: NamedSkillFile[],
  keyOf: (f: NamedSkillFile) => string | undefined,
  valueOf: (f: NamedSkillFile) => T,
): Map<string, T> {
  const result = new Map<string, T>();
  const keyIsOrigin = new Map<string, boolean>();

  for (const file of files) {
    const key = keyOf(file);
    if (!key) continue;
    const isOrigin = file.frontmatter.origin === true;

    if (!result.has(key) || (isOrigin && !keyIsOrigin.get(key))) {
      result.set(key, valueOf(file));
      keyIsOrigin.set(key, isOrigin);
    }
  }

  return result;
}

function buildNamedIndex(files: NamedSkillFile[]): NamedIndex {
  const index: NamedIndex = {
    generatedAt: new Date().toISOString().slice(0, 10),
    skills: {},
    slugToContributor: {},
    unlinkedSlugs: [],
  };

  const winners = reduceByKeyPreferOrigin(files, (f) => f.slug, (f) => f);

  for (const [slug, file] of winners) {
    const { contributor, frontmatter } = file;
    const fmContributor = cleanText(frontmatter.contributor, 60) || contributor;
    const title =
      cleanText(frontmatter.title, 120) || cleanText(frontmatter.name, 120) || slug;
    const description = cleanText(frontmatter.description, 260);
    const genericSkillRef = cleanText(frontmatter.genericSkillRef, 60);
    const level = cleanText(frontmatter.level, 8);

    const record: NamedSkillRecord = { c: fmContributor, t: title, d: description };
    if (genericSkillRef) record.g = genericSkillRef;
    if (level) record.lvl = level;
    index.skills[slug] = record;
    index.slugToContributor[slug] = fmContributor;
  }

  // No redacted directories exist in the .md source today; keep the field for
  // shape/back-compat.
  index.unlinkedSlugs = [];

  return index;
}

/**
 * Build the TINY contributor roster (handle -> named-skill count) for the
 * Builders collection. Reads the SAME named/ walk as buildNamedIndex but
 * counts EVERY named-skill .md file a contributor authored (not deduped by
 * slug), so `sum(count) === file count`. Redacted contributors are skipped so
 * no ████████ handle can ever leak into the client bundle (none exist in the
 * .md source today, but the guard is kept).
 */
function buildContributorRoster(files: NamedSkillFile[]): ContributorRoster {
  const roster: ContributorRoster = { total: 0, contributors: {} };

  for (const { contributor, frontmatter } of files) {
    const handle = cleanText(frontmatter.contributor, 60) || contributor;
    if (!handle || isRedacted(handle)) continue;
    roster.contributors[handle] ??= { count: 0 };
    roster.contributors[handle].count += 1;
  }

  roster.total = Object.keys(roster.contributors).length;
  return roster;
}

/**
 * Build the `genericSkillRef -> {contributor, slug}` reverse-map (plan §3c):
 * named skills declare `genericSkillRef: <fusion-node-id>` in frontmatter;
 * this inverts that relation so deriveRecipes() can recover the attributed
 * named skill for a generic fusion node. Uses the exact same walk + collision
 * policy as buildNamedIndex() (via reduceByKeyPreferOrigin) so the two can
 * never disagree on a tie-break.
 */
function buildGenericRefMap(files: NamedSkillFile[]): Map<string, GenericRefTarget> {
  return reduceByKeyPreferOrigin(
    files,
    (f) => cleanText(f.frontmatter.genericSkillRef, 60) || undefined,
    (f) => ({
      contributor: cleanText(f.frontmatter.contributor, 60) || f.contributor,
      slug: f.slug,
    }),
  );
}

// ---------------------------------------------------------------------------
// Step 5: Derive fusion recipes from node.prerequisites (plan §3 — replaces
// the deleted combinations.md parser entirely).
// ---------------------------------------------------------------------------

interface DeriveRecipesResult {
  recipes: Recipe[];
  multiRecipes: MultiPrereqRecipe[];
  /** Count of fusion nodes with >=1 named ref (for the assertRegistryShape floor). */
  fusionNodesWithNamedRef: number;
}

/**
 * For each fusion node, read its own `prerequisites` array and emit a Recipe
 * (2 prereqs) or MultiPrereqRecipe (>=3 prereqs). The recipe's `result`/
 * `slug`/`contributor` are recovered via the genericSkillRef reverse-map when
 * one exists (Option B, plan §3b) — otherwise they fall back to the node's own
 * generic id with no contributor. Fusion nodes with <2 prerequisites are
 * skipped with a warning (none exist today; the Yggdrasil II schema
 * technically permits 1-prereq fusion nodes, so this is a defensive guard).
 *
 * 2-input recipes are emitted in DESCENDING node-id order. This matters only
 * for the ~2 fusion-node pairs whose prerequisites collide on the same
 * pairKey (plan §3d) — lib/craft/recipes.ts's getRecipeMap() dedupes by
 * pairKey with last-write-wins, so array order decides the winner. Emitting
 * descending means the alphabetically EARLIER node id is pushed LAST for a
 * shared pairKey and therefore wins the in-memory lookup (documented as
 * canonical in the plan: "the alphabetically-later node id loses the
 * pairKey"). All colliding recipes are still written to recipes.json — only
 * the in-memory findRecipe() lookup dedupes.
 */
function deriveRecipes(
  nodes: SkillEntry[],
  genericRefMap: Map<string, GenericRefTarget>,
  getEmoji: (slug: string) => string,
): DeriveRecipesResult {
  const fusionNodes = nodes.filter((n) => n.type === 'fusion');
  const fusionNodesWithNamedRef = fusionNodes.filter((n) => genericRefMap.has(n.id)).length;

  const sorted = [...fusionNodes].sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));

  const recipes: Recipe[] = [];
  const multiRecipes: MultiPrereqRecipe[] = [];

  for (const node of sorted) {
    const prereqs = node.prerequisites ?? [];

    if (prereqs.length < 2) {
      console.warn(
        `⚠ Fusion node "${node.id}" has ${prereqs.length} prerequisite(s) (need >=2) — skipping recipe derivation`,
      );
      continue;
    }

    const named = genericRefMap.get(node.id);
    const result = named ? named.slug : node.id;
    const slug = named ? named.slug : node.id;
    const contributor = named ? named.contributor : undefined;
    const emoji = getEmoji(slug);
    const blurb = makeBlurb(result, prereqs);

    if (prereqs.length === 2) {
      const [a, b] = prereqs;
      recipes.push({
        pairKey: pairKey(a, b),
        result,
        emoji,
        blurb,
        ...(contributor ? { contributor } : {}),
        ...(slug ? { slug } : {}),
      });
    } else {
      multiRecipes.push({
        pairKey: '',
        result,
        emoji,
        blurb,
        prereqs,
        ...(contributor ? { contributor } : {}),
        ...(slug ? { slug } : {}),
      });
    }
  }

  return { recipes, multiRecipes, fusionNodesWithNamedRef };
}

// ---------------------------------------------------------------------------
// Sanity gate — fail loudly, never write near-empty (see docs/plans/
// epic-89-sub-85-registry-sync-repair-plan-v2-yggdrasil2.md §6). Runs after
// loading and BEFORE any writeFileSync. Throws (non-zero exit) if any
// assumption below is violated, so a broken read aborts the sync instead of
// silently regenerating near-empty data (the "235 named skills → 0" trap this
// issue exists to fix).
// ---------------------------------------------------------------------------

function assertShape(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ Registry sanity check failed: ${message}`);
  }
}

function assertRegistryShape(args: {
  nodes: SkillEntry[];
  basicCount: number;
  fusionCount: number;
  recipes: Recipe[];
  multiRecipes: MultiPrereqRecipe[];
  namedFiles: NamedSkillFile[];
  namedIndex: NamedIndex;
  fusionNodesWithNamedRef: number;
}): void {
  const {
    nodes,
    basicCount,
    fusionCount,
    recipes,
    multiRecipes,
    namedFiles,
    namedIndex,
    fusionNodesWithNamedRef,
  } = args;

  // §4a pre-migration layout guard — checked FIRST so a stale (pre-#1185)
  // gaia-skill-tree checkout fails with an actionable message instead of
  // tripping the generic floor checks below with a confusing near-empty count.
  const hasLegacyLayout =
    fs.existsSync(path.join(REGISTRY_ROOT, 'nodes', 'extra')) ||
    fs.existsSync(path.join(REGISTRY_ROOT, 'nodes', 'ultimate'));
  assertShape(
    fusionCount > 0 || !hasLegacyLayout,
    'pre-Yggdrasil-II layout detected (registry/nodes/extra or registry/nodes/ultimate ' +
      'present, registry/nodes/fusion missing/empty) — this branch targets the ' +
      'post-gaia-skill-tree-#1185 schema only; do not run against the old gaia-skill-tree ' +
      '`main` until #1185 merges. See docs/plans/epic-89-sub-85-registry-sync-repair-plan-v2-yggdrasil2.md §4a.',
  );

  assertShape(
    nodes.length >= 220,
    `total node count too low: expected >=220 (basic+fusion), got ${nodes.length}`,
  );
  assertShape(
    fusionCount >= 100,
    `fusion node count too low: expected >=100, got ${fusionCount} — check registry/nodes/fusion`,
  );
  assertShape(
    basicCount >= 100,
    `basic node count too low: expected >=100, got ${basicCount} — check registry/nodes/basic`,
  );
  assertShape(
    recipes.length >= 45,
    `2-input recipe count too low: expected >=45, got ${recipes.length} — check node.prerequisites reads`,
  );
  assertShape(
    multiRecipes.length >= 50,
    `multi-prereq recipe count too low: expected >=50, got ${multiRecipes.length}`,
  );
  assertShape(
    fusionNodesWithNamedRef >= 60,
    `fusion-nodes-with-named-ref too low: expected >=60, got ${fusionNodesWithNamedRef} — check the genericSkillRef reverse-map`,
  );
  assertShape(
    namedFiles.length >= 250,
    `named/ layout changed or missing: expected >=250 .md files, got ${namedFiles.length}`,
  );

  // Named-schema canary fixtures the tests depend on (lib/craft/named-index.test.ts).
  assertShape(
    namedIndex.skills['scrape']?.c === 'garrytan',
    'canary "scrape" missing or contributor mismatch — named schema changed',
  );
  assertShape(
    namedIndex.skills['design-html']?.c === 'garrytan',
    'canary "design-html" missing or contributor mismatch — named schema changed',
  );

  // End-to-end recipe canaries (plan §6) — prove the prerequisites read AND
  // the genericSkillRef reverse-map work together correctly.
  const canaryA = recipes.find((r) => r.pairKey === pairKey('api-call', 'tool-use'));
  assertShape(
    canaryA?.result === 'flow-nexus-platform' && canaryA?.contributor === 'ruvnet',
    `recipe canary A failed: api-call+tool-use should resolve to flow-nexus-platform/ruvnet, ` +
      `got ${JSON.stringify(canaryA)}`,
  );
  const canaryB = recipes.find(
    (r) => r.pairKey === pairKey('multi-agent-debate', 'swarm-topology-management'),
  );
  assertShape(
    canaryB?.result === 'swarm-advanced' && canaryB?.contributor === 'ruvnet',
    `recipe canary B failed: multi-agent-debate+swarm-topology-management should resolve to ` +
      `swarm-advanced/ruvnet, got ${JSON.stringify(canaryB)}`,
  );

  // Regression guard vs the currently-committed snapshot (the "235→0" trap):
  // refuse to write if the new named count drops below 50% of the previously
  // committed count, unless the operator explicitly opts in via FORCE_RESYNC.
  const prevNamedIndexPath = path.join(OUT_DIR, 'named-index.json');
  let prevNamedCount = 0;
  if (fs.existsSync(prevNamedIndexPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(prevNamedIndexPath, 'utf8')) as {
        skills?: Record<string, unknown>;
      };
      prevNamedCount = Object.keys(prev.skills ?? {}).length;
    } catch {
      // Unreadable/corrupt previous snapshot — treat as "no baseline", don't block.
      prevNamedCount = 0;
    }
  }
  const newNamedCount = Object.keys(namedIndex.skills).length;
  const forced = process.env.FORCE_RESYNC === '1';
  assertShape(
    prevNamedCount === 0 || newNamedCount >= 0.5 * prevNamedCount || forced,
    `named count collapsed: ${prevNamedCount} → ${newNamedCount} (>50% drop). ` +
      `Set FORCE_RESYNC=1 if this contraction is real and reviewed.`,
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('🌿 Gaia Skill Tree sync starting (Yggdrasil II schema)...');
  console.log(`   Registry: ${REGISTRY_ROOT}`);

  // 1. Load skills from node JSON files (basic + fusion only).
  const nodes = loadNodes();
  const basicCount = nodes.filter((n) => n.type === 'basic').length;
  const fusionCount = nodes.filter((n) => n.type === 'fusion').length;
  console.log(`   Loaded ${nodes.length} skill nodes (${basicCount} basic, ${fusionCount} fusion)`);

  // 2. Load emoji map (may not exist on first run — falls back to defaults).
  const emojiMapRaw = loadEmojiMap();
  const getEmoji = makeGetEmoji(emojiMapRaw);
  const emojiMapSize = Object.keys(emojiMapRaw).length;
  if (emojiMapSize > 0) {
    console.log(`   Using emoji-map.json (${emojiMapSize} entries)`);
  } else {
    console.log('   emoji-map.json not found — using hardcoded defaults');
  }

  // 3. Build the named-skill index + contributor roster + genericSkillRef
  //    reverse-map from the named/ walk.
  const namedFiles = listNamedSkillFiles();
  console.log(`   Found ${namedFiles.length} named-skill .md files`);
  const namedIndex = buildNamedIndex(namedFiles);
  const roster = buildContributorRoster(namedFiles);
  const genericRefMap = buildGenericRefMap(namedFiles);
  console.log(`   ${genericRefMap.size} distinct genericSkillRef values`);

  // 4. Derive recipes directly from each fusion node's prerequisites array.
  const { recipes, multiRecipes, fusionNodesWithNamedRef } = deriveRecipes(
    nodes,
    genericRefMap,
    getEmoji,
  );
  console.log(`   ${recipes.length} canonical 2-input recipes`);
  console.log(`   ${multiRecipes.length} multi-prereq recipes (chained)`);
  console.log(`   ${fusionNodesWithNamedRef} fusion nodes have >=1 named ref`);

  // 5. Sanity gate — throws (aborts, non-zero exit) BEFORE any write if the
  // registry shape looks broken. This is the mechanism that prevents ever
  // silently regenerating near-empty data again.
  assertRegistryShape({
    nodes,
    basicCount,
    fusionCount,
    recipes,
    multiRecipes,
    namedFiles,
    namedIndex,
    fusionNodesWithNamedRef,
  });

  // 6. Write output files
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // skills.json
  const skillsOut = nodes.map(s => ({
    id: s.id,
    name: s.name,           // slash-style e.g. /api-call
    displayName: s.displayName,
    type: s.type,
    ...(s.contributor ? { contributor: s.contributor } : {}),
    ...(s.slug ? { slug: s.slug } : {}),
  }));
  fs.writeFileSync(
    path.join(OUT_DIR, 'skills.json'),
    JSON.stringify(skillsOut, null, 2),
    'utf8'
  );
  console.log(`✅ Wrote data/craft/skills.json (${skillsOut.length} entries)`);

  // recipes.json — 2-prereq first, then multi-prereq at end (with prereqs array)
  const recipesOut: (Recipe | MultiPrereqRecipe)[] = [...recipes, ...multiRecipes];
  fs.writeFileSync(
    path.join(OUT_DIR, 'recipes.json'),
    JSON.stringify(recipesOut, null, 2),
    'utf8'
  );
  console.log(`✅ Wrote data/craft/recipes.json (${recipesOut.length} total entries)`);

  // named-index.json — compact slug -> contributor map (anti-bloat).
  const namedIndexPath = path.join(OUT_DIR, 'named-index.json');
  fs.writeFileSync(namedIndexPath, JSON.stringify(namedIndex, null, 2), 'utf8');
  const namedCount = Object.keys(namedIndex.skills).length;
  const namedBytes = fs.statSync(namedIndexPath).size;
  console.log(
    `✅ Wrote data/craft/named-index.json (${namedCount} enriched skill entries, ` +
      `${namedIndex.unlinkedSlugs.length} unlinked, ${(namedBytes / 1024).toFixed(2)} KB)`,
  );

  // contributors.json — tiny handle->count roster for the Builders collection.
  const rosterPath = path.join(OUT_DIR, 'contributors.json');
  fs.writeFileSync(rosterPath, JSON.stringify(roster, null, 2), 'utf8');
  const rosterBytes = fs.statSync(rosterPath).size;
  const totalNamed = Object.values(roster.contributors).reduce((s, c) => s + c.count, 0);
  console.log(
    `✅ Wrote data/craft/contributors.json (${roster.total} contributors, ` +
      `${totalNamed} named skills, ${(rosterBytes / 1024).toFixed(2)} KB)`,
  );
  const top5 = Object.entries(roster.contributors)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);
  console.log('   Top 5 builders by skill count:');
  top5.forEach(([handle, { count }], i) => {
    console.log(`     ${i + 1}. @${handle} — ${count} skills`);
  });

  // 7. Print 3 example recipe entries
  console.log('\n📖 Example canonical recipe entries:');
  recipes.slice(0, 3).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.pairKey} → ${r.result} ${r.emoji}`);
    if (r.contributor) console.log(`      contributor: ${r.contributor}, slug: ${r.slug}`);
  });

  console.log('\n✨ Sync complete!');
}

main();
