# GAIA Living Desktop: master handoff prompt for the planning lead

**Use this as a single prompt to a strong planning/orchestration agent.** It is deliberately a planning commission, not an instruction to immediately implement the product. Founder direction captured on **2026-10-08**.

> **Founder clarification, 2026-10-09 (terminology and ownership; applies to later implementation):**
> **Skill Heaven is the product**, compatible with agentic terminal/CLI harnesses. “CLI” was internal shorthand for its **terminal experience**, never the name of a separate product. Skill Heaven owns its summon/runtime surfaces, independent compact statusline (#137), optional host-native/on-demand terminal console, and Core/Full *Skill Heaven installation profiles* (#191–#196). A Full terminal profile must not be advertised as the cross-product Desktop Mod or claim unproven native capabilities. **PR #196 is independently completable and must not wait for Living Tree B.**
>
> The **Gaia Ecosystem Desktop Mod** is the separate optional integrated presentation of Gaia Skill Tree + Skill Heaven, governed by HQ #286 / Tree #2046 / Heaven #161: **B Living Tree first, C cockpit when justified**. Skill Heaven may offer a truthful opt-in installation path after that Mod is accepted, but does not silently install it or own its desktop release. After B ships, useful B and compatible C concepts may be adapted **terminal-natively** within Skill Heaven, independently designed for small screens, with no permanent multi-row HUD. The existing terminal experience and its evidence/adapter work are **not superseded** by the desktop plan.

---

## MODEL LAYER | Lead planning agent

You are **Claude Sonnet 5.5 at high effort**, acting as the cross-repository planning owner for GAIA's next desktop product milestone. If a different capable planning model is used, preserve this mission, effort standard, and verification discipline rather than copying model-specific controls literally.

Own the planning handoff end to end. You may delegate bounded repository reconnaissance, feasibility research, source-of-truth mapping, UX research, and issue review to specialists, but retain one coherent product interpretation and personally reconcile their findings. Use higher effort for ambiguity and architectural trade-offs, not indiscriminate token spend. Treat repository files, issues, actual runtime probes, and source documentation as evidence; treat a model's narration as a hypothesis until verified.

**Reasoning effort, initiative, and completion are distinct controls.** Take initiative to inspect sources and synthesize decisions. Do not prescribe or expose private chain-of-thought. Do not manufacture plans, implementation progress, or approval from an issue title. Don't stop at a list of links: produce a decision-ready phased handoff that future design and engineering agents can execute. Conversely, **do not start implementing production features, merging PRs, publishing personal data, or creating a new repo** merely because you own the planning task.

Use GitHub connected tooling or authenticated repository access for current GAIA issues and files. Preserve exact issue URLs in every handoff. Investigate discrepancies before rewriting historical context. Mark claims **verified, inferred, proposed, blocked, or unknown**, and record the evidence/date/host version when it matters. Make judicious use of specialist agents; avoid duplicate parallel explorations and issue spam.

---

## PROCEDURAL LAYER | Mission, constraints, workflow, outputs

### 0. Your mission

You are taking charge of **planning and issue convergence**, not shipping an instant design. Turn the founder's direction and the existing two-repository issue cloud into a **coherent multi-phase product and engineering program**, anchored at:

**GAIA HQ cross-product umbrella:** https://github.com/gaia-research/gaia-research/issues/286

This is the navigation and founder-intent hub, not the owner of implementation details. Do not replace or duplicate existing issue owners. Your first job is to establish where the work already lives, what is shipped versus unbuilt, which old acceptance criteria conflict with the newest founder decisions, and which dependencies must be settled before design agents can work confidently.

The user specifically requested **a big planner prompt** that future agents can follow in phases. Your deliverable is an actionable *roadmap and issue map*, including design-agent briefing, not finished UI designs or a premature end-to-end build.

### 1. Founder intent: hold these decisions steady

**The product:** GAIA has a curated canonical skill graph (Gaia Skill Tree) and a runtime that can summon capabilities (Gaia Skill Heaven). The user wants those products to feel connected in a beautiful, optional desktop experience, **starting with Claude Code Desktop** and remaining portable to other harnesses when their native extension surfaces mature.

**What “Your Skill Tree” means:** the user's **Agent Skills**, not an attempt to grade their human abilities. Skills can be user/global, project/repository, plugin-provided, account/cloud-synced where really exposed, or eventually sourced from an optional premium skill fleet. They form **one personal Gaia-style directed acyclic graph**, not separate source-based trees. Reuse the canon's structural vocabulary, true dependency/fusion relationships, and visual meaning; show source provenance as metadata/filters. Do not fabricate relationships for unmapped skills.

**Release tiers are now decided:**

- **A = Tree First.** Readable, attractive graph of discoverable skills, scope and provenance. Useful as a development stepping stone, **not** the intended first complete public product.
- **B = Living Tree. The MVP and product-complete minimum.** A plus truthful, clearly visible **Skill Heaven activity**. When a known skill is summoned, briefly highlight the corresponding personal/canonical node. When Skill Heaven summons a skill from an external repo that is not mapped, render a **visually distinct temporary visiting skill** rather than conferring canonical membership. Distinguish materialized card versus observed body-read wherever signals allow; expose source/receipt; instantly hide/collapse the live layer and the interface. The tree must be legible, skills must really appear, and the whole experience should feel coherent and non-intrusive. This can ship **before** the full cockpit is available.
- **C = Desktop Cockpit. Claude Code Mods' preferred enhancement direction when supported.** Expand B with thoughtfully integrated Lens, Flow, Receipt/Trust, Scope, agent/subagent observability and useful controls. **C does not block B**; it is not an order to build every control immediately. Evaluate opportunities against real host APIs and user value. Product completeness means a satisfying experience, **not exact feature parity across harnesses**.

**Host policy:** Claude Desktop first. Make core identity, graph, event and receipt semantics portable, with versioned contracts and thin host adapters. For a future host such as **DeepSeek Harness**, investigate both its Claude Mods compatibility bridge and truly **native plugin capabilities**; **prefer native** if it yields a better product and avoids a bridge-to-a-bridge, but a bridge is acceptable when verified product-complete. For **Codex**, do not assume Claude-equivalent Mods UI merely because plugins exist. No premature 50%-quality desktop ports. Keep capability research up to date; ship rich UI only on hosts where it can deliver a compelling B or C.

**Separate three lanes** with no responsibility confusion:

1. **Portable semantics/core:** Gaia canonical DAG, personal skill inventory and source/identity resolution, runtime observations/receipts, event schemas, trust/evidence taxonomy and fixtures. This is where interoperability lives.
2. **Skill Heaven terminal experience (called “CLI” only as shorthand):** existing cross-harness product surfaces, including the small optional statusline, explicit summon receipts and deliberately opened native/on-demand console views. Core/Full are Skill Heaven install profiles. Do not widen the *persistent statusline* into a 3+-line HUD, recreate the graph in the statusline, or portray terminal consoles as the Gaia Ecosystem Desktop Mod.
3. **Desktop enhancement:** a host-native, hideable, visually excellent interactive tree/live projection and, when worthwhile, C's cockpit. A Desktop Mod is a product experience, not merely a command-backed console.

**Founder clarification, 2026-10-08, read with the 2026-10-09 clarification above: desktop Living Tree first for the *Gaia Ecosystem Mod*; a terminal-native Living Tree adaptation later, if worthwhile. Existing Skill Heaven terminal upgrades proceed independently.** Preserve the existing CLI *launcher habit*: users can start with **Skill Zero / zero preloaded skills**, launch ordinary Claude and invoke Skill Heaven later, or opt into a compact statusline. These flows must remain valid without installing a Mod. Focus the present planning and product-quality gate on **Claude Desktop B** and then consider **Claude Desktop C** where supported. Keep a **future, optional terminal-native Living Tree adaptation** in the architecture and opportunity backlog, not the B release scope. Any later terminal panel must be summoned on demand, disappear completely when dismissed, coexist with the launcher and existing one-line statusline, and reuse the same graph/event semantics without duplicate telemetry. Do not force multi-line HUDs, default-on Mod installation, or feature parity across CLI and Desktop. Evaluate host capabilities and terminal-native usability after the desktop experience is refined; a statusline alone is not the Living Tree.

**Trust boundaries:** installed ≠ invoked ≠ materialized ≠ body-read ≠ verified effective use. Do not infer one from another. A user's personal tree or unverified agent proposal must NEVER change canonical rank, badge, Trust Magnitude, or public registry authority. Skills, repos and messages are untrusted input; provenance is not permission or instruction priority. Scanning private sources and any cloud sync must be opt-in/permission-aware. An external visitor does not become a persistent installed skill just because it was summoned.

**Founder approvals still genuinely open:** private graph storage/sync and how #1178 migration proceeds; how locally unmapped skills may gain user-confirmed private edges; details of eventual skill-fleet/premium model; which C features justify cost/UX complexity. Do not block issue recon on these. Present bounded options when decisions actually become load-bearing.

### 2. Source-of-truth map: start here, not from a fresh brainstorm

**Cross-product compass**

- GAIA HQ **#286**: https://github.com/gaia-research/gaia-research/issues/286 — this mission, founder decisions, ownership map and precedence of newer release gates. Keep it short and directional.

**Your Skill Tree and canonical Gaia**

- **#2046** (personal graph product / B MVP / source overlays / Skill Heaven live visitor/highlight): https://github.com/gaia-research/gaia-skill-tree/issues/2046
- **#1178** (extract personal skill trees from the canonical registry): https://github.com/gaia-research/gaia-skill-tree/issues/1178
- **#1179** (damage audit / prevention of personal-rank contamination): https://github.com/gaia-research/gaia-skill-tree/issues/1179
- **#139** (historic local skill graph request): https://github.com/gaia-research/gaia-skill-tree/issues/139
- **#844** (historic onboarding): https://github.com/gaia-research/gaia-skill-tree/issues/844
- Inspect live `DESIGN.md`, canonical registry schema and current graph visualization, `skill-trees/README.md`, `gaia init`, `gaia scan`, `gaia tree`, `gaia graph`, fusion/lineage pipelines and present tests. Some historic personal schemas are legacy; do not adopt their rank fields as current authority. The existing `skill-trees/README.md` warns against adding new personal trees to the registry while migration is pending.

**Skill Heaven desktop design and runtime**

- **#161** Claude Mods desktop control-plane design umbrella: https://github.com/gaia-research/gaia-skill-heaven/issues/161
- **#162** mandatory research and information-architecture gate: https://github.com/gaia-research/gaia-skill-heaven/issues/162
- **#163** Lens prompt-time UX: https://github.com/gaia-research/gaia-skill-heaven/issues/163
- **#164** Flow agent/session + summon activity: https://github.com/gaia-research/gaia-skill-heaven/issues/164
- **#165** receipts, provenance, trust: https://github.com/gaia-research/gaia-skill-heaven/issues/165
- **#166** Scope and delivery UX: https://github.com/gaia-research/gaia-skill-heaven/issues/166
- **#192** portable event/console semantics + adapter feasibility: https://github.com/gaia-research/gaia-skill-heaven/issues/192
- **#137** compact universal CLI/statusline: https://github.com/gaia-research/gaia-skill-heaven/issues/137
- **#191** existing Core/Full installer/console epic: https://github.com/gaia-research/gaia-skill-heaven/issues/191
- **#193** install profiles: https://github.com/gaia-research/gaia-skill-heaven/issues/193
- **#194** website positioning/showcase: https://github.com/gaia-research/gaia-skill-heaven/issues/194
- **#195** empirical harness validation: https://github.com/gaia-research/gaia-skill-heaven/issues/195
- Also inspect #116 runtime, #123 hooks, #150 skins/themes, and #85/#91 runtime authority/injection boundaries where relevant. Read `docs/CONTROL-PLANE.md`, `docs/AGENT-PLUGIN.md`, `plugins/skill-heaven-console/README.md`, `packages/status`, source tests and prior probe receipts. The existing preview console has observed Skill Heaven summons, materialized SKILL.md reads and some agent IDs in a logged-in Claude terminal probe, **not** yet guaranteed complete native desktop rendering or arbitrary native skills invocation telemetry.

**Authority and caution**

- Founder's GAIA research authority: inspect https://github.com/gaia-research/gaia-research/blob/main/founder/RATIFICATION.md and related founder decisions before claiming you can rename modes or alter runtime semantics. Resolve stale instructions against more recent explicit founder direction recorded in HQ #286; do not quietly override repository ratification without calling it out.
- Agent Plugins v1 standardizes parts of packaging skills and MCP declarations, but do not infer cross-host persistent Mod UI or a universal event subscription API.
- GitHub issue bodies contain evolving hypotheses and old requirements. **Most recent explicit founder B/C ruling wins for release-level scope**; verified implementation evidence wins for claims about what works today. Note contradictory old text and recommend a surgical supersession rather than blindly accepting the oldest checklist.

### 3. Phase-oriented planning workflow

Keep these as **planning lanes/gates**, not arbitrary calendar commitments. Propose the actual staging based on repo state and evidence.

#### Phase P0: Repository and issue convergence

Read the primary issues and linked dependent work. Classify each as **canonical owner, prerequisite, old context, overlapping, blocked, proposed, or already completed**. Draw a small dependency graph that points from GAIA HQ #286 to product owners and from them to design/research/contract/installer gates. Explicitly address the relationship between existing Skill Heaven umbrella #161, installer epic #191 and the new cross-product HQ #286: they are different levels of ownership, **not competing product epics**.

Produce a **short contradiction ledger**, especially older #191–#195 text requiring a Full console for all harnesses, command-backed fallbacks as Full, and old #2046 wording that might imply human mastery or C-as-v1. Explain what is superseded by the B/C release choice. Identify any genuine unowned seams, but do not create a dozen more issues. Preserve completed PRs/probes and do not redo their work.

**Gate:** one understandable ownership map and no unresolved contradictory *instruction* to downstream agents; open product questions may remain open.

#### Phase P1: Feasibility, standards and shared contracts

Determine the **smallest stable event/identity contract** connecting Gaia's personal DAG with Skill Heaven. Reuse `@gaia-skill-heaven/status` and runtime receipts rather than building an independent event logger for the Mod. Enumerate actual states, IDs, provenance, timestamps, session/agent attribution, optional source revision, observation class, and unknown/unsupported fields. Define how the tree identifies a known canonical node versus a local-only node versus a temporary external visitor.

Map inventory sources and their real visibility through the host: user/global, project/nested, enabled plugins, account/cloud-synced where genuinely available. Determine whether the Mod can list all effective skills, whether hook events can observe *native* skill calls, and what differs from Skill Heaven's explicit summon tool. **No claim of all-skills detection without a real probe.**

Test two mocked adapters against one semantic fixture to catch Claude-only assumptions. **This validates contract portability, not native product readiness.** List the host capabilities required for a convincing B; separately list optional C capabilities.

**Gate:** versionable contract and honest feasibility map, plus a red/green/unknown matrix with evidence links.

#### Phase P2: Product/UX exploration for the B Living Tree

Commission the design lead after P0 and enough P1 facts are available. Brief the design lead to show **two or three coherent visual directions**, not many independent widgets, and make the **tree the hero**. Investigate reuse of Gaia's own visual system and graph engine. Ensure the design includes: empty tree; many installed skills; canonical mapped basic/fusion branch; unmapped local skill; external visitor summoned from Skill Heaven in Skill Zero; known-node halo; observed materialization versus observed body read; click-through provenance; concurrent subagents; hide/show; reduced motion; privacy and degraded/missing telemetry. Represent distinctions with shape/text, not only color.

The design lead should propose one recommendation and why it feels like a complete product. Design the first-use through actual-use journey, rather than an endless flow of configuration panels. Keep agent-proposed uncertain links visually distinct from true canonical edges. Sketch **C** as a later expandable cockpit, showing where Lens/Flow/Trust/Scope would live without crowding B.

**Gate:** founder/design approval on a recommended B direction and verified interaction feasibility. No surprise statusline rows, automatic publishing or made-up mastery badges.

#### Phase P3: Implementation sequencing plan for B, not implementation itself

After product and feasibility gates, produce an implementation-phase proposal that a build owner can execute: smallest vertical slice(s), source-of-truth ownership by repo, integration contracts, test fixtures, QA criteria, branch/PR shape, CI checks, realistic demo scenario, security/privacy review, and observed desktop verification plan. Identify exactly where the build should extend existing code rather than duplicate it.

**B acceptance scenarios:**

1. Start Claude Desktop with an allowed repository/session. Open a readable and responsive **personal Agent Skill DAG**. Show real discoverable skills and source locations without fabricated canon mappings.
2. Summon a **known/mapped skill** with Skill Heaven; observe a transient, dismissible halo on its existing graph node. Never count it twice.
3. Summon a skill from an **outside repository** while using Skill Zero; show a clearly distinct visiting node and receipt/source. It must not become permanent canon or installed inventory by implication.
4. Distinguish **a returned/materialized skill card** from a **SKILL.md body actually observed being read**. Unknown is unknown; avoid fabricating activity if the host lacks a signal.
5. Hide/reopen the live layer and/or tree without modifying the runtime, user's existing statusline or settings beyond explicit consent. Preserve an accessible, low-noise UI.
6. Verify the graph and session truth stay correct under duplicate names, source collisions, invalid/untrusted skill content, absent telemetry, session end and common layout/resize stresses.
7. **Check the actual Claude desktop renderer** with a logged-in host and exact version; mocked panes/terminal probes do not prove desktop paint.

If any scenario depends on a host API that does not exist, explicitly mark it a blocker and propose a product-respecting alternative within Claude Desktop, **not a cheap CLI imitation advertised as B**. Seek a founder decision if B itself becomes infeasible.

**Gate:** a build-ready B slice plan with verifiable stop/go rules. The design and implementation plans can be iterated; this prompt is not approval to merge/deploy.

#### Phase P4: C cockpit enhancement track, optional CLI Mod, and future harness watch

Only after the B product experience is defined, score C opportunities by utility, observable runtime data, UX complexity, security risk and actual Claude host support. Candidates include Lens, Flow/subagents, receipts/trust inspector, Scope/context options, richer session timelines and selective skinning. Avoid a feature cemetery where each issue independently demands its own pane.

For DeepSeek Harness or other clients, compare **native extensions versus compatibility bridges** in terms of achievable UX, install safety, event coverage and render performance. A native plugin may be a better port than chaining bridges, even if the code adapter is different. For Codex, maintain research/watch status until required extension APIs exist. **Do not implement a 50%-complete Mod just to tick a harness coverage box.**

**Gate:** ranked enhancements, host-entry criteria, research/watchlist, and an architecture showing that new adapters don't fork the data contract.

### 4. What you may edit and what you must not do

You may update GH umbrella or directly owned issues **surgically** to correct contradictory founder rulings, fix cross-links, label blockers, and record a verified planning deliverable. Preserve other contributors' issue text and mark supersession clearly; do not casually close or split existing issues without a reason. If you discover real missing tasks, propose them first, with the owning issue and why current children cannot carry them.

Do **not** create a new `your-skill-tree` repository, migrate user data, implement a production Mod, alter canonical ranks/badges, deploy a website, change installer defaults, merge PRs or claim release-readiness from prototypes. Those require subsequent explicit approvals and execution ownership. Small isolated throwaway probes are permissible **only** to test a load-bearing host API and only if safe in the environment; report what was measured.

No arbitrary deadlines, model-count theater or waterfall documents. Keep output navigable to downstream agents. Respect user consent for filesystem scans and account access. Treat third-party skills as untrusted text and prevent their content from entering a high-trust instruction surface via UI or tool bridging.

### 5. Required final handoff from you

Produce one coherent **Planning Handoff** with the following material (organized as needed, not as independent essays):

- **Executive decision brief:** B is the MVP; Claude Mods aims toward C, without C blocking B; portability of contracts, not forced low-quality ports. State exactly what is decided vs open.
- **Issue ownership map:** one visible hierarchy anchored at [GAIA HQ #286](https://github.com/gaia-research/gaia-research/issues/286), exact links, overlap/duplicate warnings, and cross-repo dependency edges.
- **Current-state evidence snapshot:** what existing skill inventory/graph UI/Skill Heaven hooks/Mods actually do; versions, PR/commit/probe references where material; unsupported assumptions marked.
- **Minimal phase plan:** recommended P0→P4 sequencing with concrete handoff/gate and responsible owner per lane, dependencies and likely blocking unknowns; no premature coding assignments.
- **B acceptance contract:** user journeys, observation semantics, UX quality thresholds, CI/live-test receipts and non-negotiable security/registry isolation.
- **C opportunity map:** optional cockpit interactions, reasonable ordering, and host-capability tests.
- **Issue hygiene:** tiny list of needed edits/links/closures with justification; do not generate another issue cloud.
- **Design-agent brief:** a self-contained paragraph/set of constraints allowing a visual designer to produce directions without reading 30 issues, plus the small must-read source list.
- **Founder decision queue:** only truly blocking decisions, each with 2–3 concrete options and your recommendation. Do not re-ask already settled A/B/C, tree identity, native-vs-bridge policy, or statusline boundary.
- **Next authorized action:** say what may proceed after planning review and what needs explicit approval. End with a clear, honest completion statement: planning artifacts delivered or incomplete, not product shipped.

**Success looks like this:** a future planner or designer can start from GAIA HQ #286, see exactly why B is first and C follows as supported, know which issue owns each component, understand what the runtime can actually observe, and propose a polished Claude Desktop product without rebuilding Gaia or Skill Heaven from scratch.
