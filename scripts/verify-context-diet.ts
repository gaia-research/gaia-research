// Golden parity check: measure() on the Lab 001 source CLAUDE.md must reproduce
// baseline.json exactly.
//
// The baseline was measured against gaia-skill-tree@b5c3f6a:CLAUDE.md — exactly
// 49,687 Unicode codepoints, no astral (>BMP) chars, so JS .length (UTF-16
// units) equals Python len(). We extract that exact revision from the sibling
// gaia-skill-tree checkout (same pattern as generate-templates.ts). If the
// sibling is missing, the check SKIPS (exit 0) rather than failing a clean CI.
//
// Run: npx tsx scripts/verify-context-diet.ts
import { execFileSync } from "node:child_process";
import { measure } from "../lib/context-diet/analyze";
import baseline from "../content/reports/context-diet-lab-001/baseline.json";

const SIBLING = "../gaia-skill-tree";
const SOURCE_SHA = "b5c3f6a924a87fce8fca65bc2e37cd58afe8cafd";

let src: string;
try {
  src = execFileSync("git", ["-C", SIBLING, "cat-file", "-p", `${SOURCE_SHA}:CLAUDE.md`], {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });
} catch {
  console.log(
    `SKIP  sibling ${SIBLING} or revision ${SOURCE_SHA.slice(0, 7)}:CLAUDE.md unavailable — ` +
      `cannot run golden parity check offline. (Not a failure.)`,
  );
  process.exit(0);
}

const m = measure(src, 40000, 2, "CLAUDE.md");

let fails = 0;
const ok = (cond: boolean, msg: string) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`);
  if (!cond) fails++;
};

ok(m.totalChars === baseline.totalChars, `totalChars ${m.totalChars} == ${baseline.totalChars}`);
ok(m.approxTokens === baseline.approxTokens, `approxTokens ${m.approxTokens} == ${baseline.approxTokens}`);
ok(m.sectionCount === baseline.sectionCount, `sectionCount ${m.sectionCount} == ${baseline.sectionCount}`);
ok(m.overBy === baseline.overBy, `overBy ${m.overBy} == ${baseline.overBy}`);
ok(m.overLimit === baseline.overLimit, `overLimit ${m.overLimit} == ${baseline.overLimit}`);
ok(m.headroom === baseline.headroom, `headroom ${m.headroom} == ${baseline.headroom}`);

// Full section-by-section parity (title/chars/tokens/lineStart).
const bs = baseline.sections;
ok(m.sections.length === bs.length, `sections.length ${m.sections.length} == ${bs.length}`);
let sectionMismatch = 0;
for (let i = 0; i < Math.min(m.sections.length, bs.length); i++) {
  const a = m.sections[i];
  const b = bs[i];
  if (a.title !== b.title || a.chars !== b.chars || a.approxTokens !== b.approxTokens || a.lineStart !== b.lineStart) {
    sectionMismatch++;
    if (sectionMismatch <= 5) {
      console.log(`  section[${i}] MISMATCH: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`);
    }
  }
}
ok(sectionMismatch === 0, `all ${bs.length} sections match (${sectionMismatch} mismatches)`);

console.log(fails === 0 ? "\nGOLDEN: ALL PASS" : `\nGOLDEN: ${fails} FAILURE(S)`);
process.exit(fails === 0 ? 0 : 1);
