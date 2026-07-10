// Public research ledger + homepage gateways.
//
// HARD RULE: only real, reachable destinations belong here. No placeholder rows,
// no "coming soon" links to an empty repo. If an item exists but has no public
// URL yet, set `href` to "" — page.tsx renders it as plain text, not a link.
//
// `href` may be:
//   - an internal route ("/labs/...") or in-page anchor ("#...")
//   - an external URL ("https://...")  -> opened in a new tab
//   - ""                                -> no public destination yet (plain text)
export const ledger = [
  ["Context Diet / Lab 001", "LAB", "WIP", "Local token-budget estimator; benchmark results pending", "/labs/context-diet"],
  ["CI-Churn", "SKILL", "ACT", "Flaky-test / CI-churn analysis; writeup published as a public gist", "https://gist.github.com/mbtiongson1/a77f8089b1e72f1ac4c537b64f111cdf"],
  ["Fuse", "SKILL", "WIP", "Composable evidence-fusion skill; public writeup pending", ""],
] as const;

export const gateways = [
  ["Lab 001 · Context Diet", "Run the experimental local token-budget analyzer.", "/labs/context-diet", "/assets/gateway-labs-panel.webp"],
  ["Research ledger", "Read the public evidence trail.", "#ledger", "/assets/gateway-ledger-panel.webp"],
  ["Gaia Skill Tree", "The permanent registry for verified skills.", "https://gaiaskilltree.com", "/assets/gateway-skill-tree-panel.webp"],
] as const;
