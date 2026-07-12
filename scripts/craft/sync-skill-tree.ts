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
//                             backward-compat) built from registry/named-skills.json.
//                             GROUND TRUTH: we store the real registry title (t) and
//                             description (d) so canonical unlocks read as unmistakably
//                             real skills. Anti-bloat: we still store ONLY slug+contributor
//                             for linking and derive skill-tree URLs on the fly, never
//                             full paths per fusion.
//
// Run: npx tsx scripts/craft/sync-skill-tree.ts

import fs from 'fs';
import path from 'path';
import { pairKey } from '../../lib/craft/types';
import type { Recipe } from '../../lib/craft/types';

// ---------------------------------------------------------------------------
// Config — path to sibling gaia-skill-tree checkout (READ-ONLY)
// ---------------------------------------------------------------------------

const REGISTRY_ROOT = path.resolve(__dirname, '../../../../../../gaia-skill-tree/registry');
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
  type: 'basic' | 'extra' | 'ultimate';
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
 * is GROUND TRUTH copied verbatim from registry/named-skills.json.
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

// ---------------------------------------------------------------------------
// Step 1: Load all node JSON files from basic / extra / ultimate
// ---------------------------------------------------------------------------

function loadNodes(): SkillEntry[] {
  const tiers: Array<'basic' | 'extra' | 'ultimate'> = ['basic', 'extra', 'ultimate'];
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
        const node = JSON.parse(raw) as { id: string; name: string; type?: string };
        const id = node.id ?? path.basename(file, '.json');
        const name = node.name ?? id;
        entries.push({
          id,
          name: `/${id}`,   // slash-style
          displayName: name,
          type: tier,
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
// READ-ONLY on gaia-skill-tree. Reads registry/named-skills.json, whose shape is:
//   { buckets: { <genericSkill>: [ { id, contributor, title, description,
//                                    genericSkillRef, level, ... } ] } }
// The `id` field is the authoritative "<contributor>/<slug>" pair used to derive
// the explorer deep-link; title/description/genericSkillRef/level are GROUND TRUTH
// copied verbatim so canonical unlocks read as real skills. We skip entries whose
// contributor is redacted (████████).
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

function buildNamedIndex(): NamedIndex {
  const namedPath = path.join(REGISTRY_ROOT, 'named-skills.json');
  const index: NamedIndex = {
    generatedAt: new Date().toISOString().slice(0, 10),
    skills: {},
    slugToContributor: {},
    unlinkedSlugs: [],
  };

  if (!fs.existsSync(namedPath)) {
    console.warn(`⚠ named-skills.json not found at: ${namedPath} — emitting empty index`);
    return index;
  }

  interface RegistryEntry {
    id?: string;
    contributor?: string;
    title?: string;
    description?: string;
    genericSkillRef?: string;
    level?: string;
  }
  let parsed: { buckets?: Record<string, RegistryEntry[]> };
  try {
    parsed = JSON.parse(fs.readFileSync(namedPath, 'utf8'));
  } catch (e) {
    console.warn(`⚠ Failed to parse named-skills.json: ${e} — emitting empty index`);
    return index;
  }

  const buckets = parsed.buckets ?? {};
  const unlinked = new Set<string>();

  for (const bucket of Object.keys(buckets)) {
    for (const entry of buckets[bucket]) {
      const id = entry.id ?? '';
      const slashAt = id.indexOf('/');
      if (slashAt <= 0) continue; // need both a contributor and a slug
      const contributorFromId = id.slice(0, slashAt);
      const slug = id.slice(slashAt + 1).trim();
      if (!slug) continue;

      // Prefer the explicit contributor field, fall back to the id prefix.
      const contributor = (entry.contributor ?? contributorFromId).trim();

      // Skip redacted contributors — but remember the slug as "known but unlinked".
      if (isRedacted(contributor) || isRedacted(contributorFromId)) {
        unlinked.add(slug);
        continue;
      }

      // First-write-wins on slug collisions (deterministic across runs given
      // stable bucket/entry ordering in the source file).
      if (!index.skills[slug]) {
        const title = cleanText(entry.title, 120);
        const description = cleanText(entry.description, 260);
        const genericSkillRef = cleanText(entry.genericSkillRef, 60);
        const level = cleanText(entry.level, 8);
        const record: NamedSkillRecord = {
          c: contributor,
          // Ground truth: real registry title, falling back to the slug only if the
          // registry somehow omits it (shouldn't happen for status 'named').
          t: title || slug,
          d: description,
        };
        if (genericSkillRef) record.g = genericSkillRef;
        if (level) record.lvl = level;
        index.skills[slug] = record;
        index.slugToContributor[slug] = contributor;
      }
    }
  }

  // Only surface slugs that never got a linked contributor.
  index.unlinkedSlugs = [...unlinked].filter((s) => !index.skills[s]).sort();

  return index;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
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

  // 5. Write output files
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // skills.json
  const skillsOut = skills.map(s => ({
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

  // 5c. named-index.json — compact slug -> contributor map (anti-bloat).
  const namedIndex = buildNamedIndex();
  const namedIndexPath = path.join(OUT_DIR, 'named-index.json');
  fs.writeFileSync(namedIndexPath, JSON.stringify(namedIndex, null, 2), 'utf8');
  const namedCount = Object.keys(namedIndex.skills).length;
  const namedBytes = fs.statSync(namedIndexPath).size;
  console.log(
    `✅ Wrote data/craft/named-index.json (${namedCount} enriched skill entries, ` +
      `${namedIndex.unlinkedSlugs.length} unlinked, ${(namedBytes / 1024).toFixed(2)} KB)`,
  );

  // 6. Print 3 example recipe entries
  console.log('\n📖 Example canonical recipe entries:');
  recipes.slice(0, 3).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.pairKey} → ${r.result} ${r.emoji}`);
    if (r.contributor) console.log(`      contributor: ${r.contributor}, slug: ${r.slug}`);
  });

  console.log('\n✨ Sync complete!');
}

main();
