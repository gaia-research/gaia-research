# Lanes and ownership — who owns what, who does the work, and the bar it must clear

Hub: [`README.md`](README.md). **The quality bar in §3 is set by the planner; the orchestrator verifies
every slice and every gate against it.** Cost discipline follows the owner's direction of 2026-10-09:
*keep costs low — Haiku and Luna take volume scouting and implementation; Opus owns creative work and
delegates to Sonnet; Sol does the heavy lifting on everything else.*

## 1. Two kinds of lanes

**Architectural lanes** (founder, 2026-10-08) say *what* each part owns. **Execution lanes** (owner,
2026-10-09) say *which tier of model does the work*. They are independent: a Sol worker can build in
the core lane; a Luna worker can write desktop-lane tests.

| Architectural lane | Owns | Issue owner | Code home |
|---|---|---|---|
| Portable semantics / core | inventory, identity, canon mapping, graph projection, overlay reducer; observation envelope; host capabilities; fixtures; conformance | Tree #2046 (graph half) · Heaven #192 (observation half) | gaia-skill-tree new TS package · gaia-skill-heaven `packages/status` |
| CLI instrument | the one-line statusline and summon receipts | Heaven #137 | unchanged by this program |
| Desktop enhancement | the My Tree pane (B) and the cockpit (C) inside the Claude Mod | Heaven #161 (with #2046 for tree semantics) | gaia-skill-heaven `plugins/skill-heaven-console` |
| Evidence of record | desktop capability matrix gate (f), live receipts | Heaven #192 / #195 | gaia-research `docs/labs/harness-capability-matrix.md` |

## 2. Execution roster

| Tier | Models (roster names) | Does | Never |
|---|---|---|---|
| **Orchestrator** | one Claude Code session — Opus 5.5 at **high** (xhigh only for gate verdicts) — or whoever the owner assigns | sequences and dispatches packets; holds judgement (what to probe, what a result means, contract freeze, gate verdicts); verifies every slice against §3; integrates; applies hygiene; posts receipts; merges only with owner authorization | delegate judgement; merge a BLOCK; let a worker review its own output |
| **Volume — scouting** | Claude **Haiku 5.5** (effort low) · GPT 6 **Luna** (`scout-luna`, minimal) | repository and doc reads with exact questions; repeated probe cells; counting, enumerating, diffing; screenshot and log capture; doc/link sync | interpreting a negative result; proposing architecture |
| **Volume — implementation** | **Haiku 5.5** (medium) · **Luna** (`worker-luna`, medium) | fixture JSON from specs; test scaffolds and matrices; adapter boilerplate; CI wiring; bundle and parity scripts; copy and doc updates; a11y/performance measurement runs | contract changes; security-critical paths; anything a packet does not name |
| **Creative** | **Opus 5.5** creative lead (high) → **Sonnet 5.5** makers (medium; high for the chosen direction's final build) | B design directions, interaction model, motion and choreography, visual language, copy, prototypes, the `Svg` skin; Opus reviews every Sonnet output before it leaves the lane | inventing data states the contract does not have; merging product code |
| **Heavy lifting** | GPT 6.1 **Sol** (`worker-sol` medium · `worker-sol-xhigh` · `worker-sol-max` / `planner-sol` for adversarial review) | contract implementation; identity resolution and overlay reducer; Mod integration (pane, renderer engine, level of detail, state machine); performance; security hardening; conformance harness; hard debugging; reviewing volume-lane output | visual direction; merging its own PRs |

**Where each tier runs.** Haiku and Sonnet run as Claude Code agents or workflow agents with an explicit
`model` and `effort`. Sol and Luna run as pi subagents (`worker-sol*`, `worker-luna*`, `scout-luna`) or
in codex. Anything that needs the Claude engine (`claude plugin validate`, `claude plugin test`, the
plugin-authoring hot reload) can be run from any tier's shell with `~/.local/bin/claude` (the aliased
`claude` breaks plugin subcommands). Every receipt names the harness and model that actually ran.

**Effort meter.** Scouting: minimal or low. Mechanical implementation: medium. API-interpretation-heavy
work: high. Sol xhigh only for the core reducer, the identity resolver and the renderer engine. Max is
reserved for the adversarial reviews at G1 and G3.

**Escalate on the second failure, not the first.** A packet starts at the cheapest tier that can do it.
If its output fails §3 twice, the orchestrator moves it up one tier (Luna/Haiku → Sol; Sonnet → Opus)
and records why. It never moves down mid-packet.

## 3. The quality bar

### 3.1 Truth bars — any failure stops the slice

| ID | Bar |
|---|---|
| T1 | **No fabricated canon.** A node is canon-mapped only by content pin or source route at the snapshot's revision; every edge exists in canon at that revision. |
| T2 | **No fabricated observation.** Every phase traces to an observation; inferred states are labelled inferred on screen. |
| T3 | **The chain holds.** Installed ≠ invoked ≠ materialized ≠ body-read ≠ verified use. No copy says a skill was "used", "active" or "working". |
| T4 | **Canon isolation.** No write path to the registry, `skill-trees/`, badges or any canon artifact; possession never changes a displayed rank. |
| T5 | **No authority.** Nothing enters model context; tool and skill results pass through untouched; pre-fills are fixed commands plus sanitized names. |
| T6 | **No shared-state mutation.** Settings, the user's statusline and the plugin registry are byte-identical; P3 holds. |
| T7 | **Untrusted text is data.** Sanitized at the edge, escaped at paint; no markup, script or link injection. |
| T8 | **View is not runtime.** Hide, show and close never change runtime behaviour or what the model receives. |
| T9 | **Unknown is said.** An unsupported capability produces a notice; silence never reads as a negative. |
| T10 | **No invented numbers.** The tree computes no `skills N`, no entropy figure, no trust score, no mastery; canon numbers appear only with provenance. |

### 3.2 Craft and code bars

Craft thresholds are B-ACCEPTANCE §4 (Q1–Q12). Code bars:

| ID | Bar |
|---|---|
| K1 | Core is pure TypeScript: no `claude-code` import, no Node, no I/O; deterministic tests. |
| K2 | Extend, do not duplicate: observations come from `packages/status`; one copy of every generated bundle, parity-checked in CI. |
| K3 | Tests at every seam: fixture tests for each mapper and reducer; `claude plugin test` on desktop and terminal mounts for each Mod behaviour. |
| K4 | Everything bounded: list lengths, string lengths, files examined, `Svg` characters, redraw rate. |
| K5 | Failure is honest: every caught error becomes a notice or a degraded state, never a silent empty view. |
| K6 | Nothing provisional ships: no `PENDING` stubs, no fixture data on a runtime path, no dead flags. |
| K7 | One slice per PR, draft until its gate; repo-specific branch names and merge verbs. |
| K8 | Decisions travel with code (D9): a decision change lands in the PR that implements it. |

### 3.3 Evidence bars

| ID | Bar |
|---|---|
| E1 | Every capability claim is tagged verified / static / doc / unknown with host version and date. |
| E2 | Hard signals over narration: state hashes, debug-log lines, file hashes, screenshots. |
| E3 | Negative results are recorded in the matrix like positive ones. |
| E4 | Live claims come from pinned versions and are re-verified after a Claude upgrade. |
| E5 | Receipts name the harness and model that ran. |
| E6 | Cost is measured only by canonical `gaia-research/skill-cost`, once per lane close. |

### 3.4 How the orchestrator verifies

For every slice PR, in order — and the verdict is written on the PR:

1. **Packet compliance** — outputs match the packet; the file lane was respected.
2. **CI** — typecheck, tests, bundle parity, `claude plugin validate`, `claude plugin test`.
3. **Fixtures** — every fixture the packet names passes.
4. **Truth bars** — static scan for forbidden calls (SEC3), the `Svg` allowlist validator (SEC2),
   result-identity tests (SEC1), file-hash checks (T6).
5. **Independent review** — a reviewer from a different model family than the author (Sol-authored
   work → Opus or Sonnet high; Luna, Haiku or Sonnet work → Sol). Findings go back to the author;
   reviewers never patch their own findings.
6. **UI evidence** — screenshots at 360 px and 1,400 px, light and dark, reduced motion, grayscale.
7. **Verdict** — PASS · PASS WITH WAIVER (founder-approved, recorded) · BLOCK with reasons.
8. **Merge** — only with owner authorization, using the repository's own verb (gaia-skill-heaven
   squash; gaia-skill-tree and gaia-research merge commits).

Gate verdicts (G1, G2, G3) add an adversarial pass by `worker-sol-max` or an Opus xhigh review against
the whole gate, and a short "what cost the most, what changes next" note.

## 4. Slices, owners and dispatch packets

Each packet is self-contained: hand it to the named tier with this folder. Forbidden for every packet:
editing `~/.claude` or any user settings, writing to the registry or `skill-trees/`, network beyond the
packet's named reads, merging, and expanding scope.

| Packet | Lane / repo | Author → reviewer | Inputs | Outputs | Accepted when |
|---|---|---|---|---|---|
| **P1-H-static** | evidence / scratch | Luna medium → orchestrator | B-ACCEPTANCE §6; host declarations; `probe/lt-probe` (already 7/7) | extend the probe: `Select`/`Input`, hotkeys and focus, two panes as tabs, fixture-scale graphs from P1-F, reduced-motion markup; `validate`/`test` output on desktop and terminal mounts | the engine accepts or refuses each tree as the declarations say; results tagged *static (engine test kit)* |
| **P1-H-live** | evidence / gaia-research | orchestrator + owner; Haiku low for repeat cells and capture | probe mod; cell list H0–H18 | matrix gate (f) live verdicts; screenshots; debug-log excerpts | every cell has a verdict and a hard signal; negatives recorded |
| **P1-C** | core / Tree + Heaven | Sol xhigh → Opus high | CONTRACT.md; `packages/status`; `arbor-identity.json`; `docs/graph/*.json` | Tree core package (types, matching, projection, diff, overlay); `observation.ts` and `host-capabilities.ts` in `packages/status` | F1–F14 green; K1, K4, K5; T1, T2, T9, T10 checks |
| **P1-F** | core / Tree | Luna medium → Sol medium | CONTRACT §9; a real canon slice at the pinned revision | fixtures F1–F14 (+ F2-large: 300 skills) as JSON | each fixture validates against the schemas; F11 contains every hostile class listed |
| **P1-M** | core / Tree | Luna medium → Sol medium | P1-C, P1-F | Claude-shaped mock + generic mock adapters; conformance runner in CI | byte-identical overlays from both adapters on every fixture |
| **P2-D** | creative / prototypes | **Opus high** (direction) → **Sonnet medium** (state builds) → Opus review | DESIGN-BRIEF.md; P1-H-static results; the planning prototype | 2–3 directions as interactive prototypes using only feasible primitives; every required state; a recommendation; a C sketch | DESIGN-BRIEF deliverables complete; Q6 run on grayscale renders |
| **P2-R** | creative review | Sonnet high (critique) + Haiku low (axe/contrast/overlap measurements) → orchestrator | P2-D outputs; P1-H-live results | critique, measurements, feasibility cross-check table (interaction → probe cell → verdict) | no interaction depends on a red cell without a stated in-desktop alternative |
| **B0** | desktop + core | Luna medium → Sol medium | G1, FD-3 | Tree core package skeleton wired to CI; `/my-tree` pane with an honest empty state; vendoring + parity script; desktop/terminal mount tests | CI green; SEC3 scan clean |
| **B1-core** | core + desktop | Sol xhigh → Opus high | B0; approved direction | tier-0 adapter; layout and level-of-detail engine (reusing `world-tree-layout.js` where it fits); renderer engine emitting allowlisted `Svg`; rail and inspector data | S1 in CI; Q1, Q4, Q5; T1, T7 |
| **B1-paint** | creative + desktop | Sonnet medium (under Opus direction) → Opus review | approved direction; B1-core renderer interfaces | the visual layer: marks, labels, halos, legend, light/dark, reduced motion | screenshots per §3.4 step 6; Q7, Q8; S10, S11 |
| **B1-wire** | desktop | Luna medium → Sol medium | B1-core, B1-paint | commands, state atoms, rail controls, keyboard path, tests | Q9; `claude plugin test` desktop mount |
| **B2** | core + desktop | Sol medium → Opus high (security) | B1 | consent card; bounded, cancellable tier-1 scan; frontmatter reader (vendored); sha256 pins; collisions; diff | S9; F3, F5; SEC4; Q2 |
| **B3** | core + desktop + creative | Sol xhigh (reducer integration) + Sonnet medium (choreography) + Luna medium (fixtures) → Opus high | B1; console observation state | halos, canon and external visitors, dedupe, lifetime, live toggle, session-end fade | S2, S3, S4, S5, S8; T8; Q3, Q11 |
| **B4** | desktop | Sonnet medium + Luna medium → Sol medium | B3; the console's receipt view-model | row/mark → receipt click-through; instance and provenance inspector | S2/S3 receipts reachable by keyboard and screen reader |
| **B5** *(stretch)* | desktop | Sol medium → Opus high | B3; H11 green | observe-only `skill.prompt` / Skill-tool halos | S12; SEC1 result-identity test |
| **B6** | all | Luna medium + Haiku low (volume tests, measurements) → Sol fixes → Sonnet a11y fixes | B1–B4 | S6 matrix: scale, collisions, hostile content, absent telemetry, resize, offline | S6, S13, S14; all Q thresholds measured |
| **B7** | evidence + desktop | orchestrator + owner; Haiku low capture | B6; pinned Claude Desktop build | live receipts; matrix gate (f) live update; preview copy | B-ACCEPTANCE §7 lines 1–7 |
| **HYG** | issues | orchestrator (Haiku low drafts) | README §10 | H2–H4, H6–H7 comments; H1, H5 after owner OK | posted text matches the ledger; no new issues |
| **P4-score** | planning | Sol medium (research) + Luna minimal (host doc reads) → planner/orchestrator | C-AND-HOSTS.md | scored C list; refreshed host matrix rows | founder approves the order |

**File lanes during P3.** Sol: Tree core package and `packages/status` observation files. Sonnet:
renderer skin and pane view files. Luna/Haiku: fixtures, tests, scripts, docs. Orchestrator only:
contract files after freeze, version pins, bundle parity baselines, release receipts.

## 5. Cost controls

- **Tripwires, not estimates.** Soft ceilings per dispatch: scouting packet ≈ 60k tokens; Luna or Haiku
  implementation packet ≈ 600k; Sonnet build packet ≈ 400k; Opus direction round ≈ 800k; Sol xhigh
  packet ≈ 1.5M. A worker that crosses its tripwire stops at the next commit boundary and reports; the
  orchestrator re-scopes before continuing. Actual cost comes only from `skill-cost`.
- **Intended mix.** Most tokens should land in the volume tiers, then Sol, with Opus and Sonnet
  creative work and the orchestrator as the smallest shares. The orchestrator checks the mix at each
  gate and says what drifted.
- **Concurrency.** At most two heavy workers (Sol, Sonnet, Opus) at once; mechanical fan-out happens
  inside a worker (pi caps one call at 8 tasks, 4 concurrent).
- **No expensive reconnaissance.** Recon is Haiku low or Luna minimal with exact questions and exact
  report formats. The 2026-10-08 lesson stands: six xhigh Sonnet scouts reading docs is the failure mode.
- **Reuse before rebuild.** P2's chosen prototype is built on the B1 renderer interfaces so the design
  build is not thrown away; `world-tree-layout.js`, the status sanitizer and the console's receipt
  view-model are reused, not reimplemented.
- **Push often.** Commit and push the draft branch after each coherent unit.
- **Checkpoint reflection.** At G1, G2 and G3 the orchestrator writes three lines: what cost the most,
  what to change, whether any tier should move.
- **One total.** One canonical `skill-cost` total per lane at close, posted to #286.

## 6. Escalation

| Situation | Who decides | What happens |
|---|---|---|
| a truth bar fails | orchestrator | BLOCK; back to the author with the failing check |
| a probe cell is red and B depends on it | founder | in-desktop alternatives only (B-ACCEPTANCE §6); never a CLI imitation advertised as B |
| a packet fails §3 twice | orchestrator | escalate one tier; record why |
| scope pressure toward C during B | orchestrator | park it in C-AND-HOSTS with a score; B ships first |
| a decision the founder has not made becomes load-bearing | founder | bounded options with a recommendation, as in README §8 |
