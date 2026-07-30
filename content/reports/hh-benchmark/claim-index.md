# Claim index — every public Arc I number and the record behind it

> **What this page is.** An **index, not a measurement.** It introduces no new
> figures. Every claim Skill Heaven / Hell has made in public during **Arc I**
> is listed here with the record it traces to — a committed `hh-ledger/v1`
> line, a committed census field, a committed `harness-probe/v1` run record —
> or it is marked **‡ = declared uncommitted workstation context**, or it is
> named as **not probed** and carries no number at all.
>
> **Why it exists.** **B4** ([`founder/RATIFICATION.md`][ratification]): *"The ledger
> is always on, the claim-discipline table binds all public copy, and no claim
> ships ahead of its benchmark. A 'will not work' ledger is as first-class as a
> 'will work' one — verified negative findings are recorded with the same
> rigor."* B4 says public copy is **bound** to the ledger. Until this page
> existed, that binding was asserted; a reader had no route from a sentence on
> the site to the JSON line under it. This is that route.
>
> **This page is machine-gated.** It sits in `content/reports/hh-benchmark/`,
> which [`scripts/hell-heaven-bench/check-claims.ts`][gate] scans by **derived**
> directory listing — so it is checked on every run, and so is the next report
> anyone drops beside it. Every number below either equals a committed value or
> carries ‡. Run it yourself:
>
> ```bash
> npx tsx scripts/hell-heaven-bench/check-claims.ts
> npx tsx scripts/hell-heaven-bench/ledger.ts validate
> ```

## The three evidence classes (and which ones the gate can read)

| Class | Where it lives | Gate reads it? |
|---|---|:---:|
| `hh-ledger/v1` records | [`scripts/hell-heaven-bench/data/ledger.jsonl`][ledger] | **yes** |
| Two-part-dose census | [`content/reports/hh-benchmark/data/r0-census.json`][census] | **yes** (per-record doses + per-surface standing sums) |
| `harness-probe/v1` run records | [`scripts/hell-heaven-bench/harness-probes/runs/`][runs] | **no** — committed, reproducible, but structurally invisible to the gate (its findings are listing shapes, not token counts). Named as the next natural extension, not a silent gap. |

A claim backed by the third class is **committed and reproducible but not
machine-bound** — this page cites its file path so a reader can open the bytes.

## Status vocabulary

- **RECORD** — traces to a committed ledger line or census field; the gate binds it.
- **RUN RECORD** — traces to a committed `harness-probe/v1` file; cite the path.
- **‡ UNCOMMITTED** — real workstation measurement whose artifact was never
  committed. Honest, corroborating, never load-bearing.
- **NOT PROBED** — no measurement exists. No number appears, anywhere, in any form.
- **SOFTENED** — published copy overstated; the fix is the copy, not the number.
- **OUT OF SCOPE** — a different program's claim, stated rather than silently omitted.

<!-- ledger-claims:begin -->

## A — the live site

| # | Claim as a reader sees it | Where | Record | Status |
|---|---|---|---|---|
| A1 | top-five loadout reduced the standing dose from **9,453** to **249** tokens — **−97.4%** | [`content/blog/claude-5-system-prompt-shrink/post.md`][post] | census [`h1Restatement.publishedStandingTokens.{allGraphNodeListings, top5Evidenced}`][census-published] | **RECORD** |
| A2 | "evicts *every* installed skill … admits back only the *grilling-native* ones" | [`app/page.tsx`][home] | **contradicted.** The KC4 clean-room probe shows curated's listing is `["heaven-set:kc4-curated-marker","doctor"]`, not empty; **P8** ([`RATIFICATION.md`][ratification]) rules `doctor` irreducible while the door is open and rules absolute zero internal-only, never public copy. "grilling-native" rides gate (e), still unverified, on the authority of **D13, retired 2026-07-24**; shipped **P6** admits the user's own named skills. | **SOFTENED — copy fix owed** |
| A3 | "one step below vanilla" / "cleaner than vanilla" | [`app/page.tsx`][home] | the two floors are ledger records [**11** and **12**][ledger-11-12] (below). The **native** pole it is measured against is not a record. | **RECORD** (floors) **+ ‡** (native) |
| A4 | Context Diet: 49,687 → 29,040 chars, 41.6%, 124/124 rules | same blog post | own committed artifacts under [`content/reports/context-diet-lab-001/`][diet] | **OUT OF SCOPE** — different program |
| A5 | [`/research/hh-benchmark`](/research/hh-benchmark) method page | [`methodology.md`][methodology] | in the derived scan set; passes the gate | **RECORD** |
| A6 | [`/about`](/about) Skill Heaven card | [`app/about/page.tsx`][about] | no figures; "the dose measured rather than guessed" is a method statement | clean |

## B — gaia-research markdown

| # | Claim | Where | Record | Status |
|---|---|---|---|---|
| B1 | floor **30,661** · curated **31,624** · **+963** · standing **227** · `sha256:14c4642…` | [`m2-live-demo.md`][m2] | ledger records [**9** and **10**][ledger-9-10] (`hh-m2-smoke`, claude 2.1.216). The **+963** is blessed as a signed delta between two committed perTurn values — it needs no record of its own. | **RECORD** |
| B2 | the same pair, matrix M2 rows | [`harness-capability-matrix.md`][matrix-m2] | [the same two records][ledger-9-10] | **RECORD** |
| B3 | native **46,849 ‡** · delta **−16,188 ‡** · invocation **5,917 ‡** | [`m2-live-demo.md`][m2-poles] | emitted to gitignored `scripts/.hh-demo/`; never committed | **‡ UNCOMMITTED** — the reference use of the sigil |
| B4 | gate (a) ladder: ≈25.2k · ≈17.0k · ≈19.2–19.6k figures across the three rungs | [`harness-capability-matrix.md`][matrix-gate-a] | workstation smoke from [`gate-a-resume-recomposition.sh`][gate-a-sh], never committed — **and structurally ungated**: `normalizeNum` accepts plain integers only, so every k-suffixed magnitude is *skipped*, not checked. The matrix carries 18 such figures. Declared in [the gate's own header][gate], dated, unfixed on purpose (closing it is a scope call, not a quiet edit). | **‡ UNCOMMITTED + declared gate hole** |
| B5 | gate (c) self-dose ≈**57 ‡** tok · door command **24 ‡** tok | [matrix][matrix-gate-c]; `claude-heaven/README.md` | `chars4` over *draft* copy, never committed; to be re-priced at WS4. NB **57 ‡** happens to exist as a committed magnitude elsewhere, so the gate would wave it through — a live instance of the declared *magnitude-existence, not record-binding* limit. The sigil, not the gate, is what makes this honest. | **‡ UNCOMMITTED** |
| B6 | census: the two-dose corpus totals and the **11.1×** / **23.2×** / **40.8×** overstatement factors; graph-node listings **9,384** · named-skill listings **14,498** | [`r0-census.md`][census-md-listings] | [`data/r0-census.json`][census] — `contracts.records[]` per-record doses and [`registryListings.*.standingTokens.sum`][census-listings]. The corpus **totals and distribution statistics are deliberately not restated here**: the gate binds per-record doses and per-surface sums, not derived summary stats, so quoting them on an index page would assert a binding the gate does not provide. Read them on the census page, where they sit under their own table. | **RECORD** |
| B7 | this-repo sanity check: 6 contracts, standing **597 ‡** vs invocation **10,376 ‡** (**13.8× ‡**) | [`r0-census.md`][census-md-sanity] | `--repo` mode run; its JSON was never committed | **‡ UNCOMMITTED** |
| B8 | oracle passages carrying **+515**, `["doctor"]`, `skills=[]`, entry counts | [`founder/RATIFICATION.md`][ratification] | the oracle is deliberately outside every scan set. This page names where each of those figures' record lives instead; the oracle is not edited by KC8. | **OUT OF SCOPE** |

## C — the `skill-heaven` repo

| # | Claim | Record | Status |
|---|---|---|---|
| C1 | **F7** — the door costs **+515** tok: product floor **20,176** vs benchmark floor **19,661**, claude **2.1.216**, probed 2026-07-24 ([`README.md`][sh-readme-f7], [`claude-heaven/README.md`][sh-ch-readme]) | ledger records [**11** and **12**][ledger-11-12] (`hh-f7-floor-split` / `door-cost-probe`), backfilled 2026-07-30 from [`packages/core/src/compile.ts` `FLOOR_EVIDENCE`][sh-compile] (arithmetic pinned by [`packages/core/test/compile.test.ts`][sh-compile-test]). **+515** is the signed delta between them. **LOCKED by founder ruling 2026-07-30: cited as measured on 2.1.216 and deliberately NOT re-derived against 2.1.220** — the version drift is accepted, not an oversight. Both records disclose in `notes` that `model` was `unrecorded` and `wallClockMs: 0` means *unmeasured*, not a 0 ms run (the schema has no null for it — a named gap, not a quiet normalization). | **RECORD** |
| C2 | **F6 negative** — `/skill-heaven` answers `Unknown command` at the doorless floor | [record **11**][ledger-11] carries `objectiveEndpoint.pass: false`. A verified negative finding, recorded with the same rigor as a positive, per B4. | **RECORD (negative)** |
| C3 | "−28.9% off native **28,379 ‡**" ([`claude-heaven/README.md`][sh-ch-readme]) | `hh-ledger/v1` has no `native` arm, and `arm: "heaven"` with an empty loadout would misrepresent the vanilla pole. Following the [`m2-live-demo.md`][m2-poles] precedent, the native pole stays uncommitted rather than being forced into the wrong arm. The missing arm is a disclosed schema gap. | **‡ UNCOMMITTED** (both the pole and the derived percentage) |
| C4 | **KC4 clean room** — curated listing `["heaven-set:kc4-curated-marker","doctor"]`, 2/2 byte-identical, claude 2.1.220, 2026-07-30 | the probe **script** is committed (`packages/claude-heaven/scripts/probe-kc4-listing-residual.sh`, on the KC4 lane branch — not yet on `skill-heaven` `main`, so this row deliberately carries no link); the **observed output is committed nowhere**, in this repo or that one. Script-reproducible, output not committed. Not a token count, so the gate is structurally blind to it either way. | **NOT COMMITTED — declared** |
| C5 | KC4 (superseded, 2026-07-29): "~64-entry" / "~68-entry" listings | approximations with no artifact. They stay approximate and never become anyone's numbers. | **‡ UNCOMMITTED** |
| C6 | codex "74 → 73 entries, 2/2 byte-identical" | **this does not match the committed record.** [`codex-g1-2026-07-29.run.json`][codex-run] reports **67 → 66** skills with `input_tokens` 18,986 → 18,925, 2/2 byte-identical, on `codex-cli 0.145.0`. The public 74 → 73 figure is a *different, uncommitted* probe. The committed run record is **not** presented as backing it. | **RUN RECORD** (67 → 66) · public 74 → 73 **unbacked** |
| C7 | pi: "0/15" leaks observed, 95% upper bound ≈21.8% | [`pi-race-and-argv-order-2026-07-29.run.json`][pi-run] (`n: 15`, `leaksObserved: "0/15"`, `upperBound95pct: "21.8%"`, pi 0.82.1) | **RUN RECORD** |
| C8 | **cursor** | **the binary probes are DEFERRED — no availability to run them.** No measurement exists, so no figure appears here, and none is inferred from a doc-verified cell. A doc-verified capability cell is not a measurement and is never borrowed as one. | **NOT PROBED** |


## D — the KC9 three-minute demo

Live run, claude **2.1.220**, `sonnet` at `--effort low`, 2026-07-30. One task
asked three ways with a byte-identical prompt and a **single shared** objective
endpoint — the loadout is the only variable, so "curated succeeds" is a result
rather than a definition. Writeup: [`kc9-three-minute-demo.md`][kc9], in this
directory and therefore in the derived scan set.

| # | Claim | Where | Record | Status |
|---|---|---|---|---|
| D1 | floor **30,601** · curated **55,924** · standing **227** | [`kc9-three-minute-demo.md`][kc9] | ledger records [**13** and **14**][ledger-13-14] (`hh-kc9-demo` / `side-stripe-review`). The floor→curated **+25,323** is blessed as a signed delta between two committed perTurn values and needs no record of its own. | **RECORD** |
| D2 | only the curated arm solves the task; both other arms fail the same endpoint | [`kc9-three-minute-demo.md`][kc9] | the same two records carry `objectiveEndpoint.pass` `false` / `true` against the identical regex. The floor's `false` is a **verified negative**, recorded with the same rigor as a positive, per B4. | **RECORD (negative + positive)** |
| D3 | native **46,490 ‡** and the derived native−floor **15,889 ‡** | [`kc9-three-minute-demo.md`][kc9-poles] | emitted to gitignored `scripts/.hh-demo/` and never appended — `hh-ledger/v1` still has no `native` arm (**C3**'s disclosed schema gap), and `arm: heaven` with an empty loadout would misrepresent the vanilla pole. | **‡ UNCOMMITTED** |
| D4 | the demo's **first** run inverted: floor **64,658 ‡** against native **46,463 ‡** | [`kc9-three-minute-demo.md`][kc9-poles] | never committed, and reported as a **method finding** rather than as evidence for anything: `perTurn` sums usage across a whole headless run, so differencing two of them prices *turn count* unless both runs took a comparable number of turns. Same trap the M3 paired run hit from the other direction. | **‡ UNCOMMITTED — method caveat** |
| D5 | the replay page and the `kc9-demo-transcript/v1` beats | [`kc9-demo-replay.html`][kc9-replay], [`kc9-demo-transcript.jsonl`][kc9-transcript] | committed and reproducible. The page carries no figure that is not read out of the transcript at render time, and it is not a markdown doc with numbers in prose, so the gate is structurally blind to it — same treatment as **C1**/**C4**'s run-record citations. | **cited by path** |
| D6 | **F7** and **cursor** in the KC9 artifacts | — | neither appears. F7 stays as **C1** states it, locked and not re-derived — the demo never launches the product floor. Cursor stays as **C8** states it, deferred with no figure anywhere. | **unchanged by KC9** |

<!-- ledger-claims:end -->

## What this index does and does not settle

- **Does:** give every public Arc I figure a named home — a ledger line, a
  census field, a run-record path, or an explicit ‡ / not-probed marker; put the
  page itself inside the machine gate rather than beside it; record the two
  places public copy is currently ahead of its evidence (**A2**'s eviction
  wording, **C6**'s 74 → 73) instead of quietly restating them.
- **Does not:** fix A2's copy (a visitor-visible change, owed a separate
  human-gated pass), close the k-suffix gate hole, teach the gate to read
  `harness-probe/v1` records, or re-derive F7. Each of those is named above with
  its reason, which is the point: **a declared gap is first-class evidence; a
  silent one is a defect.**

[ledger]: https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/data/ledger.jsonl
[ledger-9-10]: https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/data/ledger.jsonl#L9-L10
[ledger-11-12]: https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/data/ledger.jsonl#L11-L12
[ledger-11]: https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/data/ledger.jsonl#L11
[ledger-13-14]: https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/data/ledger.jsonl#L13-L14
[kc9]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/kc9-three-minute-demo.md
[kc9-poles]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/kc9-three-minute-demo.md#what-the-first-run-got-wrong-and-why-it-is-in-this-report
[kc9-replay]: https://github.com/gaia-research/gaia-research/blob/main/public/reports/hh-benchmark/kc9-demo-replay.html
[kc9-transcript]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/data/kc9-demo-transcript.jsonl
[census]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/data/r0-census.json
[census-listings]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/data/r0-census.json#L589
[census-published]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/data/r0-census.json#L620
[runs]: https://github.com/gaia-research/gaia-research/tree/main/scripts/hell-heaven-bench/harness-probes/runs
[gate]: https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/check-claims.ts
[post]: https://github.com/gaia-research/gaia-research/blob/main/content/blog/claude-5-system-prompt-shrink/post.md#L53
[home]: https://github.com/gaia-research/gaia-research/blob/main/app/page.tsx#L81-L82
[about]: https://github.com/gaia-research/gaia-research/blob/main/app/about/page.tsx#L153
[diet]: https://github.com/gaia-research/gaia-research/tree/main/content/reports/context-diet-lab-001
[methodology]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/methodology.md
[m2]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/m2-live-demo.md
[m2-poles]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/m2-live-demo.md#L105-L107
[matrix-m2]: https://github.com/gaia-research/gaia-research/blob/main/docs/labs/harness-capability-matrix.md#L136-L137
[matrix-gate-a]: https://github.com/gaia-research/gaia-research/blob/main/docs/labs/harness-capability-matrix.md#L261-L291
[matrix-gate-c]: https://github.com/gaia-research/gaia-research/blob/main/docs/labs/harness-capability-matrix.md#L382-L390
[gate-a-sh]: https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/gate-a-resume-recomposition.sh
[census-md-listings]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/r0-census.md#L48-L49
[census-md-sanity]: https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/r0-census.md#L78
[ratification]: https://github.com/gaia-research/gaia-research/blob/main/founder/RATIFICATION.md
[codex-run]: https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/harness-probes/runs/codex-g1-2026-07-29.run.json
[pi-run]: https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/harness-probes/runs/pi-race-and-argv-order-2026-07-29.run.json
[sh-readme-f7]: https://github.com/gaia-research/skill-heaven/blob/main/README.md#L90
[sh-ch-readme]: https://github.com/gaia-research/skill-heaven/blob/main/packages/claude-heaven/README.md#L205
[sh-compile]: https://github.com/gaia-research/skill-heaven/blob/main/packages/core/src/compile.ts#L49
[sh-compile-test]: https://github.com/gaia-research/skill-heaven/blob/main/packages/core/test/compile.test.ts#L123
