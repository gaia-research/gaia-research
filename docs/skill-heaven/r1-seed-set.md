# R1 Seed Set — 20-skill composition, identities, labelling procedure

**Status:** PREDICTIONS ONLY. Every stamp, qualifier, and expected secondary below is a
hand-label *prediction* to be tested by the R2 worksheet procedure — none of it is a
benchmark result (B4/B2/B3). Numbers appear nowhere here by design; the design language is
N repeats plus confidence intervals once labeling lands.

Inputs: `docs/skill-heaven/R1-STAMP-TAXONOMY-SYNTHESIS.md` §3–§4;
`docs/plans/drafts/r1-stamp-taxonomy-seedset-PLAN.md` §"Seed set (~20 skills)".
R1 canon was read from `/data/data/com.termux/files/home/gaia-skill-tree`
(`registry/named-skills.json`, `skill-trees/`, `skills-lock.json`) **READ-ONLY**.
R2 resolves every input to exact immutable bytes in
[`content-identities.json`](../../scripts/hell-heaven-bench/data/r2/content-identities.json);
where an R1 candidate had no retrievable contract, the replacement is named below rather
than pretending the old identity was executable.

## 0. Rank policy

Arbor I selection of seeds is **rank-agnostic**: seed slots are chosen for raw capability <!-- lexicon-allow: B3 historical R1 terminology. -->
fit to a tension cell, never for star level or trust grade. Where the canon registry carries
a rank (`level` stars, evidence `trustNumber`), ranks are used **only to break ties between
equally-fitting candidate skills**, so the seed set stays realistic against what users can
actually install today.

## 1. Composition rules (from the synthesis)

- Bands: Heaven 7 · Hell 9 · Governor 3 · Summon-floor 1 = 20.
- Every tension cell T1–T11 hit at least once.
- At most **3 primary anchors per input slice** (S1–S8); accounting in §5.
- Two **clean positive controls** (#2 Heaven-side, #11 Hell-side): if labelers disagree on
  either, the rubric itself is indicted — see §4 (KILL K1 downstream).

## 2. The 20-skill composition table

Genres, primary-stamp predictions, tension cells per the synthesis (§4 there), verbatim:

| # | Seed skill (genre) | Band | Primary stamp prediction (+secondary) | Tension cells | <!-- lexicon-allow: B3 historical R1 table heading. -->
|---|--------------------|------|---------------------------------------|---------------|
| 1 | Adversarial-critique/grilling playbook | A | heaven-native | T2, T9 |
| 2 | Design-systems/visual style guide | A | heaven-native | control (Heaven) |
| 3 | Systematic-debugging playbook | A | heaven-native (+ultra-ready) | T9 dual-stamp anchor |
| 4 | House-style/brand-voice reference | A | heaven-native (standing-dose economics) | T7-lite |
| 5 | IaC-plan **review** checklist | A | heaven-native, explicitly NOT hell-safe | T1 anchor |
| 6 | Language-onboarding cheatsheet+tutor | A | heaven-native (+ultra-ready?) | T6, T9 |
| 7 | Decision-framework/tradeoff matrix | A | heaven-native (+ultra-ready) | T9 |
| 8 | Read-only security-audit checklist | B | hell-safe@high | T1 contrast to #9 |
| 9 | Auto-patch w/ RED→GREEN gate | B | hell-safe@max ONLY IF gate verified | T1, T8 |
| 10 | Codemod/org-migration playbook | B | hell-safe@xhigh + ultra-ready | T1, T8 |
| 11 | Bulk test-gen/coverage sweep | B | hell-safe@high | control (Hell) |
| 12 | Chaos-injection playbook | B | hell-safe@mid conditional on env gate | T4 |
| 13 | Corpus map-reduce summarizer (fixed ledger schema) | B | hell-safe@high + ultra-ready | privacy/egress open question |
| 14 | Web-recon/deep-research playbook | B | hell-safe@tier w/ network qualifier | network axis |
| 15 | Image/batch media-generation skill | B | hell-safe@high w/ cost ceiling | cost-containment S5 |
| 16 | Env-repro/get-it-running skill | B | hell-safe@**ceiling** (tier cap) | T3 |
| 17 | Checkpoint/canonization protocol | C | ultra-ready | U2/U3 pilot |
| 18 | Guardrail/destructive-action gate | C | ultra-ready + composition-load-bearing | S3 probe |
| 19 | Grounding/citation-integrity discipline | C | ultra-ready + hell-safe candidate | T5 |
| 20 | Heavy normative reference (WCAG-class rulebook) | S | none-auto / summon-floor | T7 |

### 2b. Tension-cell coverage accounting (T1–T11)

The table column above names each seed's *headline* cells; several cells are carried in <!-- lexicon-allow: B3 historical R1 terminology. -->
the rubric's anchor assignments and the worksheets' qualifier fields rather than the
column, so the full map is written out here to make the §1 claim checkable:

| Cell | Seeds carrying it | Where recorded |
|------|-------------------|----------------|
| T1 reviewer/remediator split | #5 (reviewer half), #8 (contrast), #9, #10 | table + rubric T1 anchors |
| T2 griller polarity cap | #1 | table + rubric T2 rule |
| T3 ceiling-not-blanket | #16 | table + rubric T3 anchor |
| T4 env gate above `med` | #12 | table + rubric T4 anchor |
| T5 grounding inversion | #19 | table + rubric T5 anchor |
| T6 learn-vs-ship scoping | #6 (vs #10) | table + rubric T6 anchors |
| T7 dosing paradox / heavy refs | #20 (anchor), #4 (lite) | table + rubric T7 anchor |
| T8 publish-class deny-list | structural rule (rung-independent); exercised by #9, #10 | rubric §5 + worksheet deny-list-status fields |
| T9 multiplicative + one PRIMARY | #3 (anchor), #1, #6, #7 | table + every worksheet's stamp block |
| T10 probe-patch-as-mutation (OPEN) | #9 — both readings recorded per the interim conservative rule | worksheet 09 environment-qualifiers field |
| T11 scope-of-validity qualifiers | #4, #10 (rubric anchors); #20 adjacent | worksheets 04/10/20 qualifier fields |

Every cell T1–T11 lands at least once. No cell relies on a seed outside the 20. <!-- lexicon-allow: B3 historical R1 terminology. -->

## 3. Concrete skill identities per slot

Identities sourced READ-ONLY from the Arbor I canon checkout
(`registry/named-skills.json` buckets; `skill-trees/<contributor>/...`). Where multiple
canon candidates fit, the tie was broken on rank/evidence grade where one exists (§0);
where none fits, the REQUIRED SHAPE is specified and identity is **TBD**.

| # | Identity (canon id) | Notes / fallback |
|---|---------------------|------------------|
| 1 | `mattpocock/grilling` (also `grill-me`, `grill-with-docs`) | interactive critique genre confirmed |
| 2 | `garrytan/design-consultation` (design-system-extraction bucket) | CONTROL — must be uncontroversially heaven-native |
| 3 | `obra/systematic-debugging` | canonical dual-stamp anchor |
| 4 | `anthropics/brand-guidelines` (brand-guideline-application bucket) | standing-dose economics case |
| 5 | `lgbarn/terraform-plan-review` (**R2 replacement**) | review-only Terraform plan inspection; replaces the unresolved shape |
| 6 | `mattpocock/teach` (+ cheatsheet half optional) | tutor dose vs ship-keyword collision (T6) |
| 7 | `microsoft/tradeoff-analysis` (**R2 replacement**) | explicit tradeoff-analysis contract; replaces the unresolved shape |
| 8 | `garrytan/cso` (security-audit bucket) | must be verified read-only during labeling |
| 9 | `mattpocock/diagnosing-bugs` (**R2 replacement**) | live five-phase diagnosis contract with deterministic feedback-loop requirement |
| 10 | `mattpocock/migrate-to-shoehorn` (**R2 replacement**) | R1 Laravel candidate exposed no retrievable `SKILL.md`; the documented alternate is pinned instead |
| 11 | `curiouslearner/test-generator` (**R2 replacement**) | R1 Upsonic candidate exposed an agent file, not an executable `SKILL.md`; live test-generator contract is the control input |
| 12 | `alirezarezvani/chaos-engineering` (**R2 replacement**) | live chaos experiment contract with blast-radius and rollback planning |
| 13 | `huggingface/huggingface-datasets` (data-analysis bucket) | corpus map-reduce over fixed schema; egress question applies |
| 14 | `mvanhorn/last30days` (autonomous-web-research bucket) | network-touching qualifier mandatory |
| 15 | `remotion-dev/remotion-multimedia` (generative-media bucket) | batch media-gen; structural dims only (taste-dependent) |
| 16 | `firecrawl/firecrawl-build-onboarding` (agent-environment-setup bucket) | install-script ceiling case (T3) |
| 17 | `garrytan/context-save` (context-compression bucket) | checkpoint/canonization protocol pilot |
| 18 | `garrytan/guard` (guardrails bucket; siblings `careful`, `freeze`) | destructive-action gate probe target |
| 19 | `caioribeiroclw-pixel/evidence-attestation` (evidence-attestation bucket) | grounding/citation-integrity; known-miss cases mandatory |
| 20 | `supabase/supabase-postgres-best-practices` | WCAG-class heavy normative reference; summon-floor dosing paradox |

No existing schema or record in the canon was modified (K4: additive/read-only).
The R2 replacements correct executable inputs; they do not retroactively turn the R1
worksheet rows into evidence. Those rows remain pre-trial hypotheses, and the R2 protocol's
confidence-interval and safety rules alone accept, reject, or withhold a stamp.

## 4. Labelling procedure (per skill)

Per the plan's procedure, executed independently per labeler:

1. **Applicable dimensions.** Score every applicable dimension of H1–H5 (Heaven),
   S1–S5 (Hell safety/tier), U1–U5 (Ultra readiness). Dimensions are the real data;
   the stamp verdict is derived. Taste-dependent skills (#1 creative uses, #15
   curation) get **structural dimensions only**.
2. **Stamp labels are multiplicative** with exactly **one declared PRIMARY stamp**
   per skill (T9 ruling ratified this sprint); secondaries recorded separately.
3. **Environment qualifiers** wherever the verdict is conditional rather than
   absolute — required at minimum for #12 (env-gate precondition), #14
   (network-touching), #15 (cost ceiling), #16 (tier cap). No absolute hell-safe
   verdict may be written for these.
4. **Known-miss cases** (2–3 each) are **mandatory for audit-class skills**:
   #8, #9, #14, #19 — so the R2 curve cannot flatter recall-blind scoring.
5. ≥2 independent labelers per skill; founder arbitrates deltas (D9). Agreement
   reported as exact-verdict % plus per-dimension agreement.
6. Aggregates land in `data/seed-labels/summary.jsonl`, validated by the enum checker.

## 5. Controls and the halt rule

- **Control #2** (`garrytan/design-consultation`): clean because the genre has no
  write-path, no publish surface, no environment dependence, and no plausible secondary
  stamp — a unanimous heaven-native verdict is the rubric's easiest pass.
- **Control #11** (`curiouslearner/test-generator`): clean because test generation is
  conventionally sandboxed, additive-only, reversible by git, and carries no
  publish-class action — a unanimous hell-safe@high verdict is likewise the easy pass.
  This executable R2 input replaces the R1 `upsonic/unittest-generator` candidate, whose
  retrievable artifact was an agent file rather than a `SKILL.md` contract.
- **Halt rule (K1):** any labeller disagreement on EITHER control halts labeling
  entirely. Revise the rubric, record the negative finding (D8), re-run. Disagreement
  on a non-control skill is arbitration, not halt.

## 6. Slice-provenance accounting

Primary anchors per collection slice (≤3 enforced):

| Slice | Primary anchors |
|-------|-----------------|
| S1 | #3, #10, #11 |
| S2 | #2, #15 |
| S3 | #5, #12, #19 |
| S4 | #13, #14 (#19 alternate) |
| S5 | #10, #17 |
| S6 | #5, #9, #18 |
| S7 | #6, #16 (#20 alternate) |
| S8 | #4, #15 |

No slice exceeds 3 primary anchors.

---

*Everything above is a set of predictions about how labeling will go, not a result.
The seed identities are inputs to the R2 worksheets; the stamps are their hypotheses.* <!-- lexicon-allow: B3 historical R1 terminology. -->

## 7. Divergence ledger — filled worksheets vs headline predictions (review cycle 3)

All twenty worksheets now carry complete fifteen-row dimension predictions. Where the
filled rows derive a different verdict than this document's §2 headline prediction, the
delta is recorded **in the worksheet** with its derivation and flagged for D9 arbitration —
never silently resolved. Ledger of known divergences:

| # | Headline prediction (above) | Filled-worksheet derivation | Disposition |
|---|---|---|---|
| 03 | heaven-native (+ultra-ready) | heaven-native + hell-safe@high; ultra-ready WITHHELD (U2 in-session state, U3 any-bug scope) | T9 dual cell still exercised, different dual; D9 |
| 10 | hell-safe@xhigh (+ultra-ready) | hell-safe@xhigh held; ultra-ready WITHHELD conservatively (U5 unverifiable, body NOT-RESOLVED) | thin-evidence convention; ultra-ready returns if R2 pinning shows a deterministic protocol |
| 13 | hell-safe@high (+ultra-ready) | none-auto, tier none, deny-list-ADJACENT — S3 information-flow clause fails conservatively (trace-upload path transmits session content its own text admits may contain secrets) | largest delta; canary-secrets egress probe would adjudicate; D9 |
| 14 | hell-safe@tier w/ network qualifier | hell-safe@med — S5 fail (metered spend, no ceilings) caps at med; `--publish` recorded deny-list-adjacent | tier resolved to med per §3.2 cap rule |
| 20 | none-auto / summon-floor | none-auto HELD, but all S rows pass => hell-safe derivable and deliberately not rendered | presentation-convention question escalated with T7 weighting |

Also logged as rubric defects for D9 (found by labelling, not resolvable here): the §3.2
cap grammar yields only {∅, low, med, max} while §6's band semantics anchor @high/@xhigh
labels; and R1 possesses no verification machinery, so §6's max band (VERIFIED RED→GREEN)
is unreachable by construction at R1. Worksheets map tiers via §6 band additions and say
so explicitly.

Controls are unaffected: #2 derives heaven-native cleanly and #11 derives hell-safe@high
cleanly on inspection. The ≥2-independent-labeler agreement pass remains the gating step
for any agreement claim; until it runs, every worksheet is one structural prediction pass.
