# MISSION — Building Skill Heaven / Skill Hell

> What we are building, in what order, and how we keep it honest. Companion to
> [`VISION.md`](VISION.md). A **line** doc — one of the things `gaia-research`
> is building, not the lab's own mission.
> Voice per [`PRODUCT.md`](../../PRODUCT.md): Joy. Rigor. Spark.
>
> **Decision authority:** [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md)
> — this doc describes; the founder doc decides. Vocabulary:
> [`founder/LEXICON.md`](../../founder/LEXICON.md).

---

## 0. Mission statement

**End install debt.** Make agentic skills a per-session summon over an
evidence-backed pool — chosen by mode, sized by rung, gated by measured trust —
so any builder, from a solo dev to an enterprise fleet, gets exactly the skills
the task needs and *nothing else*.

We measure everything we claim. Our priority is shaping the **entropy curve** —
how quality and cost move along the skill-entropy axis — not a single
token-savings headline ([`RATIFICATION`](../../founder/RATIFICATION.md) B6).
Higher entropy is not directly benchmarkable per run, and hell-safe eligibility
is read from the Skill Tree stamps, not measured live. If the benchmark does not
back it, we do not ship it.

---

## 1. The load-bearing things we nail first

In order. Each one unblocks the next.

1. **Stamp *semantics* before stamp *values*.** Define what "heaven-native" and
   "hell-safe" mean as a **discrete, per-tier contract**, not a mushy float. A
   skill is `hell-safe@max` if an autonomous fleet can summon it unsupervised
   with no destructive risk; `heaven-native` if a clean-context grilling session
   is where it does its best work. Get the taxonomy right and the benchmark just
   fills the cells. *(Storage: discrete stamps per effort tier, persisted in the
   canon schema — routing is set-membership, not arithmetic.)*

2. **`contextCost` measured, not guessed.** The one dimension free *today*:
   tokenize every `SKILL.md` contract. The mechanism is already demonstrated —
   the H1 registry-proxy prototype measured a large standing-dose reduction for
   a top-k evidenced loadout versus naive all-loaded. It needs zero new schema
   to reproduce, and the number belongs in the ledger and the reports, never in
   a headline on its own.

3. **The honesty gate, defined early.** "Do not unlock Hell or Ultra until
   trust-coverage clears a threshold" is the credibility firewall. Pin the
   *threshold definition* now, before we can hit it — that is what lets us ship
   Heaven today and Hell later without ever overclaiming.

4. **`autonomyAffinity` vs `grillingNeed` — kept distinct, on purpose.** They
   look inverse and are not: a skill can be *safe to auto-invoke* **and**
   *sharper after a grilling session*. One sentence in the schema doc must say
   why, or reviewers will rightly call them redundant.

---

## 2. The 80/15/5 build split

The ratio is not a target we impose — it is what falls out of putting each
concern in its home repo.

- **80% infrastructure.** The `hellHeaven` stamps live **persisted,
  build-time-derived** in the canon schema. Once there, the router *reads* them.
  Routing is a deterministic lookup — no model call decides a loadout. Boring,
  fast, reproducible. That is the point.
- **15% agentic.** The door composes the loadout at session start; the ladder's
  rung bounds what may be summoned after it. The benchmark **fleet** earns the
  stamps by actually running skills across the tiers. Agents set the stamps,
  agents consume them, agents never *invent* routing per session.
- **5% human.** Judgment only: the **grilling / office-hours UX** — Heaven's
  whole reason to exist — and **ratifying the gate** ("trust-coverage cleared,
  Hell is safe to enable"). Humans decide *whether*, never *how*.

---

## 3. Roadmap

> Research-first: each milestone lands a ledger entry before any external claim.
> Governance path (propose → stage → persist):
> `gaia-research → marketing-tasks → gaia-skill-tree`.
> Runtime path (consume): `gaia-skill-tree → gaia-mcp → agent`.

| # | Milestone | Deps | Ships | Ledger artifact |
|---|---|---|---|---|
| **R0** | **Context-cost census** — tokenize all canon `SKILL.md` contracts; publish the real distribution. | none | now | census table + data |
| **R1** | **Stamp taxonomy + rubric** — define heaven/hell stamps per effort tier; hand-label a ~20-skill seed set as ground truth. | R0 | — | taxonomy spec + labelled seed set |
| **R2** | **Benchmark stamps them** — the harness runs the seed set across the tiers; correlate measured token and quality outcomes against the hand labels. | R1 | — | benchmark results + confidence intervals |
| **R3** | **Doors read stamps** — routing lookup wired to the persisted index. **Heaven ships to real users**, launched through the door: the deepest rung is composed at boot, which is the only place a harness will evict personal skills. | R2 | Heaven | integration note |
| **R3.5** | **BYO-tree adapter** — the router points at a private tree; fusion plus grade-against-canon. Enterprise. | R3 | Ultra (private) | enterprise brief (private lane) |
| **R4** | **Gate clears → Hell ships** — trust-coverage threshold met; autonomous fleets get the pool, bounded by the rung. | R2, R3 | Hell / Ultra | gate-clearance report |

**Pivot trigger:** if a live run shows Hell does **not** net-save against
no-skills, Heaven becomes the hero and Hell becomes opt-in for quality-critical
loops.

---

## 4. What "done" looks like per mode

- **Heaven — done when** launching through the door provably evicts installed
  skills and lands below a vanilla session on loaded-context tokens across the
  task corpus, and grilling-session quality holds or improves.
- **Hell — done when** the gate is cleared, an autonomous multi-hour loop nets
  fewer tokens than naive all-loaded at the same rung, and beats no-skills on
  graded quality.
- **Ultra — done when** a Heaven base plus the evidenced flood measurably beats
  Heaven alone on quality, at a bounded token premium.

---

## 5. Guardrails (non-negotiable)

- **Never auto-install, never auto-post.** Skills are summoned per session and
  do not outlive it; external posting routes through approved channels only.
- **The canon is read-only.** Schema changes are proposed through the
  governance path, never committed directly.
- **No claim ships ahead of its benchmark.** Until a mode is live we frame it as
  concept plus roadmap, and lead with what the completed milestones actually
  proved. A verified negative finding is as publishable as a positive one.

> We are the strongest research group, so the data had better be flawless. It
> will be. 🔥☁️
