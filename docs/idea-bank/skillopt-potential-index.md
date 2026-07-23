# SkillOpt Potential Index (PLN)

- **Source:** Yang et al., *SkillOpt: Executive Strategy for Self-Evolving Agent Skills*, Microsoft Research, 2026 — [arXiv:2605.23904](https://arxiv.org/abs/2605.23904) · [GitHub](https://github.com/microsoft/SkillOpt)
- **Status:** PLN — unratified plan, in ideation
- **Rank:** TBD (pending founder review)
- **Viability:** Medium-High
- **Potential:** Very High

## The idea

SkillOpt's validation gate gives a clear empirical signal: some skills improve dramatically under optimization (+38.9 pts on SpreadsheetBench), others barely move (+9.6 pts on SearchQA). The delta is not random — it correlates with how vague the trigger surface is, how many conversational filler words the skill carries, and whether negative trigger boundaries exist.

The **SkillOpt Potential Index (PLN)** is a static analysis score that estimates — *before* running a full SkillOpt optimization loop — how much a given `SKILL.md` file could benefit from it. It is not a benchmark result. It is a cheap pre-flight signal.

The index would appear in the Gaia Research skill registry as a per-skill property alongside the existing Hell-Heaven score, surfaced on the site and in CLI output.

## What the index would measure

Four signals, each scorable by static analysis without running a model:

1. **Trigger surface vagueness** — does the skill's trigger description use broad verbs ("whenever you need to", "use this for any") without explicit negative cases ("do NOT trigger for X")? Broad surface = high optimization potential.
2. **Filler word density** — count of hedge/politeness tokens ("please", "try to", "make sure to", "carefully", "always try your best"). SkillOpt consistently strips these. High density = high potential.
3. **Negative boundary completeness** — presence or absence of explicit `Do NOT trigger for...` lines. SkillOpt reliably adds these when missing. Absence = high potential.
4. **Word count vs. directive density ratio** — total word count divided by number of imperative directives. A 780-word skill with 6 directives is high-potential; a 185-word skill with 4 tight directives is already well-optimized.

A composite PLN score (0–100) could weight these signals against the SkillOpt paper's ablation results to produce a ranked list of "most improvable skills in your registry."

## Why it matters for Gaia Research

- **Practical**: gives practitioners a zero-cost signal before committing to a full SkillOpt run (which can cost 0.6–46M training tokens per task depending on modality).
- **Ecosystem**: positions Gaia Research's skill registry as the first public database with SkillOpt readiness metadata — a natural fit with the Hell-Heaven benchmark work.
- **Research**: the index itself is an empirical hypothesis. Comparing PLN scores against actual SkillOpt lift figures from the paper (or future community runs) would validate or falsify the signal — a concrete research output.

## Open questions (do not invent answers — flag for founder)

- Should PLN be a field in the GSB submission schema, or a computed property on the registry's read path?
- Does the index live in `gaia-research` (site + badge) or `skill-heaven` (runtime signal during loadout)?
- What is the relationship between PLN and the Hell-Heaven (HH) Index? Are they additive signals or competing framings of the same measurement?
- Is there appetite to run actual SkillOpt optimization on Gaia's internal skills (`.agents/skills/`, `.pi/skills/`) and publish the before/after as a research output?

## What to research next

- Read the SkillOpt ablation tables (§4, `src_extract/sections/4_experiments.tex`) for which skill properties correlate most strongly with large lift — that determines the PLN weights.
- Check whether the SkillOpt GitHub repo exposes any pre-optimization analysis tooling that could be wrapped rather than built from scratch.
- Review the GSB submission schema (`content/schemas/gsb-submission.schema.json`) for where a `skilloptPotential` field would fit without breaking existing validators.
