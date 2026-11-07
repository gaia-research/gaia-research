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
    blurb: "Trim oversized agent-context files below the harness ceiling without dropping a single rule.",
    status: "WIP",
    inTree: false, // context-diet to be added to the tree later
    surface: { label: "Play Context Diet", href: "/labs/context-diet" },
  },
  {
    slug: "skill-ci-churn",
    blurb: "Trace wasted GitHub Actions compute, isolate flaky tests, and stop retry-push loops.",
    status: "ACT",
    inTree: true,
    surface: { label: "Read the postmortem", href: "/research/ci-churn" },
  },
  {
    slug: "skill-cost",
    blurb: "Audit token spend across Pi, Claude Code, Codex, and OpenCode session logs against public rate cards.",
    status: "ACT",
    inTree: false,
    surface: { label: "Read the research plan", href: "/research/cost" },
  },
  {
    slug: "skill-fuse",
    blurb: "Fuse two installed skills into one coherent SKILL.md—the composition engine behind the Skill Tree.",
    status: "ACT",
    inTree: true,
  },
  {
    slug: "skill-scout-fleet",
    blurb: "Fan out 2× or 4× lightweight scouts with zero-token RRF deduplication before touching code.",
    status: "ACT",
    inTree: true,
    surface: { label: "Read the benchmark", href: "/research/parallel-scouting" },
  },
  {
    slug: "skill-image-tuner",
    blurb: "Tune bounding-box crops, zoom, and framing interactively with live coordinate and CSS export.",
    status: "ACT",
    inTree: false,
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
    title: "Agent Role Intelligence and Capability Floors",
    shortName: "Role Intelligence",
    type: "META-RESEARCH",
    status: "PRP",
    description:
      "Source-audited study of role capability floors across 39 graded records, eight repos, four papers, and the controlled trial against naive cheap-tier routing.",
    href: "/research/agent-role-intelligence",
    action: "Read the report & corrections",
  },
  {
    title: "The Orchestration Guide",
    shortName: "Orchestration Guide",
    type: "GUIDE",
    status: "WIP",
    description:
      "The A–E coordination ladder, deterministic vs. model work, cache-horizon matching, and <200-token pointer manifests. Experience-based — no control study yet.",
    href: "/research/orchestration-guide",
    action: "Read the guide",
  },
  {
    title: "The Agent Playbook",
    shortName: "Agent Playbook",
    type: "PLAYBOOK",
    status: "WIP",
    description:
      "Portable operating philosophy for AI agents: conversational memory context, two consented skills, and a swappable profile. Documents only; no runtime or installer.",
    href: "/research/agent-playbook",
    action: "Explore the playbook",
  },
  {
    title: "Context Diet",
    shortName: "Context Diet",
    type: "LAB",
    status: "WIP",
    description: "Browser-local token-budget analyzer; comparative benchmark results pending review.",
    href: "/labs/context-diet",
    action: "Play Context Diet",
  },
  {
    title: "The Compounding Cost of CI Failures",
    type: "POSTMORTEM",
    status: "VRF",
    description: "Epic #780 postmortem establishing CI Churn as a first-class engineering cost metric.",
    href: "/research/ci-churn",
    action: "Read the postmortem",
  },
  {
    title: "When Agents Report Their Own Cost",
    shortName: "Agent Cost Reporting",
    type: "RESEARCH PLAN",
    status: "PRP",
    description: "Planned audit of the gap between agent self-reports, rate-card math, and actual invoices.",
    href: "/research/cost",
    action: "Read the plan",
  },
  {
    title: "Gaia MCP",
    type: "PRODUCT",
    status: "ACT",
    description: "MCP server connecting Claude Code, Codex, and Cursor to the Gaia Skill Tree.",
    href: "/mcp",
    action: "Learn more",
  },
  {
    title: "Parallel Cheap-Scout Fan-Out Benchmark",
    shortName: "Scout Fan-Out",
    type: "BENCHMARK",
    status: "VRF",
    description: "360-run empirical study of cheap-scout fan-out vs. mid-tier scouts: Pareto frontier, cache amplification, and flake reduction.",
    href: "/research/parallel-scouting",
    action: "Read the benchmark & receipts",
  },
  {
    title: "The Hell Heaven Benchmark",
    shortName: "HH Benchmark",
    type: "BENCHMARK",
    status: "VRF",
    description: "Controlled trial scoring skills by marginal efficacy over model baselines. Arc I verified: floor pricing, census, and gated claim index.",
    href: "/research/hh-benchmark",
    action: "Read the benchmark & receipts",
  },
  {
    title: "Context Compaction Phase 2 Empirical Benchmark",
    shortName: "Context Compaction Bench",
    type: "BENCHMARK",
    status: "VRF",
    description: "37 live sessions across 8 autocompaction thresholds on Gemini 3.8 Flash: Pareto frontier, cache amplification, and reacquisition thrashing.",
    href: "/research/context-compaction-phase-2",
    action: "Read the methodology & receipts",
  },
] as const;

export const ledger = researchEntries.map((e) => [
  e.shortName ?? e.title,
  e.type,
  e.status,
  e.description,
  e.href,
]) as readonly (readonly [string, string, LedgerStatus, string, string])[];

