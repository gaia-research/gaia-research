# Random Forest + SHAP/LIME Trust-Appraisal Explainability Model

- **Rank:** TBD (pending founder review)
- **Status:** RFC / research — **not ratified**. Decoupled v-next study; nothing here overrides `gaia-skill-tree`'s `META.md` trust gate.
- **Viability:** Medium-High (labeled corpus already exists implicitly in the curated registry)
- **Potential:** High

## HARD constraint — read this first

**Trust Magnitude (TM) remains the sole promotion gate.** This study builds an
*explainability* model that predicts and explains a skill's **star rank** from
its TM evidence signals. It is a reporting/audit surface that sits *beside* the
transparent gate — it never silently replaces it, never becomes a gate itself,
and never writes rank. Star assignment stays a human-reviewed, transparent TM
decision per `META.md`. A model prediction is corroborating signal only.

## Scoping — what this is, and what it is NOT

TM signals answer *how trusted / how good* a skill is (→ **star rank**). That is
a **different question** from what `gaia-curate` v2 answers (*what generic does
this skill map to? is it a suite? a fusion?*). This RF is therefore a
**trust-appraisal explainability study**, explicitly **NOT** the gaia-curate
mapping classifier. Do not conflate the two:

| | gaia-curate v2 (ships first, independently) | This study (decoupled v-next) |
|---|---|---|
| Question | What generic / suite / fusion does this map to? | How trusted is this skill (star rank)? |
| Method | Embeddings + thresholds + structural rules | Random Forest + SHAP/LIME over TM feature vector |
| Output | Curation mapping | Predicted star rank + per-signal attribution |

The gaia-curate v2 work (embeddings + thresholds + structural rules) ships on
its own timeline first. This is separate, later research.

## The idea

The `gaia-skill-tree` registry appends a rich **Trust Magnitude** signal set
onto every skill (from `src/gaia_cli/trustMagnitude.py`). These signals form a
genuine **feature vector** — the founder's intuition that they can feed a Random
Forest is sound. Train an RF over the (skill → assigned star rank) pairs already
present in the curated registry, then wrap it in **SHAP/LIME** so a curator or
verifier can see *why* the model landed on a rank: which evidence signals drove
it, and by how much.

### The TM feature vector (from `trustMagnitude.py`)

Per-evidence-type magnitudes and caps, plus structural counts:

- **benchmark-result** — weight 1.4, cap 100.0
- **peer-review** — weight 1.2 (capped); decays 12.5%/year linear
- **repo-own** — weight 0.6, cap 60.0
- **social-signal** — weight 1.0, cap 80.0 (hard-capped)
- Self-producible types: `fusion-recipe`, `self-attestation`, `repo-own`
- Inheritance multipliers: peer-review 0.30, social-signal 0.35, benchmark-result 0.15
- Plus: origin counts, contributors, commits, percentile, depth-2 provenance
  walks, A-graded origin closure counts

These caps, weights, decays, and structural counts are exactly the kind of
numeric + categorical features a Random Forest handles well.

## Why SHAP/LIME (not a black box)

Chosen for **auditability**. A curator/verifier should see *which evidence
signals* pushed a skill toward or away from a rank, mirroring the human L4 review
ethos. A per-prediction SHAP attribution ("this skill scored 3★ mostly on
benchmark-result magnitude + A-graded origin closure, docked by peer-review
decay") complements human review instead of hiding behind a score.

## Prerequisite — a labeled corpus (Phase 1)

The study needs **labels**. The existing curated registry's **(skill →
assigned star rank)** pairs are the implicit labels; extracting and cleaning them
into a training corpus is Phase 1 of the study. No new labeling effort is
assumed to exist — Phase 1 produces it from what curation already decided.

## Deliverable value

- **(a) Mis-calibration surfacing** — flag skills whose predicted rank is far
  from the assigned rank (candidates for re-review).
- **(b) Contributor-facing explanation** — explain star assignments to
  contributors in terms of the signals that drove them.
- **(c) LATER: threshold-tuning input** — could inform TM threshold tuning, but
  must **NOT** silently replace transparent gates; TM stays the sole promotion
  gate per `META.md`.

## Open questions (do not invent answers — flag for founder)

- Is the curated registry's labeled corpus large enough for a stable RF, or does
  Phase 1 need to widen the label source?
- Where does the model + explainability surface live — a `gaia-research` report,
  a CLI inspection command, or both?
- What is the acceptable prediction/assignment divergence before a skill is
  auto-queued for re-review vs. just logged?
- Does mis-calibration surfacing feed the meta-audit queue, or stay a standalone
  research output?

## What to research next

- Phase 1: extract and clean the (skill → star rank) corpus from the curated
  registry; quantify class balance across 1★–5★.
- Baseline an RF over the TM feature vector; measure feature importance against
  the known TM weights/caps as a sanity check.
- Layer SHAP (global + per-prediction) and LIME (local) explanations; evaluate
  whether attributions are legible to a human curator.
- Compare predicted vs. assigned rank distribution to size the mis-calibration
  surface before proposing any workflow integration.
