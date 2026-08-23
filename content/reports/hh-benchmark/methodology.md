# The Hell Heaven Benchmark — Methodology

<!-- Status: DRAFT METHOD, NOT YET EXECUTED. Public WIP. Help wanted. -->

> **Reconciliation note (updated 2026-08-24).** Where this draft disagrees with
> [`founder/RATIFICATION.md`](../../../founder/RATIFICATION.md), the
> ratification doc wins. Aligned this pass: **§2** now runs the **B2
> own-placebo design** (the placebo arm is our own same-harness no-skill run;
> published benchmark scores are calibration context only); every fixed-run
> phrasing is gone per **B3** (N repeats + confidence intervals throughout; the
> run-ledger validator rejects the retired field); and new **§2b** re-anchors
> every arm to one ladder per **N13**.
>
> Still pending, flagged honestly: residual "fewer tokens than vanilla"
> phrasing in §3's asymmetry note and §4's v1-scope line predates N13/B2 and is
> left as-is because those sections are out of scope for this rewrite. Read it
> as calibration-era language; everywhere else the target is the entropy curve
> (§2b), never a token-savings headline.

**How do you benchmark a *skill*?** Not a model — a skill. The thing you bolt onto an
agent to make it better at something. Everyone can feel when a skill helps. Almost nobody
has written down how to *prove* it. This is our attempt, in the open, before we've run it.

> **Status:** Draft method. **Not yet executed.** We are publishing the plan first — receipts
> before results — and asking for help (see the bottom). If you benchmark models or skills for
> a living, this is bleeding edge, and we'd love your eyes on it.

---

## 1. The reframing: you are not benchmarking a skill

A skill has no score in a vacuum. Its value is always **marginal** — *what did adding it to
the loadout do, versus not adding it, in this exact context?* So we never measure a skill
alone. We measure a **pair**: the same task, same model, **N repeats reported with confidence intervals**, run **with** the skill and
**without** it. The skill's worth is the *delta*.

### The analogy: a drug trial, not an exam

We don't grade skills like a student taking a test (absolute score, works in isolation). We run
a **pharmacology trial**, where each skill is a *compound* and the agent-in-context is the
*patient*.

| Pharmacology | Hell Heaven Benchmark |
|---|---|
| The compound | The skill (its `SKILL.md` contract) |
| The patient | The agent + its current context / loadout |
| **Dose** | **`contextCost`** — tokens the skill occupies |
| **Efficacy** | Does the task score go *up* with it? |
| **Toxicity** | Does it crowd out better skills, mislead, or misfire? |
| **Placebo arm** | Our **own same-harness no-skill run** at a pinned harness version — the control we always run (see §2) |
| **Published survival rates** | Established model benchmarks (see §2) — calibration context only, never an arm |
| **Double-blind grading** | Blind pairwise judging, so we score what happened, not what we hoped |

The frame also tells us Heaven and Hell are not two trials but **two dosing
regimens on one line** — the ladder `zero · low · med · high · xhigh · max ·
ultra`, where each rung is a level of **skill entropy** (how much skill variety
and volume enters the session; full statement in §2b):

- **Heaven** = the *precision-medicine* regimen — the low-entropy band (`low ·
  med`). Small, curated dose. Question: did the *right few* skills, at the
  lowest dose, beat the untreated patient?
- **Hell** = the *polypharmacy / population* regimen — the high-entropy band
  (`high · xhigh · max`). Open the whole formulary to the patient and ask:
  across a *population* of tasks, does aggressive dosing net better outcomes at
  acceptable total cost than placebo — or does the curve turn?
- **Ultra** sits at the top of the same line and picks the entropy per gap,
  direction and depth both. A session sits at exactly one rung — never two
  regimens at once.

---

## 2. The baseline is our own placebo, not a borrowed number

The single hardest thing about a homemade benchmark is credibility: *why should anyone trust
your scoring?* Pharmacology's answer is not to borrow another trial's historical survival
rate — it is to **run your own control group**. So do we.

**The placebo arm is our own same-harness no-skill run**: identical harness, pinned version,
identical corpus, identical endpoints — skills withheld. Nothing borrowed. Each arm runs
over **N repeats reported with confidence intervals**, and every effect is measured
within-harness:

> skill effect = mean(outcome | arm) − mean(outcome | placebo)

- The baseline is never a published score. Established model benchmarks are demoted to
  **calibration and sanity context only** — numbers we quote beside ours to check we are in
  the right ballpark, never an arm of the trial and never the denominator of a claim. This
  aligns the prose with the invariant the run-ledger validator already enforces (B2).
- Reproducibility comes from **pinned harness versions + persisted session logs**, priced by
  [`gaia-research/skill-cost`](https://github.com/gaia-research/skill-cost) — the canonical
  basis for every cost measure: persisted harness logs priced against a public catalog,
  never self-reported counts.
- This still makes every claim *reproducible by a skeptic*: pin the same harness version,
  run the same corpus without skills, and you have produced the placebo yourself.

---

## 2b. Arms are rungs on one ladder

(N13.) There are no separate Heaven and Hell trial designs here — there is **one line**:
`zero · low · med · high · xhigh · max · ultra`. Every arm of this benchmark is a rung on
that line, and a session sits at **exactly one rung**.

1. **One ladder, four bands.** The line is single and global; the four surfaces are
   contiguous bands read from the rung. `zero` = Skill Zero, the floor — zero skill entropy,
   ships `/summon`, none of the choosing automated. `low · med` = Heaven (converge).
   `high · xhigh · max` = Hell (explore). `ultra` crowns the same line and picks the entropy
   per gap — direction and depth both.
2. **v1 arms:** `placebo`, `heaven@low`, `heaven@med`, `hell@high`, `hell@max` (`xhigh`
   optional), `ultra`. Exactly one rung per session; never a Heaven position and a Hell
   position held at once.
3. **Mixture-of-agents expectation (D5).** Hell routes its summons through gaia mcp as a
   *mixture-of-agents-for-skills*: more experts in context, expected better — until it
   isn't. Routing stays deterministic (relevance ranking over the pool); **no model call
   decides HOW MUCH** enters context, **no rung carries a count, and no summon is capped**
   (the count model is WITHDRAWN). How far a rung reaches on a given gap is the agent's
   call, worked out in use while the benchmark is built.
4. **Endpoints: quality AND cost.** Quality goes through the §3 tier filter unchanged. Cost
   is dosed as two numbers — **standing** (the listing line, paid every session) vs
   **invocation** (the full body, paid on invoke), from the census tokenizer — plus
   whole-session tokens priced from persisted logs and wall-clock. Never self-reported
   counts.
5. **The target is the ENTROPY CURVE.** Quality and cost plotted together as skill entropy
   rises, under a rise-then-turn hypothesis. Explicitly **not a token-savings headline**;
   if the curve turns, that turn is the finding, not a failure of framing.
6. **Honest status.** Heaven/Hell stamps are not built; routing falls back to relevance
   ranking until R2; no surface may present stamp-gated routing as running. The
   representative rungs — Heaven's `low`, Hell's `high` — remain **PROVISIONAL** until the
   curve lands.

> **Trial translation.** The placebo arm is absolute zero — the ruler's bottom, an internal
> instrument, benchmarking-only (P8). Every treatment arm is a rung above it. What varies
> between arms is the dose of skill entropy; what we record is efficacy and cost against
> it.

---

## 3. What is even benchmark-able? (the one deciding question)

Not every task can carry a golden claim. We stratify by **how objective the endpoint is**, and
we never claim more certainty than the endpoint allows. The filter is a single question:

> **Can a script decide success without a human reading the output?**

| Tier | Endpoint | Example | What it backs |
|---|---|---|---|
| **1 — Deterministic** | Pure measurement, no run | `contextCost` = tokenize `SKILL.md`; loadout-size delta | Hard facts (dose) |
| **2 — Objective outcome** | A script decides pass/fail | "add auth → the auth test suite goes green"; pass@k; build green; linter delta | **The strong public claims** |
| **3 — Judged** | Blind pairwise, LLM-judge panel + human spot-check | "is this a sharper architecture, with vs without?" | "We observed" (+ CI) |
| **4 — Expert label** | Rubric + ≥2 raters, report agreement | `grillingNeed`; "is this heaven-native?" | Expert judgment (hypothesis) |

**Tier 2 is the backbone.** Objective-endpoint tasks first — that's what makes a report
bulletproof. Tier 3/4 layer on for the fuzzy, design-shaped work Heaven cares about.

**A stated asymmetry, on purpose:** Hell's corpus (autonomous "build / fix / refactor X" tasks)
is mostly Tier 2 — objective. Heaven's corpus (architecting, shaping a feature, brainstorming)
leans harder on Tier 3 judged preference, because good design has no unit test. *We say so in
every Heaven report.* Pretending otherwise is the one thing that would tarnish the gold. The
saving grace: Heaven's boldest claim — *fewer tokens than vanilla, success held* — has an
objective Tier-1/2 endpoint even when "sharper" stays a judged preference.

---

## 4. v1 scope: marginal efficacy. Isolation comes later.

We are deliberately staging the ambition.

- **v1 — Marginal efficacy.** For each skill, does it move an established baseline in context?
  With/without pairs, published-benchmark anchor, objective endpoints first. That's the whole
  of v1. It is enough to earn a first round of stamps.
- **v2 — Isolation & competition.** Once v1 is solid, we test **skills of the same calibre
  against each other.** When two skills claim the same capability, which wins the roster slot?
  This needs a *fixed context ceiling* so adding one skill forces dropping another — that's when
  we can measure **displacement** (what a skill crowds out) and run head-to-head **competitions**
  within a capability class. Bleeding edge, and it waits until v1 proves the method.

---

## 5. How stamps fall out of the trial

Stamps are **earned by the trial, not assigned by vibes** — but your intuition is the
*hypothesis*, not the verdict:

1. **Rubric-first.** Expert intuition is written into a rubric — the deterministic
   hand-labelling rules live in [`docs/skill-heaven/r1-stamp-rubric.md`](../../docs/skill-heaven/r1-stamp-rubric.md),
   over the 20-skill seed set defined in [`docs/skill-heaven/r1-seed-set.md`](../../docs/skill-heaven/r1-seed-set.md);
   **≥2 labelers** stamp it. Report inter-rater agreement. These labels are *predictions*.
2. **Trial validates.** Run the paired benchmark. Did the skills we *predicted* were
   `heaven-native` actually win the precision arm? Did the ones we called `hell-safe@max`
   actually help autonomous loops? Confusion matrix, with CIs.
3. **Stamps ship.** Labels that survive validation become `hellHeaven` stamps in the schema
   (`heaven-native`, `auto@tier`, `hell-safe@tier`). The golden moment is intuition *confirmed
   or falsified* — either way, the report is honest.

This maps to the RFC phases: R0 dose census → R1 rubric + seed labels → R2 objective corpus →
R3 paired trial → R4 validate labels → R5 stamps.

---

## 6. Data we gather, per run

Every run appends to a ledger (`scripts/hell-heaven-bench/`): benchmark id, task, **arm named
by its rung** — `placebo`, `heaven@low`, `heaven@med`, `hell@high`, `hell@xhigh` (optional),
`hell@max`, `ultra`; exactly one rung per session — skill(s) loaded (id + sha256 of the exact
`SKILL.md` text), model, harness name and version, `repeatIndex` (0-based; N repeats give the
confidence intervals), tokens by two-number dose category (**standing** — listing lines, paid
every session vs **invocation** — full bodies pulled on invoke — alongside system scaffold and
per-turn conversation), wall-clock, the **objective endpoint result**, and — for Tier 3 — the
blind-judge verdict. An arm's marginal effect is `mean(outcome | arm) − mean(outcome |
placebo)`, with CIs, over the population.

Schema discipline: the `hh-ledger/v1` field set is **frozen** — the cross-repo parity fixture
is byte-pinned (D6), so none of the above changes a field. The ledger's coarse `arm` key stays
the frozen enum `placebo / heaven / hell / ultra`; the exact rung rides in the record's
identifying fields until a future ratified schema version carries a dedicated one. And the
validator **rejects any record carrying `seed`** — determinism does not exist in any target <!-- lexicon-allow: states what B3 retired -->
harness; N repeats plus confidence intervals is the whole design.

---

## 7. Open questions (help us answer these)

- **Calibration sets:** which established benchmark scores make the best sanity context to
  quote beside our curves — highest trust, cleanest machine endpoints? Calibration only,
  never arms (see §2).
- **Corpus sourcing:** real Gaia-repo issues/PRs (dogfooded, credible) vs. a synthetic fixed
  corpus (cleaner controls)? Pharma's "real patients vs. model organisms" trade-off.
- **Judge reliability:** how many blind judges + human spot-checks before a Tier-3 preference is
  trustworthy?
- **Does the 0–100 score survive?** Or do the discrete stamps make a continuous score redundant?

---

## Help wanted 🧪

This is genuinely new. We have not seen anyone benchmark *skills* this way — as marginal
compounds against our own same-harness placebo, across the rungs of one dosing line. If you
benchmark models (or, rarely, skills) for a living, or you just think this is a fun hard
problem: **come build it with us, in the open.**

- **Where:** the [tracking issue (#62)](https://github.com/gaia-research/gaia-research/issues/62)
  links back here.
- **What we need first:** the calibration-set shortlist (§2), the objective task corpus (§3
  Tier 2), and a second labeler for the seed rubric (§5). <!-- lexicon-allow: "seed rubric" names the R1 label-set work, not a fixed-run field -->
- **What you get:** your name on a bleeding-edge, evidence-first benchmark, and a say in how the
  Hell Heaven Index gets tuned before it's ever shipped.

*Method drafted in public by Gaia Research. Not yet executed. Receipts before results.*
