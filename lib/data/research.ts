export type LedgerStatus = "PRP" | "ACT" | "REV" | "VRF";

export const ledgerRows: Array<{
  record: string;
  kind: string;
  status: LedgerStatus;
  source: string;
  href?: string;
}> = [
  {
    record: "Context Diet / Lab 001",
    kind: "Protocol",
    status: "ACT",
    source: "Source pending",
  },
  {
    record: "G-Bench Generalist Suite",
    kind: "Benchmark",
    status: "PRP",
    source: "Specification pending",
  },
  {
    record: "Skill Evidence Schema",
    kind: "Spec",
    status: "VRF",
    source: "Repository schema",
    href: "https://github.com/gaia-research/gaia-research/tree/main/content/schemas",
  },
  {
    record: "Memory Architecture Analysis",
    kind: "Research brief",
    status: "REV",
    source: "Review queue",
  },
  {
    record: "Protocol Fusion Notes",
    kind: "Paper",
    status: "ACT",
    source: "Source pending",
  },
];

export const directives = [
  "Share your research. Open science is the way.",
  "Verify before you flex. Data beats hype.",
  "Fuse ideas. Break silos.",
  "Build safe, robust agents.",
];
