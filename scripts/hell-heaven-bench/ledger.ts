// M3 — Hell Heaven Benchmark ledger appender (R2 plumbing).
//
// JSONL, one record per run, matching methodology.md §6 plus the two-part-dose
// token categories from the ratified findings: system / skill-standing /
// skill-invocation / per-turn. Every run — manual or fleet — appends here from
// day one ("the ledger is always on", RFC §7.4), so paired data accumulates
// before the fleet exists.
//
// Design constraints (binding):
//   * NO seed field. Determinism does not exist in any target harness; the
//     design is N repeats (repeatIndex) + confidence intervals. A record that
//     tries to carry `seed` is rejected, so the field can never creep in.
//   * Token categories are number-or-null: null means UNMEASURED — never write
//     0 for "we didn't measure it". (Same discipline as the census's unpriced
//     invocation dose.)
//   * `skillsLoaded` carries id + content hash of each loaded contract — the
//     same sha256(SKILL.md) shape the Ygg II hash-binding ask reuses, so runs
//     stay attributable to the exact contract text they ran with.
//   * `judgeVerdict` is Tier-3 only; objective (Tier-1/2) runs leave it null.
//   * Placebo arm is OUR OWN same-harness no-skill run (skillsLoaded: []).
//     Published benchmark scores are calibration only and never appear as arms.
//
// CLI:
//   append a record (object on stdin or --record '<json>'):
//     npx tsx scripts/hell-heaven-bench/ledger.ts append [--file <jsonl>] --record '<json>'
//   validate an existing ledger:
//     npx tsx scripts/hell-heaven-bench/ledger.ts validate [--file <jsonl>]
//
// Default ledger file: scripts/hell-heaven-bench/data/ledger.jsonl
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const LEDGER_SCHEMA = "hh-ledger/v1" as const;

export const ARMS = ["placebo", "heaven", "hell", "ultra"] as const;
export type Arm = (typeof ARMS)[number];

export interface SkillRef {
  id: string;
  contentSha256: string; // sha256 of the exact SKILL.md text that was loaded
}

export interface TokenDoses {
  system: number | null; // harness system prompt + fixed scaffold
  skillStanding: number | null; // sum of listing lines for skillsLoaded
  skillInvocation: number | null; // skill bodies actually pulled in this run
  perTurn: number | null; // conversation tokens (input+output) across turns
}

export interface ObjectiveEndpoint {
  kind: string; // e.g. "regex-match", "test-suite-green", "pass@k"
  pass: boolean | null; // null only for Tier-3-only runs
  detail?: string;
}

export interface LedgerRecord {
  schema: typeof LEDGER_SCHEMA;
  recordedAt: string; // ISO timestamp
  benchmarkId: string; // which benchmark/anchor this run belongs to
  task: string; // task id within the benchmark
  arm: Arm;
  skillsLoaded: SkillRef[]; // [] for placebo
  model: string;
  harness: { name: string; version: string };
  repeatIndex: number; // 0-based; N repeats + CIs, never seeds
  tokens: TokenDoses;
  wallClockMs: number;
  objectiveEndpoint: ObjectiveEndpoint;
  judgeVerdict: string | null; // Tier 3 only
  notes?: string;
}

export const DEFAULT_LEDGER_FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  "data",
  "ledger.jsonl",
);

export function validateRecord(raw: unknown): asserts raw is LedgerRecord {
  const fail = (msg: string): never => {
    throw new Error(`invalid ledger record: ${msg}`);
  };
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) fail("not an object");
  const r = raw as Record<string, unknown>;

  if ("seed" in r) {
    fail(
      "carries a `seed` field. No target harness offers seed control — determinism does " +
        "not exist; use repeatIndex (N repeats + CIs) instead. (Binding: RFC §7.3.)",
    );
  }
  if (r.schema !== LEDGER_SCHEMA) fail(`schema must be "${LEDGER_SCHEMA}"`);
  for (const k of ["recordedAt", "benchmarkId", "task", "model"] as const) {
    if (typeof r[k] !== "string" || !r[k]) fail(`${k} must be a non-empty string`);
  }
  if (Number.isNaN(Date.parse(r.recordedAt as string))) fail("recordedAt must be an ISO timestamp");
  if (!ARMS.includes(r.arm as Arm)) fail(`arm must be one of ${ARMS.join("/")}`);
  if (!Array.isArray(r.skillsLoaded)) fail("skillsLoaded must be an array");
  for (const s of r.skillsLoaded as unknown[]) {
    const sr = s as Record<string, unknown>;
    if (typeof sr?.id !== "string" || !sr.id) fail("skillsLoaded[].id must be a non-empty string");
    if (typeof sr?.contentSha256 !== "string" || !/^[a-f0-9]{64}$/.test(sr.contentSha256)) {
      fail("skillsLoaded[].contentSha256 must be a 64-hex sha256 of the loaded SKILL.md");
    }
  }
  if (r.arm === "placebo" && (r.skillsLoaded as unknown[]).length > 0) {
    fail("placebo arm must have skillsLoaded: [] (it is our own same-harness no-skill run)");
  }
  const h = r.harness as Record<string, unknown> | undefined;
  if (typeof h?.name !== "string" || typeof h?.version !== "string" || !h.name || !h.version) {
    fail("harness must be { name, version } (non-empty strings)");
  }
  if (!Number.isInteger(r.repeatIndex) || (r.repeatIndex as number) < 0) {
    fail("repeatIndex must be a non-negative integer");
  }
  const t = r.tokens as Record<string, unknown> | undefined;
  for (const k of ["system", "skillStanding", "skillInvocation", "perTurn"] as const) {
    const v = t?.[k];
    if (v === undefined) fail(`tokens.${k} missing — use null for unmeasured, never omit or write 0`);
    if (v !== null && (typeof v !== "number" || v < 0 || !Number.isFinite(v))) {
      fail(`tokens.${k} must be a non-negative number or null (null = unmeasured)`);
    }
  }
  if (typeof r.wallClockMs !== "number" || r.wallClockMs < 0) {
    fail("wallClockMs must be a non-negative number");
  }
  const o = r.objectiveEndpoint as Record<string, unknown> | undefined;
  if (typeof o?.kind !== "string" || !o.kind) fail("objectiveEndpoint.kind must be a non-empty string");
  if (o.pass !== null && typeof o.pass !== "boolean") {
    fail("objectiveEndpoint.pass must be boolean or null (null = Tier-3-only run)");
  }
  if (r.judgeVerdict !== null && typeof r.judgeVerdict !== "string") {
    fail("judgeVerdict must be a string (Tier 3) or null");
  }
}

export function appendRecord(record: LedgerRecord, file: string = DEFAULT_LEDGER_FILE): void {
  validateRecord(record);
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(record) + "\n");
}

export function validateLedger(file: string = DEFAULT_LEDGER_FILE): number {
  if (!existsSync(file)) throw new Error(`no ledger at ${file}`);
  const lines = readFileSync(file, "utf-8").split("\n").filter((l) => l.trim() !== "");
  lines.forEach((line, i) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      throw new Error(`line ${i + 1}: not valid JSON`);
    }
    try {
      validateRecord(parsed);
    } catch (e) {
      throw new Error(`line ${i + 1}: ${(e as Error).message}`);
    }
  });
  return lines.length;
}

// ---------------------------------------------------------------------------
// CLI

function parseCli(argv: string[]) {
  const [cmd, ...rest] = argv;
  let file = DEFAULT_LEDGER_FILE;
  let record: string | null = null;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--file") file = rest[++i];
    else if (rest[i] === "--record") record = rest[++i];
    else throw new Error(`unknown arg: ${rest[i]}`);
  }
  return { cmd, file, record };
}

const isMain = process.argv[1]?.endsWith("ledger.ts");
if (isMain) {
  const { cmd, file, record } = parseCli(process.argv.slice(2));
  if (cmd === "append") {
    const raw = record ?? readFileSync(0, "utf-8");
    const parsed = JSON.parse(raw) as LedgerRecord;
    appendRecord(parsed, file);
    console.log(`appended 1 record to ${file} (${parsed.arm}, ${parsed.benchmarkId}/${parsed.task}, repeat ${parsed.repeatIndex})`);
  } else if (cmd === "validate") {
    const n = validateLedger(file);
    console.log(`OK — ${n} valid record(s) in ${file}`);
  } else {
    console.error("usage: ledger.ts append [--file <jsonl>] [--record '<json>'] | ledger.ts validate [--file <jsonl>]");
    process.exit(2);
  }
}
