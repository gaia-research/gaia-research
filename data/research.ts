export const ledger = [
  ["Context Diet / Lab 001", "LAB", "WIP", "Experimental local estimator; benchmark results pending", "/labs/context-diet"],
  ["Protocol Fusion Framework", "SPEC", "VRF", "Composable evidence protocol", "https://github.com/gaia-research"],
  ["G-Bench Generalist Suite", "BENCHMARK", "ACT", "Capability evaluation baseline", "https://github.com/gaia-research"],
  ["Safety Alignment Eval Set", "DATASET", "REV", "Evidence under review", "https://github.com/gaia-research"],
] as const;

export const gateways = [
  ["Labs", "Try the experimental local research sandbox.", "/labs/context-diet", "/assets/gateway-labs-panel.webp"],
  ["Benchmarks", "Measure claims before they travel.", "https://github.com/gaia-research", "/assets/gateway-benchmarks-panel.webp"],
  ["Research ledger", "Read the public evidence trail.", "#ledger", "/assets/gateway-ledger-panel.webp"],
  ["Gaia Skill Tree", "The permanent registry for verified skills.", "https://gaiaskilltree.com", "/assets/gateway-skill-tree-panel.webp"],
  ["Docs & specs", "Protocols, schemas, and working notes.", "https://github.com/gaia-research", "/assets/gateway-docs-panel.webp"],
] as const;
