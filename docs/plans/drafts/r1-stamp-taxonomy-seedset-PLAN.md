Plan written to `$TMPDIR/plan-r1.md` (`/tmp` is not writable in this environment). Full plan below.

---

# R1 Implementation Plan — HH Benchmark: Stamp Taxonomy, Rubric & Hand-Labelled Seed Set

## Goal
Land milestone R1: rewrite the HH benchmark methodology to reconcile B2/B3/N13, define the three-stamp taxonomy as a deterministic hand-labelling rubric (binary/set-membership, never floats), hand-label a ~20-skill seed set as **prediction ground truth** for R2, and publish honest per-surface user stories — with every artifact gated by B4 (no claim before its benchmark) and D6 (thin cross-repo contract untouched).

## Plan

1. **Branch setup (both repos).**
   - `gaia-research`: branch `feat/r1-stamp-rubric-seedset`. This repo follows the **merge-commit** convention — do not squash.
   - `gaia-skill-heaven`: branch `feat/r1-user-stories` (docs-only). This repo **squashes**.
2. **Rewrite `content/reports/hh-benchmark/methodology.md` §2** — replace the borrowed-baseline section with the B2 own-placebo design (spec below).
3. **Insert a new section after §2 ("Arms are rungs on one ladder")** — the N13 reframing: rungs as arms, mixture-of-agents expectation (D5), quality AND cost endpoints, entropy curve as the target, explicit not-a-token-savings-headline clause (spec below).
4. **Update §1 and §6 prose** — §1: finish retiring any residual same-seed framing beyond the existing banner and re-anchor the Heaven/Hell paragraph to ladder rungs; §6: align the arm enum to rungs and restate the two-number dose categories. **Do not touch the `hh-ledger/v1` schema** — parity fixture depends on it byte-for-byte.
5. **Write the rubric** — new file `gaia-research/docs/skill-heaven/r1-stamp-rubric.md`: the three stamp verdicts as derivations from per-dimension binary rows (H1–H5, S1–S5, U1–U5), the honest "not measurable today" preamble copied verbatim from the synthesis, tension-cell decision rules T1–T11, and the multiplicative + primary-stamp convention flagged as pending founder ratification (D9 delta rides this PR).
6. **Escalate the six open questions** — append to `gaia-research/founder/RATIFICATION.md` as a clearly-marked PROPOSED delta block: multiplicative vs exclusive stamps; standing-dose weighting; probe-patch-as-mutation (T10); privacy/egress axis placement; D5 curation-vs-ranking boundary; rung-independent publish deny-list (T8).
7. **Write the seed-set doc** — `gaia-research/docs/skill-heaven/r1-seed-set.md`: the 20-skill composition table, labelling procedure, inter-labeller agreement protocol, controls, known-miss-case requirements, slice-provenance accounting.
8. **Create label worksheets** — `gaia-research/scripts/hell-heaven-bench/data/seed-labels/`: one Markdown worksheet per seed (per-dimension binary scores, primary/secondary stamps, tier + environment qualifiers, known-miss cases, labeler/confidence columns). Labels live **outside** the `hh-ledger` — the ledger records runs, not predictions.
9. **Add a tiny label validator** — `scripts/hell-heaven-bench/validate-seed-labels.ts`: enum membership only (stamp names, tiers, dimension IDs, verdict values). Pure TS ESM, zero runtime dependencies. No changes to `ledger.ts`, `census.ts`, `check-claims.ts`, or `src/vendor`.
10. **Run the first labelling pass** — ≥2 independent labelers complete all 20 worksheets; compute agreement; verify positive controls (#2, #11) reach unanimity. If either control splits: STOP, record as a first-class negative finding (D8), revise rubric, re-run.
11. **File the user-stories sub-issue** in `gaia-skill-heaven` with all four surfaces' stories verbatim including HONESTY NOTES; link back to rubric + seed-set docs.
12. **Cross-link** — pointer from methodology §5 to the rubric doc; optional one-line pointer in monorepo `docs/LADDER-FLOW.md`. No product code, no site copy changes.
13. **PRs.** Both repos; CI + review gate; merge with correct verb per repo; ratification deltas ride the implementing PR (D9).

## Files to Modify/Create

### gaia-research
| Path | Action |
|---|---|
| `content/reports/hh-benchmark/methodology.md` | Modify: §1 finish, §2 full rewrite, NEW §2b ladder-as-arms, §5 pointer, §6 prose alignment |
| `docs/skill-heaven/r1-stamp-rubric.md` | Create: full rubric |
| `docs/skill-heaven/r1-seed-set.md` | Create: composition table + protocol |
| `founder/RATIFICATION.md` | Append PROPOSED delta block (six open questions) |
| `scripts/hell-heaven-bench/data/seed-labels/*.md` | Create: 20 worksheets |
| `scripts/hell-heaven-bench/validate-seed-labels.ts` | Create: enum-only validator |

### gaia-skill-heaven
- GitHub sub-issue (user stories verbatim) · optional one-line pointer in `docs/LADDER-FLOW.md`

### Explicitly NOT touched
`ledger.ts`, `census.ts`, `check-claims.ts`, `data/ledger.jsonl`, `packages/core/src/vendor/`, parity fixture, `packages/site` copy, canon storage (G1 read-only).

---

### Methodology update spec

**§1 (light touch):** sweep residual "same seed"/determinism phrasing beyond the existing B3 banner; re-anchor the closing Heaven/Hell paragraph to the ladder (Heaven ≡ `low·med`, Hell ≡ `high·xhigh·max`, Ultra ≡ per-gap governor on the same line). Keep the drug-trial analogy table.

**§2 (full rewrite, B2):** placebo arm = **our own same-harness no-skill run** at a pinned harness version, same corpus, N repeats + CIs; effect = `mean(outcome | arm) − mean(outcome | placebo)`, always within-harness. Published external benchmarks demoted to calibration/sanity context only, never arms (aligning prose with the invariant already in `ledger.ts`). Reproducibility via pinned versions + persisted session logs priced by `gaia-research/skill-cost`.

**NEW §2b "Arms are rungs on one ladder" (N13):**
1. One line `zero · low · med · high · xhigh · max · ultra`; four contiguous bands; zero = Skill Zero floor shipping `/summon`.
2. v1 arms: `placebo`, `heaven@low`, `heaven@med`, `hell@high`, `hell@max` (xhigh optional), `ultra`. Exactly one rung per session.
3. D5 mixture-of-agents expectation: Hell routes through gaia mcp; routing deterministic (relevance ranking over the pool); **no model call decides HOW MUCH**; **no rung carries a count** (counts WITHDRAWN).
4. Endpoints: quality (§3 tier filter unchanged) AND cost — two-number dosing (`census.ts`, chars4) plus whole-session tokens from persisted logs and wall-clock; never self-reported counts.
5. Target = the **entropy curve** (rise-then-turn hypothesis); explicitly **not a token-savings headline**.
6. Honest-status box: stamps not built; routing falls back to relevance ranking until R2; no surface may present stamp-gated routing as running.

**§6 (prose only):** rung-based arm enum, two-number dose categories, `repeatIndex` + CIs, validator rejects `seed`. **Schema frozen** — parity fixture is byte-pinned (D6).

**Stays untouched:** §3 endpoint filter, §4 v1 scope, ledger schema, census, validator.

---

### Stamp taxonomy & rubric

Scoring discipline: every row **binary or set-membership over the tier lattice** (`{low…max}`); no floats; verdicts derived, never claimed. Labels are **multiplicative + primary-stamp** (T9, pending ratification). Preamble carries the seven not-measurable-today items verbatim; behavioural rows labelled as **predictions** verified in R2.

**heaven-native** (iff H1–H5 pass): H1 dose profile (lowest tercile of R0 census for genre class — binary vs one ratified cutoff table) · H2 convergence contribution · H3 anti-flood/marginal-gain shape · H4 interactive-loop fitness · H5 default harmlessness.

**hell-safe@T** (verdict = ceiling up to tier T): S1 write-scope checklist (P3 disposable workspace; no destructive git ops; writes gated behind RED→GREEN for mutation behaviour — failure caps at `low`) · S2 unsupervised-risk ceiling (**publish-class actions = unconditional FAIL at every tier**, T8) · S3 static composition safety incl. **information-flow check** (secrets-read ⇒ never instruct external transmission; pairwise dynamics recorded unverified) · S4 side-effects-of-output clause · S5 cost containment (paid-compute skills without explicit ceilings fail above `mid`).

**ultra-ready** (iff U1–U5 pass): U1 governor compatibility (robust to arbitrary combination) · U2 checkpoint/recover friendliness · U3 single-gap decomposability · U4 anti-fabrication under pressure (T5) · U5 deterministic self-description.

Tension rules embedded: T1 reviewer/remediator split (#5/#9/#10 anchors), T2 griller polarity cap, T3 ceiling-not-blanket (#16), T4 env gate required above `mid` (#12), T5 grounding inversion, T6 learn-vs-ship scoping, T7 dosing paradox legitimises H1 failure for summon-floor references (#20), T8/T9/T10 pending ratification, T11 qualifiers never upgrade verdicts.

---

### Seed set (~20 skills)

Heaven 7 / Hell 9 / Governor 3 / Summon-floor 1; every tension cell hit; ≤3 primary anchors per slice; controls #2 (design-systems guide → heaven-native cleanly) and #11 (bulk test-gen → hell-safe@high cleanly):

| # | Seed skill (genre) | Band | Primary stamp (+secondary) | Tensions |
|---|---|---|---|---|
| 1 | Grilling/adversarial-critique playbook | A | heaven-native | T2, T9 |
| 2 | Design-systems/visual style guide | A | heaven-native | control |
| 3 | Systematic-debugging playbook | A | heaven-native (+ultra-ready) | T9 |
| 4 | House-style/brand-voice reference | A | heaven-native | T7-lite |
| 5 | IaC-plan **review** checklist | A | heaven-native, explicitly NOT hell-safe | T1 |
| 6 | Language-onboarding cheatsheet+tutor | A | heaven-native (+ultra-ready?) | T6, T9 |
| 7 | Decision-framework/tradeoff matrix | A | heaven-native (+ultra-ready) | T9 |
| 8 | Read-only security-audit checklist | B | hell-safe@high | T1 contrast |
| 9 | Auto-patch w/ RED→GREEN gate | B | hell-safe@max ONLY IF gate verified | T1, T8 |
| 10 | Codemod/org-migration playbook | B | hell-safe@xhigh + ultra-ready | T1, T8 |
| 11 | Bulk test-gen/coverage sweep | B | hell-safe@high | Hell control |
| 12 | Chaos-injection playbook | B | hell-safe@mid conditional on env gate | T4 |
| 13 | Corpus map-reduce summarizer | B | hell-safe@high + ultra-ready | egress Q |
| 14 | Web-recon/deep-research playbook | B | hell-safe@tier w/ network qualifier | network axis |
| 15 | Image/batch media-generation skill | B | hell-safe@high w/ cost ceiling | S5 |
| 16 | Env-repro/get-it-running skill | B | hell-safe @ **ceiling** | T3 |
| 17 | Checkpoint/canonization protocol | C | ultra-ready | U2/U3 pilot |
| 18 | Guardrail/destructive-action gate | C | ultra-ready + composition-load-bearing | S3 probe |
| 19 | Grounding/citation-integrity discipline | C | ultra-ready + hell-safe candidate | T5 |
| 20 | Heavy normative reference (WCAG-class) | S | none-auto / summon-floor | T7 |

**Procedure:** independent per-dimension worksheets → derived verdicts + qualifiers + known-miss cases (mandatory for #8/#9/#14/#19) → taste-dependent skills (#1 creative, #15 curation) structural dims only → ≥2 labelers, founder arbitrates (D9) → agreement check: exact-verdict % + per-dimension agreement; controls must be unanimous or the rubric is indicted (halt, revise, record negative finding D8); aggregate to `data/seed-labels/summary.jsonl` validated by the enum checker.

---

### USER STORIES (verbatim for the GitHub sub-issue)

#### `/summon`
1. As a solo developer, I type `/summon obra/systematic-debugging` when a test fails randomly on CI, so that I get one disciplined debugging method mounted for this session only — nothing installed, clean slate afterwards. **HONESTY NOTE:** The summon mechanic works today (demo path). Not true yet: no stamp certifies this skill's dose profile — heaven-native labels are R1/R2 predictions, and dose numbers come from the census, not a ratified M2a system (`tokens.system` stays null until then).
2. As a platform engineer, I `/summon org-convention-reviewer` before reviewing a PR, so that everyone can see exactly which rulebook was applied — accountability demands knowing the standard, not trusting an automated chooser. **HONESTY NOTE:** Works today. Standing-vs-invocation dose split comes from the census; projected-session-cost display at summon time is unbuilt.
3. As a consultant auditing client code, I `/summon` a heavy WCAG-class rulebook for one engagement, so that I get normative precision this session without paying its large standing cost every future session. **HONESTY NOTE:** Works today — deliberately the T7 stress case; whether bare summon beats install economics for heavy references is exactly what R1/R2 test. No claim ships before the benchmark (B4).

#### `/skill-heaven`
1. As a product designer, I run `/skill-heaven brainstorm 3 directions for our analytics dashboard, then grill them`, so that the right few design and critique skills are auto-summoned and I converge quickly. **HONESTY NOTE:** Auto-summon currently falls back to **relevance ranking** — no heaven-native stamps exist yet, so "the right few" is provisional, and representative rung `low` is PROVISIONAL until the entropy curve lands.
2. As a solo dev, I run `/skill-heaven grill me on this API design doc before I build it`, so that my design gets adversarially attacked before any code exists. **HONESTY NOTE:** Grilling works interactively today, but the T2 polarity flip is unmeasured — how the same skill behaves Hell-summoned in a swarm is on the not-measurable-today list.
3. As a maintainer, I run `/skill-heaven do the retro for last night's outage and give me a hardening backlog`, so that analysis converges on one good document instead of fanning into a swarm. **HONESTY NOTE:** Relevance-ranked summons deliver a plausible retro today; whether it beats the same-harness no-skill placebo is what R2 must show — no efficacy claim before that (B4).

#### `/skill-hell`
1. As a security champion, I run `/skill-hell sweep the repo for CVE dependencies and autofix with draft PRs`, so that parallel agents reproduce vulnerable paths and land RED→GREEN draft PRs overnight. **HONESTY NOTE:** Swarm orchestration over the shared MCP is design intent; **hell-safe@tier stamps are not built** — nothing yet certifies these skills for unsupervised fleet summon. Until R2 this is probe/demo territory, not a safety claim.
2. As a release manager, I run `/skill-hell find and quarantine the flaky tests — evidence per cluster`, so that unknown failure causes get explored in parallel and confirmed flakes are quarantined with evidence. **HONESTY NOTE:** Quarantine-only writes fit the hell-safe shape on paper, but composition safety (S3) is not measurable today, and representative rung `high` is PROVISIONAL.
3. As an indie dev about to ship, I run `/skill-hell security-sweep this app — find it, reproduce it, fix it`, so that findings are reproduced as failing tests and patched behind a verification gate. **HONESTY NOTE:** Patch-stage skills should only earn hell-safe@max behind a *verified* RED→GREEN gate — that verification doesn't exist yet; honest behaviour today is ranked findings with reproduction steps, not certified autonomous patching.

#### `/skill-ultra`
1. As a tech lead, I run `/skill-ultra redesign the admin console and fix the flaky realtime pipeline`, so that the design gap converges while the hardening gap explores, checkpointed between phases. **HONESTY NOTE:** The ultra controller is a heuristic, **not shipped**; gap decomposition is a judgment call whose deterministic-rubric status is an open R1 ratification question (D5 boundary). Design target, not capability claim.
2. As a platform migration driver, I run `/skill-ultra migrate all services to auth-sdk v2, opening draft PRs per repo`, so that mechanical repos get codemods and exotic call sites get swarms — direction and depth picked per repo. **HONESTY NOTE:** Checkpoint/canonize protocols exist as genre definitions only; no ultra-ready stamp exists and long-horizon resume-after-crash is unbuilt. Irreversible steps would need a rung-independent deny-list still awaiting ratification.
3. As an SRE, I run `/skill-ultra run a multi-region failover drill on staging and report gaps`, so that four heterogeneous gaps execute with appropriate skill and depth each, sequenced into one drill report. **HONESTY NOTE:** Chaos/failover skills require an environment gate (abort on prod detection) as a hell-safe precondition (T4) — gate enforcement is not implemented. Also open: whether incident-class prompts should route to ultra at all.

---

### Validation gates

- **B4:** all R1 artifacts framed as PREDICTIONS; numbers via the `check-claims.ts` ‡ provenance gate; no public site/marketing changes; honesty notes verbatim in the sub-issue.
- **B2:** §2 rewrite makes own-placebo the only baseline arm; published scores calibration-only (matching `ledger.ts`).
- **B3:** no `seed` anywhere; N repeats + CIs everywhere; validator already rejects the field.
- **D5:** rubric encodes the deterministic boundary (U5, S3-static, tension rules); curation-vs-ranking question escalated, not assumed.
- **D6:** zero changes to `hh-ledger/v1` schema, `census.ts`, `check-claims.ts`, vendor helpers, or the parity fixture; labels get their own enum-only validator; monorepo needs no code sync.
- **G1:** canon set-membership stamp persistence described as future direction only, never implemented.
- **M0/D8:** no harness-behaviour claims in R1 (no probe owed); control disagreement = first-class negative finding blocking downstream work.
- **Git:** feature branches + PRs; `gaia-research` merges with merge commits, `gaia-skill-heaven` squashes; ratification deltas ride the implementing PR (D9).

## Risks
1. **Rubric circularity** — mitigated by halt-and-revise controls (#2/#11) and prediction-framing of behavioural rows.
2. **Genuinely low inter-labeller agreement** on taste cells — pre-declared expected-noisy cells restricted to structural dimensions; report honestly.
3. **Ratification latency** on T8/T9 — worksheets record secondaries/qualifiers either way; ruling costs a re-reduction, not a re-labour.
4. **Schema drift temptation** during §6 prose work — forbidden; parity fixture is byte-pinned.
5. **User stories read as capability claims** once filed — honesty notes mandatory verbatim, linked to the not-measurable list.
6. **Scope creep into R2** — R1 ends at validated labelled aggregate; correlation analysis is explicitly R2.