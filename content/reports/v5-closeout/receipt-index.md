# V5 closeout receipt index

**Receipt owner:** Gaia Research  
**Issue:** [gaia-research#159](https://github.com/gaia-research/gaia-research/issues/159)  
**Receipt date:** 2026-08-09

This is a cross-repository delivery index, not a benchmark result. A source
merge, release record, or report proves that an artifact exists; it does not
prove that a stranger can install it or that a runtime session behaved as
claimed.

## Evidence classes

Every receipt row uses exactly one of these classes:

- **DIRECT** — the cited immutable commit, release, check, or committed raw
  artifact is inspectable at the linked source.
- **ASSERTED** — a PR, issue, release note, or report states the claim, but no
  independent runtime artifact is attached to this row.
- **UNVERIFIED** — the runtime or install observation is still missing. No
  transcript is implied, and no result is fabricated here.

## Selector boundary

Public setup intentionally uses moving selectors:

- MCP server: `npx -y -p @gaia-research/mcp@latest gaia-mcp`
- summon alias: `npx -y skill-hell@latest`
- scoped summon bin: `npx -y -p @gaia-research/mcp@latest skill-hell`

The fixed `mcp-v0.4.0` rows below are release and source receipts only. They do
not claim that a later `@latest` resolution is still version `0.4.0`, and no
`@latest` command is promoted to a `0.4.0` runtime receipt without captured
output.

## Receipt rows

The columns are the fields required by #159: bounded program/claim, evidence
class, repository, full commit SHA with an immutable URL, date, PR/release and
status, verification command or CI URL, raw artifact path, and explicit gap.

| Program / bounded claim | Class | Repository | Full SHA + immutable URL | Date | PR/release URL · status | Verification command or CI/check URL | Raw artifact path | Explicit gap |
|---|---|---|---|---|---|---|---|---|
| **Program 3 — prototype source delivery.** The Skill Heaven prototype source and its named build check were delivered. | **DIRECT** | `gaia-research/gaia-skill-heaven` | [`44f0e9d7a920e3a775d4e6a813ce85b2d5d46b6e`](https://github.com/gaia-research/gaia-skill-heaven/commit/44f0e9d7a920e3a775d4e6a813ce85b2d5d46b6e) | 2026-08-08 | [PR #39](https://github.com/gaia-research/gaia-skill-heaven/pull/39) · **MERGED** | [`build` job 93056473425](https://github.com/gaia-research/gaia-skill-heaven/actions/runs/31238936127/job/93056473425) | not applicable (source/CI receipt) | Source merge and CI are not per-door live-session transcripts. |
| **Program 3 — bounded runtime claim.** The PR/release record says five doors launch and reports 204/204. | **ASSERTED** | `gaia-research/gaia-skill-heaven` | [`44f0e9d7a920e3a775d4e6a813ce85b2d5d46b6e`](https://github.com/gaia-research/gaia-skill-heaven/commit/44f0e9d7a920e3a775d4e6a813ce85b2d5d46b6e) | 2026-08-08 | [PR #39](https://github.com/gaia-research/gaia-skill-heaven/pull/39) · **MERGED** | [`build` job 93056473425](https://github.com/gaia-research/gaia-skill-heaven/actions/runs/31238936127/job/93056473425) | not committed (raw runtime artifact required) | No per-door transcripts or CI output for those runtime numbers is attached here; keep the claim **ASSERTED**, not DIRECT. |
| **Program 4 — summon-engine source merge.** The MCP prototype source merged to the gaia-mcp default branch. | **DIRECT** | `gaia-research/gaia-mcp` | [`1b4c3e704babc7a051a00ff8e4f670b569e9cb2b`](https://github.com/gaia-research/gaia-mcp/commit/1b4c3e704babc7a051a00ff8e4f670b569e9cb2b) | 2026-08-07 | [PR #7](https://github.com/gaia-research/gaia-mcp/pull/7) · **MERGED** | [Node 22.14 job 92890184726](https://github.com/gaia-research/gaia-mcp/actions/runs/31185891693/job/92890184726); [Node 24 job 92890184653](https://github.com/gaia-research/gaia-mcp/actions/runs/31185891693/job/92890184653) | not applicable (source/CI receipt) | The merge and CI checks do not substitute for a fresh package install or stdio transcript. |
| **Program 4 — fixed release fact.** The `mcp-v0.4.0` source declares the released package shape, including `gaia-mcp` and `skill-hell` bins and the four published tool names `gaia_search`, `gaia_inspect`, `summon`, and `gaia_status`. | **DIRECT** | `gaia-research/gaia-mcp` | [`85a5d01435943d4d063108fb026f71bd7e7ef5d8`](https://github.com/gaia-research/gaia-mcp/commit/85a5d01435943d4d063108fb026f71bd7e7ef5d8) ([immutable `package.json`](https://github.com/gaia-research/gaia-mcp/blob/85a5d01435943d4d063108fb026f71bd7e7ef5d8/package.json), [immutable server source](https://github.com/gaia-research/gaia-mcp/blob/85a5d01435943d4d063108fb026f71bd7e7ef5d8/src/mcp/server.ts)) | 2026-08-08 | [`mcp-v0.4.0`](https://github.com/gaia-research/gaia-mcp/releases/tag/mcp-v0.4.0) · **PUBLISHED** | `npm view @gaia-research/mcp@0.4.0 version dist.tarball bin --json` (reproducible metadata query) | not applicable (source/metadata receipt) | Source and release metadata are direct; no fresh install, initialize response, or `tools/list` output is attached. D4's thin future Heaven/Summon profile is a separate distinction, not a reason to rename these four published names. |
| **Program 4 — fixed public package records.** The scoped package and the separately addressable `skill-hell` package have 0.4.0 registry records and tarballs. | **DIRECT** | `gaia-research/gaia-mcp` | [`85a5d01435943d4d063108fb026f71bd7e7ef5d8`](https://github.com/gaia-research/gaia-mcp/commit/85a5d01435943d4d063108fb026f71bd7e7ef5d8) | 2026-08-08 | [`mcp-v0.4.0`](https://github.com/gaia-research/gaia-mcp/releases/tag/mcp-v0.4.0) · **PUBLISHED** | [`@gaia-research/mcp@0.4.0` metadata](https://registry.npmjs.org/@gaia-research/mcp/0.4.0); [`skill-hell@0.4.0` metadata](https://registry.npmjs.org/skill-hell/0.4.0) | `@gaia-research/mcp` [tarball](https://registry.npmjs.org/@gaia-research/mcp/-/mcp-0.4.0.tgz); `skill-hell` [tarball](https://registry.npmjs.org/skill-hell/-/skill-hell-0.4.0.tgz) | Registry metadata and tarball addresses do not prove that either selector ran successfully in a fresh environment, and do not claim the two selectors resolve identical internals. |
| **Program 4 — bounded `@latest` MCP handshake and exact four-tool enumeration.** In a fresh environment, the explicit published `gaia-mcp` binary initialized and returned, in order, exactly `gaia_search`, `gaia_inspect`, `summon`, and `gaia_status`. | **DIRECT** | `gaia-research/gaia-mcp` | [`85a5d01435943d4d063108fb026f71bd7e7ef5d8`](https://github.com/gaia-research/gaia-mcp/commit/85a5d01435943d4d063108fb026f71bd7e7ef5d8) (immutable 0.4.0 release context) | 2026-08-09 (runtime capture) | [`mcp-v0.4.0`](https://github.com/gaia-research/gaia-mcp/releases/tag/mcp-v0.4.0) · **PUBLISHED** | `npx --yes --package=@gaia-research/mcp@latest gaia-mcp`, with initialize and `tools/list` JSON-RPC requests | [`2026-08-09-gaia-mcp-tools-list.md`](evidence/2026-08-09-gaia-mcp-tools-list.md) | The capture resolved `@latest` to 0.4.0 at that time (metadata is recorded in the artifact); it does not make the moving selector immutable, prove tool-call behavior beyond `tools/list`, or prove a thin profile. |
| **Program 4 — bounded summon CLI paths.** In separately fresh environments, both public selectors successfully ran `summon "code review" --card` and returned a summon card. | **DIRECT** | `gaia-research/gaia-mcp` | [`85a5d01435943d4d063108fb026f71bd7e7ef5d8`](https://github.com/gaia-research/gaia-mcp/commit/85a5d01435943d4d063108fb026f71bd7e7ef5d8) (immutable 0.4.0 release context) | 2026-08-09 (runtime captures) | [`mcp-v0.4.0`](https://github.com/gaia-research/gaia-mcp/releases/tag/mcp-v0.4.0) · **PUBLISHED** | `npx --yes skill-hell@latest summon "code review" --card`; `npx --yes --package=@gaia-research/mcp@latest skill-hell summon "code review" --card` | [`2026-08-09-skill-hell-direct-summon.md`](evidence/2026-08-09-skill-hell-direct-summon.md); [`2026-08-09-skill-hell-scoped-summon.md`](evidence/2026-08-09-skill-hell-scoped-summon.md) | Each capture resolves a moving selector and records its own 0.4.0 metadata. This proves only the captured prototype/package summon path; it does not prove HH scoring, routing eligibility, content-hash admission or verification, or a measured thin profile. |
| **Program 2 — historical MCP lexicon ban.** The earlier source commit recorded the prototype-name ban; it is a historical receipt, not the current published-package contract. | **DIRECT** | `gaia-research/gaia-research` | [`c538939eea76d9c8c21c9c432793262bda5e67c6`](https://github.com/gaia-research/gaia-research/commit/c538939eea76d9c8c21c9c432793262bda5e67c6) | 2026-07-28 | — · **COMMITTED ON MAIN (HISTORICAL)** | `git show c538939eea76d9c8c21c9c432793262bda5e67c6:founder/lexicon.gaia.mcp.json` | `founder/lexicon.gaia.mcp.json` at the immutable commit | It documents the earlier vocabulary state. The repaired source must be merged before it becomes the current contract. |
| **Program 2 — federated lexicon migration.** The five-namespace Gaia Research lexicon layout was committed. | **DIRECT** | `gaia-research/gaia-research` | [`8e151e377032f37631d4cc7d8a57e7f938e81941`](https://github.com/gaia-research/gaia-research/commit/8e151e377032f37631d4cc7d8a57e7f938e81941) | 2026-07-28 | — · **COMMITTED ON MAIN** | `git show 8e151e377032f37631d4cc7d8a57e7f938e81941:founder/lexicon.json` | `founder/lexicon.json`, `founder/lexicon.gaia.*.json` at the immutable commit | The migration receipt does not decide the later rich-package/thin-profile distinction. |
| **Program 7 — adoption source.** The canonical ecosystem-surface page was committed and its PR merged. | **DIRECT** | `gaia-research/gaia-research` | [`eb5aa1a86290a01c3ba3c3dc687b662eff77ef15`](https://github.com/gaia-research/gaia-research/commit/eb5aa1a86290a01c3ba3c3dc687b662eff77ef15) | 2026-07-29 | [PR #130](https://github.com/gaia-research/gaia-research/pull/130) · **MERGED** | `git show eb5aa1a86290a01c3ba3c3dc687b662eff77ef15:app/about/page.tsx` | `app/about/page.tsx` at the immutable commit | This proves source delivery and merge, not deployment, browser rendering, or adoption. |
| **Program 3 — founder-side historical record.** The observed head contains the five named founder artifacts from the prototype session. | **DIRECT** | `gaia-research/gaia-skill-tree` | [`d150ed0f2d34c2fbf88b3ac53b61423f5fa718b8`](https://github.com/gaia-research/gaia-skill-tree/commit/d150ed0f2d34c2fbf88b3ac53b61423f5fa718b8) | 2026-08-08 | [PR #1474](https://github.com/gaia-research/gaia-skill-tree/pull/1474) · **OPEN** | `gh pr view 1474 --repo gaia-research/gaia-skill-tree --json state,headRefName` | `founder/GAIA_ROADMAP v5 (BUILD).md`; `founder/MEMORY.md`; `founder/PROGRAM-3-CHALLENGES.md`; `founder/handovers/2026-08-08-SKILL-HEAVEN-INSTALL.md`; `founder/reports/2026-08-07-program-3-prototypes.html` | The PR is not merged; founder prose is not an independent runtime transcript. |
| **Research — bounded Arc I claim index.** The claim index binds public Arc I figures to records and labels gaps; it is not a V5 delivery receipt. | **DIRECT** | `gaia-research/gaia-research` | [`c83d92a493da7dfb625362df6016547452be53ca`](https://github.com/gaia-research/gaia-research/commit/c83d92a493da7dfb625362df6016547452be53ca) | 2026-07-31 | — · **COMMITTED ON MAIN** | `npx tsx scripts/hell-heaven-bench/check-claims.ts`; `npx tsx scripts/hell-heaven-bench/ledger.ts validate` | [`content/reports/hh-benchmark/claim-index.md`](https://github.com/gaia-research/gaia-research/blob/c83d92a493da7dfb625362df6016547452be53ca/content/reports/hh-benchmark/claim-index.md) | Its claims concern the bounded Arc I research lane. It is not evidence of MCP installation, stdio behavior, or Skill Heaven door launches. |
| **Research — committed harness-probe artifacts.** Codex and pi probe records are inspectable and reproducible within their stated harness/version bounds. | **DIRECT** | `gaia-research/gaia-research` | [`1bfa889fb86ca724f2b59325426779900b2e389b`](https://github.com/gaia-research/gaia-research/commit/1bfa889fb86ca724f2b59325426779900b2e389b) | 2026-07-29 | — · **COMMITTED ON MAIN** | `jq empty scripts/hell-heaven-bench/harness-probes/runs/codex-g1-2026-07-29.run.json scripts/hell-heaven-bench/harness-probes/runs/pi-race-and-argv-order-2026-07-29.run.json` | [`scripts/hell-heaven-bench/harness-probes/runs/codex-g1-2026-07-29.run.json`](https://github.com/gaia-research/gaia-research/blob/1bfa889fb86ca724f2b59325426779900b2e389b/scripts/hell-heaven-bench/harness-probes/runs/codex-g1-2026-07-29.run.json); [`scripts/hell-heaven-bench/harness-probes/runs/pi-race-and-argv-order-2026-07-29.run.json`](https://github.com/gaia-research/gaia-research/blob/1bfa889fb86ca724f2b59325426779900b2e389b/scripts/hell-heaven-bench/harness-probes/runs/pi-race-and-argv-order-2026-07-29.run.json) | These are Codex/pi listing probes, not MCP or Skill Heaven runtime transcripts; no transcript is inferred. |
| **Research — committed HH ledger.** The ledger records the bounded benchmark observations referenced by the claim index. | **DIRECT** | `gaia-research/gaia-research` | [`dba73ff11ffc2db2b47646755c79785923660c60`](https://github.com/gaia-research/gaia-research/commit/dba73ff11ffc2db2b47646755c79785923660c60) | 2026-07-31 | — · **COMMITTED ON MAIN** | `npx tsx scripts/hell-heaven-bench/ledger.ts validate` | [`scripts/hell-heaven-bench/data/ledger.jsonl`](https://github.com/gaia-research/gaia-research/blob/dba73ff11ffc2db2b47646755c79785923660c60/scripts/hell-heaven-bench/data/ledger.jsonl) | The ledger is benchmark evidence for its recorded harness/tasks only; it does not prove the MCP or CLI rows above. |
| **Research — committed R0 census artifact.** The two-part-dose census JSON is locatable and bounded by its methodology. | **DIRECT** | `gaia-research/gaia-research` | [`58b1b871ee22843fca8105cb5b923aa88aacd06e`](https://github.com/gaia-research/gaia-research/commit/58b1b871ee22843fca8105cb5b923aa88aacd06e) | 2026-07-19 | — · **COMMITTED ON MAIN** | `npx tsx scripts/hell-heaven-bench/check-claims.ts` | [`content/reports/hh-benchmark/data/r0-census.json`](https://github.com/gaia-research/gaia-research/blob/58b1b871ee22843fca8105cb5b923aa88aacd06e/content/reports/hh-benchmark/data/r0-census.json) | A census artifact is not a cross-repository delivery/runtime receipt and is not reinterpreted as a universal Index result. |

## Closure gate

This issue is not closed by the existence of this unmerged file. **#159 must be
merged to `gaia-research/gaia-research` `main`, and the merged index URL must be
linked in a final comment on [gaia-skill-tree#1336](https://github.com/gaia-research/gaia-skill-tree/issues/1336)
before #1336 is closed.** The final comment must preserve the `DIRECT`,
`ASSERTED`, and `UNVERIFIED` boundaries above; it must not turn a release or
source receipt into a runtime transcript.

## Remaining explicit gaps

- The fresh MCP JSON-RPC and CLI summon artifacts are bounded captures, not a
  continuing guarantee for the moving `@latest` selectors.
- The exact four-tool capture enumerates names only; it does not exercise each
  tool's behavior or establish a future thin profile.
- The two summon captures establish a usable prototype/package path only. They
  are not HH scoring, routing eligibility, content-hash admission or
  verification, or a measured thin-profile receipt.
- Program 3 per-door runtime claims remain **ASSERTED** until per-door raw
  transcripts or check output are attached.
- The research paths above are real, bounded artifacts. They must not be
  relabeled as MCP, Skill Heaven, HH scoring, routing eligibility, content-hash
  admission, or universal five-door capability evidence.
- The repaired website, acceptance test, and lexicon changes are not a receipt
  until this #159 work is merged to `main`.
