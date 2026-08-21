// Scout Benchmark ledger appender & validator (scout-bench/v1)
//
// JSONL append-only recording discipline for parallel cheap-scout benchmark experiments.
// Evaluates cost, recall, precision, F2, latency, and prompt-caching across
// Architectural Postures A (single standard), B (single lite), C (parallel lite), D (cascaded funnel).
//
// Design constraints:
//   * NO seed field. Determinism does not exist in LLM API harnesses; design uses
//     N repeats (repeatIndex) + confidence intervals. Records with `seed` are rejected.
//   * Tokens and metrics are strictly typed numbers or null (where non-applicable).
//   * Append-only ledger format.
//
// CLI:
//   append a record:
//     npx tsx scripts/scout-bench/ledger.ts append [--file <jsonl>] --record '<json>'
//   validate an existing ledger:
//     npx tsx scripts/scout-bench/ledger.ts validate [--file <jsonl>]

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const LEDGER_SCHEMA = "scout-bench/v1" as const;

export const ARCHITECTURES = ["A", "B", "C", "D"] as const;
export type Architecture = (typeof ARCHITECTURES)[number];

export const TASK_SUITES = ["localization", "retrieval", "pruning"] as const;
export type TaskSuite = (typeof TASK_SUITES)[number];

export interface ArchConfig {
  K: number;
  fanOutStrategy?: "subspace" | "perspective" | "diverse-query" | "none";
  aggregation?: "rrf" | "quorum-then-rrf" | "rrf-then-quorum" | "passthrough" | "union";
  quorumM?: number;
  verifierEnabled?: boolean;
  topNForVerifier?: number;
}

export interface TokenAccounting {
  scoutInputTotal: number;
  scoutOutputTotal: number;
  scoutCacheReadTotal: number;
  verifierInput: number | null;
  verifierOutput: number | null;
  verifierCacheRead: number | null;
  judgeInput: number;
  judgeOutput: number;
  aggregatorTokens: 0;
}

export interface CostBreakdownUSD {
  scouts: number;
  verifier: number | null;
  judge: number;
  total: number;
}

export interface WallClockTimingMs {
  scoutsParallel: number;
  scoutsSequential: number;
  verifier: number | null;
  judge: number;
  aggregator: number;
  totalE2E: number;
}

export interface QualityResults {
  groundTruthSize: number;
  predictedSize: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  recall: number;
  precision: number;
  f2Score: number;
  validationFailures: number;
}

export interface ScoutBenchRecord {
  schema: typeof LEDGER_SCHEMA;
  recordedAt: string;
  benchmarkId: string;
  taskId: string;
  taskSuite: TaskSuite;
  architecture: Architecture;
  archConfig: ArchConfig;
  repeatIndex: number;
  scoutModel: string;
  verifierModel?: string | null;
  judgeModel: string;
  tokens: TokenAccounting;
  costUSD: CostBreakdownUSD;
  wallClockMs: WallClockTimingMs;
  results: QualityResults;
  notes?: string;
}

export const DEFAULT_LEDGER_FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  "data",
  "ledger.jsonl",
);

// Standard model pricing per 1M tokens
export const MODEL_PRICING: Record<
  string,
  { inputPer1M: number; outputPer1M: number; cacheReadPer1M: number }
> = {
  "gemini-3.5-flash-lite": {
    inputPer1M: 0.3,
    outputPer1M: 2.5,
    cacheReadPer1M: 0.03,
  },
  "google-antigravity/gemini-3.5-flash-lite": {
    inputPer1M: 0.3,
    outputPer1M: 2.5,
    cacheReadPer1M: 0.03,
  },
  "gemini-3.7-flash": {
    inputPer1M: 0.3,
    outputPer1M: 2.5,
    cacheReadPer1M: 0.075,
  },
  "antigravity/gemini-3.7-flash": {
    inputPer1M: 0.3,
    outputPer1M: 2.5,
    cacheReadPer1M: 0.075,
  },
  "claude-opus-4-6": {
    inputPer1M: 5.0,
    outputPer1M: 25.0,
    cacheReadPer1M: 0.5,
  },
  "antigravity/claude-opus-4-6": {
    inputPer1M: 5.0,
    outputPer1M: 25.0,
    cacheReadPer1M: 0.5,
  },
};

export function calculateCostUSD(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number = 0,
): number {
  const p = MODEL_PRICING[model] ?? MODEL_PRICING["gemini-3.7-flash"];
  const uncachedInput = Math.max(0, inputTokens - cacheReadTokens);
  const cost =
    (uncachedInput / 1_000_000) * p.inputPer1M +
    (cacheReadTokens / 1_000_000) * p.cacheReadPer1M +
    (outputTokens / 1_000_000) * p.outputPer1M;
  return Number(cost.toFixed(6));
}

export function computeF2Score(precision: number, recall: number): number {
  if (precision + recall === 0) return 0;
  const f2 = (5 * precision * recall) / (4 * precision + recall);
  return Number(f2.toFixed(4));
}

export function validateRecord(raw: unknown): asserts raw is ScoutBenchRecord {
  const fail = (msg: string): never => {
    throw new Error(`invalid scout-bench ledger record: ${msg}`);
  };

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    fail("record must be a non-null object");
  }
  const r = raw as Record<string, unknown>;

  if ("seed" in r) {
    fail("carries a forbidden `seed` field. Use repeatIndex (N repeats + CIs) instead.");
  }
  if (r.schema !== LEDGER_SCHEMA) {
    fail(`schema must be "${LEDGER_SCHEMA}", got "${r.schema}"`);
  }
  for (const k of ["recordedAt", "benchmarkId", "taskId", "scoutModel", "judgeModel"] as const) {
    if (typeof r[k] !== "string" || !r[k]) fail(`${k} must be a non-empty string`);
  }
  if (Number.isNaN(Date.parse(r.recordedAt as string))) {
    fail("recordedAt must be a valid ISO-8601 timestamp");
  }
  if (!TASK_SUITES.includes(r.taskSuite as TaskSuite)) {
    fail(`taskSuite must be one of ${TASK_SUITES.join("/")}`);
  }
  if (!ARCHITECTURES.includes(r.architecture as Architecture)) {
    fail(`architecture must be one of ${ARCHITECTURES.join("/")}`);
  }

  // archConfig validation
  if (typeof r.archConfig !== "object" || r.archConfig === null) {
    fail("archConfig must be an object");
  }
  const cfg = r.archConfig as Record<string, unknown>;
  if (typeof cfg.K !== "number" || cfg.K < 1) fail("archConfig.K must be a positive integer");

  // repeatIndex
  if (typeof r.repeatIndex !== "number" || r.repeatIndex < 0 || !Number.isInteger(r.repeatIndex)) {
    fail("repeatIndex must be a non-negative integer");
  }

  // tokens
  if (typeof r.tokens !== "object" || r.tokens === null) fail("tokens must be an object");
  const tok = r.tokens as Record<string, unknown>;
  if (typeof tok.scoutInputTotal !== "number" || tok.scoutInputTotal < 0) {
    fail("tokens.scoutInputTotal must be a non-negative number");
  }
  if (typeof tok.scoutOutputTotal !== "number" || tok.scoutOutputTotal < 0) {
    fail("tokens.scoutOutputTotal must be a non-negative number");
  }
  if (typeof tok.scoutCacheReadTotal !== "number" || tok.scoutCacheReadTotal < 0) {
    fail("tokens.scoutCacheReadTotal must be a non-negative number");
  }
  if (tok.aggregatorTokens !== 0) {
    fail("tokens.aggregatorTokens must be 0 (deterministic aggregator)");
  }

  // costUSD
  if (typeof r.costUSD !== "object" || r.costUSD === null) fail("costUSD must be an object");
  const cost = r.costUSD as Record<string, unknown>;
  if (typeof cost.scouts !== "number" || cost.scouts < 0) fail("costUSD.scouts must be >= 0");
  if (typeof cost.judge !== "number" || cost.judge < 0) fail("costUSD.judge must be >= 0");
  if (typeof cost.total !== "number" || cost.total < 0) fail("costUSD.total must be >= 0");

  // wallClockMs
  if (typeof r.wallClockMs !== "object" || r.wallClockMs === null) fail("wallClockMs must be an object");
  const wc = r.wallClockMs as Record<string, unknown>;
  if (typeof wc.scoutsParallel !== "number" || wc.scoutsParallel < 0) fail("wallClockMs.scoutsParallel must be >= 0");
  if (typeof wc.totalE2E !== "number" || wc.totalE2E < 0) fail("wallClockMs.totalE2E must be >= 0");

  // results
  if (typeof r.results !== "object" || r.results === null) fail("results must be an object");
  const res = r.results as Record<string, unknown>;
  for (const numKey of [
    "groundTruthSize",
    "predictedSize",
    "truePositives",
    "falsePositives",
    "falseNegatives",
    "recall",
    "precision",
    "f2Score",
    "validationFailures",
  ] as const) {
    if (typeof res[numKey] !== "number" || (res[numKey] as number) < 0) {
      fail(`results.${numKey} must be a non-negative number`);
    }
  }

  // Sanity check metric arithmetic
  const tp = res.truePositives as number;
  const fp = res.falsePositives as number;
  const fn = res.falseNegatives as number;
  const gt = res.groundTruthSize as number;
  if (tp + fn !== gt) {
    fail(`inconsistent results: truePositives (${tp}) + falseNegatives (${fn}) != groundTruthSize (${gt})`);
  }
}

export function appendRecord(
  record: ScoutBenchRecord,
  ledgerPath: string = DEFAULT_LEDGER_FILE,
): void {
  validateRecord(record);
  mkdirSync(dirname(ledgerPath), { recursive: true });
  appendFileSync(ledgerPath, `${JSON.stringify(record)}\n`, "utf-8");
}

export function readLedger(ledgerPath: string = DEFAULT_LEDGER_FILE): ScoutBenchRecord[] {
  if (!existsSync(ledgerPath)) return [];
  const lines = readFileSync(ledgerPath, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((line, idx) => {
    try {
      const parsed = JSON.parse(line);
      validateRecord(parsed);
      return parsed;
    } catch (err) {
      throw new Error(
        `Error validating record at line ${idx + 1} of ${ledgerPath}: ${(err as Error).message}`,
      );
    }
  });
}

// CLI handler
function runCli(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(`scout-bench/ledger.ts CLI

Usage:
  npx tsx scripts/scout-bench/ledger.ts validate [--file <path>]
  npx tsx scripts/scout-bench/ledger.ts append [--file <path>] --record '<json>'
  npx tsx scripts/scout-bench/ledger.ts stats [--file <path>]
`);
    process.exit(0);
  }

  let file = DEFAULT_LEDGER_FILE;
  const fileIdx = args.indexOf("--file");
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    file = args[fileIdx + 1];
  }

  if (command === "validate") {
    try {
      const records = readLedger(file);
      console.log(`✓ Ledger valid: ${records.length} records verified in ${file}`);
      process.exit(0);
    } catch (err) {
      console.error(`✗ Ledger invalid: ${(err as Error).message}`);
      process.exit(1);
    }
  }

  if (command === "append") {
    const recordIdx = args.indexOf("--record");
    let rawJson = "";
    if (recordIdx !== -1 && args[recordIdx + 1]) {
      rawJson = args[recordIdx + 1];
    } else {
      rawJson = readFileSync(0, "utf-8");
    }

    try {
      const record = JSON.parse(rawJson);
      appendRecord(record, file);
      console.log(`✓ Appended record for task=${record.taskId} arch=${record.architecture} to ${file}`);
      process.exit(0);
    } catch (err) {
      console.error(`✗ Append failed: ${(err as Error).message}`);
      process.exit(1);
    }
  }

  if (command === "stats") {
    const records = readLedger(file);
    console.log(`Total records: ${records.length}`);
    const byArch = records.reduce<Record<string, number>>((acc, r) => {
      acc[r.architecture] = (acc[r.architecture] || 0) + 1;
      return acc;
    }, {});
    console.log("By Architecture:", byArch);
    process.exit(0);
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli();
}
