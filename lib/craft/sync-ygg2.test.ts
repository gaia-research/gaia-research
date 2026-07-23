/**
 * lib/craft/sync-ygg2.test.ts
 *
 * Behaviour tests for scripts/craft/sync-skill-tree.ts under the Yggdrasil II
 * node schema (nodes/{basic,fusion} with inline prerequisites).
 *
 * Isolation contract: every call to runSyncViaTsx() passes GAIA_CRAFT_OUT_DIR
 * pointing at a fresh mkdtemp() dir. The sync script writes there, never to
 * the real data/craft/. No snapshot/restore needed — no shared mutable state.
 * Safe under vitest's parallel workers.
 *
 * Timeout: each test spawns `npx tsx <sync>` synchronously, which cold-starts
 * in ~7-8s and blows vitest's default 5000ms per-test timeout under parallel
 * load. The subprocess-level `timeout: 60_000` in runSyncViaTsx() does NOT
 * cover this — vitest kills the test first. Raise the per-test timeout
 * file-wide so these subprocess-driven tests are reliable in `vitest run`.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Subprocess-spawning tests need well above the 5s default (see header note).
vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 });
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SYNC_SCRIPT = path.resolve(__dirname, '../../scripts/craft/sync-skill-tree.ts');
const REAL_DATA_CRAFT = path.resolve(__dirname, '../../data/craft');

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
 *   nodes >= 200          : 113 basic + 130 fusion = 243
 *   fusion present        : yes
 *   fusionWithPrereqs >= 30 : all 130 carry prereqs
 *   namedFiles >= 200     : 2 canaries + 198 stubs = 200
 *   canaries              : garrytan/scrape + garrytan/design-html
 */
function buildValidFixture(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < 113; i++) writeBasicNode(dir, `basic-skill-${i}`, `Basic Skill ${i}`);
  for (let i = 0; i < 130; i++) {
    writeFusionNode(
      dir,
      `fusion-skill-${i}`,
      ['basic-skill-0', 'basic-skill-1'],
      `Fusion Skill ${i}`,
    );
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
// Runner — output isolated via GAIA_CRAFT_OUT_DIR
// ---------------------------------------------------------------------------

/**
 * Run the sync script via `npx --prefer-offline tsx` against a registry
 * fixture, writing output to an isolated temp dir (never data/craft/).
 *
 * GAIA_CRAFT_OUT_DIR is set to a fresh mkdtemp() dir per invocation — the sync
 * script honours this override (added in this PR). Safe under parallel workers.
 *
 * Returns { exitCode, stdout, stderr, outDir }. Caller pushes outDir into
 * testOutDirs for afterAll cleanup.
 */
function runSyncViaTsx(registryDir: string): {
  exitCode: number;
  stdout: string;
  stderr: string;
  outDir: string;
} {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gaia-craft-out-'));
  // Seed emoji-map.json so the sync can read it from OUT_DIR
  fs.writeFileSync(path.join(outDir, 'emoji-map.json'), '{}', 'utf8');

  const cmd = `npx --prefer-offline tsx "${SYNC_SCRIPT}"`;
  try {
    const stdout = execSync(cmd, {
      env: {
        ...process.env,
        GAIA_SKILL_TREE_REGISTRY: registryDir,
        GAIA_CRAFT_OUT_DIR: outDir,
      },
      cwd: path.resolve(__dirname, '../../'),
      encoding: 'utf8',
      timeout: 60_000,
    });
    return { exitCode: 0, stdout, stderr: '', outDir };
  } catch (err: unknown) {
    const e = err as { status?: number; stdout?: string; stderr?: string; message?: string };
    return {
      exitCode: e.status ?? 1,
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? e.message ?? '',
      outDir,
    };
  }
}

// ---------------------------------------------------------------------------
// Global fixture setup / teardown
// ---------------------------------------------------------------------------

let fixtureBase: string;
let validFixtureDir: string;
let emptyFusionDir: string;
let noFusionDir: string;

/** Isolated output dirs created per-invocation — cleaned up in afterAll. */
const testOutDirs: string[] = [];

beforeAll(() => {
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
  try { fs.rmSync(fixtureBase, { recursive: true, force: true }); } catch { /* ignore */ }
  for (const d of testOutDirs) {
    try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

// ---------------------------------------------------------------------------
// Tests — valid registry
// ---------------------------------------------------------------------------

describe('sync-skill-tree: Yggdrasil II fixture — valid registry', () => {
  it('completes with exit code 0 on a well-formed ygg2 fixture', () => {
    const { exitCode, stdout, stderr, outDir } = runSyncViaTsx(validFixtureDir);
    testOutDirs.push(outDir);
    if (exitCode !== 0) console.error('STDOUT:', stdout, '\nSTDERR:', stderr);
    expect(exitCode).toBe(0);
  });

  it('reports 243 skill nodes loaded (113 basic + 130 fusion)', () => {
    const { stdout, outDir } = runSyncViaTsx(validFixtureDir);
    testOutDirs.push(outDir);
    expect(stdout).toMatch(/Loaded 243 skill nodes/);
  });

  it('emits "Sync complete" in stdout', () => {
    const { stdout, outDir } = runSyncViaTsx(validFixtureDir);
    testOutDirs.push(outDir);
    expect(stdout).toMatch(/Sync complete/);
  });

  it('skills.json written to isolated outDir contains 130 entries with type "fusion"', () => {
    const { outDir } = runSyncViaTsx(validFixtureDir);
    testOutDirs.push(outDir);
    const skills = JSON.parse(
      fs.readFileSync(path.join(outDir, 'skills.json'), 'utf8'),
    ) as Array<{ type: string; prerequisites?: string[] }>;
    const fusion = skills.filter((s) => s.type === 'fusion');
    expect(fusion.length).toBe(130);
  });

  it('fusion entries in isolated output carry inline prerequisites', () => {
    const { outDir } = runSyncViaTsx(validFixtureDir);
    testOutDirs.push(outDir);
    const skills = JSON.parse(
      fs.readFileSync(path.join(outDir, 'skills.json'), 'utf8'),
    ) as Array<{ type: string; prerequisites?: string[] }>;
    const fusionWithPrereqs = skills.filter(
      (s) => s.type === 'fusion' && Array.isArray(s.prerequisites) && s.prerequisites.length > 0,
    );
    expect(fusionWithPrereqs.length).toBe(130);
    for (const s of fusionWithPrereqs) {
      expect(s.prerequisites!.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('basic entries in isolated output do NOT carry a prerequisites field', () => {
    const { outDir } = runSyncViaTsx(validFixtureDir);
    testOutDirs.push(outDir);
    const skills = JSON.parse(
      fs.readFileSync(path.join(outDir, 'skills.json'), 'utf8'),
    ) as Array<{ type: string; prerequisites?: string[] }>;
    const basicWithPrereqs = skills.filter(
      (s) => s.type === 'basic' && s.prerequisites !== undefined,
    );
    expect(basicWithPrereqs.length).toBe(0);
  });

  it('bridges.json is written by the sync and contains a reachability report', () => {
    // Reads from the isolated outDir — never touches real data/craft/
    const { outDir } = runSyncViaTsx(validFixtureDir);
    testOutDirs.push(outDir);
    const bridgesPath = path.join(outDir, 'bridges.json');
    expect(fs.existsSync(bridgesPath)).toBe(true);
    const bridges = JSON.parse(fs.readFileSync(bridgesPath, 'utf8')) as {
      report?: {
        totalRegistrySkills?: number;
        reachableCount?: number;
        reachablePct?: number;
        unreachableCount?: number;
        internalConnectivityPct?: number;
        gameSeedReachableCount?: number;
      };
      reachable?: unknown[];
      unreachable?: unknown[];
    };
    expect(bridges.report).toBeDefined();
    expect(typeof bridges.report!.totalRegistrySkills).toBe('number');
    expect(typeof bridges.report!.reachableCount).toBe('number');
    // The fixture has 113 basic + 130 fusion = 243 nodes; all reachable from basics
    expect(bridges.report!.totalRegistrySkills).toBe(243);
    expect(bridges.report!.reachableCount).toBe(243);
    expect(Array.isArray(bridges.reachable)).toBe(true);
    expect(Array.isArray(bridges.unreachable)).toBe(true);
    expect(bridges.unreachable!.length).toBe(0);
  });

  it('does NOT write to the real data/craft/ directory', () => {
    const skillsPath = path.join(REAL_DATA_CRAFT, 'skills.json');
    const mtimeBefore = fs.statSync(skillsPath).mtimeMs;
    const { outDir } = runSyncViaTsx(validFixtureDir);
    testOutDirs.push(outDir);
    const mtimeAfter = fs.statSync(skillsPath).mtimeMs;
    expect(mtimeAfter).toBe(mtimeBefore);
  });
});

// ---------------------------------------------------------------------------
// Tests — fail-loud gate
// ---------------------------------------------------------------------------

describe('sync-skill-tree: fail-loud gate — empty fusion dir', () => {
  it('exits non-zero when nodes/fusion exists but is empty', () => {
    const { exitCode, stdout, outDir } = runSyncViaTsx(emptyFusionDir);
    testOutDirs.push(outDir);
    if (exitCode === 0) console.error('Expected non-zero exit. STDOUT:', stdout);
    expect(exitCode).not.toBe(0);
  });

  it('aborts with a registry sanity error message', () => {
    const { stdout, stderr, outDir } = runSyncViaTsx(emptyFusionDir);
    testOutDirs.push(outDir);
    const combined = stdout + stderr;
    // The node-count floor (< 200) fires first when fusion/ is empty — correct.
    expect(combined).toMatch(
      /Registry sanity check failed|no fusion-type nodes loaded|node layout changed/,
    );
  });

  it('does not write skills.json to the isolated outDir when gate fires', () => {
    const { outDir } = runSyncViaTsx(emptyFusionDir);
    testOutDirs.push(outDir);
    // Gate throws before any writeFileSync — skills.json must not exist
    expect(fs.existsSync(path.join(outDir, 'skills.json'))).toBe(false);
  });
});

describe('sync-skill-tree: fail-loud gate — fusion dir absent', () => {
  it('exits non-zero when nodes/fusion dir is entirely missing', () => {
    const { exitCode, stdout, outDir } = runSyncViaTsx(noFusionDir);
    testOutDirs.push(outDir);
    if (exitCode === 0) console.error('Expected non-zero exit. STDOUT:', stdout);
    expect(exitCode).not.toBe(0);
  });

  it('prints a registry sanity error about missing nodes', () => {
    const { stdout, stderr, outDir } = runSyncViaTsx(noFusionDir);
    testOutDirs.push(outDir);
    const combined = stdout + stderr;
    expect(combined).toMatch(
      /no fusion-type nodes loaded|node layout changed|Registry sanity check failed/,
    );
  });
});
