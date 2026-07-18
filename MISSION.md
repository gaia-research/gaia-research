# MISSION.md — Building the Skill Heaven/Hell router

> What we're building, in what order, and how we keep it honest.
> Companion to [`VISION.md`](VISION.md). Voice per [`PRODUCT.md`](PRODUCT.md): Joy. Rigor. Spark.

---

## 0. Mission statement

**End install debt.** Make agentic skills a per-session summon over an evidence-backed pool —
dialed by the effort axis (`low → max`), gated by measured trust — so that any builder, from a
solo dev to an enterprise fleet, gets exactly the skills the task needs and *nothing else*.

We measure everything we claim. If the benchmark doesn't back it, we don't ship it.

---

## 1. The load-bearing things we nail first

In order. Each one unblocks the next.

1. **Stamp *semantics* before stamp *values*.** Define what "heaven-native" and "hell-safe"
   mean as a **discrete, per-tier contract**, not a mushy float. A skill is `hell-safe@max` if
   an autonomous fleet can summon it unsupervised with no destructive risk; `heaven-native` if a
   clean-context grilling session is where it does its best work. Get the taxonomy right and the
   benchmark just fills the cells. *(Storage: discrete stamps per effort tier, persisted in the
   Yggdrasil II schema — routing is set-membership, not arithmetic.)*

2. **`contextCost` measured, not guessed.** The one dimension free *today*: tokenize every
   `SKILL.md` contract. We already proved the mechanism — top-5 evidenced skills load **−97.4%**
   tokens vs. naive all-loaded (see `marketing-tasks/research/hell-heaven-h1/`). This is the
   honest, defensible core and needs zero new schema to demonstrate.

3. **The honesty gate, defined early.** "Don't unlock Hell/Ultra until trust-coverage ≥ X" is the
   credibility firewall. Pin the *threshold definition* now, even before we can hit it — it's what
   lets us ship Heaven today and Hell later without ever overclaiming.

4. **`autonomyAffinity` vs `grillingNeed` — kept distinct, on purpose.** They look inverse but
   aren't: a skill can be *safe to auto-invoke* **and** *sharper after a grilling session*. One
   sentence in the schema doc must say why, or reviewers will (rightly) call them redundant.

---

## 2. The 80/15/5 build split

The ratio isn't a target we impose — it's what falls out of putting each concern in its home repo.

- **80% infrastructure.** The `hellHeaven` stamps live **persisted, build-time-derived** in the
  Skill Tree schema (`gaia-skill-tree`, and the private `your-skill-tree`). Once there, the MCP
  *reads* them. Routing is a deterministic lookup — no model call decides your loadout. Boring,
  fast, reproducible. That's the point.
- **15% agentic.** `gaia-mcp` composes the loadout at session start and adjusts under the
  firebreak. The benchmark **fleet** earns the stamps by actually running skills across the five
  tiers. Agents set the stamps; agents consume them; agents never *invent* routing per-session.
- **5% human.** Judgment only: the **grilling / office-hours UX** (Heaven's whole reason to exist)
  and **ratifying the gate** ("trust-coverage cleared — Hell is safe to enable"). Humans decide
  *whether*, never *how*.

---

## 3. Roadmap

> Research-first: each milestone lands a ledger entry before any external claim.
> Governance path (propose → stage → persist): `gaia-research → marketing-tasks → gaia-skill-tree`.
> Runtime path (consume): `gaia-skill-tree → gaia-mcp → agent`.

| # | Milestone | Deps | Ships | Ledger artifact |
|---|---|---|---|---|
| **R0** | **Context-cost census** — tokenize all canon `SKILL.md` contracts; publish the real distribution. | none | now | census table in `research/` |
| **R1** | **Stamp taxonomy + rubric** — define heaven/hell stamps per effort tier; hand-label a ~20-skill seed set as ground truth. | R0 | — | taxonomy spec + labeled seed |
| **R2** | **Benchmark stamps them** — harness runs the seed across 5 tiers; correlate measured token/quality with hand labels; tune weights. | R1 | — | `hell-heaven-bench` results + CIs |
| **R3** | **MCP reads stamps** — routing lookup wired to the persisted index. **Heaven ships to real users** (vanilla claude, standalone, no gate needed). | R2 | Heaven | MCP integration note |
| **R3.5** | **BYO-tree adapter** — MCP points at a private `your-skill-tree`; fusion + grade-against-canon. Enterprise. | R3 | Ultra (private) | enterprise brief (marketing-tasks) |
| **R4** | **Gate clears → Hell ships** — trust-coverage threshold met; autonomous fleets get the full pool with firebreak. | R2, R3 | Hell / Ultra | gate-clearance report |

Pivot trigger (already noted in `IDEAS-2026-020`): if a live run shows Hell does **not** net-save
vs. no-skills, reposition Heaven as the hero and Hell as opt-in for quality-critical loops.

---

## 4. What "done" looks like per pole

- **Heaven — done when:** invoking it provably evicts installed skills and lands *below vanilla*
  on loaded-context tokens across the task corpus, and grilling-session quality holds or improves.
- **Hell — done when:** the gate is cleared, an autonomous multi-hour loop nets fewer tokens than
  naive all-loaded (firebreak on) and beats no-skills on graded quality.
- **Ultra — done when:** Heaven base + evidenced flood measurably beats Heaven-alone on quality at
  a bounded token premium.

---

## 5. Guardrails (non-negotiable)

- **Never auto-install, never auto-post.** Skills are summoned per-session and cleared; external
  posting routes through approved channels only.
- **The canon is read-only from marketing.** Schema changes to `gaia-skill-tree` are proposed via
  `needs-review` issues, never direct commits.
- **No claim ships ahead of its benchmark.** `gaia-mcp` is publish-gated; until it's live we frame
  Hell/Ultra as concept + roadmap on the live graph, and lead with what R0–R3 actually proved.

> We're the strongest research group, so the data had better be flawless. It will be. 🔥☁️
