# B Living Tree — acceptance contract

**What "done" means for the MVP.** Every B slice is judged against this page; the release gate (§7)
is the only path to calling B complete. Hub: [`README.md`](README.md) · contract:
[`CONTRACT.md`](CONTRACT.md) · quality bar and verification: [`LANES.md`](LANES.md) §3.

Working names: the pane is **My Tree**, opened by **`/my-tree`**, inside the Skill Heaven console
plugin (FD-3 default). The design lead may rename at G2.

## 1. Journeys — first use through actual use

| # | Journey | What the person experiences | Never |
|---|---|---|---|
| J1 | **First open** | types `/my-tree` (or presses the console's button); a pane docks beside the conversation within a second showing the skills *this session* lists, honestly sparse if few; one quiet card offers "See your full local tree" with exactly what would be read | an unasked pane; a scan before consent; a lecture |
| J2 | **Consent and scan** | accepts; a bounded, cancellable read of skill folders; the tree re-forms and a one-line diff explains it ("23 on disk · 4 now verified Gaia canon · 2 possibly canon · 17 local") | reading outside the named folders; uploading anything |
| J3 | **Explore** | focus a branch, filter by source (this repo · personal · plugins · synced), inspect a node: its instances and where each lives, which one the host resolves, its verified canon identity and rank *with provenance*, its canon edges | rank colours on unverified skills; invented edges |
| J4 | **Known summon** | Skill Heaven summons a skill they already have; that node gets a brief halo; when the agent actually reads the body the halo settles into "in context"; the row opens the receipt | a second copy of the node; a count the engine did not report |
| J5 | **Visitor** | from a clean or zero start, a skill arrives from an outside repo; a distinct visitor appears in a visiting zone with "Summoned · external", repo and commit | edges into their graph; the visitor lingering after the session |
| J6 | **Many agents** | subagents summon in parallel; marks carry agent chips; arrivals coalesce; the busiest moment is still calm | an animation storm; agent ids the host did not report |
| J7 | **Hide and return** | one control hides the live layer; closing the pane hides everything; reopening restores the session's view | any change to the runtime, settings or statusline |
| J8 | **Session end** | live marks fade to a quiet "earlier this session" list; the next session starts clean | persistence of a visitor |
| J9 | **Switch to the Gaia view** | one control turns My Tree into Gaia's canon tree with their skills marked, missing prerequisites and eligible fusions in view; live marks stay where they belong; switching back returns their place | a canon rank or edge appearing on a skill that is not verified |

## 2. Acceptance scenarios

Each scenario names its fixtures (CONTRACT §9) and what live receipt it needs at the release gate.
"Hard signal" means something a machine can check — never a model's narration.

| ID | Scenario | Expected | Hard signal | Fixtures | Live receipt |
|---|---|---|---|---|---|
| **S1** | Open the personal DAG in an allowed repo on Claude Desktop (handoff 1) | real listed skills with sources; verified canon mapping only where pins prove it; plausible shown as text; unmapped as satellites; truncation said if `included < total` | snapshot counts and hash in the debug log; screenshot | F1, F2, F4, F5 | yes |
| **S2** | Summon a known skill (handoff 2) | one halo on the existing node; no visitor; repeat summon → same halo, `count: 2`; status-entry count is the engine's | overlay `{ halos: 1, visitors: 0 }`; console entry ids | F6, F9 | yes |
| **S3** | From Skill Zero, summon from an outside repo (handoff 3) | an external visitor with origin and commit; no edges; gone after session end; inventory snapshot hash unchanged | overlay; inventory hash before/after | F8 | yes — and if probe H9 shows desktop cannot boot the product floor, run "zero rung selected, no local skills" and label it exactly so |
| **S4** | Card versus body (handoff 4) | before the read: "card returned · body not read" (*inferred*, marked); after the `Read`: "in context · body read by ⟨agent⟩" (*observed*); a host that cannot see reads: "read not observed" | observation stream phases | F6, F10 | yes |
| **S5** | Hide, close and reopen (handoff 5) | overlay byte-identical across toggles; later tool behaviour unchanged; `settings.json`, `settings.local.json`, `installed_plugins.json` and the user's `statusLine` byte-identical; with **Remember** (FD-2 b) only the plugin's own store file changes | sha256 of those files before/after; overlay hash | F12 | yes |
| **S6** | Robustness (handoff 6): duplicate names, source collisions, hostile content, absent telemetry, session end, narrow↔wide dock, 300 skills, offline | per fixture; nothing escapes its field; nothing invented; layout legible at every width | fixture assertions; layout overlap test | F3, F10, F11, F12, F2-large | spot-check |
| **S7** | Actual desktop renderer (handoff 7) | S1–S6's key states paint in the Claude Desktop app on a pinned build | screenshots + debug log + host version | — | **required** |
| S8 | Concurrent subagents | marks attributed to the agents the host reported; arrivals coalesced; ≤7 visitors drawn, then "+N more" | overlay agents; frame count | F9 | yes |
| S9 | Consent upgrade | zero file reads before consent; after it, the diff names each `plausible → verified` | fs call count in the plugin test kit; diff | F3, F5 | spot-check |
| S10 | Reduced motion and no colour | zero animation; a grayscale screenshot still distinguishes possessed, context, local, halo, canon visitor, external visitor, card and body | screenshot review against the 10-second test | all | yes |
| S11 | Light and dark themes | contrast thresholds (§4) hold in both | measured contrast | — | yes |
| S12 | *Stretch (B5):* native skill activity | a typed `/skill` lights its node "expanded by the host"; an ambiguous name lands in the unresolved list, not on a guessed node | observations `via: skill-prompt` | F14 | if B5 ships |
| S13 | Revision mismatch | nothing verified; a notice says why | overlay notices | F13 | no |
| S15 | My Tree ↔ Gaia view (FD-1) | `mine` shows possessed and local skills only; `gaia` shows canon structure with possessed marked; a canon visitor marks its node in `gaia` and sits in the visiting zone in `mine`; overlay identical across switches | overlay hash; screenshot pair | F4, F7 | yes |
| S16 | Remember (FD-2) | Remember writes only the plugin's own store file; a new session restores the hidden live layer; Forget removes the file; nothing else on disk changes | file hashes before/after; probe H13 | F12 | yes |
| S14 | Coexistence with the status entry and Lens band | one event has one primary surface; no duplicated pulses | design review + screenshot | F6 | yes |

## 3. Observation semantics — what each signal may show

| Signal | Phase | Mark | Words (meaning fixed; copy may change) | Evidence |
|---|---|---|---|---|
| listed this session | — | node | "listed this session" | observed (host listing) |
| found on disk, not listed | — | node, quieter | "on disk · not in this session" | observed (consented scan) |
| canon structure you lack | — | context node | "Gaia canon · not installed" | static (canon at revision) |
| `/lens` preview | previewed | optional faint mark (C3) | "previewed · nothing materialized" | observed |
| summon result, possessed | materialized | halo, open | "summoned · card returned · body not read" | observed + *inferred* |
| summon result, canon, not possessed | materialized | canon visitor | "Summoned · Gaia canon · not installed" | observed |
| summon result, unknown to canon | materialized | external visitor | "Summoned · external · ⟨repo⟩@⟨ref⟩" | observed |
| `Read` of the materialized `SKILL.md` | body-read | halo or visitor, settled | "in context · body read by ⟨agent⟩" | observed |
| host cannot observe reads | materialized | stays open | "read not observed on this host" | unknown |
| `skill.prompt` (B5) | body-read | halo · name-listed | "expanded by the host" | observed |
| session ended | ended | fades to history | "earlier this session" | observed |
| compaction reported (if H16) | body-read → | dims | "read before compaction — may no longer be in context" | observed |
| no agent id | any | no chip | "agent not reported" | unknown |

Shape and words carry every distinction; colour may reinforce, never decide.

## 4. UX quality thresholds

| ID | Threshold | How measured |
|---|---|---|
| Q1 | `/my-tree` → tier-0 tree drawn in **≤ 1.0 s** for a 100-skill session | `$.clock` stamps from `command.run` to the first drawn tree, debug log |
| Q2 | Tier-1 scan **≤ 3 s** for ≤ 300 skill folders, progress shown, cancel honoured within 250 ms, hard ceiling on entries examined with an honest "stopped at the limit" | same |
| Q3 | Live signal → mark drawn **≤ 500 ms**; redraws coalesced to ≤ 4 per second | same |
| Q4 | `Svg` source **≤ 110,000 characters** at every fixture scale (headroom under the host's 131,072); level-of-detail above 120 visible nodes (labels on the focus neighbourhood only; branches collapse to cluster marks) | renderer test over F2-large |
| Q5 | No overlapping labels at default zoom in a 360 px dock and a 1,400 px dock | layout overlap test |
| Q6 | **Ten-second test:** at least three people new to Gaia each identify a canon skill, a local skill, a visitor, and card-versus-body within 10 s each, on a grayscale render | moderated review at G2 and G3 |
| Q7 | Arrival motion ≤ 1.2 s, once per subject; no continuous motion except an optional slow settled glow; reduced motion → none, every state still readable | review + test |
| Q8 | WCAG AA: text 4.5:1, graph marks and focus rings 3:1, in light and dark | contrast tool on screenshots |
| Q9 | Every action reachable by keyboard: open, rail, move, inspect, receipt, live toggle, close; focus always visible | keyboard walk-through |
| Q10 | Screen reader announces kind, name and state for every rail row ("Code review pipeline · Gaia canon · in your tree · summoned · body read by main agent"); `alt` summarises the drawing | VoiceOver on desktop (probe H15) |
| Q11 | Never opens unasked; no toasts from the tree; ≤ 7 visitors drawn at once | review |
| Q12 | **Zero model cost:** no model calls; nothing added to model context; a scripted session issues the same tool calls with the pane open or closed | debug log + `$.session.usage` context breakdown comparison |

A miss ships only with a founder-accepted waiver recorded in the release receipt.

## 5. Security, privacy and registry isolation (non-negotiable)

| ID | Rule | Test |
|---|---|---|
| SEC1 | **No authority.** Hooks on `tool.call` and `skill.prompt` return `next(e)`'s result untouched; no `prompt.compose`; command results are fixed sentences; pre-fills are fixed commands plus sanitized names | plugin test asserts result identity; static scan of hooks |
| SEC2 | **Untrusted text stays text.** Status sanitizer at the adapter edge; XML-escaped in `Svg`; no data-driven attributes beyond escaped text; no `href`, `xlink`, `<image>`, `<foreignObject>`, `<script>` or data-supplied `style`; URLs only through native `Link`, `https` only | F11 + an SVG allowlist validator |
| SEC3 | **No writes, no network, no processes.** No `$.fs.write`, `$.process`, `$.http`, `$.model`, `$.telemetry.log`; `$.store` only under FD-2 (b) | `claude plugin validate` call report |
| SEC4 | **Private paths stay private.** Paths painted home-relative or repo-relative only; never logged outside the debug log; never posted anywhere | review + F11 |
| SEC5 | **Registry isolation.** No code path writes to gaia-skill-tree, `skill-trees/`, badges or any canon artifact; canon rank is shown only for verified matches, with provenance; possession never changes a displayed rank | static review; no such API in the bundle |
| SEC6 | **Visitors never persist.** No install or save in B; nothing of a visitor survives session end | F12 + live S3 |
| SEC7 | **Trust disclosure.** The console's Trust section states what the tree reads (listing; consented folders), writes (nothing, or the store file on Remember) and fetches (nothing) | review |
| SEC8 | **Supply chain.** The vendored Tree core is byte-identical to a pinned Tree commit; no new runtime dependency | CI parity check |

## 6. Desktop host probe — P1-H cells

Route: an owner-attended Claude Desktop **Code-tab** session on a pinned build; a throwaway probe mod
loaded through the plugin-authoring hot-reload prompt (session-only, no plugin-registry write). If the
owner prefers, a user-scope install is the alternative and is then recorded as such. Static
pre-checks (`claude plugin validate`, `claude plugin test` with desktop mounts) run first, without the
owner — the planning run already did this once with [`probe/lt-probe`](probe/README.md) (7/7: the
`Svg` ceiling, hit-targets over it, `Client` pointer input, terminal fallback). Results land in
gaia-research `docs/labs/harness-capability-matrix.md` gate (f).

| Cell | Question | Pass | If it fails |
|---|---|---|---|
| H0 | Which build, engine version, surfaces, OS, account type? | recorded | — |
| H1 | Does a `Pane` opened from a command dock on desktop; how wide; does it resize, close and reopen cleanly? | docked, resizable | inline placement is acceptable if legible; else founder decision |
| H2 | Does an image-mode `Svg` paint in the docked pane at 10k / 60k / 110k characters, crisply, in time? | paints ≤ 300 ms at 110k | fall back to fewer, larger marks (LOD) |
| H3 | In interactive mode, do hover, `<title>` tooltips, CSS keyframes and SMIL work; do `prefers-reduced-motion` and `prefers-color-scheme` reach the frame? | hover + tooltip + CSS work | image mode + rail-only interaction; motion driven by redraws |
| H4 | Replacing `source` four times a second for ten seconds — flicker, lost hover, CPU? | no visible flicker; modest CPU | redraw only on meaningful changes |
| H5 | Buttons, hotkeys, `Select`, `Input`, focus ring, Tab order, `$.ui.focus`, `$.ui.scroll` inside the pane | all work | rail via the controls that do |
| H6 | Can an absolutely positioned `Box` place hit-target Buttons over `Svg` nodes (units, alignment)? | aligned within a node's radius | selection stays in the rail (AD-4 default) |
| H7 | Does a `Client` give usable pointer capture for drag-pan on desktop? | smooth enough to keep | keyboard + buttons for pan/zoom (AD-4 default) |
| H8 | Does the session skill listing come back on desktop; sources, plugin names, truncation versus `/skills`? | present and consistent | tier 1 only, after consent; tier 0 shows an honest gap |
| H9 | Can a desktop session start at the Skill Zero product floor? | yes, with a route | S3 runs as "zero rung + no local skills", labelled |
| H10 | Do summon results, `Read` observation and subagent `agentId` look as they do in the terminal (#187)? | identical shapes | adapt the mapper; never guess |
| H11 | Does `skill.prompt` fire for `/name`, the Skill tool and a subagent preload; what attribution surrounds it; inline vs forked Skill results? | fires, payload as declared | B5 dropped; "native activity not observable" notice |
| H12 | Can the mod find home and project roots, list skill folders, read and hash 200 `SKILL.md` files; any permission prompt; time? | ≤ 3 s, no surprise prompt | tier 1 narrowed to the folders that work |
| H13 | Where does `$.store` write, what is in it, does uninstall remove it? | plugin-owned file, removable | FD-2 falls back to (a) |
| H14 | Light/dark switch — `Svg` contrast and ThemeKey-coloured text | Q8 holds | theme-neutral palette for the graph |
| H15 | VoiceOver: `alt`, Button labels, rail order | Q10 holds | rail copy fixes |
| H16 | `session.end`, `/clear`, resume; is compaction an observable event? | end observable | history on end only; never claim "left context" |
| H17 | Do the existing console status entry, Lens band and `/heaven` pane paint on desktop? | paint | closes #185/#187's open desktop cell either way |
| H18 | Observe-only on desktop: settings, local settings, installed plugins, user statusLine byte-identical; the probe makes no model or tool calls | identical | stop and fix before anything else |

**Live results 2026-10-09** (desktop engine 2.1.293, matrix f14–f24): H1 ✅ (placement and width not
reported) · H2 ✅ · H3 ✅ hover and CSS/SMIL animation (tooltip unconfirmed), scheme reaches the frame ·
H4 ❌ every source change flickers once · H5 ✅ overlay button input (async callback cause unisolated) · H6 ✅ · H7 ✅ · H8 ✅ 186/186
listed · H11 ✅ typed and model-called skills · H14 ✅ with the SVG root-background fix. Still open: H9,
H10, H12, H13, H15–H18. **B is a go on paint;** H10 (summon observation on desktop) is the last cell the
go rule needs.

**Handoff to the orchestrator (2026-10-09).** The remaining cells (H9, H10, H12, H13, H15–H18) move to the
orchestrator. Notes from the owner-attended run:
- Computer use cannot control the Claude app from inside its own session, so owner screenshots were the
  hard signal. A later orchestrator with its own desktop computer use may capture them directly.
- **Proposed: a desktop test harness** that loads the probe, drives the pane and captures its readouts
  (debug log or `$.ui.log`) without the owner relaying screenshots, so cells can iterate back and forth.
  The owner prefers this to manual rounds.
- H10 attempt: `/skill-heaven:summon graphify` materialized nothing. The registry entry
  `safishamsi/graphify` links a file, not a skill directory ([gaia-skill-tree #1445](https://github.com/gaia-research/gaia-skill-tree/issues/1445), also rediscovered in duplicate #2049); the index was reported 31 days
  stale. Retry H10 with a verified materializable skill. The probe is **instrumented to observe** summon
  results and `Read`s of materialized `SKILL.md`, but this desktop observation has **not passed**.
- Probe lessons: `$.state` survives hot reloads, so merge persisted state over defaults. A button
  began responding after **both** an async `onPress` wrapper and element-key change; isolate the cause
  before claiming the wrapper itself is required.
- Not yet checked: whether the locally installed `skill-heaven` plugin matches `main`.

**Go for B:** H1, H2, H5, H10 and one of H8/H12 green. **Stop and ask the founder:** H2 red (no vector
paint) — the alternatives are in-desktop only (a `Client` cell graph, a structured `Markdown` tree with
a mini-map), never a CLI imitation advertised as B.

## 7. Release gate G3 and stop/go

B is complete only when **every** line holds:

1. S1–S16 pass in CI (fixture-driven; `claude plugin test` on desktop and terminal mounts where
   meaningful), and the two-adapter conformance suite is green.
2. **Live desktop receipts** for S1–S8, S10–S11, S15 and S16 on a pinned Claude Desktop build, owner-attended:
   screenshots, debug-log hard signals, host version. Mocked panes and terminal probes do not count.
3. Truth bars T1–T10 verified by the orchestrator ([`LANES.md`](LANES.md) §3).
4. Q1–Q12 measured; misses carry founder waivers.
5. Security review by a different model family than the author; no open high findings.
6. Accessibility review (keyboard, VoiceOver on desktop, contrast).
7. Matrix gate (f) updated with live verdicts; #195 carries the receipt; listing and README copy say
   **preview**, B only, Claude Desktop, pinned version — no C controls promised.
8. Founder approval to list.

**No-go** if 2, 3 or 5 fails. A failure in 1, 4 or 6 blocks until fixed or waived.

## 8. Receipts every slice PR attaches

- test files and counts; `claude plugin validate` and `claude plugin test` output;
- fixture ids covered; for UI slices, screenshots at 360 px and 1,400 px, light and dark, reduced motion;
- every capability claim tagged verified / static / unknown with the host version;
- reviewer identity (model + effort) and verdict; the orchestrator's gate verdict;
- at lane close, one canonical `skill-cost` total (never a self-reported figure).
