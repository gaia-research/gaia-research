// Tests for the claims-provenance gate. Run: npx tsx scripts/hell-heaven-bench/check-claims.test.ts
//
// Fixtures live in __fixtures__/check-claims/ and are named by expectation:
//   good-*  → must produce ZERO findings
//   bad-*   → must produce AT LEAST ONE finding
// Some fixtures additionally assert a substring of the finding reason (below),
// so the test pins WHICH class was caught, not merely that something was.
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildEvidence, scanDoc } from "./check-claims.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "__fixtures__", "check-claims");
const LEDGER = join(HERE, "data", "ledger.jsonl");
const CENSUS = join(HERE, "..", "..", "content", "reports", "hh-benchmark", "data", "r0-census.json");

// fixture basename → substring that must appear in at least one finding reason
const REASON_ASSERTS: Record<string, string> = {
  "bad-uncommitted-number.md": "traces to no committed record",
  "bad-sha-match.md": "asserts a sha MATCH",
  // hardening fixtures from the red-team pass (each pins the class it catches):
  "bad-notes-column-overclaim.md": "traces to no committed record",
  "bad-fence-marker-self-mention.md": "traces to no committed record",
  "bad-sha-match-consistent-with.md": "asserts a sha MATCH",
  "bad-sha-short-truncation.md": "asserts a sha MATCH",
  "bad-bare-number-equals-delta.md": "traces to no committed record",
  "bad-standing-under-100.md": "traces to no committed record",
};

const ev = buildEvidence(LEDGER, CENSUS);
let pass = 0;
let fail = 0;

for (const name of readdirSync(FIXTURES).filter((f) => f.endsWith(".md")).sort()) {
  const findings = scanDoc(join(FIXTURES, name), ev);
  const expectBad = name.startsWith("bad-");
  const gotBad = findings.length > 0;
  let ok = expectBad === gotBad;
  let detail = "";
  if (ok && REASON_ASSERTS[name]) {
    const want = REASON_ASSERTS[name];
    if (!findings.some((f) => f.reason.includes(want))) {
      ok = false;
      detail = ` — expected a finding reason containing "${want}"`;
    }
  }
  if (ok) {
    pass++;
    console.log(`✓ ${name} (${findings.length} finding(s))`);
  } else {
    fail++;
    console.error(`✗ ${name}: expected ${expectBad ? "≥1" : "0"} findings, got ${findings.length}${detail}`);
    for (const f of findings) console.error(`    · [${f.kind}] ${f.token} — ${f.reason}`);
  }
}

console.log(`\n${pass}/${pass + fail} fixture(s) passed`);
process.exit(fail ? 1 : 0);
