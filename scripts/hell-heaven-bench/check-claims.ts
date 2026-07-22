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
//      standing/dose, or a prose/cell number adjacent to tok/perTurn/standing/
//      invocation/delta) must either (a) carry the ‡ sigil = "declared
//      uncommitted workstation context", or (b) equal a MEASURED committed value
//      (ledger token counts + census per-record doses). A signed delta (+963 /
//      −963) may instead equal a difference between two committed perTurns; a
//      *bare* number may not (that would let arbitrary pairwise differences
//      bless fabricated figures).
//   2. Every truncated/full SHA near sha-vocabulary must be a prefix of a
//      committed ledger sha or a census sha. A line carrying two shas that do
//      not resolve to one full sha, without a "differ"/"not" disclaimer, FAILS
//      (the census-sha fabrication).
//
// THE ‡ SIGIL. Uncommitted-but-corroborating numbers are allowed *iff* tagged ‡
// in the same table cell or line. The demo runner tags its own native/delta
// output with ‡ so prose written from it inherits the marker.
//
// FENCES. A doc opts its ledger-backed region in with a STANDALONE-comment fence
// `<!-- ledger-claims:begin -->` … `<!-- ledger-claims:end -->` (a fence-free doc
// is scanned whole). Standalone-only so prose that merely *mentions* the marker
// does not toggle scanning.
//
// KNOWN LIMITATIONS (documented, not silently ignored): the sha false-match
// check is per physical line (a match split across two lines evades it); ASCII
// digits only (fullwidth digits are not recognized). Both are out of scope for
// this all-ASCII, single-line-claim doc set; revisit if that changes.
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
// Fences must be a STANDALONE html comment line, so prose mentioning the marker
// (e.g. docs about this convention) does not toggle scanning.
const FENCE_BEGIN = /^\s*<!--\s*ledger-claims:begin\s*-->\s*$/;
const FENCE_END = /^\s*<!--\s*ledger-claims:end\s*-->\s*$/;
// "delta"/"invocation" stay valid PROSE keywords, but only perTurn/tokens/
// standing/dose name a token *column* (dropping bare "invocation", which also
// means function/retry invocation counts).
const COLUMN_WORDS = /per-?turn|tokens?\b|standing|dose/i;
const DIFFER_WORDS = /\b(differ(?:s|ent|ing)?|not|never|distinct|edited|changed)\b|≠|!=/i;
const BARE_NUM = /[+\-−–—]?\d[\d,]*/g;
// Note the gap before the 2nd capture excludes sign chars ([^\d\n+\-−–—]) so a
// leading +/− stays WITH the number (a signed delta must not silently lose its
// sign and be re-read as a bare number).
const PROSE_NUM =
  /([+\-−–—]?\d[\d,]*)\s*(?:tok|tokens|per-turn|perTurn)\b|(?:perTurn|per-turn|standing|invocation|delta)\b[^\d\n+\-−–—]{0,12}([+\-−–—]?\d[\d,]*)/gi;

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

export interface Evidence {
  measured: Set<number>; // genuinely measured committed values (ledger + census per-record doses)
  deltas: Set<number>; // pairwise |perTurn − perTurn|; only bless SIGNED deltas
  shas: Set<string>; // full committed/census shas
}

export function buildEvidence(ledgerFile: string, censusFile: string): Evidence {
  const measured = new Set<number>();
  const deltas = new Set<number>();
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
          measured.add(Math.abs(v));
          if (key === "perTurn") perTurns.push(v);
        }
      }
      for (const s of rec.skillsLoaded ?? []) if (s?.contentSha256) shas.add(String(s.contentSha256).replace(/^sha256:/, ""));
    }
  }
  // legitimate deltas: |perTurnA − perTurnB| between two committed records —
  // kept SEPARATE from `measured` so only explicitly-signed deltas may use them.
  for (let i = 0; i < perTurns.length; i++)
    for (let j = i + 1; j < perTurns.length; j++) deltas.add(Math.abs(perTurns[i] - perTurns[j]));

  if (existsSync(censusFile)) {
    const text = readFileSync(censusFile, "utf8");
    for (const m of text.matchAll(/[0-9a-f]{64}/g)) shas.add(m[0]);
    // ONLY per-record measured doses (…contracts.records[]) — NOT the summary
    // stats (sum/min/max/p25/p90) that would bless unrelated aggregate numbers.
    const census = JSON.parse(text);
    collectInts(census?.contracts?.records ?? [], measured);
  }
  return { measured, deltas, shas };
}

// ── claim checks ────────────────────────────────────────────────────────────
function looksStructural(numStr: string, ctx: string): boolean {
  const bare = numStr.replace(/^[+\-−–—]/, ""); // strip sign before building the probe
  if (/^20\d\d$/.test(bare)) return true; // year
  const esc = bare.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`\\d\\.\\d\\.${esc}|${esc}\\.\\d`).test(ctx)) return true; // version piece
  return false;
}

function checkNumberToken(numStr: string, scope: string, ev: Evidence): string | null {
  if (scope.includes(SIGIL)) return null; // declared uncommitted → allowed
  if (looksStructural(numStr, scope)) return null;
  const n = normalizeNum(numStr);
  if (n === null) return null;
  const abs = Math.abs(n);
  const standingCtx = /standing/i.test(scope);
  // magnitude floor avoids row indices / percentages, EXCEPT in a standing
  // context (standing doses run small: 0, 33, 227 — a fabricated 99 must not slip).
  if (!standingCtx && abs < 100) return null;
  if (ev.measured.has(abs)) return null;
  const signed = /^[+\-−–—]/.test(numStr);
  if (signed && ev.deltas.has(abs)) return null; // signed deltas may equal a committed perTurn difference
  return `unmarked token number ${numStr} traces to no committed record (add ${SIGIL} if it is uncommitted context)`;
}

// ── doc scanning ────────────────────────────────────────────────────────────
function tokenColumnsOf(headerCells: string[]): Set<number> {
  const cols = new Set<number>();
  headerCells.forEach((c, i) => {
    if (COLUMN_WORDS.test(c)) cols.add(i);
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

    // 1. numbers. Collect (number, ‡-scope) candidates, then check deduped.
    const cands: Array<{ num: string; scope: string }> = [];
    if (inTable && line.includes("|")) {
      const cells = splitRow(line);
      cells.forEach((cell, idx) => {
        // token columns: bare numbers (no keyword needed)
        if (tokenCols.has(idx)) for (const m of cell.matchAll(BARE_NUM)) cands.push({ num: m[0], scope: cell });
        // EVERY cell (incl. notes/free-text): keyword-adjacent numbers — closes
        // the "hide the overclaim in the notes column" bypass.
        for (const m of cell.matchAll(PROSE_NUM)) {
          const s = m[1] ?? m[2];
          if (s) cands.push({ num: s, scope: cell });
        }
      });
    } else {
      for (const m of line.matchAll(PROSE_NUM)) {
        const s = m[1] ?? m[2];
        if (s) cands.push({ num: s, scope: line });
      }
    }
    const seen = new Set<string>();
    for (const { num, scope } of cands) {
      const key = `${num} ${scope}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const reason = checkNumberToken(num, scope, ev);
      if (reason) findings.push({ file: rel, line: lineNo, kind: "number", token: num, reason });
    }

    // 2. sha provenance + false-match heuristic.
    // A hex token is a *content-sha claim* only when it is ≥40 hex, OR is
    // ellipsis-truncated (14c4642…, or even 2bc1…) — excludes git commit refs
    // (@f07a057, versions/…-899851b) which are neither.
    const shaHits = [...line.matchAll(/\b([0-9a-f]{4,64})(?:…|\.\.\.)/g), ...line.matchAll(/\b([0-9a-f]{40,64})\b/g)]
      .map((m) => m[1])
      .filter((h) => h.length >= 4 && /[a-f]/.test(h));
    const shaCtx = /sha256|contentSha|census|SKILL\.md|skillsLoaded|hash/i.test(line);
    const resolves = (h: string) => [...ev.shas].some((full) => full.startsWith(h));
    if (shaCtx && shaHits.length) {
      for (const h of shaHits) {
        if (!resolves(h)) findings.push({ file: rel, line: lineNo, kind: "sha", token: h, reason: `sha ${h}… is not a prefix of any committed/census sha` });
      }
      // false-match: two distinct shas on one line that do NOT resolve to a
      // single full sha, and no "differ"/"not"/"edited" disclaimer → an implicit
      // equality claim between different artifacts. (Wording-agnostic: does not
      // rely on catching "matches"/"=="/"consistent with".)
      const distinct = [...new Set(shaHits)];
      if (distinct.length >= 2 && !DIFFER_WORDS.test(line)) {
        const sameFull = [...ev.shas].some((full) => distinct.every((h) => full.startsWith(h)));
        if (!sameFull)
          findings.push({
            file: rel,
            line: lineNo,
            kind: "sha",
            token: distinct.join(" / "),
            reason: `line asserts a sha MATCH between ${distinct.join(" and ")} but they resolve to different artifacts (add a "differ"/"not" disclaimer or ${SIGIL})`,
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
