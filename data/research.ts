// Public research portal data.
//
// SKILLS are modeled as data keyed by their canonical repo slug under the
// gaia-research org (e.g. "skill-ci-churn"). EVERYTHING else is derived from
// that slug — display name, repo URL, install command, and Skill-Tree URL —
// so that adding a skill (or renaming one, e.g. dropping the "skill-" prefix
// later) is a one-line change here and the whole site adapts automatically.
//
// Install is via npx:  npx skills install gaia-research/<slug>
//
// `inTree`   -> already browsable in the Skill Tree explorer.
// `surface`  -> an on-site page that demonstrates or documents the skill
//               (a live lab, a research report). Omit if there's no page yet.

const ORG = "gaia-research";

export type SkillStatus = "ACT" | "WIP" | "PLN";

export type Skill = {
  slug: string;            // canonical repo name, e.g. "skill-ci-churn"
  blurb: string;           // one line, plain
  status: SkillStatus;
  inTree: boolean;         // live in the Skill Tree explorer
  surface?: { label: string; href: string }; // on-site demo / report
};

const skills = [
  {
    slug: "skill-context-diet",
    blurb: "Measure and compact an oversized agent-context file under the harness limit without dropping a single rule.",
    status: "WIP",
    inTree: false, // context-diet to be added to the tree later
    surface: { label: "Play Context Diet", href: "/labs/context-diet" },
  },
  {
    slug: "skill-ci-churn",
    blurb: "GitHub Actions cost analyzer and flaky-test detector: measure wasted CI compute and prevent retry-push churn.",
    status: "ACT",
    inTree: true,
    surface: { label: "Read the postmortem", href: "/research/ci-churn" },
  },
  {
    slug: "skill-cost",
    blurb: "Multi-harness token-usage cost reporter for pi, Claude Code, Codex, and opencode session logs.",
    status: "ACT",
    inTree: false,
    surface: { label: "Read the research plan", href: "/research/cost" },
  },
  {
    slug: "skill-fuse",
    blurb: "Compose two installed agent skills into one unified SKILL.md — the composition engine behind the Skill Tree.",
    status: "ACT",
    inTree: true,
  },
  {
    slug: "skill-scout-fleet",
    blurb: "Parallel cheap-scout fan-out harness (2x, 4x, or cascaded funnel) with zero-token RRF deduplication.",
    status: "ACT",
    inTree: true,
    surface: { label: "Read the benchmark", href: "/research/parallel-scouting" },
  },
] as const satisfies readonly Skill[];

// ── Derivations (never hard-code these downstream) ──────────────────────────
export const displayName = (slug: string) => slug.replace(/^skill-/, "");
export const repoUrl = (slug: string) => `https://github.com/${ORG}/${slug}`;
export const installCmd = (slug: string) => `npx skills install ${ORG}/${slug}`;
export const treeUrl = (slug: string) => `https://gaiaskilltree.com/named/#explorer/${ORG}/${slug}`;

export const allSkills: readonly Skill[] = skills;
export { allSkills as skills };

// ── Research ledger: published evidence, not installable tools ──────────────
// href "" renders as plain text (no destination yet). External URLs open in a
// new tab; internal routes and #anchors navigate in place.

export type LedgerStatus = "ACT" | "PRP" | "VRF" | "REV" | "WIP" | "PLN";

export const statusText: Record<LedgerStatus, string> = {
  ACT: "ACTIVE",
  PRP: "PROPOSED",
  VRF: "VERIFIED",
  REV: "IN REVIEW",
  WIP: "EXPERIMENTAL",
  PLN: "PLANNED",
} as const;

export type ResearchEntry = {
  title: string;
  shortName?: string;
  type: string;
  status: LedgerStatus;
  description: string;
  href: string;
  action: string;
};

export const researchEntries: readonly ResearchEntry[] = [
  {
    title: "Context Diet",
    shortName: "Context Diet",
    type: "LAB",
    status: "WIP",
    description: "Local token-budget estimator; comparative benchmark results pending review.",
    href: "/labs/context-diet",
    action: "Play Context Diet",
  },
  {
    title: "The Compounding Cost of CI Failures",
    type: "POSTMORTEM",
    status: "VRF",
    description: "Postmortem of Epic #780 introducing CI Churn as a first-class cost metric.",
    href: "/research/ci-churn",
    action: "Read the postmortem",
  },
  {
    title: "When Agents Report Their Own Cost",
    shortName: "Agent Cost Reporting",
    type: "RESEARCH PLAN",
    status: "PRP",
    description: "Proposed study of the gap between agent estimates, rate-card totals, and invoices.",
    href: "/research/cost",
    action: "Read the plan",
  },
  {
    title: "Gaia MCP",
    type: "PRODUCT",
    status: "ACT",
    description: "Model Context Protocol server exposing the Gaia Skill Tree to Claude Code, Codex, and Cursor.",
    href: "/mcp",
    action: "Learn more",
  },
  {
    title: "Parallel Cheap-Scout Fan-Out Benchmark",
    shortName: "Scout Fan-Out",
    type: "BENCHMARK",
    status: "VRF",
    description: "Empirical study of parallel cheap-scout fan-out vs single mid-tier scouts across 360 runs: Pareto frontier, prompt-cache amplification, and flake rate reduction.",
    href: "/research/parallel-scouting",
    action: "Read the benchmark & receipts",
  },
  {
    title: "The Hell Heaven Benchmark",
    shortName: "HH Benchmark",
    type: "BENCHMARK",
    status: "VRF",
    description: "Drug-trial method for scoring skills by marginal efficacy against model baselines. Arc I verified: baseline floor pricing, census, and machine-gated claim index.",
    href: "/research/hh-benchmark",
    action: "Read the benchmark & receipts",
  },
] as const;

export const ledger = researchEntries.map((e) => [
  e.shortName ?? e.title,
  e.type,
  e.status,
  e.description,
  e.href,
]) as readonly (readonly [string, string, LedgerStatus, string, string])[];

