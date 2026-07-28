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
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  aboveBaseline,
  findRoot,
  foreignCollisions,
  globToRegExp,
  loadHq,
  ROOT_CANDIDATES,
  oracleEntryIds,
  scanText,
  scopesFor,
  tally,
  validateLexicon,
  type Baseline,
  type Finding,
  type Foreign,
  type Lexicon,
} from "./check-lexicon.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "__fixtures__", "check-lexicon");
const ROOT = join(HERE, "..", "..");
const rootPath = findRoot(ROOT)!;
const lex: Lexicon = loadHq(rootPath);
const foreign: Foreign | null = lex.foreign
  ? JSON.parse(readFileSync(join(ROOT, lex.foreign), "utf8"))
  : null;

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
const schemaErrors = validateLexicon(lex, oracleIds, foreign);
check("the merged lexicon is well-formed", schemaErrors.length === 0, schemaErrors.join("; "));
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

console.log("\nnamespaces (V5-8 federation)");
const OWNED = ["core", "gaia.research", "gaia.brand", "gaia.heaven", "gaia.mcp"];
check(
  "this HQ owns exactly the five ratified namespaces",
  JSON.stringify([...(lex.owns ?? [])].sort()) === JSON.stringify([...OWNED].sort()),
  JSON.stringify(lex.owns),
);
check(
  "gaia.registry is rejected — the namespace is gaia.skills",
  !(lex.owns ?? []).includes("gaia.registry") && !(foreign?.terms["gaia.registry"]),
);
check(
  "every owned namespace actually has terms (KC5: the namespaces exist)",
  OWNED.every((ns) => lex.terms.some((t) => lex.owners?.[t.term.toLowerCase()]?.namespace === ns)),
);
check(
  "every term resolves to exactly one owning file (KC1)",
  lex.terms.every((t) => !!lex.owners?.[t.term.toLowerCase()]?.file) &&
    Object.keys(lex.owners ?? {}).length === lex.terms.length,
);
check(
  "the three MCP tool names are owned by gaia.mcp",
  ["gaia_search", "gaia_inspect", "gaia_status"].every(
    (t) => lex.owners?.[t]?.namespace === "gaia.mcp",
  ),
);
check(
  "the transitional per-term `namespace` field is gone",
  !lex.terms.some((t) => "namespace" in t),
);
check(
  "redefining a term inside the HQ is a merge failure naming both files",
  (() => {
    try {
      // The root already defines CURRENT; a namespace file claiming it must fail.
      const fake = { ...lex, terms: [...lex.terms, lex.terms[0]] };
      return validateLexicon(fake, oracleIds, foreign).some((e) => e.includes("duplicate term"));
    } catch {
      return true;
    }
  })(),
);
check(
  "redefining a term the OTHER HQ owns is an error (KC2)",
  foreignCollisions(
    { ...lex, terms: [{ term: "Trust Magnitude", state: "canonical", definition: "d" }] },
    foreign,
  ).some((e) => e.includes("gaia.trust")),
);
check(
  "the foreign mirror carries names only — never definitions",
  !!foreign && Object.values(foreign.terms).every((v) => typeof v === "string" && v.startsWith("gaia.")),
);
check(
  "the foreign mirror covers both namespaces the other HQ owns",
  !!foreign &&
    ["gaia.skills", "gaia.trust"].every((ns) => Object.values(foreign.terms).includes(ns)),
);
// The remaining merge rules need a throwaway HQ on disk, because they are about
// FILES, not about the in-memory shape.
const TMP = mkdtempSync(join(tmpdir(), "lexicon-hq-"));
const writeHq = (root: object, files: Record<string, object>) => {
  writeFileSync(join(TMP, "lexicon.json"), JSON.stringify(root));
  for (const [ns, body] of Object.entries(files))
    writeFileSync(join(TMP, `lexicon.${ns}.json`), JSON.stringify(body));
  return join(TMP, "lexicon.json");
};
const baseRoot = {
  lexicon: "2",
  hq: "t",
  namespace: "core",
  extends: null,
  owns: ["core", "gaia.heaven"],
  updated: "2026-07-28",
  scopes: {},
  exclude: [],
  terms: [{ term: "alpha", state: "canonical", definition: "d" }],
};
const nsFile = (ns: string, terms: object[]) => ({
  lexicon: "2",
  namespace: ns,
  extends: "core",
  terms,
});

const throws = (fn: () => unknown, needle: string) => {
  try {
    fn();
    return false;
  } catch (e) {
    return (e as Error).message.includes(needle);
  }
};

check(
  "a namespace declared in `owns` with no file is a hard failure",
  throws(() => loadHq(writeHq(baseRoot, {})), 'declared in "owns"'),
);
check(
  "a term defined in two files fails, naming both",
  throws(
    () =>
      loadHq(
        writeHq(baseRoot, {
          "gaia.heaven": nsFile("gaia.heaven", [{ term: "alpha", state: "canonical", definition: "d" }]),
        }),
      ),
    "is defined twice",
  ),
);
check(
  "a namespace file whose declared namespace disagrees with its filename fails",
  throws(
    () =>
      loadHq(
        writeHq(baseRoot, {
          "gaia.heaven": nsFile("gaia.mcp", [{ term: "beta", state: "canonical", definition: "d" }]),
        }),
      ),
    "is loaded as",
  ),
);
check(
  "a namespace file must extend the root namespace",
  throws(
    () =>
      writeHq(baseRoot, {
        "gaia.heaven": { ...nsFile("gaia.heaven", [{ term: "beta", state: "canonical", definition: "d" }]), extends: "gaia.mcp" },
      }) && loadHq(join(TMP, "lexicon.json")),
    "must declare extends",
  ),
);
check(
  "a clean two-file HQ merges into one flat term list",
  (() => {
    const m = loadHq(
      writeHq(baseRoot, {
        "gaia.heaven": nsFile("gaia.heaven", [{ term: "beta", state: "canonical", definition: "d" }]),
      }),
    );
    return (
      m.terms.length === 2 &&
      m.owners?.["alpha"].namespace === "core" &&
      m.owners?.["beta"].namespace === "gaia.heaven"
    );
  })(),
);
check(
  "scripts/lexicon/lexicon.json is a valid root location (second-HQ vendoring)",
  ROOT_CANDIDATES.includes("scripts/lexicon/lexicon.json") &&
    ROOT_CANDIDATES.includes("founder/lexicon.json"),
);
rmSync(TMP, { recursive: true, force: true });

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
