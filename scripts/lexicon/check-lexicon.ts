// Vocabulary-drift gate for the Skill Heaven / Skill Hell line.
//
// WHY THIS EXISTS. The PR #4 review found the shipped posture set diverging
// from the ratified one ("add-ons" duplicating "curated" under a new label,
// "lean" with no P1 authorisation) and named the cause: "oracle governance
// lacks vocabulary-drift detection." It was right. Measured at the time this
// gate was written, `posture` appeared in 14 docs and `slider` in 11, and the
// oracle's supersession log (549 words) had grown 2.9x longer than the section
// defining what the postures actually are (191 words). Drift was being caught
// by human review, inconsistently, one doc at a time. This makes it a build
// failure instead.
//
// WHAT IT CHECKS, over founder/lexicon.json:
//   1. The lexicon is internally well-formed — no duplicate terms, every
//      `banned` term carries a `replacement`, every state is one of the four.
//   2. No `banned` term appears in any scanned file. Banned means the oracle
//      already retired it (N3's Heaven-0/Heaven-1, N9's hh-launcher, B3's seed).
//   3. No `parked` term appears in user-facing copy or shipped code. Parked
//      means coined-but-unchosen; it is legal in docs/ because you must be able
//      to think in unsettled words, and illegal in front of a reader because
//      shipping one is how it becomes permanent by accident.
//   4. founder/LEXICON.md is in sync with the JSON (it is generated, not
//      hand-written). --emit regenerates it.
//
// WHAT IT DELIBERATELY DOES NOT DO. It does not ban a term this project is
// still arguing about. `lean`, `slider`, `notch` and `budget` are all `parked`,
// not `banned`, because banning them here would settle a live question by
// writing a linter — which is the same failure mode as deciding something in a
// plan doc. Only founder/RATIFICATION.md retires a word; this gate enforces
// what the oracle already ruled.
//
// SCOPES. A term may carry `"scope": ["user-facing"]` to narrow where it is
// enforced. Two terms need this: `lean` (111 files, nearly all `clean` /
// `lean bundle`) and `tier` (42 files, mostly the ratified `auth@tier` stamp
// sense). A blanket rule on those two would cry wolf on day one and get the
// gate switched off by week two, so they are checked only where the word is
// load-bearing.
//
// ESCAPE HATCH. A line carrying `<!-- lexicon-allow -->` is skipped. This is
// required, not a loophole: the oracle's supersession log has to be able to say
// "hh-launcher is retired" without failing the gate that retired it.
//
// KNOWN LIMITATIONS (the gate's edges, stated rather than silently left):
//   * Word-boundary regex over raw text. It does not parse markdown, so a
//     banned term inside a fenced code block is still flagged — intentional
//     (a retired name in a copy-pasteable command is exactly the drift to
//     catch), but it means legitimate historical commands need the marker.
//   * Case-insensitive. `Milim` and `milim` are one term.
//   * Multi-word terms match across single spaces only; a term broken across a
//     line wrap is not caught.
//   * Scope membership is by path glob, so a doc moved between directories
//     silently changes which rules apply to it.
//   * It checks vocabulary, never semantics. A doc can use every word correctly
//     and still describe the product wrongly.
//
// THE BASELINE. Introducing this gate against existing docs produced 39
// findings, every one of them in a doc already queued for rewrite. Two bad
// options: land it non-blocking (it gets ignored by week two) or block every PR
// until the rewrites finish (it gets deleted by week one). So baseline.json
// records the known debt as {file: {term: count}}, and the gate fails only on
// findings ABOVE the baseline — new drift is blocked from day one while the
// backlog burns down. Counts, not line numbers, so ordinary edits don't churn
// it. The outstanding total is printed on every success so it stays visible
// instead of becoming furniture.
//
// CLI:
//   npx tsx scripts/lexicon/check-lexicon.ts            # check (exit 1 on NEW drift)
//   npx tsx scripts/lexicon/check-lexicon.ts --emit     # regenerate LEXICON.md
//   npx tsx scripts/lexicon/check-lexicon.ts --strict   # ignore the baseline
//   npx tsx scripts/lexicon/check-lexicon.ts --update-baseline
//   npx tsx scripts/lexicon/check-lexicon.ts --file a.md --file b.md
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");

const STATES = ["canonical", "banned", "parked", "frozen"] as const;
type State = (typeof STATES)[number];

export type Term = {
  term: string;
  state: State;
  group?: string;
  oracle?: string;
  definition: string;
  replacement?: string;
  proposed_replacement?: string;
  note?: string;
  scope?: string[];
  /** "exact-case" for ALL-CAPS labels whose lowercase form is ordinary English. */
  match?: "exact-case";
  /**
   * Regexes that exempt a match. A one-word ban is too blunt when the word has
   * more than one sense: `seed` is retired in the determinism sense (B3) but a
   * "seed set" of skills to hand-label is a different thing entirely. Without
   * this the gate flags the wrong sense and gets silenced with markers, which
   * is how a linter dies.
   */
  except?: string[];
};

export type Lexicon = {
  lexicon: string;
  namespace: string;
  extends: string | null;
  updated: string;
  about?: string;
  scopes: Record<string, { about?: string; include: string[] }>;
  exclude: string[];
  terms: Term[];
};

export type Finding = {
  file: string;
  line: number;
  term: string;
  state: State;
  message: string;
};

/** Convert a glob to a RegExp. Supports **, *, ? and {a,b} alternation. */
export function globToRegExp(glob: string): RegExp {
  let out = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        // `**/` consumes the slash so `**/*.md` also matches a root-level file.
        if (glob[i + 2] === "/") {
          out += "(?:.*/)?";
          i += 2;
        } else {
          out += ".*";
          i += 1;
        }
      } else {
        out += "[^/]*";
      }
    } else if (c === "?") {
      out += "[^/]";
    } else if (c === "{") {
      const close = glob.indexOf("}", i);
      if (close === -1) {
        out += "\\{";
      } else {
        const alts = glob.slice(i + 1, close).split(",");
        out += `(?:${alts.map((a) => a.replace(/[.+^${}()|[\]\\]/g, "\\$&")).join("|")})`;
        i = close;
      }
    } else if (".+^$()|[]\\".includes(c)) {
      out += `\\${c}`;
    } else {
      out += c;
    }
  }
  return new RegExp(`^${out}$`);
}

export function matchesAny(path: string, globs: string[]): boolean {
  return globs.some((g) => globToRegExp(g).test(path));
}

/** Decision ids the oracle actually defines, e.g. {"D12","P1",…}. */
export function oracleEntryIds(oracleText: string): Set<string> {
  return new Set([...oracleText.matchAll(/^\|\s*([A-Z]\d+)\s*\|/gm)].map((m) => m[1]));
}

/**
 * Validate the lexicon's own shape. A malformed lexicon is a hard failure.
 *
 * When `oracleIds` is supplied, every `oracle` citation must resolve to a real
 * entry. A term citing an entry that no longer exists is worse than an
 * uncited one: it carries borrowed authority from something deleted.
 */
export function validateLexicon(lex: Lexicon, oracleIds?: Set<string>): string[] {
  const errors: string[] = [];
  if (lex.lexicon !== "1") errors.push(`unknown lexicon schema version: ${lex.lexicon}`);

  const seen = new Map<string, number>();
  for (const t of lex.terms) {
    const key = t.term.toLowerCase();
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if (!STATES.includes(t.state)) errors.push(`${t.term}: invalid state "${t.state}"`);
    if (t.state === "banned" && !t.replacement)
      errors.push(`${t.term}: state "banned" requires a "replacement"`);
    if (t.state === "banned" && !t.oracle)
      errors.push(
        `${t.term}: state "banned" requires an "oracle" citation — only RATIFICATION.md retires a word`,
      );
    if (!t.definition?.trim()) errors.push(`${t.term}: missing definition`);
    for (const s of t.scope ?? [])
      if (!lex.scopes[s]) errors.push(`${t.term}: unknown scope "${s}"`);
    for (const p of t.except ?? [])
      try { new RegExp(p); } catch { errors.push(`${t.term}: invalid except pattern "${p}"`); }
    if (oracleIds && t.oracle) {
      for (const id of t.oracle.match(/[A-Z]\d+/g) ?? [])
        if (!oracleIds.has(id))
          errors.push(`${t.term}: cites oracle entry "${id}", which RATIFICATION.md does not define`);
    }
  }
  for (const [term, n] of seen) if (n > 1) errors.push(`duplicate term: "${term}" (${n}x)`);
  return errors;
}

/** Which scopes a repo-relative path belongs to. */
export function scopesFor(path: string, lex: Lexicon): string[] {
  return Object.entries(lex.scopes)
    .filter(([, def]) => matchesAny(path, def.include))
    .map(([name]) => name);
}

function termPattern(t: Term): RegExp {
  const escaped = t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
  // \b fails against a leading/trailing non-word char (e.g. "-only"), so anchor
  // on "not a word character" instead, which behaves for hyphenated terms.
  // Status labels (CURRENT, INVARIANT) match case-sensitively — their lowercase
  // forms are ordinary English and matched 188 innocent lines when they didn't.
  return new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, t.match === "exact-case" ? "g" : "gi");
}

export function scanText(text: string, path: string, lex: Lexicon): Finding[] {
  const findings: Finding[] = [];
  const inScopes = scopesFor(path, lex);
  const lines = text.split(/\r?\n/);

  for (const t of lex.terms) {
    if (t.state !== "banned" && t.state !== "parked") continue;

    // A term with an explicit scope list is only enforced inside those scopes.
    if (t.scope && !t.scope.some((s) => inScopes.includes(s))) continue;

    // Parked vocabulary is legal in docs and illegal in front of a reader.
    if (t.state === "parked") {
      const exposed = inScopes.includes("user-facing") || inScopes.includes("code");
      if (!exposed) continue;
    }

    const re = termPattern(t);
    lines.forEach((line, i) => {
      // Same-line marker, or the preceding line (the eslint-disable-next-line
      // convention). The preceding-line form exists because a JSX opening tag
      // cannot host a `{/* */}` comment among its attributes, and the homepage's
      // `<section id="skill-heaven-hell">` is exactly that case.
      if (line.includes("lexicon-allow")) return;
      if (i > 0 && lines[i - 1].includes("lexicon-allow")) return;
      re.lastIndex = 0;
      if (!re.test(line)) return;
      if (t.except?.some((p) => new RegExp(p, "i").test(line))) return;
      findings.push({
        file: path,
        line: i + 1,
        term: t.term,
        state: t.state,
        message:
          t.state === "banned"
            ? `retired by ${t.oracle} — use "${t.replacement}"`
            : `parked vocabulary in ${inScopes.includes("code") ? "shipped code" : "user-facing copy"} — unchosen, must not ship`,
      });
    });
  }
  return findings.sort((a, b) => a.line - b.line);
}

function walk(dir: string, lex: Lexicon, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = relative(ROOT, abs).split(sep).join("/");
    if (matchesAny(rel, lex.exclude) || matchesAny(`${rel}/`, lex.exclude)) continue;
    if (entry.startsWith(".") && entry !== ".github") continue;
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs, lex, acc);
    else if (/\.(md|mdx|ts|tsx)$/.test(entry)) acc.push(rel);
  }
  return acc;
}

/** Files in scope: anything a scope's globs claim, minus the exclusions. */
export function filesInScope(lex: Lexicon): string[] {
  const all = walk(ROOT, lex);
  const anyScope = Object.values(lex.scopes).flatMap((s) => s.include);
  return all.filter((f) => matchesAny(f, anyScope)).sort();
}

export type Baseline = { about?: string; generated?: string; findings: Record<string, Record<string, number>> };

export function tally(findings: Finding[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const f of findings) {
    out[f.file] ??= {};
    out[f.file][f.term] = (out[f.file][f.term] ?? 0) + 1;
  }
  return out;
}

/**
 * Findings above the baseline. A (file, term) pair absent from the baseline is
 * new; a pair present but with more occurrences than recorded is new drift too.
 * Excess is attributed to the last occurrences in the file so the reported line
 * numbers point at something real.
 */
export function aboveBaseline(findings: Finding[], base: Baseline | null): Finding[] {
  if (!base) return findings;
  const budget = new Map<string, number>();
  for (const [file, terms] of Object.entries(base.findings))
    for (const [term, n] of Object.entries(terms)) budget.set(`${file} ${term}`, n);

  const out: Finding[] = [];
  for (const f of findings) {
    const key = `${f.file} ${f.term}`;
    const left = budget.get(key) ?? 0;
    if (left > 0) budget.set(key, left - 1);
    else out.push(f);
  }
  return out;
}

export function renderMarkdown(lex: Lexicon): string {
  const groups = [...new Set(lex.terms.map((t) => t.group ?? "other"))];
  const badge: Record<State, string> = {
    canonical: "✅ canonical",
    banned: "⛔ banned",
    parked: "🅿️ parked",
    frozen: "🧊 frozen",
  };
  const out: string[] = [
    "# LEXICON — vocabulary of record",
    "",
    "<!-- GENERATED FROM founder/lexicon.json — DO NOT EDIT BY HAND. -->",
    "<!-- Regenerate: npx tsx scripts/lexicon/check-lexicon.ts --emit -->",
    "<!-- lexicon-allow -->",
    "",
    `> Schema \`${lex.lexicon}\` · namespace \`${lex.namespace}\` · updated **${lex.updated}**.`,
    ">",
    "> A term is defined in **exactly one** lexicon file, ever. Extensions (e.g.",
    "> `marketing-tasks/founder/lexicon.brand.json`) **add** terms in their own",
    "> namespace and may never redefine a core term.",
    "",
    "| State | Meaning | Where allowed |",
    "|---|---|---|",
    "| ✅ `canonical` | The word. Use this. | everywhere |",
    "| ⛔ `banned` | The oracle retired it. CI fails. | nowhere (except `**/archived/**`) |",
    "| 🅿️ `parked` | Coined but unchosen. | `docs/` only — never user-facing copy or code |",
    "| 🧊 `frozen` | Meant something specific once. | `**/archived/**` only |",
    "",
    "**A term is `banned` only when `RATIFICATION.md` already retired it.** A term",
    "this project is still arguing about is `parked`. Writing a linter is not a way",
    "to make a decision.",
    "",
  ];

  for (const g of groups) {
    out.push(`## ${g}`, "");
    out.push("| Term | State | Oracle | Definition |", "|---|---|---|---|");
    for (const t of lex.terms.filter((x) => (x.group ?? "other") === g)) {
      const extra = [
        t.replacement ? `**Use \`${t.replacement}\`.**` : "",
        t.proposed_replacement ? `Proposed: \`${t.proposed_replacement}\` (unratified).` : "",
        t.note ? t.note : "",
      ]
        .filter(Boolean)
        .join(" ");
      const def = `${t.definition}${extra ? ` ${extra}` : ""}`.replace(/\|/g, "\\|");
      out.push(`| \`${t.term}\` | ${badge[t.state]} | ${t.oracle ?? "—"} | ${def} |`);
    }
    out.push("");
  }
  return out.join("\n");
}

function main(argv: string[]): number {
  const lexPath = join(ROOT, "founder", "lexicon.json");
  if (!existsSync(lexPath)) {
    console.error(`✗ lexicon not found: ${relative(ROOT, lexPath)}`);
    return 1;
  }
  const lex: Lexicon = JSON.parse(readFileSync(lexPath, "utf8"));

  const oraclePath = join(ROOT, "founder", "RATIFICATION.md");
  const oracleIds = existsSync(oraclePath)
    ? oracleEntryIds(readFileSync(oraclePath, "utf8"))
    : undefined;
  const schemaErrors = validateLexicon(lex, oracleIds);
  if (schemaErrors.length) {
    console.error("✗ founder/lexicon.json is malformed:");
    for (const e of schemaErrors) console.error(`    ${e}`);
    return 1;
  }

  const mdPath = join(ROOT, "founder", "LEXICON.md");
  const rendered = renderMarkdown(lex);
  if (argv.includes("--emit")) {
    writeFileSync(mdPath, `${rendered}\n`);
    console.log(`✓ wrote founder/LEXICON.md (${lex.terms.length} terms)`);
    return 0;
  }

  const explicit = argv.reduce<string[]>((acc, a, i) => {
    if (a === "--file" && argv[i + 1]) acc.push(argv[i + 1]);
    return acc;
  }, []);
  const files = explicit.length ? explicit : filesInScope(lex);

  const allFindings: Finding[] = [];
  for (const f of files) {
    const abs = join(ROOT, f);
    if (!existsSync(abs)) {
      console.error(`✗ no such file: ${f}`);
      return 1;
    }
    allFindings.push(...scanText(readFileSync(abs, "utf8"), f, lex));
  }

  const basePath = join(ROOT, "scripts", "lexicon", "baseline.json");
  if (argv.includes("--update-baseline")) {
    const next: Baseline = {
      about:
        "Known vocabulary debt at the time the gate landed. Every entry is drift the gate WOULD flag, parked here so new drift can be blocked immediately instead of waiting for the rewrites. Shrink this file; never grow it. An entry disappears when the doc that owns it is rewritten.",
      generated: new Date().toISOString().slice(0, 10),
      findings: tally(allFindings),
    };
    writeFileSync(basePath, `${JSON.stringify(next, null, 2)}\n`);
    console.log(`✓ baseline updated — ${allFindings.length} known finding(s)`);
    return 0;
  }

  const base: Baseline | null =
    !argv.includes("--strict") && existsSync(basePath)
      ? JSON.parse(readFileSync(basePath, "utf8"))
      : null;
  const findings = aboveBaseline(allFindings, base);
  const carried = allFindings.length - findings.length;

  // LEXICON.md is generated; drift between it and the JSON is a failure too.
  const staleDoc = !existsSync(mdPath) || readFileSync(mdPath, "utf8").trim() !== rendered.trim();
  if (staleDoc && !explicit.length) {
    console.error("✗ founder/LEXICON.md is out of sync with founder/lexicon.json");
    console.error("    fix: npx tsx scripts/lexicon/check-lexicon.ts --emit");
  }

  if (findings.length) {
    console.error(`✗ ${findings.length} NEW vocabulary finding(s) above the baseline:\n`);
    let current = "";
    for (const f of findings) {
      if (f.file !== current) {
        console.error(`  ${f.file}`);
        current = f.file;
      }
      console.error(`    ${f.line}: "${f.term}" — ${f.message}`);
    }
    console.error(
      '\n  A line that must mention a retired term (an audit trail, a supersession\n  note) may carry an inline `<!-- lexicon-allow -->` marker.',
    );
  }

  if (findings.length || staleDoc) return 1;
  console.log(
    `✓ lexicon clean — ${lex.terms.length} terms, ${files.length} files scanned, 0 new findings`,
  );
  if (carried > 0) {
    const owed = Object.entries(tally(allFindings))
      .map(([f, terms]) => `${f} (${Object.values(terms).reduce((a, b) => a + b, 0)})`)
      .join(", ");
    console.log(`  carrying ${carried} baselined finding(s) — outstanding rewrite debt: ${owed}`);
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  process.exit(main(process.argv.slice(2)));
}
