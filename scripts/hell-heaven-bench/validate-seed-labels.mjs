#!/usr/bin/env node
// R1 seed-label worksheet validator — ENUM-ONLY.
//
// Parses the Markdown worksheets under data/seed-labels/ and checks:
//   - required fields present, values against fixed enums
//   - dimension ids against {H1-H5, S1-S5, U1-U5}, binary pass/fail values,
//     no duplicates, at least one dimension row
//   - exactly ONE primary stamp (T9 ratified ruling), stamps from the fixed set
//   - deny-list consistency: a deny-listed skill cannot carry hell-safe
//     (T8 ratified rung-independent) and must have tier "none"
//   - hell-safe tier spelling against the band vocabulary {low..max}
//   - STRICT/fixtures only: hell-safe tier against the R1a S-bits→tier bijection
//     (§3.2 of the rubric; repairs negative finding #188)
//
// Labels live OUTSIDE hh-ledger — this validator has ZERO dependency on
// ledger.ts / census.ts / check-claims.ts. No dependencies at all.
//
// Usage:
//   node validate-labels.mjs [dir]        # default: <script dir>/data/seed-labels
//   node validate-labels.mjs --selftest   # run fixtures + live worksheets
//   node validate-labels.mjs --summary    # generate data/seed-labels/summary.jsonl
//                                         # (one aggregate line per worksheet;
//                                         #  PREDICTIONS ONLY pending R2 receipts)

import { writeFileSync } from 'node:fs';

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BANNER = 'R1 PREDICTION WORKSHEET - not a benchmark record (B4)';

const DIMENSIONS = new Set([
  'H1','H2','H3','H4','H5',
  'S1','S2','S3','S4','S5',
  'U1','U2','U3','U4','U5',
]);
const DIM_VALUES = new Set(['pass', 'fail']);

const STAMPS = new Set([
  'heaven-native',
  'hell-safe@low', 'hell-safe@med', 'hell-safe@high', 'hell-safe@xhigh', 'hell-safe@max',
  'ultra-ready',
  'none-auto',
]);
const isHellSafe = (s) => s.startsWith('hell-safe@');

// Band vocabulary (N13 ladder rungs). "pending" = tier not yet declared;
// "none" = no hell-safe verdict.
const TIERS = new Set(['low', 'med', 'high', 'xhigh', 'max', 'none', 'pending']);
const REAL_TIERS = new Set(['low', 'med', 'high', 'xhigh', 'max']);

const BANDS = new Set(['heaven', 'hell', 'governor', 'summon-floor']);
const DENY_STATUS = new Set(['no', 'yes', 'adjacent']);

// (FIELD_RE unused; fields parsed via parseField)

function parseField(text, key) {
  const m = text.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
  return m === null ? undefined : m[1].trim();
}

// strict=true (selftest fixtures): every dimension cell must carry a binary value
// and the exactly-one primary rule applies with no pre-labeling allowance.
// strict=false (--all / live worksheets): empty score cells are allowed until
// labeling completes; a FILLED cell must still be pass|fail.
export function validateWorksheet(text, filename, { strict = false } = {}) {
  const errors = [];
  const lines = text.split('\n');
  if ((lines[0] ?? '').trim() !== BANNER) {
    errors.push(`banner: first line must be exactly "${BANNER}"`);
  }

  // Required fields
  for (const k of ['seed-id', 'skill-id', 'sha256-skill-md', 'upstream', 'band', 'audit-class']) {
    if (parseField(text, k) === undefined) errors.push(`missing field "${k}"`);
  }
  if (errors.length > 2 && !text.includes('band:')) {
    return errors; // badly malformed; don't spam
  }

  const band = parseField(text, 'band');
  if (band !== undefined && !BANDS.has(band)) {
    errors.push(`enum band: "${band}" not in ${[...BANDS].join('|')}`);
  }
  const auditClass = parseField(text, 'audit-class');
  if (auditClass !== undefined && !['yes', 'no'].includes(auditClass)) {
    errors.push(`enum audit-class: "${auditClass}" must be yes|no`);
  }
  const sid = parseField(text, 'seed-id');
  if (!/^\d{1,2}$/.test(sid ?? '') && !/^seed-\d+$/.test(sid ?? '')) {
    errors.push(`field seed-id: expected "NN" or "seed-NN", got "${sid}"`);
  }

  // Dimension rows: markdown table "| dim | prediction |"
  const seenDims = new Set();
  const dimVals = new Map();
  let dimCount = 0;
  for (const line of lines) {
    const m = line.match(/^\|\s*([A-Z]\d{1,2})\s*\|\s*(\S*)\s*\|$/);
    if (!m) continue;
    const [, id, val] = m;
    if (!DIMENSIONS.has(id)) {
      errors.push(`dimension id: "${id}" not in H1-H5/S1-S5/U1-U5`);
      continue;
    }
    if (val === '') {
      if (strict) errors.push(`dimension value: ${id} is EMPTY (fixtures must be fully labeled)`);
    } else if (!DIM_VALUES.has(val)) {
      errors.push(`dimension value: ${id} = "${val}" (binary pass|fail only — no floats, no ordinals)`);
      continue;
    }
    if (seenDims.has(id)) errors.push(`duplicate dimension row: ${id}`);
    seenDims.add(id);
    if (val !== '') dimVals.set(id, val);
    dimCount++;
  }
  if (dimCount === 0) errors.push('no dimension rows found (expected | Hx/Sx/Ux | pass|fail | table rows)');

  // Stamps
  const primaries = [];
  for (const line of lines) {
    const m = line.match(/^primary-stamp:\s*(.*)$/);
    if (m) primaries.push(m[1].trim());
  }
  if (primaries.length === 0) errors.push('primary stamp: none declared (exactly one PRIMARY required, T9)');
  else if (primaries.length > 1) errors.push(`primary stamp: ${primaries.length} declared (${primaries.join(', ')}) — exactly one allowed`);
  for (const p of primaries) {
    if (!STAMPS.has(p)) errors.push(`enum primary-stamp: "${p}" not in stamp vocabulary`);
  }

  const secRaw = parseField(text, 'secondary-stamps') ?? '';
  if (secRaw === undefined || secRaw === '') errors.push('missing field "secondary-stamps" (use "none" if empty)');
  const secondaries = secRaw === 'none' ? [] : secRaw.split(',').map((s) => s.trim()).filter(Boolean);
  for (const s of secondaries) {
    if (!STAMPS.has(s)) errors.push(`enum secondary-stamp: "${s}" not in stamp vocabulary`);
  }

  // Tier
  const tier = parseField(text, 'hell-safe-tier');
  if (tier === undefined) errors.push('missing field "hell-safe-tier"');
  else if (!TIERS.has(tier)) {
    errors.push(`tier spelling: "${tier}" not in band vocabulary {${[...TIERS].join(', ')}}`);
  }

  // Deny-list consistency (T8, rung-independent)
  const deny = parseField(text, 'deny-list-status');
  if (deny === undefined) errors.push('missing field "deny-list-status"');
  else if (!DENY_STATUS.has(deny)) errors.push(`enum deny-list-status: "${deny}" must be no|yes|adjacent`);

  if (deny === 'yes') {
    const allStamps = [...primaries.filter((p) => STAMPS.has(p)), ...secondaries.filter((s) => STAMPS.has(s))];
    const hs = allStamps.filter(isHellSafe);
    if (hs.length > 0) {
      errors.push(`deny-list consistency: deny-listed skill carries hell-safe stamp(s) [${hs.join(', ')}] — T8 forbids this at every rung`);
    }
    if (tier !== undefined && tier !== 'none' && TIERS.has(tier)) {
      errors.push(`deny-list consistency: deny-listed skill must have hell-safe-tier "none", got "${tier}"`);
    }
  } else if (deny !== undefined) {
    // A real (non-pending, non-none) tier implies a hell-safe stamp somewhere.
    if (tier !== undefined && REAL_TIERS.has(tier)) {
      const allStamps = [...primaries, ...secondaries];
      if (!allStamps.some(isHellSafe)) {
        errors.push(`consistency: tier "${tier}" declared but no hell-safe@* stamp present`);
      }
    }
    const allStamps = [...primaries.filter((p) => STAMPS.has(p)), ...secondaries.filter((s) => STAMPS.has(s))];
    if (allStamps.some(isHellSafe) && tier !== undefined && TIERS.has(tier) && !REAL_TIERS.has(tier) && tier !== 'pending' && tier !== 'none') {
      errors.push(`tier spelling: hell-safe stamp requires a real rung, got "${tier}"`); // unreachable guard
    }
  }

  // R1a bijection awareness (STRICT/fixtures only). The hell-safe tier must equal what
  // the S-row prefix derives (r1-stamp-rubric.md §3.2; negative finding #188). Live
  // worksheets are mid-re-derivation under the new rubric and keep their existing enum
  // checks unchanged until that lands. No existing check is weakened.
  if (strict) {
    const sVals = ['S1', 'S2', 'S3', 'S4', 'S5'].map((k) => dimVals.get(k));
    if (
      deny !== 'yes' &&
      sVals.every((v) => v === 'pass' || v === 'fail') &&
      tier !== undefined && TIERS.has(tier) && tier !== 'pending'
    ) {
      let k = 0;
      while (k < 5 && sVals[k] === 'pass') k++;
      const derived = k >= 5 ? ['xhigh', 'max'] : ['none', 'low', 'med', 'high', 'xhigh'][k];
      const ok = Array.isArray(derived) ? derived.includes(tier) : tier === derived;
      if (!ok) {
        const d = Array.isArray(derived) ? derived.join('|') : derived;
        const note = k >= 5 ? ' (@max additionally requires verified environment-gate evidence)' : '';
        errors.push(`R1a bijection: S-prefix of ${k} passing row(s) derives "${d}", got "${tier}"${note}`);
      }
    }
  }

  // Known-miss cases mandatory for audit-class skills
  if (auditClass === 'yes') {
    const sec = text.split('## Known-miss cases')[1] ?? '';
    const bullets = sec.split('## ')[0].split('\n').filter((l) => /^- /.test(l)).filter((l) => !/\(none/.test(l));
    if (bullets.length < 2) {
      errors.push(`known-miss cases: audit-class skill needs >= 2 miss-case bullets, found ${bullets.length}`);
    }
  }

  if (!strict && primaries.length === 0 && !/^primary-stamp:/m.test(text)) {
    errors.push('primary stamp: no primary-stamp slot found (declare one or leave the slot for labeling)');
  }

  // Labeler columns must be EMPTY during worksheet phase
  for (const [k, v] of [['labeler', parseField(text, 'labeler')], ['confidence', parseField(text, 'confidence')]]) {
    if (v === undefined) errors.push(`missing field "${k}"`);
    else if (v !== '') errors.push(`phase check: "${k}" must be EMPTY until labeling lands, got "${v}"`);
  }

  return errors;
}

// --- summary aggregate (predictions only, B4) -------------------------------

export function summarizeWorksheet(text) {
  const dims = [];
  const passed = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*([A-Z]\d{1,2})\s*\|\s*(\S*)\s*\|$/);
    if (!m) continue;
    const [, id, val] = m;
    if (!DIMENSIONS.has(id) || !DIM_VALUES.has(val)) continue;
    dims.push([id, val]);
    if (val === 'pass') passed.push(id);
  }
  // Environment qualifier bullets under "## Environment qualifiers"
  const sec = (text.split('## Environment qualifiers')[1] ?? '').split('## ')[0];
  const envQ = sec.split('\n').filter((l) => /^- /.test(l)).map((l) => l.replace(/^- /, '').trim());
  const tierRaw = parseField(text, 'hell-safe-tier');
  return {
    skillId: parseField(text, 'skill-id') ?? null,
    primaryStamp: parseField(text, 'primary-stamp') ?? null,
    secondaryStamps:
      (parseField(text, 'secondary-stamps') ?? 'none') === 'none'
        ? []
        : (parseField(text, 'secondary-stamps') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    hellSafeTier: tierRaw !== undefined && REAL_TIERS.has(tierRaw) ? tierRaw : null,
    denyListed: parseField(text, 'deny-list-status') === 'yes',
    dimensionsPassed: passed,
    environmentQualifiers: envQ,
    predictionOnly: true,
    labeledAt: '2026-08-23',
  };
}

function writeSummary() {
  const dir = join(dirname(fileURLToPath(import.meta.url)), 'data', 'seed-labels');
  const lines = [{ schema: 'seed-label-summary/v0', note: 'predictions pending R2 receipts' }];
  let bad = 0;
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.md')) continue;
    const errs = validateWorksheet(readFileSync(join(dir, f), 'utf8'), f);
    if (errs.length) {
      bad++;
      console.error(`${f}: refusing to summarize invalid worksheet:`);
      for (const e of errs) console.error(`  - ${e}`);
      continue;
    }
    lines.push(summarizeWorksheet(readFileSync(join(dir, f), 'utf8')));
  }
  if (bad > 0) {
    console.error(`${bad} invalid worksheet(s); summary NOT written`);
    process.exit(1);
  }
  const out = join(dir, 'summary.jsonl');
  writeFileSync(out, lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  console.log(`wrote ${out}: ${lines.length - 1} worksheet line(s) + header`);
}

function selftest() {
  const dir = join(dirname(fileURLToPath(import.meta.url)), 'data', 'seed-labels');
  const fxDir = join(dir, '__fixtures__');
  let failed = 0;

  for (const f of readdirSync(fxDir).sort()) {
    if (!f.endsWith('.md')) continue;
    const expectOk = f.startsWith('valid');
    const errs = validateWorksheet(readFileSync(join(fxDir, f), 'utf8'), f, { strict: true });
    const ok = expectOk ? errs.length === 0 : errs.length > 0;
    console.log(`${ok ? 'PASS' : 'FAIL'}  fixture ${f}${expectOk ? ' (must be clean)' : ' (must trip)'}`);
    for (const e of errs) console.log(`       -> ${e}`);
    if (!ok) failed++;
  }

  // Live worksheets must all be valid
  let count = 0;
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.md')) continue;
    count++;
    const errs = validateWorksheet(readFileSync(join(dir, f), 'utf8'), f);
    const ok = errs.length === 0;
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  worksheet ${f}`);
    for (const e of errs) console.log(`       -> ${e}`);
  }
  console.log(`\nselftest: ${count} worksheets checked; ${failed} failure(s)`);
  process.exit(failed === 0 ? 0 : 1);
}

if (process.argv.includes('--selftest')) {
  selftest();
} else if (process.argv.includes('--summary')) {
  writeSummary();
} else {
  const rest = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const dir = rest[0] ?? join(dirname(fileURLToPath(import.meta.url)), 'data', 'seed-labels');
  let bad = 0;
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.md')) continue;
    const errs = validateWorksheet(readFileSync(join(dir, f), 'utf8'), f);
    if (errs.length) {
      bad++;
      console.error(`${f}:`);
      for (const e of errs) console.error(`  - ${e}`);
    }
  }
  console.log(bad === 0 ? 'all worksheets valid' : `${bad} invalid worksheet(s)`);
  process.exit(bad === 0 ? 0 : 1);
}
