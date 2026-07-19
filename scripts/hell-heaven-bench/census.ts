// M1 — Two-part-dose census (R0 of the Hell Heaven Benchmark).
//
// Tokenizes every skill contract TWICE (ratified finding 2 — never one number):
//   * standing dose   = the one-line listing an installed skill costs every session
//                       (built deterministically as `- <name>: <description>` from the
//                       SKILL.md frontmatter, whitespace-collapsed to one line)
//   * invocation dose = the full SKILL.md body, paid only when the skill is invoked
//
// Sources, in two modes (both may run in one invocation):
//   --repo <path>    scan a repo's local skill dirs (.claude/skills, .agents/skills,
//                    .pi/skills, .codex/skills) for SKILL.md contracts. This is the mode
//                    Heaven's below-vanilla delta is computed from — point it at any repo.
//   --canon <path>   a gaia-skill-tree checkout: scans its in-tree SKILL.md contracts
//                    (same scanner) AND its registry listings — graph nodes
//                    (registry/nodes/{basic,extra,ultimate}/*.json, desc+summary — the
//                    surface H1 measured) and named skills (registry/named/**/*.md,
//                    frontmatter description). Registry listings have a standing dose
//                    only; their bodies live upstream (hash-pinned in skills-lock.json),
//                    so their invocation dose is reported as null — explicitly unpriced,
//                    never zero.
//
// Default (no flags): use ../gaia-skill-tree as the canon sibling if present (same
// discipline as generate-templates.ts), else census the current repo's skill dirs.
//
// Tokenizer: chars4 — max(1, floor(len/4)), byte-for-byte the estimate_tokens() proxy
// the H1 registry-proxy prototype used (marketing-tasks/scripts/hell-heaven-bench/
// ledger.py), so R0 numbers are directly comparable with the H1 standing-dose result.
// It is a proxy, not the Claude tokenizer; the backend is recorded in every artifact
// and pluggable when a counted backend lands.
//
// Output: human summary on stdout; --json <path> writes the R0 ledger artifact.
//
// Run:
//   npx tsx scripts/hell-heaven-bench/census.ts --canon ../gaia-skill-tree \
//     --json content/reports/hh-benchmark/data/r0-census.json
//   npx tsx scripts/hell-heaven-bench/census.ts --repo .
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

// ---------------------------------------------------------------------------
// Tokenizer (pluggable; record the backend in every artifact)

export type TokenizerId = "chars4";

export function tokenize(text: string, backend: TokenizerId = "chars4"): number {
  if (backend !== "chars4") throw new Error(`unknown tokenizer backend: ${backend}`);
  // H1 parity: Python `max(1, len(text or "") // 4)` on the raw string.
  return Math.max(1, Math.floor((text ?? "").length / 4));
}

// ---------------------------------------------------------------------------
// Minimal frontmatter reader (name/description/id only; handles folded `>-`
// scalars and indented continuation lines — enough for SKILL.md and the
// registry's named-skill records without adding a YAML dependency).

export function readFrontmatter(src: string): Record<string, string> {
  const lines = src.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return {};
  const out: Record<string, string> = {};
  let key: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (key) out[key] = buf.join(" ").replace(/\s+/g, " ").trim();
    key = null;
    buf = [];
  };
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "---") break;
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (m) {
      flush();
      key = m[1];
      const v = m[2].trim();
      buf = v === ">-" || v === ">" || v === "|" || v === "|-" ? [] : [stripQuotes(v)];
    } else if (key && /^\s+\S/.test(line)) {
      buf.push(line.trim());
    } else if (key && line.trim() === "") {
      // blank line inside a folded scalar — keep collecting
    } else {
      flush();
    }
  }
  flush();
  return out;
}

function stripQuotes(v: string): string {
  if (v.length >= 2 && ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'")))) {
    return v.slice(1, -1);
  }
  return v;
}

// ---------------------------------------------------------------------------
// Records

export interface ContractRecord {
  id: string; // skill name from frontmatter, else dir name
  source: string; // path relative to the scanned root
  listingLine: string; // the reconstructed one-line listing
  standingTokens: number;
  invocationTokens: number; // full SKILL.md file
  overstatement: number; // invocation / standing — how much "tokenize the file" overstates
  contentSha256: string; // hash of the full SKILL.md (stamp hash-binding uses this shape)
}

export interface ListingRecord {
  id: string;
  source: string;
  kind: "graph-node" | "named-skill";
  listingLine: string;
  standingTokens: number;
  invocationTokens: null; // body lives upstream — unpriced here, never zero
}

const SKILL_DIRS = [".claude/skills", ".agents/skills", ".pi/skills", ".codex/skills"];

export function scanContracts(root: string): ContractRecord[] {
  const records: ContractRecord[] = [];
  for (const dir of SKILL_DIRS) {
    const base = join(root, dir);
    if (!existsSync(base)) continue;
    for (const file of walk(base)) {
      if (basename(file) !== "SKILL.md") continue;
      const src = readFileSync(file, "utf-8");
      const fm = readFrontmatter(src);
      const id = fm.name || basename(join(file, ".."));
      const listingLine = makeListingLine(id, fm.description ?? "");
      const standingTokens = tokenize(listingLine);
      const invocationTokens = tokenize(src);
      records.push({
        id,
        source: relative(root, file),
        listingLine,
        standingTokens,
        invocationTokens,
        overstatement: round2(invocationTokens / standingTokens),
        contentSha256: createHash("sha256").update(src).digest("hex"),
      });
    }
  }
  return records.sort((a, b) => a.source.localeCompare(b.source));
}

export function makeListingLine(id: string, description: string): string {
  return `- ${id}: ${description}`.replace(/\s+/g, " ").trim();
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield p;
  }
}

// Canon registry listings ----------------------------------------------------

export function scanGraphNodes(canon: string): ListingRecord[] {
  const out: ListingRecord[] = [];
  for (const tier of ["basic", "extra", "ultimate"]) {
    const dir = join(canon, "registry/nodes", tier);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
      const n = JSON.parse(readFileSync(join(dir, f), "utf-8"));
      // H1 parity: description + " " + summary (ledger.py record_skill_load call shape).
      const listing = `${n.description ?? ""} ${n.summary ?? ""}`.replace(/\s+/g, " ").trim();
      out.push({
        id: n.id ?? f.replace(/\.json$/, ""),
        source: relative(canon, join(dir, f)),
        kind: "graph-node",
        listingLine: listing,
        standingTokens: tokenize(listing),
        invocationTokens: null,
      });
    }
  }
  return out;
}

export function scanNamedSkills(canon: string): ListingRecord[] {
  const base = join(canon, "registry/named");
  if (!existsSync(base)) return [];
  const out: ListingRecord[] = [];
  for (const file of walk(base)) {
    if (!file.endsWith(".md")) continue;
    const fm = readFrontmatter(readFileSync(file, "utf-8"));
    const id = fm.id || relative(base, file).replace(/\.md$/, "");
    const listingLine = makeListingLine(id, fm.description ?? "");
    out.push({
      id,
      source: relative(canon, file),
      kind: "named-skill",
      listingLine,
      standingTokens: tokenize(listingLine),
      invocationTokens: null,
    });
  }
  return out.sort((a, b) => a.source.localeCompare(b.source));
}

// ---------------------------------------------------------------------------
// Distribution stats (nearest-rank percentiles)

export interface Distribution {
  count: number;
  sum: number;
  mean: number;
  min: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  max: number;
}

export function distribution(values: number[]): Distribution | null {
  if (values.length === 0) return null;
  const v = [...values].sort((a, b) => a - b);
  const pct = (p: number) => v[Math.max(0, Math.ceil((p / 100) * v.length) - 1)];
  const sum = round2(v.reduce((a, b) => a + b, 0));
  return {
    count: v.length,
    sum,
    mean: round2(sum / v.length),
    min: v[0],
    p25: pct(25),
    median: pct(50),
    p75: pct(75),
    p90: pct(90),
    max: v[v.length - 1],
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Main

interface Args {
  repo?: string;
  canon?: string;
  json?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--repo") args.repo = argv[++i];
    else if (a === "--canon") args.canon = argv[++i];
    else if (a === "--json") args.json = argv[++i];
    else throw new Error(`unknown arg: ${a} (usage: census.ts [--repo <path>] [--canon <gaia-skill-tree>] [--json <out>])`);
  }
  return args;
}

function gitHead(dir: string): string | null {
  try {
    return execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], { encoding: "utf-8" }).trim();
  } catch {
    return null;
  }
}

export function runCensus(args: Args) {
  let canon = args.canon;
  let repo = args.repo;
  if (!canon && !repo) {
    if (existsSync("../gaia-skill-tree/registry")) canon = "../gaia-skill-tree";
    else repo = ".";
  }

  const tokenizer: TokenizerId = "chars4";
  const sources: Record<string, unknown> = {};
  let contracts: ContractRecord[] = [];
  let nodes: ListingRecord[] = [];
  let named: ListingRecord[] = [];

  if (repo) {
    contracts = contracts.concat(scanContracts(resolve(repo)));
    sources.repo = { path: resolve(repo), commit: gitHead(repo) };
  }
  if (canon) {
    contracts = contracts.concat(scanContracts(resolve(canon)));
    nodes = scanGraphNodes(resolve(canon));
    named = scanNamedSkills(resolve(canon));
    sources.canon = { path: resolve(canon), commit: gitHead(canon) };
  }

  // Dedupe contracts by content hash: the same skill exposed to two harnesses
  // (.claude/skills AND .agents/skills) is one contract, listed twice.
  const byHash = new Map<string, ContractRecord[]>();
  for (const c of contracts) {
    const list = byHash.get(c.contentSha256) ?? [];
    list.push(c);
    byHash.set(c.contentSha256, list);
  }
  const unique = [...byHash.values()].map((dupes) => dupes[0]);

  const standingAll = distribution(contracts.map((c) => c.standingTokens));
  const standing = distribution(unique.map((c) => c.standingTokens));
  const invocation = distribution(unique.map((c) => c.invocationTokens));
  const overstatement = distribution(unique.map((c) => c.overstatement));
  const nodeStanding = distribution(nodes.map((n) => n.standingTokens));
  const namedStanding = distribution(named.map((n) => n.standingTokens));

  const artifact = {
    artifact: "hh-benchmark R0 two-part-dose census",
    milestone: "M1",
    generatedAt: new Date().toISOString(),
    tokenizer: {
      backend: tokenizer,
      note:
        "chars4 = max(1, floor(chars/4)); H1-prototype parity (marketing-tasks " +
        "scripts/hell-heaven-bench/ledger.py estimate_tokens). Proxy, not the Claude tokenizer.",
    },
    sources,
    doses: {
      standing: "one-line listing (`- name: description`), paid every session while installed",
      invocation: "full SKILL.md body, paid only on invoke",
    },
    contracts: {
      scanned: contracts.length,
      unique: unique.length,
      standingTokens: standing,
      standingTokensIncludingDuplicates: standingAll,
      invocationTokens: invocation,
      overstatementFactor: overstatement,
      records: unique
        .map(({ listingLine: _l, ...rest }) => rest)
        .sort((a, b) => a.source.localeCompare(b.source)),
    },
    registryListings:
      nodes.length + named.length > 0
        ? {
            note:
              "Standing dose only. Bodies live upstream (hash-pinned in skills-lock.json): " +
              "invocation dose is UNPRICED here (null), never zero.",
            graphNodes: { count: nodes.length, standingTokens: nodeStanding },
            namedSkills: { count: named.length, standingTokens: namedStanding },
          }
        : null,
    h1Restatement: {
      claim:
        "H1's -97.4% (research/hell-heaven-h1/ledger.md) is a STANDING-DOSE claim: top-5 " +
        "evidenced skills carried 249 standing tokens vs 9,453 for all 243 graph-node " +
        "listings (live graph, 2026-07-16 snapshot, same chars4 proxy). It is not a " +
        "total-token or invocation-dose claim; invocation dose was unpriced there and is " +
        "priced (for in-tree contracts) by this census. Net total saving remains PENDING " +
        "the R2 paired benchmark.",
      publishedStandingTokens: { allGraphNodeListings: 9453, top5Evidenced: 249, deltaPct: -97.4 },
      thisCheckoutStandingTokens: nodeStanding ? { allGraphNodeListings: nodeStanding.sum } : null,
    },
  };

  return artifact;
}

function fmtDist(label: string, d: Distribution | null): string {
  if (!d) return `${label}: (empty)`;
  return (
    `${label}: n=${d.count} sum=${d.sum} mean=${d.mean} ` +
    `min=${d.min} p25=${d.p25} med=${d.median} p75=${d.p75} p90=${d.p90} max=${d.max}`
  );
}

const isMain = process.argv[1]?.endsWith("census.ts");
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const artifact = runCensus(args);
  const c = artifact.contracts;
  console.log(`Two-part-dose census (${artifact.tokenizer.backend})`);
  console.log(`  contracts: ${c.scanned} scanned, ${c.unique} unique by content hash`);
  console.log("  " + fmtDist("standing  ", c.standingTokens));
  console.log("  " + fmtDist("invocation", c.invocationTokens));
  console.log("  " + fmtDist("overstate ", c.overstatementFactor));
  if (artifact.registryListings) {
    const r = artifact.registryListings;
    console.log("  " + fmtDist(`graph-nodes standing (n=${r.graphNodes.count})`, r.graphNodes.standingTokens));
    console.log("  " + fmtDist(`named-skill standing (n=${r.namedSkills.count})`, r.namedSkills.standingTokens));
  }
  if (args.json) {
    mkdirSync(dirname(args.json), { recursive: true });
    writeFileSync(args.json, JSON.stringify(artifact, null, 2) + "\n");
    console.log(`  wrote ${args.json}`);
  }
}
