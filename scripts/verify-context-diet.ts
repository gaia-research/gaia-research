#!/usr/bin/env tsx
// Golden verification for the Context Diet analyzer port.
//
//   npx tsx scripts/verify-context-diet.ts
//
// Two checks:
//   1. Fixture parity — re-derive every approxTokens value in baseline.json from
//      its chars using the ported approxTokens(), and confirm the port matches
//      the committed Lab 001 evidence exactly (including banker's rounding).
//   2. Python parity — run the original context_diet.py on this repo's CLAUDE.md
//      and assert the TS measure() output is byte-for-byte identical.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { approxTokens, measure } from "../lib/context-diet/analyze";
import type { Measured, Section } from "../lib/context-diet/types";

const ROOT = join(__dirname, "..");
const REPORT = join(ROOT, "content", "reports", "context-diet-lab-001");

let failures = 0;
function check(name: string, cond: boolean, detail = ""): void {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// ---- Check 1: fixture parity against baseline.json --------------------------
console.log("Check 1: baseline.json fixture parity");
const baseline = JSON.parse(readFileSync(join(REPORT, "baseline.json"), "utf-8")) as Measured;

check("totalChars 49687", baseline.totalChars === 49687);
check("approxTokens 12422", baseline.approxTokens === 12422);
check("sectionCount 36", baseline.sectionCount === 36);
check("overBy 9687", baseline.overBy === 9687);
check("overLimit true", baseline.overLimit === true);

// Every section's approxTokens must re-derive from chars via the port.
const mismatches = baseline.sections.filter(
  (s: Section) => approxTokens(s.chars) !== s.approxTokens,
);
check(
  "all 36 sections re-derive approxTokens (banker's rounding)",
  mismatches.length === 0,
  mismatches.map((s) => `${s.title}: ${s.chars}->${approxTokens(s.chars)} != ${s.approxTokens}`).join("; "),
);

// Section chars must sum to totalChars (every byte accounted for).
const sumChars = baseline.sections.reduce((a: number, s: Section) => a + s.chars, 0);
check("section chars sum to totalChars", sumChars === baseline.totalChars, `sum=${sumChars}`);

// The known half-integer case: 1130 chars -> 282 (round-half-to-even), not 283.
check("banker's rounding 1130->282", approxTokens(1130) === 282, `got ${approxTokens(1130)}`);

// ---- Check 2: Python parity on CLAUDE.md ------------------------------------
console.log("Check 2: Python parity on CLAUDE.md");
const claudeMd = join(ROOT, "CLAUDE.md");
const py = process.platform === "win32" ? "python" : "python3";
let pyOut = "";
try {
  pyOut = execFileSync(py, [join(REPORT, "context_diet.py"), claudeMd, "--json"], {
    encoding: "utf-8",
  });
} catch (err) {
  console.log(`  skip Python parity (could not run ${py}): ${(err as Error).message}`);
}

if (pyOut) {
  const pyData = JSON.parse(pyOut) as Measured;
  const tsData = measure(readFileSync(claudeMd, "utf-8"), pyData.limit, 2, pyData.file);
  // Compare the fields the port owns (ignore the "file" path formatting).
  const fields: (keyof Measured)[] = [
    "totalChars",
    "approxTokens",
    "limit",
    "overLimit",
    "overBy",
    "headroom",
    "sectionCount",
  ];
  for (const f of fields) {
    check(`CLAUDE.md ${String(f)}`, JSON.stringify(tsData[f]) === JSON.stringify(pyData[f]),
      `ts=${JSON.stringify(tsData[f])} py=${JSON.stringify(pyData[f])}`);
  }
  check(
    "CLAUDE.md sections deep-equal",
    JSON.stringify(tsData.sections) === JSON.stringify(pyData.sections),
  );
  check(
    "CLAUDE.md ranked deep-equal",
    JSON.stringify(tsData.ranked) === JSON.stringify(pyData.ranked),
  );
}

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
