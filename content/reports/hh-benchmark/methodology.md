# The Hell Heaven Benchmark — Methodology

<!-- Status: DRAFT METHOD, NOT YET EXECUTED. Public WIP. Help wanted. -->

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
alone. We measure a **pair**: the same task, same model, same seed, run **with** the skill and
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
| **Placebo arm** | The **no-skill baseline** — the control we always run |
| **Established survival rate** | A **published model benchmark** (see §2) — our fixed baseline |
| **Double-blind grading** | Blind pairwise judging, so we score what happened, not what we hoped |

The frame also tells us Heaven and Hell are **two different trial designs**:

- **Heaven** = a *precision-medicine* trial. Small, curated dose. Question: did the *right few*
  skills, at the *lowest* dose, beat the untreated patient — **at fewer tokens than the
  patient's own default regimen** (vanilla)? This is where "Heaven is one step below vanilla"
  gets tested.
- **Hell** = a *polypharmacy / population* trial. Flood the patient with the whole formulary,
  cap the max dose with a firebreak, and ask: across a *population* of tasks, does aggressive
  dosing net better outcomes at acceptable total cost than placebo *or* naive everything-at-once?

---

## 2. The baseline is borrowed, not invented

The single hardest thing about a homemade benchmark is credibility: *why should anyone trust
your scoring?* We sidestep it. **We anchor to already-established, model-specific benchmarks**
— the ones the community already trusts — and treat each as a patient population with a known,
published **untreated survival rate.**

> Pick a benchmark a model already has a public score on. Run it again with a skill loaded in
> context. **The only question we ask is: did the skill move the established number?**

- The model's *own* published score on that benchmark **is** the placebo arm. We don't have to
  argue what "good" means — the field already agreed.
- We report **skill effect = score(model + skill, in context) − score(model, baseline)**, with
  confidence intervals, on a benchmark nobody can accuse us of rigging.
- This makes every claim *reproducible by a skeptic*: they already have the baseline number.

Candidate baseline families (final set is part of the open work): software-engineering task
suites with machine-checkable outcomes, code-generation pass@k suites, and reasoning/agentic
task sets. **Selection rule in §3 decides which qualify.**

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
  This needs a *fixed context budget* so adding one skill forces dropping another — that's when
  we can measure **displacement** (what a skill crowds out) and run head-to-head **competitions**
  within a capability class. Bleeding edge, and it waits until v1 proves the method.

---

## 5. How stamps fall out of the trial

Stamps are **earned by the trial, not assigned by vibes** — but your intuition is the
*hypothesis*, not the verdict:

1. **Rubric-first.** Expert intuition is written into a rubric; **≥2 labelers** stamp a ~20-skill
   seed set. Report inter-rater agreement. These labels are *predictions*.
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

Every run appends to a ledger (`scripts/hell-heaven-bench/`): benchmark id, task, arm
(placebo / heaven / hell / ultra), skill(s) loaded, model, seed, tokens in/out by category
(system, skill-load, per-turn), wall-clock, the **objective endpoint result**, and — for Tier 3
— the blind-judge verdict. The skill's marginal effect is `mean(outcome | present) −
mean(outcome | absent)`, with CIs, over the population.

---

## 7. Open questions (help us answer these)

- **Which established benchmarks** make the best baseline anchors — highest trust, cleanest
  machine endpoints, model-specific published scores we can reproduce?
- **Corpus sourcing:** real Gaia-repo issues/PRs (dogfooded, credible) vs. a synthetic fixed
  corpus (cleaner controls)? Pharma's "real patients vs. model organisms" trade-off.
- **Judge reliability:** how many blind judges + human spot-checks before a Tier-3 preference is
  trustworthy?
- **Does the 0–100 slider survive?** Or do the discrete stamps make a continuous score redundant?

---

## Help wanted 🧪

This is genuinely new. We have not seen anyone benchmark *skills* this way — as marginal
compounds against established model baselines, with a heaven/hell trial split. If you benchmark
models (or, rarely, skills) for a living, or you just think this is a fun hard problem: **come
build it with us, in the open.**

- **Where:** the [tracking issue (#62)](https://github.com/gaia-research/gaia-research/issues/62)
  links back here.
- **What we need first:** the baseline-benchmark shortlist (§2), the objective task corpus (§3
  Tier 2), and a second labeler for the seed rubric (§5).
- **What you get:** your name on a bleeding-edge, evidence-first benchmark, and a say in how the
  Hell Heaven Index gets tuned before it's ever shipped.

*Method drafted in public by Gaia Research. Not yet executed. Receipts before results.*
