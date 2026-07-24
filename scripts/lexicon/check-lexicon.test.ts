// Tests for the vocabulary-drift gate.
// Run: npx tsx scripts/lexicon/check-lexicon.test.ts
//
// Fixtures live in __fixtures__/check-lexicon/ and are named by expectation:
//   good-*  → must produce ZERO findings
//   bad-*   → must produce AT LEAST ONE finding
//
// Scope is what makes this gate subtle — the same word is legal in a plan doc
// and illegal in a report — so every fixture declares the path it is pretending
// to live at on its first line:  <!-- as: docs/plans/x.md -->
// The fixture's own directory is excluded from real scans, so these files are
// only ever seen through this harness.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  aboveBaseline,
  globToRegExp,
  oracleEntryIds,
  scanText,
  scopesFor,
  tally,
  validateLexicon,
  type Baseline,
  type Finding,
  type Lexicon,
} from "./check-lexicon.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "__fixtures__", "check-lexicon");
const ROOT = join(HERE, "..", "..");
const lex: Lexicon = JSON.parse(readFileSync(join(ROOT, "founder", "lexicon.json"), "utf8"));

// fixture basename → substring that must appear in at least one finding message,
// so each test pins WHICH class was caught, not merely that something was.
const REASON_ASSERTS: Record<string, string> = {
  "bad-retired-name-in-plan.md": 'use "skill-heaven"',
  "bad-retired-level-name.md": 'use "level"',
  "bad-parked-in-user-facing.md": "must not ship",
  "bad-seed-in-report.md": "N repeats",
};

let pass = 0;
let fail = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

console.log("lexicon schema");
const oracleIds = oracleEntryIds(readFileSync(join(ROOT, "founder", "RATIFICATION.md"), "utf8"));
const schemaErrors = validateLexicon(lex, oracleIds);
check("founder/lexicon.json is well-formed", schemaErrors.length === 0, schemaErrors.join("; "));
check(
  "every banned term cites the oracle entry that retired it",
  lex.terms.filter((t) => t.state === "banned").every((t) => !!t.oracle && !!t.replacement),
);
check(
  "no term is both parked and given a hard replacement",
  lex.terms.every((t) => !(t.state === "parked" && t.replacement)),
);

check(
  "oracle ids parse out of RATIFICATION.md",
  oracleIds.has("D12") && oracleIds.has("P1") && oracleIds.has("N8") && oracleIds.size > 25,
);
check(
  "retired ids stay dead — D7/D10/D11/D13 are not redefined",
  !["D7", "D10", "D11", "D13"].some((id) => oracleIds.has(id)),
);
check(
  "a citation to a non-existent oracle entry is an error",
  validateLexicon(
    { ...lex, terms: [{ term: "zz", state: "canonical", definition: "d", oracle: "D99" }] },
    oracleIds,
  ).some((e) => e.includes("D99")),
);
check(
  "no canonical term names an unbuilt surface",
  !lex.terms.some((t) => t.state === "canonical" && /clean-room|scalpel|purge|restraint/.test(t.term)),
);

check(
  "an `except` pattern exempts the other sense of a word",
  scanText("hand-label a ~20-skill seed set as ground truth", "docs/skill-heaven/MISSION.md", lex).length === 0,
);
check(
  "…but the banned sense still fires on the same term",
  scanText("both arms ran on the same seed", "docs/skill-heaven/MISSION.md", lex).some((f) => f.term === "seed"),
);

console.log("\nglob matching");
check("**/*.md matches a root-level file", globToRegExp("**/*.md").test("VISION.md"));
check("**/*.md matches a nested file", globToRegExp("**/*.md").test("docs/plans/a.md"));
check("founder/**/*.md does not match docs/", !globToRegExp("founder/**/*.md").test("docs/a.md"));
check("brace alternation works", globToRegExp("app/**/*.{ts,tsx}").test("app/x/y.tsx"));
check("**/archived/** matches a nested archive", globToRegExp("**/archived/**").test("docs/plans/archived/old.md"));

console.log("\nscope resolution");
check("docs/skill-heaven is user-facing", scopesFor("docs/skill-heaven/VISION.md", lex).includes("user-facing"));
check("founder/RATIFICATION.md is decisive", scopesFor("founder/RATIFICATION.md", lex).includes("decisive"));
check(
  "docs/plans is decisive but not user-facing",
  (() => {
    const s = scopesFor("docs/plans/x.md", lex);
    return s.includes("decisive") && !s.includes("user-facing");
  })(),
);

console.log("\nbaseline");
const f = (file: string, term: string, line: number): Finding => ({
  file,
  term,
  line,
  state: "parked",
  message: "x",
});
const base: Baseline = { findings: { "docs/skill-heaven/VISION.md": { slider: 2 } } };

check(
  "a baselined finding is carried, not reported",
  aboveBaseline([f("docs/skill-heaven/VISION.md", "slider", 9)], base).length === 0,
);
check(
  "an extra occurrence beyond the baselined count IS reported",
  aboveBaseline(
    [f("docs/skill-heaven/VISION.md", "slider", 9), f("docs/skill-heaven/VISION.md", "slider", 41), f("docs/skill-heaven/VISION.md", "slider", 77)],
    base,
  ).length === 1,
);
check(
  "a new term in a baselined file IS reported",
  aboveBaseline([f("docs/skill-heaven/VISION.md", "budget", 90)], base).length === 1,
);
check(
  "a baselined term in a different file IS reported",
  aboveBaseline([f("MISSION.md", "slider", 3)], base).length === 1,
);
check("no baseline means everything is reported", aboveBaseline([f("a.md", "x", 1)], null).length === 1);
check(
  "tally counts per file and term",
  (() => {
    const t = tally([f("a.md", "x", 1), f("a.md", "x", 2), f("a.md", "y", 3)]);
    return t["a.md"].x === 2 && t["a.md"].y === 1;
  })(),
);

console.log("\nfixtures");
for (const name of readdirSync(FIXTURES).filter((f) => f.endsWith(".md")).sort()) {
  const text = readFileSync(join(FIXTURES, name), "utf8");
  const asPath = text.match(/<!--\s*as:\s*(\S+)\s*-->/)?.[1];
  if (!asPath) {
    check(name, false, "fixture is missing its `<!-- as: path -->` header");
    continue;
  }
  // Strip the header so its own path text cannot trip a term match.
  const body = text.replace(/<!--\s*as:.*?-->/, "");
  const findings = scanText(body, asPath, lex);
  const expectBad = name.startsWith("bad-");
  const gotBad = findings.length > 0;

  let ok = expectBad === gotBad;
  let detail = ok ? "" : `expected ${expectBad ? "≥1" : "0"} findings, got ${findings.length}`;
  if (!ok && findings.length) detail += `: ${findings.map((f) => f.term).join(", ")}`;

  const want = REASON_ASSERTS[name];
  if (ok && want && !findings.some((f) => f.message.includes(want))) {
    ok = false;
    detail = `caught something, but not "${want}" (got: ${findings.map((f) => f.message).join(" | ")})`;
  }
  check(name, ok, detail);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
