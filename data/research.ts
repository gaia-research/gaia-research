// Public research portal data.
//
// SKILLS are modeled as data keyed by their canonical repo slug under the
// gaia-research org (e.g. "skill-ci-churn"). EVERYTHING else is derived from
// that slug — display name, repo URL, install command, and Skill-Tree URL —
// so that adding a skill (or renaming one, e.g. dropping the "skill-" prefix
// later) is a one-line change here and the whole site adapts automatically.
//
// Install is via the Gaia CLI:  gaia install gaia-research/<slug>
//
// `inTree`   -> already browsable in the Skill Tree explorer.
// `surface`  -> an on-site page that demonstrates or documents the skill
//               (a live lab, a research report). Omit if there's no page yet.

const ORG = "gaia-research";

export type SkillStatus = "ACT" | "WIP";

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
    surface: { label: "Open Lab 001", href: "/labs/context-diet" },
  },
  {
    slug: "skill-ci-churn",
    blurb: "GitHub Actions cost analyzer and flaky-test detector: measure wasted CI compute and prevent retry-push churn.",
    status: "ACT",
    inTree: true,
    surface: { label: "Read the postmortem", href: "/research/ci-churn" },
  },
  {
    slug: "skill-fuse",
    blurb: "Compose two installed agent skills into one unified SKILL.md — the composition engine behind the Skill Tree.",
    status: "ACT",
    inTree: true,
  },
] as const satisfies readonly Skill[];

// ── Derivations (never hard-code these downstream) ──────────────────────────
export const displayName = (slug: string) => slug.replace(/^skill-/, "");
export const repoUrl = (slug: string) => `https://github.com/${ORG}/${slug}`;
export const installCmd = (slug: string) => `gaia install ${ORG}/${slug}`;
export const treeUrl = (slug: string) => `https://gaiaskilltree.com/named/#explorer/${ORG}/${slug}`;

export const allSkills: readonly Skill[] = skills;
export { allSkills as skills };

// ── Research ledger: published evidence, not installable tools ──────────────
// href "" renders as plain text (no destination yet). External URLs open in a
// new tab; internal routes and #anchors navigate in place.
export const ledger = [
  ["Context Diet / Lab 001", "LAB", "WIP", "Local token-budget estimator; comparative benchmark results pending review", "/labs/context-diet"],
  ["The Compounding Cost of CI Failures", "POSTMORTEM", "VRF", "Postmortem of Epic #780 introducing CI Churn as a first-class cost metric", "/research/ci-churn"],
] as const;
