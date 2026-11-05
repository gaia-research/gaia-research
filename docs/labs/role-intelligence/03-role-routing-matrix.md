# C — Role-routing matrix: economy-first candidates, confidence and escalation

- **Date:** 2026-10-22
- **Status:** **proposal.** Nothing here changes dispatch. Every row carries a confidence and an escalation trigger.
- **Sources:** every cell traces to a record id in [`02-evidence-dataset.jsonl`](02-evidence-dataset.jsonl). Confidence is *our* judgement of how much weight the cited evidence can bear, not the source's.

---

## 0. How to read this

- **Floor** = the minimum capability a route must clear to be *eligible* for the role. This is the single most important column: the one controlled study that varied cheap-tier routing showed the damage comes from routes *below a floor*, not from cheapness itself (E-MA-05), and auto-office encodes the identical mechanism (E-AO-11).
- **Effort** = the *only* levels the provider actually advertises for that model in our harness. Never write a level that is not in this table — one agent in our fleet already does (E-LF-06).
- **Cost** = list price per 1M input/output tokens from the Pi model catalog on the route named. **Subscription-billed routes have no dollar cost**; use tokens and quota burn for those instead (E-LF-01).
- **Confidence** = `high` (measured, in a comparable regime, n>10) · `medium` (measured but regime-shifted, or n<10) · `low` (operational practice or design, no measurement) · `none` (no evidence either way — deliberately listed so the gap is visible).
- **Escalate when** = the condition that must *not* be handled by the cheap route. This column is where the safety lives.

### 0.1 Verified effort support and list price (source: Pi model catalog + `pi --offline --list-models`, 2026-10-22)

| Model | Route | Effort levels the provider advertises | $ / 1M in | $ / 1M out | Notes |
|---|---|---|---|---|---|
| `gpt-6-luna` | openai | off, low, medium, high, xhigh, max — **not minimal** | 0.10 | 0.50 | cheapest frontier route available to us |
| `gpt-6-luna` | openai-codex | same as above | 0.10 | 0.50 | what auto-office used as `codex@0/gpt-6-luna@high` |
| `gpt-5.6-luna` | openai-codex | minimal, low, medium, high, xhigh, max — not off | 0.20 | 1.20 | the generation our own fleet actually used |
| `claude-haiku-5-5` | anthropic | low, medium, high, xhigh, max — not minimal/off | 0.10 | 0.50 | **5× more expensive above 100k prompt tokens** (0.50 / 2.50) |
| `gemini-3.8-flash` | google | low, medium, high | 0.75 | 3.75 | |
| `gemini-3.8-flash` | antigravity | low, medium, high | 2.00 | 10.00 | **2.7× the google price for the same model name** (E-LF-08) |
| `gemini-3.5-flash-lite` | google | minimal, low, medium, high — **not xhigh/max** | 0.30 | 2.50 | the only lane that completed under quota pressure (E-LF-05) |
| `gpt-6.1-sol` | openai | low, medium, high, xhigh, max — not off/minimal | 2.00 | 10.00 | our `planner-sol` / `worker-sol` family |
| `gpt-6-astra` | openai | low, medium, high, xhigh, max — not off/minimal | 10.00 | 50.00 | 100× Luna per token |
| `claude-sonnet-5-5` | anthropic | low, medium, high, xhigh, max — not off/minimal | 2.00 | 10.00 | auto-office's second reviewer seed, first executor |
| `claude-opus-5-5` | anthropic | low, medium, high, xhigh, max — not off/minimal | 4.00 | 20.00 | auto-office's planner seed; third reviewer seed at low |
| `claude-fable-5-1` | anthropic | **xhigh, max only** | 10.00 | 50.00 | no low-effort variant exists |
| `bunny/minimax-m3.1-flash` | virtual (openrouter-free → vercel-ai-gateway) | low, medium, high, xhigh, max | subscription | subscription | free window ends **2026-10-22T12:00:00Z** |

**Provider price asymmetry is a routing decision, not trivia.** `gemini-3.8-flash` on google is 2.7× cheaper per token than the same model on antigravity — yet our `reviewer` agent runs on antigravity. Before the fleet changes the model, it may change the *route*.

---

## 1. The matrix

### Orchestrator
| | |
|---|---|
| **Economy candidate** | `gpt-6-luna` at **xhigh** or **max** |
| **Existing agent** | none — the orchestrator is the parent Pi session (`antigravity/gemini-3.8-flash`, `defaultThinkingLevel: high`) |
| **Floor** | must produce a durable task breakdown with owner, acceptance check and handoff; must not lose scope across handoffs |
| **Cost** | 0.10 / 0.50 |
| **Confidence** | **low** — *no controlled evidence in any source found*; this is a hypothesis from the mission brief, not a result |
| **Escalate when** | scope crosses >3 files, >2 role types, or a handoff loses a requirement (measured, not felt) |
| **Evidence** | none for this role (E-MA-02 shows planner-side handoffs can *lose* signal, which is a caution, not support) |
| **Experiment** | E-4 |

### Planner
| | |
|---|---|
| **Economy candidate** | `gpt-6.1-sol` at **medium** (keep strong) — a cheap planner is **not** recommended |
| **Existing agent** | `planner-sol` (`gpt-6.1-sol:max`), `planner-argon` (`antigravity/gemini-4-argon:max`), `planner-agy` (`antigravity/gemini-3.1-pro:high`), `planner-opus` (`anthropic/claude-opus-5-5:high`) |
| **Floor** | the plan must be executable without the planner; difficulty estimate must be recorded, not inferred |
| **Cost** | 2.00 / 10.00 (Sol) · 2.00 / 10.00 (Argon) · 2.00 / 12.00 (Pro) · 4.00 / 20.00 (Opus) |
| **Confidence** | **medium** — difficulty estimation carries real signal (E-MA-09); but planner output *lowered* first-attempt success by 17.1 points when it replaced the raw spec (E-MA-02) |
| **Escalate when** | always; the planner is not a candidate for demotion until E-MA-02's dilution effect is replicated locally |
| **Design rule** | the planner's output must be **additive** (adds estimates, seams, acceptance) and must **not replace** the original task text in the brief |
| **Evidence** | E-MA-02, E-MA-09 |

### Scout / Researcher
| | |
|---|---|
| **Economy candidate** | `gemini-3.5-flash-lite` at **minimal**; `gemini-3.8-flash` at **low**; `gpt-6-luna` at **low** |
| **Existing agent** | `scout-fast` (flash-lite:minimal), `scout` (flash:minimal — *invalid pin, see §3*), `scout-luna` (luna:minimal — *invalid pin, see §3*), `scout-bunny-low/medium` |
| **Floor** | the scout's output must be locatable and complete enough that a downstream agent need not re-read the files: file + line range, the actual code, the architecture, and the entry point |
| **Cost** | 0.30 / 2.50 (flash-lite) · 0.75 / 3.75 (flash on google) · 0.10 / 0.50 (luna) |
| **Confidence** | **medium (practice)** / **low (measurement)** — our fleet routes the majority of discovery and review-phase work to Flash-family (E-LF-02); no published measurement of scout quality exists |
| **Escalate when** | the scout's brief feeds a plan (carry the original spec alongside, per E-MA-02) or the answer is non-local reasoning (E-CR-04) |
| **Evidence** | E-LF-02, E-CR-04, E-AO-05 (public prior: flash high 40.9 vs luna high 32.1 on AA index) |

### Worker / Builder
| | |
|---|---|
| **Economy candidate** | `gpt-6-luna` at **medium/high** for bounded, well-specified tasks; `gemini-3.8-flash` at **high** via google |
| **Existing agent** | `worker-luna` (medium), `worker-flash-high`, `worker-lite` (flash-lite:medium), `worker-bunny-*`, `worker-minimax-*` |
| **Floor** | the task must have a **deterministic acceptance check** (a test, a lint, a build) — this is the floor that makes cheap building safe, and it is the same mechanism that made E-MA-05's ablation work |
| **Cost** | 0.10 / 0.50 (luna) · 0.75 / 3.75 (flash/google) |
| **Confidence** | **low** — the one controlled study of difficulty-tiered cheap building found it **worse on quality (62.2% vs 72.6%) and worse on cost (4.85 vs 3.00 API calls/task)** (E-MA-03, E-MA-04) |
| **Escalate when** | the task has no deterministic check, spans modules, or the first attempt has already failed (E-MA-06: pass rate 100% → 62.3% → 10.7% by escalation count) |
| **Hard rule** | **never** select a builder route below the floor to satisfy a difficulty estimate. Difficulty estimates may *raise* the tier, never lower it below the floor (E-MA-05) |
| **Evidence** | E-MA-03, E-MA-04, E-MA-05, E-MA-06, E-AO-06 (Sol "uses far more tokens in practice than its advertised cost suggests") |

### Test author
| | |
|---|---|
| **Economy candidate** | `gpt-6-luna` at **medium**; `gemini-3.8-flash` at **high** |
| **Existing agent** | none dedicated — currently a `worker-*` role |
| **Floor** | the test must fail on the known defect (a test that passes on the bug is worthless) |
| **Cost** | 0.10 / 0.50 · 0.75 / 3.75 |
| **Confidence** | **none** — no source found separates test authorship from general building |
| **Escalate when** | the defect class is stateful, concurrent, or cross-module |
| **Evidence** | none — flagged as a genuine gap, not a claim |

### Code reviewer  ← the mission's centre of gravity
| | |
|---|---|
| **Economy candidate (primary)** | `gpt-6-luna` at **high** (or **xhigh** for hard seams) — *and* `gemini-3.8-flash` at **high** on the **google** route for cheap, high-volume review |
| **Existing agent** | `reviewer` = `antigravity/gemini-3.8-flash:high` (description still says "GPT 5.6 Sol Low" — drift) |
| **Proposed addition** | `reviewer-luna-high` = `openai/gpt-6-luna:high`, tools `read, grep, find, ls, bash` — **additive, no repoint** |
| **Floor** | the reviewer must emit a machine-readable verdict (see [`04`](04-prompting-playbook.md)) and must have read the actual diff, not the summary. **Second, non-obvious floor: the reviewer's precision.** In the wild, 56.3% of agentic review comments were rejected (E-CR-05) |
| **Cost** | 0.10 / 0.50 (luna) · 0.75 / 3.75 (flash on google) · 2.00 / 10.00 (flash on antigravity) |
| **Confidence** | **medium-high on eligibility** (auto-office pins Luna@high first for both reviewer roles, trust-granted it, and closed two live gates with it — E-AO-01/02/03/04; our own fleet routes reviews to Luna@max, E-LF-02; CRBugBench's README runs exactly this role+model, E-CR-02) · **low on superiority** (no recall, no precision, n=2 real runs on trivial defects) |
| **Escalate when** | the change touches a **hard seam** (requirements, authority, ownership, dependency, interface, acceptance) — auto-office's own hard-seam list (E-AO-14) — or the defect class needs non-local reasoning (E-CR-04) |
| **Also** | two reviewers of the same family are **not** automatically independent evidence. Fresh *sessions* are what is measured to matter (E-MA-07); a shared prompt is a shared blind spot by construction |
| **Evidence** | E-AO-01, E-AO-02, E-AO-03, E-AO-04, E-AO-05, E-CR-02, E-CR-05, E-LF-02 |

### Security reviewer
| | |
|---|---|
| **Economy candidate** | **none recommended.** Use `gpt-6.1-sol` at **high** or `claude-opus-5-5` at **high** |
| **Existing agent** | none dedicated |
| **Floor** | a finding must be **exploitable and reproducible**, with a concrete input and a demonstrated effect — not a pattern match |
| **Cost** | 2.00 / 10.00 (Sol) · 4.00 / 20.00 (Opus) |
| **Confidence** | **low — deliberately conservative.** No measurement exists either way, and the *asymmetry of harm* is decisive: a cheap reviewer that invents findings burns human review time, and we already know agentic review output has a >56% rejection rate (E-CR-05) |
| **Escalate when** | always for exploitability claims; require a reproduction before a finding is accepted |
| **Evidence** | E-CR-05 (precision ceiling), E-CR-06 (small models mis-localise) |

### Integrator
| | |
|---|---|
| **Economy candidate** | `gpt-6-luna` at **medium** **plus** deterministic checks (build, typecheck, test, diff-scope assertions) |
| **Existing agent** | none dedicated — currently `worker-*` / workflow compose phases |
| **Floor** | integration must be verified by running the assembled result, not by inspecting each piece (locally-correct pieces can be wrong together) |
| **Cost** | 0.10 / 0.50 |
| **Confidence** | **low** — no direct evidence. The adjacent result (E-MA-07: the same model at 42.1% after a failed attempt vs 81.7% direct) says integration over polluted context is where cheap routes lose |
| **Escalate when** | merges touch shared interfaces, or any constituent attempt needed rework |
| **Evidence** | E-MA-07 (adjacent), E-AO-14 (integration is a deliverable) |

### Verifier
| | |
|---|---|
| **Economy candidate** | `gpt-6.1-sol` at **medium** (our existing `worker-sol`) |
| **Existing agent** | `worker-sol` (medium) · `worker-sol-max` (max) · `worker-sol-xhigh` (xhigh) |
| **Floor** | the verifier must be **independent of the producing session** and must re-run the acceptance path, not read the producer's claim |
| **Cost** | 2.00 / 10.00 |
| **Confidence** | **medium (operational)** — our fleet already confines Sol to verification/architecture phases (E-LF-03) |
| **Escalate when** | release, irreversible, or protected-path changes |
| **Evidence** | E-LF-03 |

### Specialist — UI / visual
| | |
|---|---|
| **Economy candidate** | `gemini-3.8-flash` at **high** (auto-office's first visual preference, via `agy`; our `visual` skills) |
| **Existing agent** | none dedicated in the Pi roster; `milim-mockup-crafter` covers image work |
| **Floor** | an image-sensitive conformance probe of the exact harness/model/effort path — a route qualifies only after it proves it can see |
| **Cost** | 0.75 / 3.75 (google) · 2.00 / 10.00 (antigravity) |
| **Confidence** | **low** — no measurement; but this is the one role where a *multimodal* cheap model is a defensible first choice, because the judgement being replaced is perceptual, not architectural |
| **Escalate when** | taste is in the acceptance criteria rather than pixel fidelity (taste is a different capability from vision) |

---

## 2. Where higher effort beats a higher tier — the direct answer

| Situation | Use | Do not use | Why |
|---|---|---|---|
| **Reviewer, standard lane** | prompt craft first (+5.8 points recall for +10% cost — E-CR-03) → then effort → then model | a model upgrade as the first move (the comparable model move cost five months of evolution for +24.2 points, E-CR-01) | prompting beats the model upgrade by roughly 12× per unit cost on this role |
| **Reviewer, hard seam** | effort escalation on the same model, then premium | — | a hard seam changes the *question*, not the diligence |
| **Builder, bounded + deterministic check** | cheapest route that clears the floor | a lower tier just because the task is "easy" | E-MA-03/E-MA-05: cheap tier below a floor → escalation → cost *and* quality loss |
| **Builder, unbounded** | strong route from the start | cheap route with a plan to escalate | 81.7% vs 62.2% (E-MA-04); the first attempt is where success is won |
| **Scout** | cheap + low effort, always | premium | no evidence that premium scouts help; E-MA-02 says the *risk* is the plan, not the scout |
| **Planner** | strong | cheap | planner output degraded first-attempt success (E-MA-02) |

**The general rule this yields:** *effort is a dial you can turn up inside a model; the model tier is a capability change you pay for on every call. Spend effort before tier — but only where the role's output is cheap to grade and the failure is recoverable. Where the failure is not recoverable (security, release, architecture), spend tier first.*

---

## 3. Configuration defects found in the live fleet (proposed fixes, not applied)

| Defect | Evidence | Proposed fix | Risk |
|---|---|---|---|
| `scout-luna` pins `openai/gpt-6-luna:minimal`; `gpt-6-luna` does not advertise `minimal` | E-LF-06 (static audit) | repin to `openai/gpt-6-luna:low` | none — the current pin cannot work as declared |
| `scout` pins `antigravity/gemini-3.8-flash:minimal`; antigravity maps `minimal → null` for that model | E-LF-06 | repin to `antigravity/gemini-3.8-flash:low` | none |
| `scout-fast` pins `antigravity/gemini-3.5-flash-lite:minimal`; that model has no static `thinkingLevelMap`, so support cannot be confirmed | E-LF-06 (status `EFFORT-SUPPORT-UNCONFIRMED`) | confirm against the live antigravity catalog, then pin a declared level | none |
| `model-tiers.json` maps `medium` and `big` to the same model+effort | E-LF-07 | give `big` a distinct stronger route, or delete the duplicate | medium — changes routing |
| `reviewer` description says "GPT 5.6 Sol Low" while the model is `antigravity/gemini-3.8-flash:high` | inspection | correct the description | none |
| antigravity prices `gemini-3.8-flash` at 2.00/10.00 vs google 0.75/3.75 for the same model | E-LF-08 | re-route the reviewer to `google` — but measure first, because google may carry different reliability | medium |
| `worker-minimax-*` pin efforts with no declared support in the model catalog | E-LF-06 | add the map, or route them through the `bunny` virtual model which declares its levels | none |
| `gemini-4-argon:max` and `:xhigh` resolve to the same runtime id as `:high` on antigravity | inspection of `pi-antigravity` | stop treating them as distinct effort levels in any cost model | none |

---

## 4. Routing rules we can state today, and rules we cannot

**Can state (evidence-backed):**
1. A cheap route needs a **capability floor**; difficulty estimates may raise the tier but never lower it below the floor (E-MA-05, E-AO-11).
2. **Reviewer effort and prompt craft are the cheapest levers** on the reviewer role (E-CR-03).
3. **Retries should be fresh-context** (E-MA-07).
4. **Provider is a cost and a reliability axis** independent of the model (E-LF-04, E-LF-08).
5. **Tokens, not dollars, are the unit of account** for subscription-billed routes (E-LF-01).
6. **Two reviewers of the same family are not automatically independent**; fresh sessions are the measured property (E-MA-07).

**Cannot state (and will not, without E-1..E-5):**
1. That Luna is a *better* reviewer than Sonnet or Opus. It is *eligible*; superiority is untested.
2. That Luna can replace Sol as an orchestrator. Zero evidence.
3. That Haiku beats Sonnet on scoped implementation. Zero evidence, and no Haiku agent exists in the fleet.
4. That a cheap worker + cheap reviewer beats a premium worker alone. The evidence points the other way (E-MA-03/04/05).
5. Any expected-cost-per-accepted-task number for a specific role in our fleet. Our telemetry cannot yet attribute cost or outcome per agent.
