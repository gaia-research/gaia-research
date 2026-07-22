// Claims-provenance gate for the Hell/Heaven benchmark docs.
//
// WHY THIS EXISTS. Two review passes on the M2 deliverables failed the *same*
// class — "provenance overclaim": prose asserts a stronger evidential status
// (committed / measured / verified) than the committed artifacts support.
// Instances: a false census-sha "match" (the shas differ); an "unmeasured
// enumeration" claimed as measured; "every quantitative claim is drawn from a
// committed artifact" when the native perTurn (46,849), the −16k delta and the
// chars4 invocation (5,917) live only in gitignored scripts/.hh-demo/. The
// honesty discipline (M0 / B1–B5) was enforced ONLY by human review, so the
// review WAS the missing linter, run by hand — and the same seam re-emitted the
// same error each deliverable. This binds prose numbers/shas to committed
// evidence so a machine catches it before a human has to.
//
// WHAT IT CHECKS (over docs/labs/harness-capability-matrix.md +
// content/reports/hh-benchmark/*.md by default):
//   1. Every token-context NUMBER (a markdown column headed perTurn/tokens/
//      standing, or a prose number adjacent to tok/perTurn/standing/invocation/
//      delta) must either (a) carry the ‡ sigil = "declared uncommitted
//      workstation context", or (b) match a committed value from the ledger /
//      census (or a legitimate delta between two committed perTurns).
//   2. Every truncated/full SHA near sha-vocabulary must be a prefix of a
//      committed ledger sha or a census sha. A line that asserts a *match*
//      ("match"/"same"/"equal") between two shas that do not resolve to one full
//      sha FAILS (the census-sha fabrication); "differ"/"not"/"≠" disables it.
//
// THE ‡ SIGIL. Uncommitted-but-corroborating numbers are allowed in prose *iff*
// tagged ‡ in the same table cell or line. The demo runner tags its own native/
// delta output with ‡ so prose written from it inherits the marker.
//
// CLI:
//   npx tsx scripts/hell-heaven-bench/check-claims.ts [--file <md> ...]
//   npx tsx scripts/hell-heaven-bench/check-claims.ts --ledger <jsonl> --census <json> <md> ...
// Exit code: 0 = all claims trace (or are ‡-tagged); 1 = at least one overclaim.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..");
const DEFAULT_LEDGER = join(HERE, "data", "ledger.jsonl");
const DEFAULT_CENSUS = join(REPO_ROOT, "content", "reports", "hh-benchmark", "data", "r0-census.json");
const DEFAULT_DOCS = [
  join(REPO_ROOT, "docs", "labs", "harness-capability-matrix.md"),
  join(REPO_ROOT, "content", "reports", "hh-benchmark", "m2-live-demo.md"),
];

export const SIGIL = "‡";
const TOKEN_WORDS = /(perTurn|per-turn|standing|invocation|delta|tokens?|tok)\b/i;
const MATCH_WORDS = /\b(match(?:es|ed|ing)?|same|equal(?:s)?|identical)\b/i;
const DIFFER_WORDS = /\b(differ(?:s|ent|ing)?|not|never|≠|!=|distinct)\b/i;

export interface Finding {
  file: string;
  line: number;
  kind: "number" | "sha";
  token: string;
  reason: string;
}

// ── evidence extraction ─────────────────────────────────────────────────────
function normalizeNum(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace(/[−–—]/g, "-"); // unify unicode minus
  if (!/^-?\d+$/.test(cleaned)) return null;
  return parseInt(cleaned, 10);
}

function collectInts(obj: unknown, out: Set<number>): void {
  if (typeof obj === "number" && Number.isInteger(obj)) out.add(Math.abs(obj));
  else if (Array.isArray(obj)) for (const v of obj) collectInts(v, out);
  else if (obj && typeof obj === "object") for (const v of Object.values(obj)) collectInts(v, out);
}

function collectShas(text: string, out: Set<string>): void {
  for (const m of text.matchAll(/[0-9a-f]{64}/g)) out.add(m[0]);
}

interface Evidence {
  numbers: Set<number>; // committed token values + census integers + legit deltas
  shas: Set<string>; // full committed/census shas
}

export function buildEvidence(ledgerFile: string, censusFile: string): Evidence {
  const numbers = new Set<number>();
  const shas = new Set<string>();
  const perTurns: number[] = [];

  if (existsSync(ledgerFile)) {
    for (const raw of readFileSync(ledgerFile, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const rec = JSON.parse(line);
      const t = rec.tokens ?? {};
      for (const key of ["perTurn", "skillStanding", "skillInvocation", "system"]) {
        const v = t[key];
        if (typeof v === "number") {
          numbers.add(Math.abs(v));
          if (key === "perTurn") perTurns.push(v);
        }
      }
      for (const s of rec.skillsLoaded ?? []) if (s?.contentSha256) shas.add(String(s.contentSha256).replace(/^sha256:/, ""));
    }
  }
  // legitimate deltas: any |perTurnA − perTurnB| between two committed records.
  for (let i = 0; i < perTurns.length; i++)
    for (let j = i + 1; j < perTurns.length; j++) numbers.add(Math.abs(perTurns[i] - perTurns[j]));

  if (existsSync(censusFile)) {
    const text = readFileSync(censusFile, "utf8");
    collectShas(text, shas);
    collectInts(JSON.parse(text), numbers);
  }
  return { numbers, shas };
}

// ── doc scanning ────────────────────────────────────────────────────────────
// Returns the header-cell index set of a markdown table whose header names a
// token column, so we can scan exactly those data cells.
function tokenColumnsOf(headerCells: string[]): Set<number> {
  const cols = new Set<number>();
  headerCells.forEach((c, i) => {
    if (/perturn|tokens?|standing|invocation|dose/i.test(c)) cols.add(i);
  });
  return cols;
}

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim());
}

function isSeparator(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-");
}

// numbers that are never token claims even next to a token word (years, versions
// handled by regex context; these are explicit structural allowlists).
function looksStructural(numStr: string, ctx: string): boolean {
  // version fragments like 2.1.216, dates 2026-07-22, counts "10 valid record(s)"
  const bare = numStr.replace(/^[+\-−–—]/, ""); // strip sign before building the probe
  if (/^20\d\d$/.test(bare)) return true; // year
  const esc = bare.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`\\d\\.\\d\\.${esc}|${esc}\\.\\d`).test(ctx)) return true; // version piece
  return false;
}

function checkNumberToken(
  numStr: string,
  cellOrLine: string,
  ev: Evidence,
): string | null {
  if (cellOrLine.includes(SIGIL)) return null; // declared uncommitted → allowed
  if (looksStructural(numStr, cellOrLine)) return null;
  const n = normalizeNum(numStr);
  if (n === null) return null;
  if (n < 100) return null; // token counts of interest are ≥100; avoids row indices, %s
  if (ev.numbers.has(Math.abs(n))) return null;
  return `unmarked token number ${numStr} traces to no committed record (add ${SIGIL} if it is uncommitted context)`;
}

// Only regions that are SUPPOSED to trace to the ledger are gated. A doc opts
// its ledger-backed claims in with fences; a doc with NO fences (a dedicated
// report) is scanned whole. This keeps the gate off unrelated evidence — git
// commit refs, the gate-(a) deterministic sweep's own inline numbers, etc.
const FENCE_BEGIN = /ledger-claims:begin/;
const FENCE_END = /ledger-claims:end/;

export function scanDoc(file: string, ev: Evidence): Finding[] {
  const findings: Finding[] = [];
  const rel = relative(REPO_ROOT, file);
  const lines = readFileSync(file, "utf8").split("\n");
  const hasFences = lines.some((l) => FENCE_BEGIN.test(l));

  let inTable = false;
  let tokenCols = new Set<number>();
  let active = !hasFences; // no fences → whole-file
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;

    if (hasFences && FENCE_BEGIN.test(line)) { active = true; continue; }
    if (hasFences && FENCE_END.test(line)) { active = false; inTable = false; continue; }
    if (!active) continue;

    // table state machine
    if (line.includes("|") && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      inTable = true;
      tokenCols = tokenColumnsOf(splitRow(line));
      continue;
    }
    if (inTable && isSeparator(line)) continue;
    if (inTable && !line.includes("|")) {
      inTable = false;
      tokenCols = new Set();
    }

    // 1a. table token columns → check each data cell
    if (inTable && tokenCols.size && line.includes("|")) {
      const cells = splitRow(line);
      for (const col of tokenCols) {
        const cell = cells[col] ?? "";
        for (const m of cell.matchAll(/[+\-−–—]?[\d][\d,]*/g)) {
          const reason = checkNumberToken(m[0], cell, ev);
          if (reason) findings.push({ file: rel, line: lineNo, kind: "number", token: m[0], reason });
        }
      }
    }

    // 1b. prose: numbers adjacent to a token word (both orders), whole line as ‡ scope
    if (!inTable || !tokenCols.size) {
      const numRe = /([+\-−–—]?\d[\d,]*)\s*(?:tok|tokens|per-turn|perTurn)\b|(?:perTurn|per-turn|standing|invocation|delta)\b[^\d\n]{0,12}([+\-−–—]?\d[\d,]*)/gi;
      for (const m of line.matchAll(numRe)) {
        const numStr = m[1] ?? m[2];
        if (!numStr) continue;
        const reason = checkNumberToken(numStr, line, ev);
        if (reason) findings.push({ file: rel, line: lineNo, kind: "number", token: numStr, reason });
      }
    }

    // 2. sha provenance + false-match heuristic.
    // A hex token is a *content-sha claim* only when it is ≥40 hex, OR is
    // ellipsis-truncated (14c4642…) — this excludes git commit refs (@f07a057,
    // versions/…-899851b) which are neither.
    const shaHits = [...line.matchAll(/\b([0-9a-f]{6,64})(?:…|\.\.\.)/g), ...line.matchAll(/\b([0-9a-f]{40,64})\b/g)]
      .map((m) => m[1])
      .filter((h) => h.length >= 6 && /[a-f]/.test(h));
    const shaCtx = /sha256|contentSha|census|SKILL\.md|skillsLoaded/i.test(line);
    const resolved = (h: string) => [...ev.shas].some((full) => full.startsWith(h));
    if (shaCtx) {
      for (const h of shaHits) {
        if (!resolved(h)) {
          findings.push({ file: rel, line: lineNo, kind: "sha", token: h, reason: `sha ${h}… is not a prefix of any committed/census sha` });
        }
      }
      // false-match: "match" word + two shas that don't share a full sha, and no "differ" disclaimer
      const distinct = [...new Set(shaHits)];
      if (MATCH_WORDS.test(line) && !DIFFER_WORDS.test(line) && distinct.length >= 2) {
        const sameFull = [...ev.shas].some((full) => distinct.every((h) => full.startsWith(h)));
        if (!sameFull)
          findings.push({
            file: rel,
            line: lineNo,
            kind: "sha",
            token: distinct.join(" / "),
            reason: `line asserts a sha MATCH between ${distinct.join(" and ")} but they resolve to different artifacts`,
          });
      }
    }
  }
  return findings;
}

// ── cli ─────────────────────────────────────────────────────────────────────
function parseArgs(argv: string[]): { docs: string[]; ledger: string; census: string } {
  let ledger = DEFAULT_LEDGER;
  let census = DEFAULT_CENSUS;
  const docs: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--ledger") ledger = argv[++i];
    else if (argv[i] === "--census") census = argv[++i];
    else if (argv[i] === "--file") docs.push(argv[++i]);
    else docs.push(argv[i]);
  }
  return { docs: docs.length ? docs : DEFAULT_DOCS, ledger, census };
}

const isMain = process.argv[1]?.endsWith("check-claims.ts");
if (isMain) {
  const { docs, ledger, census } = parseArgs(process.argv.slice(2));
  const ev = buildEvidence(ledger, census);
  let total = 0;
  for (const doc of docs) {
    if (!existsSync(doc)) {
      console.error(`skip (missing): ${doc}`);
      continue;
    }
    const findings = scanDoc(doc, ev);
    total += findings.length;
    if (findings.length) {
      for (const f of findings) console.error(`✗ ${f.file}:${f.line}  [${f.kind}] ${f.token} — ${f.reason}`);
    } else {
      console.log(`✓ ${relative(REPO_ROOT, doc)} — all cited numbers/shas trace to committed evidence`);
    }
  }
  if (total) {
    console.error(`\nFAIL — ${total} unverifiable claim(s). Tag genuine uncommitted context with "${SIGIL}", or fix the number/sha.`);
    process.exit(1);
  }
  console.log(`\nOK — every token number and sha in ${docs.length} doc(s) traces to a committed ledger/census record (or is ${SIGIL}-tagged).`);
}
