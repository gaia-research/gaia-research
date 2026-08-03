# Blog Idea: The "Perfect Prompt" Trap — Under-Scoping Sub-Agents to Give Them Agency

- **Type:** Technical Research / Opinion + Practical Playbook
- **Status:** In Ideation (unratified)
- **Target Audience:** Agent Infrastructure Engineers, AI Researchers, Harness/Skill Authors
- **Viability:** High (well-sourced, ships as a post + a small skill/custom-instruction artifact)
- **Potential:** High

## The Idea

Everyone building multi-agent systems reaches for the same instinct: when a sub-agent
underperforms, write it a *more perfect, more scoped* prompt. Spell out every step,
every constraint, every edge case. This post argues that past a certain point the
"perfect prompt" **is the failure** — it micromanages the sub-agent into rigidity,
strips its degrees of freedom, and makes it brittle the moment reality deviates from
the script. The counter-move is a deliberate one: an orchestrator (via a skill or
custom instruction) that sends **intentionally less-scoped prompts** to sub-agents to
raise their *agency* — the capacity to choose their own trajectory to a goal.

The hook that earns the next ten seconds: **"Why does handing your sub-agent a
flawless, step-by-step brief sometimes make it dumber?"**

## The Real Tension (this is what makes the post worth writing)

The honest, non-obvious part — and the reason this is a *post*, not a tweet — is that
the research points in **two opposite directions**, and a naive "just under-scope
everything!" thesis would be wrong:

- **Over-specification demonstrably degrades reasoning.** Stacking constraints causes
  requirement conflicts and accuracy collapse.
- **But Anthropic found that *vague* sub-agent prompts caused chaos** — duplication,
  drift, and gaps — and fixed it by writing *more* detailed task descriptions.

Both are true. The resolution — and the actual thesis of the post — is that "scope"
is not one dial. It is (at least) two:

> **Scope the boundaries tightly; under-scope the trajectory.**
> Give the sub-agent a crisp *objective, output contract, and negative constraints
> ("don't do X, that's another agent's job")* — then say as little as possible about
> the *how*. Over-specifying the objective causes drift; over-specifying the trajectory
> causes brittleness. The "perfect prompt" trap is spending your specification budget
> on the trajectory instead of the boundary.

This reframes "increase agency" from a vibe into an engineering rule: **constrained
autonomy** — maximal freedom *inside* a well-drawn box.

## Research Findings & Sources (from firecrawl scouting, 2026)

### Camp A — over-scoping / over-constraining hurts
- **"What Prompts Don't Say: Understanding and Managing Underspecification in LLM
  Prompts"** — arXiv:2505.13360v2. ~1.5M evaluation runs across 7 models. Key finding:
  **requirement conflicts** — ~11.4% of requirement pairs conflicted, and specifying
  both dropped accuracy by up to **41.1%** (e.g. "accessible to a non-coder" vs.
  "describe error handling"). Peer-style academic source — the strongest citation.
- **"The Impact of Prompt Bloat on LLM Output Quality"** — MLOps Community (Soham
  Chatterjee, ScaleDown). "Even a seemingly small amount of irrelevant information …
  can lead to a notable decline in performance." Reasoning degrades around ~3000 tokens,
  *well* under the context limit; CoT doesn't rescue it. Coins the
  **"identification without exclusion"** failure: a model can *recognize* a constraint
  is irrelevant yet still cannot stop it from biasing the output — so irrelevant
  parent-agent rules must be physically *removed* from a sub-agent's prompt, not just
  flagged.
- **"Your AI Agent Isn't Dumb. It Has ADHD"** — AI Plain English. **Context drift**:
  mid-context instructions lose the attention fight as history grows. "The model doesn't
  need better instructions. It needs better information architecture." (Practitioner
  source — use as color, not proof.)

### Camp B — but naive vagueness causes chaos (the counter-evidence)
- **"How we built our multi-agent research system"** — Anthropic Engineering, Jun 2025.
  The load-bearing quote: *"We started by allowing the lead agent to give simple, short
  instructions like 'research the semiconductor shortage,' but found these … were vague
  enough that subagents misinterpreted the task or performed the exact same searches as
  other agents."* Their fix: *"Each subagent needs an objective, an output format,
  guidance on the tools and sources to use, and clear task boundaries."* Also: multi-agent
  systems use **~15x the tokens** of chat — unscoped agency is *expensive*.
- **Anthropic Claude Cookbook — "Orchestrator workers"** (Dec 2024). Worker contract:
  each worker gets *the original task for context* + *its specific subtask* + *additional
  context*. Global intent **plus** tight local scope.
- **"How Anthropic Built Multi-Agent Deep Research"** — The AI Engineer (analysis).
  "Explicit objectives, explicit boundaries, explicit 'don't research X.'" Multi-agent
  "only wins when the task decomposes into independent parallel threads."

### Camp C — agency/autonomy as a design dial (the synthesis frame)
- **"Measuring AI agent autonomy in practice"** — Anthropic, Feb 2026. **Deployment
  overhang**: "existing models are capable of more autonomy than they exercise in
  practice"; "smarter models require less prescriptive engineering." Experienced users
  let Claude run and intervene only on failure. **Pausing to ask a question is itself a
  form of agency** ("limits its own autonomy").
- **"Levels of Autonomy for AI Agents"** — Knight First Amendment Institute / UW (Feng,
  McDonald, Zhang, Jul 2025). Five levels: Operator → Collaborator → Consultant →
  Approver → Observer. **Autonomy is a design decision, decoupled from capability.** A
  multi-agent system of all-Level-1 agents stalls waiting for instructions; all-Level-5
  agents lack coordination. Under-scoping is how you *move a sub-agent up the ladder*.
- **"Autonomy and agency in AI"** — Promptfoo (Sep 2025). Clean definitions: autonomy =
  "self-governance — the freedom to decide without external control"; agency = "the
  capacity to act intentionally."

## Proposed Thesis / Angle

Reframe "prompt scoping" as **two independent budgets**: a *boundary budget* (objective,
output contract, negative constraints, tools) and a *trajectory budget* (the step-by-step
how). Most teams overspend the trajectory budget and underspend the boundary budget — the
exact inversion of what the evidence supports. The orchestrator's job is not to write the
sub-agent's solution; it's to **draw the box and get out of the way.**

## Proposed Outline

1. **The instinct that backfires** — the "perfect prompt" reflex, and the 41% accuracy
   drop from requirement conflicts (arXiv:2505.13360).
2. **But vagueness is chaos too** — Anthropic's "research the semiconductor shortage"
   failure. Set up the apparent contradiction honestly.
3. **Scope is two dials, not one** — boundary vs. trajectory. Resolve the contradiction:
   over-scope the boundary, under-scope the trajectory = *constrained autonomy*.
4. **Why over-scoped trajectories rot** — identification-without-exclusion, context
   drift, brittleness at the first unscripted step.
5. **The autonomy ladder** — UW's five levels + Anthropic's deployment overhang: under-
   scoping is the lever that moves a sub-agent from Operator to Consultant.
6. **The artifact** — a small orchestrator skill / custom instruction that rewrites
   delegation prompts to the boundary-tight / trajectory-loose shape (below).
7. **When NOT to do this** — the honest guardrails: parallel-independent work only,
   token cost (~15x), tasks with a genuine single correct procedure. End with one
   actionable rule the reader can apply tomorrow.

## The Shippable Artifact (show, don't just tell)

A `delegate-with-agency` orchestrator skill / custom-instruction block that enforces the
delegation-prompt contract:

- **Always specify:** objective (one sentence), output contract, hard negative
  boundaries, allowed tools/sources.
- **Deliberately omit:** the step sequence, intermediate checkpoints, and prescriptive
  "first do X, then Y" chains — unless the task has a single correct procedure.
- **A/B framing for the post:** the same task delegated "trajectory-scoped" vs.
  "boundary-scoped," showing the difference on a task that goes off-script. (Illustrative
  unless we actually run it — label it as such; do not fabricate metrics. See below.)

## Why This Matters for Gaia Research

- **Directly on the current line.** Skill Heaven / Skill Hell is about *subtraction* —
  cutting scaffolding that models no longer need. This post is the delegation-prompt
  analogue of descaffolding, and rhymes with the Rank 14/15 "system-prompt shrink" and
  "agentic-EQ descaffolding" ideas already in the bank.
- **Feeds our own harness design.** Gaia's orchestrator/sub-agent stacks (scout, worker,
  planner roles) are exactly where a boundary-vs-trajectory contract would apply.
- **High-signal, honestly-hedged.** The two-camp tension makes it a *real* essay, not a
  hot take — and it resists the "unratified roadmap claim" trap because the thesis is
  about prompting craft, not a product promise.

## Research & Writing Checklist

- [ ] Verify every quote against the live sources before publishing (URLs in
      Research Findings above); re-scrape if any 404.
- [ ] Decide: illustrative example vs. a real A/B run. If real, run boundary-scoped vs.
      trajectory-scoped delegation on 1–2 tasks with our own agents and report method +
      caveats. If illustrative, **label it explicitly** — do not present invented numbers
      as data (blog-review rule #1).
- [ ] Confirm no claim implies an unratified Gaia product/roadmap promise
      (`founder/RATIFICATION.md`); hedge anything not LOCKED.
- [ ] Draft the `delegate-with-agency` artifact so the post ships with something usable.
- [ ] Write to the `gaia-blog-post` skill + Nova persona; skimmable headers, clear
      before/after prompt blocks, one memorable closing rule.
