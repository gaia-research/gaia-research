/**
 * lib/craft/sync-ygg2.test.ts
 *
 * Behaviour tests for scripts/craft/sync-skill-tree.ts under the Yggdrasil II
 * node schema (nodes/{basic,fusion} with inline prerequisites).
 *
 * Strategy: run the sync script as a child process against tiny fixture
 * registries written to a temp directory. This tests the full gate logic
 * (assertRegistryShape) without needing to export internal functions.
 *
 * IMPORTANT — output isolation: the sync script writes to data/craft/ relative
 * to the repo root (hardcoded via __dirname). Every test that calls
 * runSyncViaTsx() must use saveAndRestoreDataCraft() to snapshot and restore
 * the real data/craft/*.json files so the test suite never contaminates them.
 *
 * Fixture layout (minimal valid Yggdrasil II registry):
 *   registry/
 *     nodes/
 *       basic/   — 113 basic node JSON files
 *       fusion/  — 130 fusion node JSON files, each with prerequisites: string[]
 *     combinations.md — empty table (valid ygg2 shape; all edges are inline)
 *     named/
 *       garrytan/
 *         scrape.md        — canary 1 (required by assertRegistryShape)
 *         design-html.md   — canary 2
 *       stub-contributor/
 *         stub-skill-{0..197}.md  — pad to satisfy namedFiles >= 200 floor
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SYNC_SCRIPT = path.resolve(__dirname, '../../scripts/craft/sync-skill-tree.ts');
const DATA_CRAFT_DIR = path.resolve(__dirname, '../../data/craft');
const CRAFT_FILES = ['skills.json', 'recipes.json', 'named-index.json', 'contributors.json'];

// ---------------------------------------------------------------------------
// Output isolation — save/restore data/craft/*.json around subprocess calls
// ---------------------------------------------------------------------------

/** Snapshot of the four data/craft JSON files, stored as raw strings. */
type DataSnapshot = Record<string, string>;

function snapshotDataCraft(): DataSnapshot {
  const snap: DataSnapshot = {};
  for (const f of CRAFT_FILES) {
    const p = path.join(DATA_CRAFT_DIR, f);
    if (fs.existsSync(p)) snap[f] = fs.readFileSync(p, 'utf8');
  }
  return snap;
}

function restoreDataCraft(snap: DataSnapshot): void {
  for (const [f, content] of Object.entries(snap)) {
    fs.writeFileSync(path.join(DATA_CRAFT_DIR, f), content, 'utf8');
  }
}

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function writeNamedSkill(
  dir: string,
  contributor: string,
  slug: string,
  opts: { title?: string; description?: string; genericSkillRef?: string; level?: string } = {},
): void {
  const contribDir = path.join(dir, 'named', contributor);
  fs.mkdirSync(contribDir, { recursive: true });
  const fm = [
    '---',
    `id: "${contributor}/${slug}"`,
    `name: "${opts.title ?? slug}"`,
    `contributor: "${contributor}"`,
    `genericSkillRef: "${opts.genericSkillRef ?? slug}"`,
    `description: "${opts.description ?? `Description for ${slug}`}"`,
    `level: "${opts.level ?? '1★'}"`,
    'status: named',
    '---',
    '',
    `# ${slug}`,
  ].join('\n');
  fs.writeFileSync(path.join(contribDir, `${slug}.md`), fm, 'utf8');
}

function writeBasicNode(dir: string, id: string, name?: string): void {
  const d = path.join(dir, 'nodes', 'basic');
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(
    path.join(d, `${id}.json`),
    JSON.stringify({ id, name: name ?? id, type: 'basic' }, null, 2),
    'utf8',
  );
}

function writeFusionNode(dir: string, id: string, prerequisites: string[], name?: string): void {
  const d = path.join(dir, 'nodes', 'fusion');
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(
    path.join(d, `${id}.json`),
    JSON.stringify({ id, name: name ?? id, type: 'fusion', prerequisites }, null, 2),
    'utf8',
  );
}

function writeCombinationsMd(dir: string): void {
  fs.writeFileSync(
    path.join(dir, 'combinations.md'),
    '# Combinations\n\n| Skill | Class | Prerequisites | Top ★ | Conditions |\n|---|---|---|---|---|\n',
    'utf8',
  );
}

/**
 * Build a minimal valid Yggdrasil II fixture registry satisfying all
 * assertRegistryShape floors:
 *   nodes >= 200      : 113 basic + 130 fusion = 243
 *   fusion present    : yes
 *   fusionWithPrereqs >= 30 : all 130 carry prereqs
 *   namedFiles >= 200 : 2 canaries + 198 stubs = 200
 *   canaries          : garrytan/scrape + garrytan/design-html
 */
function buildValidFixture(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < 113; i++) writeBasicNode(dir, `basic-skill-${i}`, `Basic Skill ${i}`);
  for (let i = 0; i < 130; i++) {
    writeFusionNode(dir, `fusion-skill-${i}`, ['basic-skill-0', 'basic-skill-1'], `Fusion Skill ${i}`);
  }
  writeCombinationsMd(dir);
  writeNamedSkill(dir, 'garrytan', 'scrape', {
    title: 'Gstack Scrape — Structured Web Extraction',
    description: 'Scrapes the web in a structured way',
    genericSkillRef: 'web-scrape',
    level: '2★',
  });
  writeNamedSkill(dir, 'garrytan', 'design-html', {
    title: 'Design to Production HTML',
    description: 'Converts design to production HTML',
  });
  for (let i = 0; i < 198; i++) {
    writeNamedSkill(dir, 'stub-contributor', `stub-skill-${i}`, {
      description: `Stub skill ${i} description text`,
    });
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/**
 * Run the sync script via `npx --prefer-offline tsx` against a given registry
 * fixture. Uses execSync with shell:true so npx resolves on Windows and Unix.
 *
 * NOTE: the script writes to data/craft/ — call this only when you have a
 * saved snapshot to restore (use the saveAndRestoreDataCraft helpers).
 */
function runSyncViaTsx(
  registryDir: string,
): { exitCode: number; stdout: string; stderr: string } {
  const cmd = `npx --prefer-offline tsx "${SYNC_SCRIPT}"`;
  try {
    const stdout = execSync(cmd, {
      env: { ...process.env, GAIA_SKILL_TREE_REGISTRY: registryDir },
      cwd: path.resolve(__dirname, '../../'),
      encoding: 'utf8',
      timeout: 60_000,
    });
    return { exitCode: 0, stdout, stderr: '' };
  } catch (err: unknown) {
    const e = err as { status?: number; stdout?: string; stderr?: string; message?: string };
    return {
      exitCode: e.status ?? 1,
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? e.message ?? '',
    };
  }
}

// ---------------------------------------------------------------------------
// Global fixture setup
// ---------------------------------------------------------------------------

let fixtureBase: string;
let validFixtureDir: string;
let emptyFusionDir: string;
let noFusionDir: string;

// Snapshot of the REAL data/craft files taken once before all tests.
// Restored after each test that mutates them.
let realDataSnapshot: DataSnapshot;

beforeAll(() => {
  realDataSnapshot = snapshotDataCraft();

  fixtureBase = fs.mkdtempSync(path.join(os.tmpdir(), 'gaia-sync-test-'));
  validFixtureDir = path.join(fixtureBase, 'valid');
  emptyFusionDir = path.join(fixtureBase, 'empty-fusion');
  noFusionDir = path.join(fixtureBase, 'no-fusion');

  buildValidFixture(validFixtureDir);

  buildValidFixture(emptyFusionDir);
  for (const f of fs.readdirSync(path.join(emptyFusionDir, 'nodes', 'fusion'))) {
    fs.unlinkSync(path.join(emptyFusionDir, 'nodes', 'fusion', f));
  }

  buildValidFixture(noFusionDir);
  fs.rmSync(path.join(noFusionDir, 'nodes', 'fusion'), { recursive: true });
});

afterAll(() => {
  // Restore the real data unconditionally on suite exit.
  restoreDataCraft(realDataSnapshot);
  try { fs.rmSync(fixtureBase, { recursive: true, force: true }); } catch { /* ignore */ }
});

// ---------------------------------------------------------------------------
// Tests — valid registry
// ---------------------------------------------------------------------------

describe('sync-skill-tree: Yggdrasil II fixture — valid registry', () => {
  // Each test in this block runs the sync (which overwrites data/craft/) then
  // restores the real files. afterEach handles the restore.
  afterEach(() => restoreDataCraft(realDataSnapshot));

  it('completes with exit code 0 on a well-formed ygg2 fixture', () => {
    const { exitCode, stdout, stderr } = runSyncViaTsx(validFixtureDir);
    if (exitCode !== 0) console.error('STDOUT:', stdout, '\nSTDERR:', stderr);
    expect(exitCode).toBe(0);
  });

  it('reports 243 skill nodes loaded (113 basic + 130 fusion)', () => {
    const { stdout } = runSyncViaTsx(validFixtureDir);
    expect(stdout).toMatch(/Loaded 243 skill nodes/);
  });

  it('emits "Sync complete" in stdout', () => {
    const { stdout } = runSyncViaTsx(validFixtureDir);
    expect(stdout).toMatch(/Sync complete/);
  });

  it('skills.json written by fixture sync contains 130 entries with type "fusion"', () => {
    runSyncViaTsx(validFixtureDir);
    const skills = JSON.parse(
      fs.readFileSync(path.join(DATA_CRAFT_DIR, 'skills.json'), 'utf8'),
    ) as Array<{ type: string; prerequisites?: string[] }>;
    const fusion = skills.filter((s) => s.type === 'fusion');
    expect(fusion.length).toBe(130);
  });

  it('fusion entries in fixture output carry inline prerequisites', () => {
    runSyncViaTsx(validFixtureDir);
    const skills = JSON.parse(
      fs.readFileSync(path.join(DATA_CRAFT_DIR, 'skills.json'), 'utf8'),
    ) as Array<{ type: string; prerequisites?: string[] }>;
    const fusionWithPrereqs = skills.filter(
      (s) => s.type === 'fusion' && Array.isArray(s.prerequisites) && s.prerequisites.length > 0,
    );
    expect(fusionWithPrereqs.length).toBe(130);
    for (const s of fusionWithPrereqs) {
      expect(s.prerequisites!.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('basic entries in fixture output do NOT carry a prerequisites field', () => {
    runSyncViaTsx(validFixtureDir);
    const skills = JSON.parse(
      fs.readFileSync(path.join(DATA_CRAFT_DIR, 'skills.json'), 'utf8'),
    ) as Array<{ type: string; prerequisites?: string[] }>;
    const basicWithPrereqs = skills.filter(
      (s) => s.type === 'basic' && s.prerequisites !== undefined,
    );
    expect(basicWithPrereqs.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests — fail-loud gate (these tests expect non-zero exit and no output write)
// ---------------------------------------------------------------------------

describe('sync-skill-tree: fail-loud gate — empty fusion dir', () => {
  it('exits non-zero when nodes/fusion exists but is empty', () => {
    const { exitCode, stdout } = runSyncViaTsx(emptyFusionDir);
    if (exitCode === 0) console.error('Expected non-zero exit. STDOUT:', stdout);
    expect(exitCode).not.toBe(0);
  });

  it('aborts with a registry sanity error message', () => {
    const { stdout, stderr } = runSyncViaTsx(emptyFusionDir);
    const combined = stdout + stderr;
    // The node-count floor (< 200) fires first when fusion/ is empty — that is
    // the correct fail-loud behaviour (all gate assertions protect against drops).
    expect(combined).toMatch(
      /Registry sanity check failed|no fusion-type nodes loaded|node layout changed/,
    );
  });

  it('does not overwrite data/craft when gate fires', () => {
    const skillsPath = path.join(DATA_CRAFT_DIR, 'skills.json');
    const mtimeBefore = fs.statSync(skillsPath).mtimeMs;
    runSyncViaTsx(emptyFusionDir);
    const mtimeAfter = fs.statSync(skillsPath).mtimeMs;
    expect(mtimeAfter).toBe(mtimeBefore);
  });
});

describe('sync-skill-tree: fail-loud gate — fusion dir absent', () => {
  it('exits non-zero when nodes/fusion dir is entirely missing', () => {
    const { exitCode, stdout } = runSyncViaTsx(noFusionDir);
    if (exitCode === 0) console.error('Expected non-zero exit. STDOUT:', stdout);
    expect(exitCode).not.toBe(0);
  });

  it('prints a registry sanity error about missing nodes', () => {
    const { stdout, stderr } = runSyncViaTsx(noFusionDir);
    const combined = stdout + stderr;
    expect(combined).toMatch(
      /no fusion-type nodes loaded|node layout changed|Registry sanity check failed/,
    );
  });
});
