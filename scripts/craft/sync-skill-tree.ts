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
// Registry schema assumptions (Yggdrasil II taxonomy — verified against
// gaia-skill-tree @ dev/yggdrasil-ii-staging, HEAD b572c7dcc)
// ---------------------------------------------------------------------------
// These are the load-bearing assumptions this script makes about the upstream
// registry shape. If any of these ever changes, assertRegistryShape() below is
// designed to abort the sync loudly (before writing output) rather than
// silently regenerate near-empty data. Update this comment when you touch the
// mapping so the next migration is easy to spot.
//
//   - registry/nodes/{basic,fusion}/*.json — generic skill nodes.
//     The Yggdrasil II taxonomy migration (metaEpoch "yggdrasil-ii", #997)
//     replaced the old {basic, extra, unique, ultimate} tiers with just two:
//       basic  — standalone skill, no prerequisites  (~113 files)
//       fusion — composed skill; carries inline `prerequisites: string[]`
//                containing the prerequisite skill IDs (~130 files)
//     `extra`, `unique`, and `ultimate` no longer exist on disk.
//     Each file shape: { id, name, type, prerequisites?: string[], ... }
//   - registry/combinations.md — markdown table of fusion recipes (unchanged
//     shape). Note: on yggdrasil-ii-staging this table is intentionally empty
//     — all fusion edges migrated to inline prerequisites on fusion nodes.
//     The gate in assertRegistryShape() accepts either source (>= 30 rows OR
//     >= 30 fusion nodes with inline prereqs), so it stays valid across both
//     registry generations.
//   - registry/named/<contributor>/<slug>.md — THE authoritative named-skill
//     source (superseded the deleted registry/named-skills.json). YAML
//     frontmatter per file, contract in registry/schema/namedSkill.schema.json.
//     Required frontmatter fields we read: id ("contributor/slug"), name,
//     contributor, genericSkillRef, description, level ("N★"); optional: title
//     (reviewer epithet, only on status: named). Unchanged by Yggdrasil II
//     (280 files, same schema).
//   - registry/real-skills.json — a DIFFERENT, staler provenance catalog
//     (source-repo items, not the named registry). Deliberately NOT used as a
//     source here — see docs/plans/epic-89-sub-85-registry-sync-repair-plan.md §2.
//
// Run: npx tsx scripts/craft/sync-skill-tree.ts
// Env: GAIA_SKILL_TREE_REGISTRY — override the registry root (used by CI, which
//      checks out gaia-skill-tree at an arbitrary path, not a fixed sibling
//      depth). FORCE_RESYNC=1 — bypass the delta-guard sanity assertion (see
//      assertRegistryShape below); use only when a real, reviewed registry
//      contraction is expected. GAIA_CRAFT_OUT_DIR — override the output
//      directory (default: data/craft relative to repo root). Used by tests to
//      write into an isolated temp dir so they never touch the real data/craft/.

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { pairKey } from '../../lib/craft/types';
import type { Recipe } from '../../lib/craft/types';
import { deriveReachability } from './derive-reachability';

// ---------------------------------------------------------------------------
// Config — path to sibling gaia-skill-tree checkout (READ-ONLY)
// ---------------------------------------------------------------------------

const REGISTRY_ROOT =
  process.env.GAIA_SKILL_TREE_REGISTRY ??
  path.resolve(__dirname, '../../../../../../gaia-skill-tree/registry');
const OUT_DIR =
  process.env.GAIA_CRAFT_OUT_DIR ??
  path.resolve(__dirname, '../../data/craft');

// ---------------------------------------------------------------------------
// Types for generated outputs
// ---------------------------------------------------------------------------

interface SkillEntry {
  id: string;
  /** Slash-style display name, e.g. /api-call */
  name: string;
  /** Human-readable name from registry JSON, e.g. "Hypothesis Generation" */
  displayName: string;
  /** Yggdrasil II taxonomy: basic (no prerequisites) or fusion (has inline prerequisites). */
  type: 'basic' | 'fusion';
  /** Prerequisite skill IDs for fusion nodes (populated from inline prerequisites field). */
  prerequisites?: string[];
  contributor?: string;
  slug?: string;
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

// ---------------------------------------------------------------------------
// Step 1: Load all node JSON files from basic / fusion (Yggdrasil II schema)
// ---------------------------------------------------------------------------

function loadNodes(): SkillEntry[] {
  // Yggdrasil II taxonomy: only basic and fusion tiers exist on disk.
  // The existsSync guard is kept per-tier so a future rename still fails loud
  // via assertRegistryShape() rather than silently dropping nodes.
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
        // Capture inline prerequisites for fusion nodes (Plan B edge list source).
        // Basic nodes have [] or undefined — omit the field to keep skills.json lean.
        const prerequisites = node.prerequisites && node.prerequisites.length > 0
          ? node.prerequisites
          : undefined;
        entries.push({
          id,
          name: `/${id}`,   // slash-style
          displayName: name,
          type: tier,
          ...(prerequisites ? { prerequisites } : {}),
          // Store the human-readable display name for name-based lookup
          ...(name !== id ? { _displayName: name } : {}),
        } as SkillEntry & { _displayName?: string });
      } catch (e) {
        console.warn(`⚠ Failed to parse ${file}: ${e}`);
      }
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Step 2: Parse combinations.md
//
// Table format:
//   | ◇/◆ [contributor](../docs/u/contributor/)/slug-or-/generic | Class | Prereqs | Stars | Conditions |
//
// Cases:
//   [contributor](../docs/u/contributor/)/skill-slug  → contributor + slug
//   /skill-slug                                        → generic, no contributor
//   ████████/skill-slug                                → redacted contributor, keep recipe but omit contributor
// ---------------------------------------------------------------------------

interface ParsedCombo {
  resultName: string;        // display name (the slug in most cases)
  contributor?: string;      // undefined if generic or redacted
  slug?: string;             // the skill slug under contributor namespace
  prereqs: string[];         // skill names as written in the table (to be resolved to slugs)
}

function parseCombinations(): ParsedCombo[] {
  const mdPath = path.join(REGISTRY_ROOT, 'combinations.md');
  if (!fs.existsSync(mdPath)) {
    throw new Error(`combinations.md not found at: ${mdPath}`);
  }
  const lines = fs.readFileSync(mdPath, 'utf8').split('\n');
  const results: ParsedCombo[] = [];

  for (const line of lines) {
    // Only process table rows
    if (!line.trim().startsWith('|')) continue;
    // Skip header and separator rows
    if (/^\| Skill\b/.test(line.trim()) || /^\|[-|]+$/.test(line.trim())) continue;

    // Split cells
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length < 3) continue;

    const skillCell = cells[0];
    // Remove leading ◇ ◆ diamond
    const cleanSkill = skillCell.replace(/^[◇◆]\s*/, '');

    let contributor: string | undefined;
    let resultName: string;
    let slug: string | undefined;

    // Case A: [contributor](../docs/u/contributor/)/skill-slug
    const namedMatch = cleanSkill.match(/^\[([^\]]+)\]\([^)]+\)\/(.+)$/);
    if (namedMatch) {
      contributor = namedMatch[1];
      slug = namedMatch[2].trim();
      resultName = slug;
    } else {
      // Case B: /generic-slug (no contributor)
      const genericMatch = cleanSkill.match(/^\/(.+)$/);
      if (genericMatch) {
        resultName = genericMatch[1].trim();
        slug = resultName;
      } else {
        // Case C: ████████/skill-slug — redacted contributor
        const redactedMatch = cleanSkill.match(/^█+\/(.+)$/);
        if (redactedMatch) {
          // No contributor, but keep the skill slug
          resultName = redactedMatch[1].trim();
          slug = resultName;
          contributor = undefined;
        } else {
          // Unrecognised format — skip
          continue;
        }
      }
    }

    // Parse prerequisites column (index 2)
    const prereqCell = cells[2] ?? '';
    if (!prereqCell || prereqCell === '—' || prereqCell === '-') continue;

    // Prerequisites are comma-separated skill names
    const prereqs = prereqCell
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (prereqs.length === 0) continue;

    results.push({ resultName, contributor, slug, prereqs });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Step 3: Build a name→slug lookup from loaded nodes
// ---------------------------------------------------------------------------

function buildNameIndex(skills: SkillEntry[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const s of skills) {
    // Index by slug id (lowercased)
    index.set(s.id.toLowerCase(), s.id);
    // Index by kebab-space-converted id (e.g. "api call" -> "api-call")
    index.set(s.id.replace(/-/g, ' ').toLowerCase(), s.id);
    // Index by the human-readable display name from registry JSON
    // e.g. "Hypothesis Generation" -> "hypothesis-generate"
    index.set(s.displayName.toLowerCase(), s.id);
    // Also kebabified display name as fallback
    index.set(s.displayName.toLowerCase().replace(/\s+/g, '-'), s.id);
  }
  return index;
}

/** Convert a display prereq string from combinations.md to a slug */
function toSlug(name: string, nameIndex: Map<string, string>): string {
  const lower = name.toLowerCase().trim();
  // Direct lookup
  if (nameIndex.has(lower)) return nameIndex.get(lower)!;
  // Try kebab-cased version
  const kebab = lower.replace(/\s+/g, '-');
  if (nameIndex.has(kebab)) return nameIndex.get(kebab)!;
  // Fallback: convert to kebab ourselves
  return kebab;
}

// ---------------------------------------------------------------------------
// Step 4: Load and assign emojis — use emoji-map.json if available
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
// Step 5: Build recipe blurb from result skill name
// ---------------------------------------------------------------------------

function makeBlurb(resultSlug: string, prereqSlugs: string[]): string {
  const prereqNames = prereqSlugs.map(p => `/${p}`).join(' + ');
  return `Fuse ${prereqNames} to unlock /${resultSlug}.`;
}

// ---------------------------------------------------------------------------
// Step 5b: Build the lean-but-rich named-skill index (slug -> ground-truth record)
//
// READ-ONLY on gaia-skill-tree. Reads registry/named/<contributor>/<slug>.md —
// one YAML-frontmatter file per named skill (superseded the deleted
// registry/named-skills.json — see the header comment for the full mapping).
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

/** One parsed named-skill source file, ready to feed the index + roster builders. */
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
 * each file. Shared by buildNamedIndex() and buildContributorRoster() so the
 * two can never drift on what counts as "one named skill".
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

function buildNamedIndex(files: NamedSkillFile[]): NamedIndex {
  const index: NamedIndex = {
    generatedAt: new Date().toISOString().slice(0, 10),
    skills: {},
    slugToContributor: {},
    unlinkedSlugs: [],
  };

  // Tracks whether the record currently held for a slug came from an
  // `origin: true` file, so a later origin:true file can still win a
  // collision even though walk order is alphabetical, not origin-first.
  const slugIsOrigin: Record<string, boolean> = {};

  for (const { contributor, slug, frontmatter } of files) {
    const fmContributor = cleanText(frontmatter.contributor, 60) || contributor;
    const title =
      cleanText(frontmatter.title, 120) || cleanText(frontmatter.name, 120) || slug;
    const description = cleanText(frontmatter.description, 260);
    const genericSkillRef = cleanText(frontmatter.genericSkillRef, 60);
    const level = cleanText(frontmatter.level, 8);
    const isOrigin = frontmatter.origin === true;

    const existing = index.skills[slug];
    // Collision policy (deterministic — walk order is contributor asc, then
    // slug asc): write if this is the first file for the slug, or if this
    // file has origin: true and the currently-held record doesn't. Otherwise
    // keep the first-seen (alphabetically first) entry. The loser is not
    // lost — it still appears in the index under any other slugs it
    // authored, only the colliding slug becomes single-owner.
    if (!existing || (isOrigin && !slugIsOrigin[slug])) {
      const record: NamedSkillRecord = { c: fmContributor, t: title, d: description };
      if (genericSkillRef) record.g = genericSkillRef;
      if (level) record.lvl = level;
      index.skills[slug] = record;
      index.slugToContributor[slug] = fmContributor;
      slugIsOrigin[slug] = isOrigin;
    }
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

// ---------------------------------------------------------------------------
// Step 5e: Embed + upsert named skills into Cloudflare Vectorize (Epic #89 / #87)
// ---------------------------------------------------------------------------
//
// Embeds every named skill's "title. description" text at sync time so the
// fuse route's Vectorize fuzzy-promotion tier (lib/craft/vectorize-promotion.ts)
// can match paraphrased fusion names against the real registry.
//
// FIRE-AND-OPTIONAL: this script runs as a plain `tsx` process (local dev, CI),
// which has no Cloudflare Workers bindings — there is no `getCloudflareContext()`
// equivalent outside an actual Worker request. `env` is therefore always `{}` at
// today's call site; the early-exit below keeps every sync (local + CI) green.
// Wiring a live embed run means adding a Cloudflare REST API client (account id +
// `CLOUDFLARE_API_TOKEN`) to the scheduled resync workflow
// (.github/workflows/craft-registry-resync.yml), gated so it skips silently in
// PR/fork contexts (plan §5.2) — that requires live Cloudflare credentials this
// implementation does not have access to, and is left as follow-up work.

interface EmbedAiLike {
  run(model: string, input: { text: string[] }): Promise<{ data?: number[][] }>;
}

interface UpsertVectorizeLike {
  upsert(
    vectors: Array<{ id: string; values: number[]; metadata?: Record<string, string> }>,
  ): Promise<unknown>;
}

const EMBED_MODEL = '@cf/baai/bge-base-en-v1.5';
const EMBED_TEXT_MAX_CHARS = 512;
const EMBED_BATCH_SIZE = 50;

/**
 * Embeds every named skill (title + description) and upserts the vectors into
 * Cloudflare Vectorize, batched to stay within Workers AI batch limits.
 *
 * Fire-and-optional: if either binding is absent (local dev, CI, offline) this
 * exits early with a warning — it must never block the sync.
 */
async function embedAndUpsertNamedSkills(
  namedIndex: NamedIndex,
  env: { AI?: EmbedAiLike; VECTORIZE?: UpsertVectorizeLike },
): Promise<void> {
  if (!env.AI || !env.VECTORIZE) {
    console.warn('[sync] VECTORIZE or AI binding absent — skipping embedding upsert.');
    return;
  }

  const slugs = Object.keys(namedIndex.skills);
  let upserted = 0;
  for (let i = 0; i < slugs.length; i += EMBED_BATCH_SIZE) {
    const batchSlugs = slugs.slice(i, i + EMBED_BATCH_SIZE);
    const texts = batchSlugs.map((slug) => {
      const rec = namedIndex.skills[slug];
      return `${rec.t}. ${rec.d}`.slice(0, EMBED_TEXT_MAX_CHARS);
    });

    try {
      const embedResult = await env.AI.run(EMBED_MODEL, { text: texts });
      const vectors = embedResult.data ?? [];
      const toUpsert = batchSlugs
        .map((slug, idx) => ({ slug, vector: vectors[idx] }))
        .filter((v): v is { slug: string; vector: number[] } => Array.isArray(v.vector));

      if (toUpsert.length > 0) {
        await env.VECTORIZE.upsert(
          toUpsert.map(({ slug, vector }) => ({
            id: slug,
            values: vector,
            metadata: { slug },
          })),
        );
        upserted += toUpsert.length;
      }
    } catch (err) {
      // A single batch failure shouldn't abort the sync — the registry data is
      // already written. Log loudly and continue with the next batch.
      console.error(`⚠ Vectorize embed/upsert failed for batch starting at ${i}: ${err}`);
    }
  }

  console.log(`✅ Embedded + upserted ${upserted}/${slugs.length} named skills into Vectorize`);
}

// ---------------------------------------------------------------------------
// Sanity gate — fail loudly, never write near-empty (see docs/plans/
// epic-89-sub-85-registry-sync-repair-plan.md §5). Runs after loading and
// BEFORE any writeFileSync. Throws (non-zero exit) if any assumption below is
// violated, so a broken read aborts the sync instead of silently regenerating
// near-empty data (the "235 named skills → 0" trap this issue exists to fix).
// ---------------------------------------------------------------------------

function assertShape(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ Registry sanity check failed: ${message}`);
  }
}

function assertRegistryShape(args: {
  nodes: SkillEntry[];
  twoInputRecipeCount: number;
  namedFiles: NamedSkillFile[];
  namedIndex: NamedIndex;
}): void {
  const { nodes, twoInputRecipeCount, namedFiles, namedIndex } = args;

  // Node layout still present.
  assertShape(
    nodes.length >= 200,
    `node layout changed: expected >=200 nodes, got ${nodes.length} — check registry/nodes/*`,
  );

  // Yggdrasil II schema: fusion tier must exist and be non-trivially populated.
  // These assertions fire loudly if the tier map goes stale again (analogous to
  // the named-skill canaries below). Verified against dev/yggdrasil-ii-staging:
  // 130 fusion nodes, all carrying inline prerequisites.
  assertShape(
    nodes.some(n => n.type === 'fusion'),
    'no fusion-type nodes loaded — nodes/fusion missing or tier map stale',
  );
  const fusionWithPrereqs = nodes.filter(n => n.type === 'fusion' && n.prerequisites && n.prerequisites.length > 0).length;
  assertShape(
    fusionWithPrereqs >= 30,
    `fusion nodes present but <30 carry inline prerequisites (got ${fusionWithPrereqs}) — schema drift`,
  );

  // Combinations / fusion-edge coverage: either combinations.md has parseable
  // 2-input rows (old registry) OR inline prerequisites on fusion nodes carry
  // the edges (Yggdrasil II — combinations.md is intentionally empty there,
  // all edges migrated to nodes/fusion/*.json prerequisites). At least one
  // source must supply >= 30 edges or something structural broke.
  assertShape(
    twoInputRecipeCount >= 30 || fusionWithPrereqs >= 30,
    `no fusion-edge data: combinations.md yielded ${twoInputRecipeCount} 2-input recipes ` +
      `and only ${fusionWithPrereqs} fusion nodes carry inline prerequisites — ` +
      `expected >=30 from at least one source`,
  );

  // Named-skill source still present & non-trivial.
  assertShape(
    namedFiles.length >= 200,
    `named/ layout changed or missing: expected >=200 .md files, got ${namedFiles.length}`,
  );

  // Canary fixtures the tests depend on (lib/craft/named-index.test.ts).
  assertShape(
    namedIndex.skills['scrape']?.c === 'garrytan',
    'canary "scrape" missing or contributor mismatch — named schema changed',
  );
  assertShape(
    namedIndex.skills['design-html']?.c === 'garrytan',
    'canary "design-html" missing or contributor mismatch — named schema changed',
  );

  // Regression guard vs the currently-committed snapshot (the "235→113" trap):
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

async function main() {
  console.log('🌿 Gaia Skill Tree sync starting...');
  console.log(`   Registry: ${REGISTRY_ROOT}`);

  // 1. Load skills from node JSON files
  const skills = loadNodes();
  console.log(`   Loaded ${skills.length} skill nodes`);

  // 2. Parse combinations.md
  const combos = parseCombinations();
  console.log(`   Parsed ${combos.length} combination rows`);

  // 3. Build name → slug index
  const nameIndex = buildNameIndex(skills);

  // 3b. Load emoji map (may not exist on first run — falls back to defaults)
  const emojiMapRaw = loadEmojiMap();
  const getEmoji = makeGetEmoji(emojiMapRaw);
  const emojiMapSize = Object.keys(emojiMapRaw).length;
  if (emojiMapSize > 0) {
    console.log(`   Using emoji-map.json (${emojiMapSize} entries)`);
  } else {
    console.log('   emoji-map.json not found — using hardcoded defaults');
  }

  // 4. Produce recipes
  const recipes: Recipe[] = [];
  const multiRecipes: MultiPrereqRecipe[] = [];

  for (const combo of combos) {
    const prereqSlugs = combo.prereqs.map(p => toSlug(p, nameIndex));

    if (combo.prereqs.length === 2) {
      // Canonical 2-input fusion
      const [a, b] = prereqSlugs;
      const recipe: Recipe = {
        pairKey: pairKey(a, b),
        result: combo.resultName,
        emoji: getEmoji(combo.slug ?? combo.resultName),
        blurb: makeBlurb(combo.resultName, prereqSlugs),
        ...(combo.contributor ? { contributor: combo.contributor } : {}),
        ...(combo.slug ? { slug: combo.slug } : {}),
      };
      recipes.push(recipe);
    } else if (combo.prereqs.length >= 3) {
      // Multi-prereq — recorded for future chained fusion support
      const multiRecipe: MultiPrereqRecipe = {
        pairKey: '',   // sentinel: not directly fused as a pair
        result: combo.resultName,
        emoji: getEmoji(combo.slug ?? combo.resultName),
        blurb: makeBlurb(combo.resultName, prereqSlugs),
        prereqs: prereqSlugs,
        ...(combo.contributor ? { contributor: combo.contributor } : {}),
        ...(combo.slug ? { slug: combo.slug } : {}),
      };
      multiRecipes.push(multiRecipe);
    }
  }

  console.log(`   ${recipes.length} canonical 2-input recipes`);
  console.log(`   ${multiRecipes.length} multi-prereq recipes (chained)`);

  // 4b. Build the named-skill index + contributor roster from the named/ walk.
  const namedFiles = listNamedSkillFiles();
  console.log(`   Found ${namedFiles.length} named-skill .md files`);
  const namedIndex = buildNamedIndex(namedFiles);
  const roster = buildContributorRoster(namedFiles);

  // 4c. Sanity gate — throws (aborts, non-zero exit) BEFORE any write if the
  // registry shape looks broken. This is the mechanism that prevents ever
  // silently regenerating near-empty data again.
  assertRegistryShape({
    nodes: skills,
    twoInputRecipeCount: recipes.length,
    namedFiles,
    namedIndex,
  });

  // 5. Write output files
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // skills.json
  const skillsOut = skills.map(s => ({
    id: s.id,
    name: s.name,           // slash-style e.g. /api-call
    displayName: s.displayName,
    type: s.type,
    ...(s.prerequisites && s.prerequisites.length > 0 ? { prerequisites: s.prerequisites } : {}),
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

  // 5c. named-index.json — compact slug -> contributor map (anti-bloat).
  const namedIndexPath = path.join(OUT_DIR, 'named-index.json');
  fs.writeFileSync(namedIndexPath, JSON.stringify(namedIndex, null, 2), 'utf8');
  const namedCount = Object.keys(namedIndex.skills).length;
  const namedBytes = fs.statSync(namedIndexPath).size;
  console.log(
    `✅ Wrote data/craft/named-index.json (${namedCount} enriched skill entries, ` +
      `${namedIndex.unlinkedSlugs.length} unlinked, ${(namedBytes / 1024).toFixed(2)} KB)`,
  );

  // 5d. contributors.json — tiny handle->count roster for the Builders collection.
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

  // 5e. Embed + upsert named skills into Vectorize (Epic #89 / #87) — fire-and-
  // optional; no-ops with a warning when run without live Cloudflare bindings
  // (always the case for this plain `tsx` script today — see the function's
  // doc comment for the live-wiring follow-up).
  await embedAndUpsertNamedSkills(namedIndex, {});

  // 6. Print 3 example recipe entries
  console.log('\n📖 Example canonical recipe entries:');
  recipes.slice(0, 3).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.pairKey} → ${r.result} ${r.emoji}`);
    if (r.contributor) console.log(`      contributor: ${r.contributor}, slug: ${r.slug}`);
  });

  // 7. Derive build-time reachability from seeds → emit bridges.json to same OUT_DIR
  console.log('\n🔭 Deriving fusion reachability...');
  try {
    const reachResult = deriveReachability({ outDir: OUT_DIR });
    console.log(
      `   Reachability: ${reachResult.report.reachableCount}/${reachResult.report.totalRegistrySkills}` +
        ` (${reachResult.report.internalConnectivityPct}% internal / ${reachResult.report.gameSeedReachablePct}% from game seeds)`,
    );
    if (reachResult.report.unreachableCount > 0) {
      console.log(
        `   ⚠ FOUNDER GATE: ${reachResult.report.unreachableCount} skills unreachable — see bridges.json unreachable list.`,
      );
      console.log(`      Decision needed: synthesize derived bridges (auto-path) OR accept emergent-only (#87)?`);
    } else {
      console.log('   All registry skills reachable from basic-node roots (internal connectivity = 100%).');
    }
  } catch (err) {
    // Reachability derivation failure is non-fatal for the sync itself — the
    // registry data (skills/recipes/named-index) has already been written.
    // Log loudly so it's noticed but don't abort the sync.
    console.error(`⚠ derive-reachability failed (bridges.json not updated): ${err}`);
  }

  console.log('\n✨ Sync complete!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
