# Beyond Orchestration: The Missing Economic Scheduler for AI Agents

- **Status:** In Ideation / Architectural RFC (Unranked)
- **Tracking Issue:** [#306](https://github.com/gaia-research/gaia-research/issues/306)
- **Precedent / Foundational Context:** [#304](https://github.com/gaia-research/gaia-research/issues/304) (*The Economics of Agentic Work: When Small Agents Beat Frontier Models*)
- **Pull Request:** [Draft PR pending creation]
- **Author:** Marcus Tiongson, Founder, Gaia Research
- **Viability:** High
- **Potential:** Exceptional
- **Primary Deliverable:** Architectural RFC & Thought Leadership Post (`/blog/beyond-orchestration-economic-scheduler`)
- **Execution Mode:** Thought leadership and systems architecture; **no empirical benchmarks or experiments claimed**.

---

## Table of Contents
1. [Executive Summary & Core Thesis](#1-executive-summary--core-thesis)
2. [Founder Voice: Verbatim Source Quotations](#2-founder-voice-verbatim-source-quotations)
3. [The Five-Stage Evolution of Agent Coordination](#3-the-five-stage-evolution-of-agent-coordination)
   - [Phase 1: Conversational Orchestration (The LLM-to-LLM Tax)](#phase-1-conversational-orchestration-the-llm-to-llm-tax)
   - [Phase 2: Deterministic Coordination Runtimes (Software State Machines)](#phase-2-deterministic-coordination-runtimes-software-state-machines)
   - [Phase 3: Shared Memory & Canonical Skill Catalogs (Global State vs. Local Reinvention)](#phase-3-shared-memory--canonical-skill-catalogs-global-state-vs-local-reinvention)
   - [Phase 4: Dynamic Programmatic Workflows (Compiled Subagent Scripts)](#phase-4-dynamic-programmatic-workflows-compiled-subagent-scripts)
   - [Phase 5: Economic Scheduling of Heterogeneous Agents (The Missing Layer)](#phase-5-economic-scheduling-of-heterogeneous-agents-the-missing-layer)
4. [Comparative Analysis of Modern Coordination Platforms](#4-comparative-analysis-of-modern-coordination-platforms)
   - [Comparison Matrix: Auto Office vs. LangGraph vs. Temporal vs. Claude Dynamic Workflows vs. Ray](#comparison-matrix)
   - [Platform Profiles & Architectural Contributions](#platform-profiles--architectural-contributions)
5. [The Remaining Gap: From State Machine to Economic Scheduler](#5-the-remaining-gap-from-state-machine-to-economic-scheduler)
   - [Why Workflow Engines Are Not Schedulers](#why-workflow-engines-are-not-schedulers)
   - [The Missing Economic Primitives](#the-missing-economic-primitives)
6. [Formal Specification of the Economic Scheduler](#6-formal-specification-of-the-economic-scheduler)
   - [The Scheduling Optimization Problem](#the-scheduling-optimization-problem)
   - [System Architecture Blueprint](#system-architecture-blueprint)
7. [Thought-Leadership Narrative Outline](#7-thought-leadership-narrative-outline)
8. [Research Source Ledger](#8-research-source-ledger)
9. [Strict Epistemic Demarcation](#9-strict-epistemic-demarcation)
10. [Roadmap & Publication Criteria](#10-roadmap--publication-criteria)

---

## 1. Executive Summary & Core Thesis

In our foundational essay, *The Economics of Agentic Work: When Small Agents Beat Frontier Models* ([#304](https://github.com/gaia-research/gaia-research/issues/304)), we established that when verification is fast and deterministic, bounded retries of smaller, cheaper models (such as GPT-6 Luna or Gemini 3.8 Flash) can economically outperform monolithic frontier reasoning runs (Claude Opus or GPT-6.1 Sol).

However, as our architectural inquiry deepened, a more fundamental pathology emerged:
**Why are we paying expensive, non-deterministic large language models to perform state coordination and workflow bookkeeping that deterministic software runtimes solved decades ago?**

When a frontier model acts as a traditional conversational orchestrator, it spends the majority of its token budget generating planning manifestos, polling worker status, serializing intermediate state, and passing natural-language messages. This introduces severe latency inflation, context degradation, and what Gaia Research previously identified as the **Orchestrator Tax** ([#242](https://github.com/gaia-research/gaia-research/issues/242)).

Modern engineering frameworks have begun addressing this:
- **Rico's Auto Office** replaces conversational back-and-forth with a deterministic software-development lifecycle (SDLC) runtime backed by SQLite WAL persistence, explicit rule-ownership matrices, and isolated worktrees.
- **LangGraph** models multi-agent execution as cyclical state graphs with persistent checkpointing.
- **Temporal** provides durable, event-sourced distributed workflow execution with automated retries and zero message loss.
- **Claude Dynamic Workflows** allows a lead agent to compile an executable JavaScript script that dispatches hundreds of subagents in background phases without polluting the primary context window.
- **Ray** demonstrates high-throughput distributed execution with zero-copy shared memory via the Plasma object store.

Yet despite these advances, a crucial systems-level piece remains missing.
Existing runtimes are **execution engines**, not **economic schedulers**. They reliably execute a predefined graph or lifecycle, but they do not dynamically optimize the assignment of tasks across heterogeneous model tiers, inference costs, verification probabilities, and subscription quota constraints.

**The Central Thesis:**
The next major architectural breakthrough in agentic systems will not come from building larger orchestrator prompts or more complex multi-agent chat rooms. It will come from an **Economic Scheduler for AI Agents**—a deterministic systems layer that treats language models, tools, and verification gates as heterogeneous compute resources, optimizing total expected cost per verified deliverable under strict latency, reliability, and safety constraints.

---

## 2. Founder Voice: Verbatim Source Quotations

The conceptual seeds of this inquiry were voiced by Gaia Research founder Marcus Rafael B. Tiongson during architectural strategy sessions in late October 2026. The following statements are preserved **verbatim** as the foundational motivation:

> **Quotation 1 (Awareness of Prior Tooling):**  
> “someone else made some sort of tool like this.”

> **Quotation 2 (The Need for Unified State):**  
> “there's a shared memory There's a global memory”

> **Quotation 3 (Skill Duplication and Sprawl):**  
> “there are these skills scattered all around that's trying to do the same thing.”

> **Quotation 4 (The Unsolved Problem of Orchestration):**  
> “orchestration not yet being solved right now”

### Context of the Founder's Observations
- **On Prior Tooling & Auto Office:** The founder observed that independent engineers have begun developing external SDLC harnesses (such as Rico's Auto Office) that pull agent lifecycles out of the model prompt and embed them into deterministic SQLite-backed command-line runtimes.
- **On Shared Memory:** In multi-agent pipelines, agents repeatedly burn tokens discovering repository structure, reading identical documentation, and re-parsing ASTs. A deterministic global memory layer eliminates redundant prompt ingestion.
- **On Skill Sprawl:** Developers across organizations author redundant, fragmented procedural skills (`SKILL.md`) that attempt the same task with conflicting conventions. A mature scheduling architecture requires a canonical, deduplicated skill catalog.
- **On Orchestration Being Unsolved:** Despite the proliferation of multi-agent frameworks, "orchestration" today remains largely conversational, fragile, and economically wasteful. It requires an operating-system-level scheduler rather than another conversational wrapper.

---

## 3. The Five-Stage Evolution of Agent Coordination

The development of multi-agent systems is undergoing an evolutionary shift parallel to the history of operating systems:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             THE FIVE-STAGE EVOLUTION OF COORDINATION                             │
├───────────────┬──────────────────────────────────┬───────────────────────────────┬───────────────┤
│ Stage         │ Coordination Mechanism           │ State Authority               │ Economic Cost │
├───────────────┼──────────────────────────────────┼───────────────────────────────┼───────────────┤
│ Phase 1:      │ Conversational Chat              │ In-context conversational     │ Extreme       │
│ Orchestration │ (LLM talks to LLMs via tokens)   │ history (unbounded tokens)    │ (50x-100x)    │
├───────────────┼──────────────────────────────────┼───────────────────────────────┼───────────────┤
│ Phase 2:      │ Deterministic Runtimes           │ Relational DB / State Graph   │ High to Mid   │
│ Runtimes      │ (SQLite, LangGraph, Temporal)    │ (SQLite WAL, Checkpoints)     │ (State saved) │
├───────────────┼──────────────────────────────────┼───────────────────────────────┼───────────────┤
│ Phase 3:      │ Global Shared Memory             │ External Object Store &       │ Moderate      │
│ Memory/Skills │ (Plasma, Vector, Skill Catalogs) │ Canonical Skill Registries    │ (Cache reuse) │
├───────────────┼──────────────────────────────────┼───────────────────────────────┼───────────────┤
│ Phase 4:      │ Dynamic Programmatic Workflows   │ Compiled execution script     │ Moderate-Low  │
│ Workflows     │ (Claude Dynamic Workflows code)  │ in background sandbox         │ (No chat bloat│
├───────────────┼──────────────────────────────────┼───────────────────────────────┼───────────────┤
│ Phase 5:      │ Economic Scheduling              │ Predictive Cost-DAG Engine    │ Optimal       │
│ (The Goal)    │ (Heterogeneous model routing)    │ with verification constraints │ (Pareto min)  │
└───────────────┴──────────────────────────────────┴───────────────────────────────┴───────────────┘
```

### Phase 1: Conversational Orchestration (The LLM-to-LLM Tax)
In early multi-agent designs, a centralized "Manager" model coordinates worker agents via natural language chat.
- **The Failure Mode:** The orchestrator must re-read the entire conversational transcript on every turn. When worker agents report intermediate status, the orchestrator burns thousands of frontier tokens summarizing the report.
- **The Cache Penalty:** As shown in [#242](https://github.com/gaia-research/gaia-research/issues/242), asynchronous delays breach provider prompt-cache TTLs (5 minutes), forcing full context prefill penalties on every coordination turn.

### Phase 2: Deterministic Coordination Runtimes (Software State Machines)
Engineering discipline enters: replacing conversational back-and-forth with deterministic state machines.
- **Rico's Auto Office (`Hikari9/auto-office`):** Eliminates chat loops by enforcing an opinionated SDLC. An orchestrator defines strategy, but state transitions (discover $\to$ plan $\to$ route $\to$ produce $\to$ review $\to$ integrate $\to$ land) are recorded in an authoritative SQLite WAL database (`runs.db`). Workers execute in isolated worktrees and emit immutable submissions.
- **LangGraph:** Structures interactions as directed cyclic graphs where nodes represent agent turns or tool calls, and edges define state updates and conditional routing. Checkpointers record every step, enabling human-in-the-loop inspection and time-travel replay.
- **Temporal:** Provides fault-tolerant workflow-as-code execution. Workflows and activities run with deterministic replay, automatic exponential backoff retries, and durable execution state that survives server restarts.

### Phase 3: Shared Memory & Canonical Skill Catalogs (Global State vs. Local Reinvention)
Even with deterministic runtimes, agents suffer from context isolation: each agent re-discovers the codebase, re-indexes symbols, and re-invents procedural instructions.
- The founder's insight: *“there's a shared memory There's a global memory”* and *“there are these skills scattered all around that's trying to do the same thing.”*
- Inspired by distributed systems like **Ray** (which uses the Plasma shared-memory object store for zero-copy memory access across nodes), Phase 3 introduces global repository memory (cached AST graphs, symbol indexes, recent verification receipts) accessible to all workers without consuming prompt tokens.
- Furthermore, scattered procedural instructions are consolidated into a canonical, deduplicated skill registry (e.g., Gaia Skill Tree / Yggdrasil), preventing agents from executing conflicting ad-hoc procedures.

### Phase 4: Dynamic Programmatic Workflows (Compiled Subagent Scripts)
Anthropic's introduction of **Claude Dynamic Workflows** represents a major shift in how frontier models coordinate subagents.
- Rather than orchestrating subagents conversationally in chat, the lead model writes an executable program (such as a JavaScript script).
- The runtime executes this script in a background sandbox, spawning dozens or hundreds of subagents in parallel execution waves.
- Only the consolidated final output returns to the primary session, shielding the developer and the lead model from intermediate chatter, terminal output, and token bloat.

### Phase 5: Economic Scheduling of Heterogeneous Agents (The Missing Layer)
While Dynamic Workflows and Auto Office compile and execute workflows deterministically, they leave the **resource allocation decision** to either hardcoded rules or unguided model intuition.
- When should a task use a $0.15/1M token model with bounded retries versus a $75.00/1M token model?
- When should two workers race concurrently (speculative execution) versus waiting for a serial outcome?
- When is a unit test verifier sufficient, and when is an independent reviewer model required?
- Phase 5 is the **Economic Scheduler**: an optimization layer that consumes task characteristics, model capability distributions, verification costs, and quota constraints to schedule work at the minimum cost per verified deliverable.

---

## 4. Comparative Analysis of Modern Coordination Platforms

### Comparison Matrix

| Dimension | Rico's Auto Office | LangChain LangGraph | Temporal.io | Claude Dynamic Workflows | Ray Distributed |
|---|---|---|---|---|---|
| **Primary Paradigm** | Opinionated Engineering SDLC Runtime | Graph-based Agent State Machine | Durable General Workflow Engine | Programmatic Compiled Subagent Script | High-Performance Distributed Compute |
| **State Authority** | SQLite WAL (`runs.db`) | In-memory / Postgres Checkpointer | Event-sourced Transaction Log | Ephemeral Script Sandbox Environment | Plasma Shared-Memory Object Store |
| **Isolation Model** | Isolated Git Worktrees per worker | Thread / State Channel Isolation | Process / Worker Activity Boundaries | Sandboxed Child Agent Environments | Worker Actor & Memory Isolation |
| **Model Awareness** | Role-based routing table (`agents.json`) | Agnostic (wraps any LLM call) | Completely Agnostic (arbitrary code) | Native Claude Integration (Opus/Sonnet/Haiku) | Agnostic (heterogeneous worker nodes) |
| **Economic Scheduling** | Fixed role mapping (no dynamic cost solver) | Graph edges (conditional routing, no solver) | Priority queues (no LLM cost awareness) | Script-defined fan-out (no cost-optimal solver) | Resource-aware (CPUs/GPUs, not token prices) |
| **Verification Gate** | Immutable submissions + independent review | Conditional edge evaluation functions | Activity retry policies & heartbeats | Final script assertion / lead review | Application-level task return assertions |
| **Failure Recovery** | Resumable run steps via `runs.db` | Replay from state checkpoints | Deterministic replay from event history | Abort / retry within 24-hr lifetime | Lineage-based object reconstruction |

### Platform Profiles & Architectural Contributions

#### 1. Rico's Auto Office (`Hikari9/auto-office`)
- **Key Contribution:** Bridges the gap between conversational agents and disciplined software engineering. It enforces that "the method should survive the replacement of every agent and tool."
- **Mechanics:** 
  - Uses an opinionated lifecycle: Discover $\to$ Plan $\to$ Route $\to$ Produce $\to$ Independently Review $\to$ Integrate $\to$ Land.
  - State is recorded in SQLite (`runs.db`), making runs pauseable, inspectable, and resumable across sessions.
  - Workers operate in isolated git worktrees with strict rule-ownership boundaries, ensuring producers never approve their own work.
- **Boundary:** Focuses on engineering lifecycle governance and authority boundaries; does not perform predictive mathematical optimization over model pricing or quota exhaustion.

#### 2. LangGraph (`docs.langchain.com/oss/python/langgraph/overview`)
- **Key Contribution:** Generalizes agent execution from rigid sequential chains into arbitrary directed graphs with cycles, branching, and persistence.
- **Mechanics:**
  - Nodes represent functions (agent actions or tool invocations); edges represent state transitions.
  - Built-in checkpointing enables state restoration, time-travel debugging, and human-in-the-loop review at arbitrary graph seams.
- **Boundary:** Routing decisions are hardcoded in conditional edge predicates or delegated back to an LLM node; it lacks an underlying economic cost solver.

#### 3. Temporal (`docs.temporal.io`)
- **Key Contribution:** The gold standard of durable distributed execution in traditional enterprise systems.
- **Mechanics:**
  - Encapsulates workflows as deterministic code and side-effects as activities.
  - Event sourcing ensures that even if an execution node crashes mid-flight, the workflow state is reconstructed without repeating executed activities.
- **Boundary:** Operates at the infrastructure level. It has no native understanding of token pricing, prompt caching, reasoning depth, or LLM hallucination probabilities.

#### 4. Claude Dynamic Workflows (`code.claude.com/docs/en/workflows`)
- **Key Contribution:** Scales subagent execution to massive parallelism (up to 1,000 subagents per run, 64 concurrent) by compiling execution into a script.
- **Mechanics:**
  - The lead agent plans the workflow and writes a program that dispatches background workers.
  - Intermediate chatter, file reads, and tool interactions stay quarantined in background execution, keeping the primary user session fast and clean.
- **Boundary:** The model itself authors the script without formal awareness of subscription rate-limit cliffs, cross-provider alternatives, or speculative racing economics.

#### 5. Ray Distributed Execution (`docs.ray.io`)
- **Key Contribution:** Solves the shared memory and hardware scheduling challenge in distributed AI.
- **Mechanics:**
  - The **Plasma Object Store** allows zero-copy deserialization of shared data across processes on the same node.
  - Ray's centralized scheduler places tasks dynamically based on hardware resource availability (CPU, GPU, memory constraints).
- **Relevance to Agents:** Proves that high-throughput distributed systems require a dedicated, low-latency shared memory layer—the exact missing primitive for agent global context.

---

## 5. The Remaining Gap: From State Machine to Economic Scheduler

### Why Workflow Engines Are Not Schedulers

A critical distinction in operating systems and distributed systems is the difference between a **Workflow Engine** and a **Scheduler**:
- A **Workflow Engine** (such as Temporal or LangGraph) knows *how* to execute a graph of tasks reliably: in what sequence, with what retries, and where to store state.
- A **Scheduler** (such as the Linux CFS, Kubernetes kube-scheduler, or Ray scheduler) decides *where, when, and on what resource* a task should run to optimize global system metrics.

Today's agent frameworks provide excellent workflow engines, but virtually **zero scheduling intelligence**:
1. If a developer tells LangGraph or Auto Office to use Claude Sonnet for code editing, the runtime obediently calls Sonnet every time.
2. It does not evaluate whether a $0.20/1M token Luna model has an 85% probability of passing the compiler on this specific file.
3. It does not calculate whether launching two cheap models in parallel (speculative race) is 5× cheaper and 3× faster than waiting for one expensive frontier model.
4. It does not check whether the user has only 15% remaining on their Claude Pro 5-hour rate limit before deciding to route the task to an alternative API endpoint.

### The Missing Economic Primitives

To bridge this gap, an Economic Scheduler must incorporate five missing primitives:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE FIVE SCHEDULER PRIMITIVES                                    │
├───────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│ Primitive                     │ Systems Role                     │ Architectural Function        │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ 1. Predictive Capability      │ Calibrated Performance Predictor │ Models P(pass | task, model,  │
│    Distribution               │                                  │ harness) from prior outcomes. │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ 2. Speculative Execution      │ Tail Latency & Failure Truncation│ Races k cheap replicas; takes │
│    Engine                     │                                  │ first verified patch.         │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ 3. Global Shared Memory       │ Plasma-style Zero-Copy Context   │ Eliminates redundant prompt   │
│    (Context Store)            │                                  │ ingestion across workers.     │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ 4. Quota-Aware Budgeter       │ Fixed-Tier Rate-Limit Guard      │ Schedules against 5-hour caps │
│                               │                                  │ ($20/month subscription).     │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ 5. Canonical Skill Catalog    │ Reusable Procedural Registrar    │ Deduplicates scattered skills │
│                               │                                  │ into validated routines.      │
└───────────────────────────────┴──────────────────────────────────┴───────────────────────────────┘
```

---

## 6. Formal Specification of the Economic Scheduler

### The Scheduling Optimization Problem

Let a task $\tau$ be defined by its requirement complexity $D(\tau)$, its file scope $S(\tau)$, its available deterministic verifier $V(\tau) \in \{0, 1\}$, and its safety criticalness $\sigma(\tau) \in [0, 1]$.

Let the scheduler choose an execution policy $\pi \in \Pi$ from four fundamental regimes:
1. $\pi_1$: Single Frontier Execution ($M_{\text{frontier}}$)
2. $\pi_2$: Bounded Sequential Retries ($M_{\text{cheap}}, K \le K_{\max}$)
3. $\pi_3$: Speculative Concurrent Racing ($k$ parallel instances of $M_{\text{cheap}}$ in isolated worktrees)
4. $\pi_4$: Adaptive Cascade ($M_{\text{cheap}} \to$ escalate to $M_{\text{frontier}}$ on verification failure)

#### Objective Function
The scheduler selects $\pi^*$ to minimize expected total cost per verified deliverable:

$$\pi^* = \arg\min_{\pi \in \Pi} \mathbb{E}\left[ C_{\text{total}}(\tau, \pi) \;\middle|\; \text{verified}(\tau) = 1 \right]$$

Subject to the following operational constraints:
1. **Latency Ceiling:**  
   $$\mathbb{E}[\text{Latency}(\tau, \pi)] \le L_{\max}$$
2. **Safety Invariant (Zero Unauthorized Destructive Action):**  
   $$P(\text{unauthorized mutation} \mid \pi) = 0 \quad (\forall \sigma(\tau) > \sigma_{\text{thresh}})$$
3. **Subscription Quota Budget:**  
   $$\text{QuotaBurn}(\pi, \text{provider}) \le Q_{\text{remaining}}(\text{window})$$
4. **Reliability Floor:**  
   $$P(\text{verified}(\tau) = 1 \mid \pi) \ge 1 - \epsilon$$

Where total cost $C_{\text{total}}$ includes:
$$C_{\text{total}} = C_{\text{inference}}(\text{workers}) + C_{\text{runtime}}(\text{orchestrator}) + C_{\text{verification}}(\text{tests/linters}) + C_{\text{human}}(\text{interruptions})$$

### System Architecture Blueprint

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             ECONOMIC AGENT SCHEDULER ARCHITECTURE                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│   [ Human Intent / Issue Tracker ] ──► [ Task Feature Extractor (Scope, Difficulty, Verifiers) ] │
│                                                          │                                       │
│                                                          ▼                                       │
│    ┌────────────────────────────────────────────────────────────────────────────────────────┐    │
│    │                          ECONOMIC SCHEDULING ENGINE (Deterministic)                    │    │
│    │  • Solves: min E[Cost | Verified] s.t. Latency, Quota, Safety Constraints              │    │
│    │  • Consults: Historical Capability Matrix P(pass | task, model)                        │    │
│    │  • Selects: Single Frontier vs. Bounded Retry vs. Speculative Race vs. Cascade         │    │
│    └────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                          │                                       │
│               ┌──────────────────────────────────────────┴──────────────────────────┐            │
│               ▼                                                                     ▼            │
│    ┌───────────────────────────────────┐                         ┌─────────────────────────────┐ │
│    │     GLOBAL SHARED MEMORY          │                         │   CANONICAL SKILL CATALOG   │ │
│    │  • Repository AST & Symbol Map    │                         │  • Validated SKILL.md specs │ │
│    │  • Cached Test & Lint Results     │                         │  • Deduplicated procedures  │ │
│    │  • Zero-Copy Task Workspace       │                         │  • Role-specific contracts  │ │
│    └───────────────────────────────────┘                         └─────────────────────────────┘ │
│               │                                                                     │            │
│               └──────────────────────────┬──────────────────────────────────────────┘            │
│                                          ▼                                                       │
│    ┌────────────────────────────────────────────────────────────────────────────────────────┐    │
│    │                      ISOLATED EXECUTION WORKTREES (Git Branches)                       │    │
│    │                                                                                        │    │
│    │   [ Worker A: Luna ]          [ Worker B: Luna (Speculative) ]    [ Worker C: Frontier ]   │    │
│    │   Worktree: .wt/branch-a      Worktree: .wt/branch-b              Worktree: .wt/branch-c   │    │
│    └────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                          │                                                       │
│                                          ▼                                                       │
│    ┌────────────────────────────────────────────────────────────────────────────────────────┐    │
│    │                        DETERMINISTIC VERIFICATION ORACLE                               │    │
│    │  • Compiler Diagnostics / Typechecker (cargo check, tsc, pyright)                       │    │
│    │  • Deterministic Test Runner (vitest, pytest)                                          │    │
│    │  • Independent Convergence Reviewer (Outside Model Gate)                                │    │
│    └────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                          │                                                       │
│                       ┌──────────────────┴──────────────────┐                                    │
│                       ▼ (Pass)                              ▼ (Fail)                             │
│         [ Fast-forward Merge & Land ]           [ Kill Stragglers / Escalate ]                   │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Thought-Leadership Narrative Outline

*(The planned narrative structure for the upcoming editorial essay in the founder's first-person voice)*

### Act I: The Illusion of Orchestration
- **Hook:** We are treating LLMs like project managers when we should be treating them like compilers and execution runtimes.
- **The Observation:** Why are we burning $3.00/turn on an orchestrator just to read JSON status messages from subagents?
- **The Founder's realization:** *“someone else made some sort of tool like this.”* People are starting to realize that software, not prompts, should manage execution.

### Act II: The Great Convergence (Auto Office, LangGraph, Temporal)
- How modern runtimes stripped the prompt away from the lifecycle:
  - Rico's Auto Office showing that an engineering team's SDLC can be a SQLite state machine.
  - LangGraph showing that agent loops are just cyclic state graphs.
  - Temporal showing that distributed execution requires event logs, not chat history.
- The shared discovery: Deterministic coordination is cheaper, faster, and infinitely more reliable than model-based conversational coordination.

### Act III: The Sprawl of Memory and Skills
- Founder's observation: *“there's a shared memory There's a global memory”* and *“there are these skills scattered all around that's trying to do the same thing.”*
- The inefficiency of isolated contexts: Every subagent re-reads the repo; every team re-invents the same git-commit skill.
- The solution: Decouple procedural knowledge (canonical skill catalog) and repository state (global shared memory) from the individual agent's context window.

### Act IV: The Missing Economic Scheduler
- Founder's verdict: *“orchestration not yet being solved right now”*.
- Why workflow engines don't solve economics: A workflow engine runs the graph you give it; a scheduler decides which graph is cheapest to run.
- Introducing the Economic Scheduler: Formulating $\min \mathbb{E}[C_{\text{total}} \mid \text{verified}]$ subject to latency, quota, and safety constraints.
- How speculative racing of cheap agents beats sequential deliberative models when backed by deterministic test oracles.

### Act V: The Engineering Mandate
- Stop building multi-agent chat rooms.
- Build clean deterministic state machines, plug them into global memory, and let an economic scheduler allocate compute across models.
- Systems engineering, once again, solves what raw model scaling cannot.

---

## 8. Research Source Ledger

The following source ledger documents the official documentation, code repositories, and academic papers evaluated in this research proposal:

| Source / Project | Classification | Author / Organization | URL | Key Systems Insight & Relevance |
|---|---|---|---|---|
| **Auto Office** | Production Open Source | Rico Tiongson (`Hikari9`) | [GitHub: Hikari9/auto-office](https://github.com/Hikari9/auto-office) | Opinionated SDLC runtime; SQLite WAL (`runs.db`) state authority; isolated worktrees; immutable submissions; rule-ownership matrix separating strategy from lifecycle. |
| **LangGraph** | Open Source Framework | LangChain (`langchain-ai`) | [LangChain Docs](https://docs.langchain.com/oss/python/langgraph/overview) | Cyclic graph state machines for agents; state checkpointing; time-travel execution; human-in-the-loop review at arbitrary graph seams. |
| **Temporal** | Distributed Systems Engine | Temporal Technologies | [Temporal Docs](https://docs.temporal.io/) | Durable execution platform; deterministic workflow replay; activity retries, heartbeats, and timeouts; failure recovery without manual polling. |
| **Anthropic Multi-Agent Research** | Applied AI Research | Anthropic | [Anthropic MARS](https://www.anthropic.com/research/multi-agent-research-system) | Investigates multi-agent research systems; details context isolation trade-offs and coordination overhead in production engineering. |
| **Claude Dynamic Workflows** | Commercial Agent Runtime | Anthropic | [Claude Code Workflows](https://code.claude.com/docs/en/workflows) | Programmatic subagent orchestration; compiles JavaScript execution scripts to run up to 1,000 subagents in background sandbox phases without context pollution. |
| **Ray Distributed Execution** | Distributed Compute | Anyscale / UC Berkeley | [Ray Docs](https://docs.ray.io/) | Dynamic task graph scheduling; actor model; zero-copy shared memory via Plasma object store; hardware-resource-aware worker placement. |
| **FrugalGPT** | Peer-Reviewed Research | Chen, Zaharia, Zou (Stanford) | [arXiv:2305.05176](https://arxiv.org/abs/2305.05176) | Formalizes model cascading and adaptive routing to optimize cost-accuracy Pareto frontiers across heterogeneous LLM pools. |

---

## 9. Strict Epistemic Demarcation

In keeping with Gaia Research editorial discipline, we maintain strict demarcation across three epistemic categories:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     EPISTEMIC DEMARCATION                                        │
├───────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│ Epistemic Category            │ Scope & Content                  │ Current Truth Status          │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ Category 1:                   │ Documented capabilities of Auto  │ VERIFIED & INDEPENDENTLY      │
│ Published Systems & Literature│ Office, LangGraph, Temporal,     │ DEMONSTRATED                  │
│                               │ Claude Dynamic Workflows, Ray,   │ (Cited from verified docs,    │
│                               │ and FrugalGPT.                   │ repos, and publications)      │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ Category 2:                   │ Conceptual formulation of the    │ THEORETICAL ARCHITECTURAL     │
│ Gaia Architectural Hypotheses │ Economic Scheduler, the missing  │ PROPOSAL                      │
│                               │ optimization layer, and metrics. │ (No empirical claims made)    │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ Category 3:                   │ Proposed future benchmark comparing│ UNRUN & NON-VALIDATED        │
│ Future Experimental Protocol  │ static workflows vs. an economic │ (Explicitly deferred to       │
│                               │ scheduling solver.               │ future lab evaluation)        │
└───────────────────────────────┴──────────────────────────────────┴───────────────────────────────┘
```

### 1. Published Systems & Literature (Verified Facts)
- Deterministic runtimes (Temporal, LangGraph, Auto Office) eliminate conversational state coordination.
- Auto Office enforces isolated git worktrees and SQLite WAL state authority for agent SDLCs.
- Claude Dynamic Workflows can execute parallel subagent scripts in background sandboxes.
- Ray's Plasma object store achieves zero-copy shared memory across local processes.
- Model cascading reduces inference costs by up to 98% on benchmark tasks (Chen et al., 2023).

### 2. Gaia Architectural Hypotheses (What We Propose)
- **The Scheduler Gap Hypothesis:** Existing runtimes execute graphs reliably but lack a mathematical solver that dynamically selects model tiers, speculative racing, and retry bounds based on expected cost per verified pass.
- **The Global Memory Amortization Hypothesis:** Providing a zero-copy shared memory store for repository ASTs and verification receipts reduces total task token consumption by 30%–60% across multi-agent runs.
- **The Skill Deduplication Hypothesis:** Consolidating redundant procedural skills into a canonical, version-pinned skill registry eliminates conflicting tool executions and reduces agent discovery turns.
- **The Quota Protection Hypothesis:** A scheduler that explicitly tracks subscription rolling rate limits ($20/month tier) increases total daily verified deliverables by preventing premature quota exhaustion.

### 3. Future Experimental Questions (Not Yet Tested)
*Disclaimer: Gaia Research has not built this scheduler or run empirical benchmarks comparing scheduled vs. unscheduled agent runs. The following questions are open research proposals:*
1. Does an economic solver that optimizes $\min \mathbb{E}[C_{\text{total}} \mid \text{verified}]$ achieve a lower cost per verified task than Claude Dynamic Workflows on SWE-bench or real GitHub PRs?
2. What is the optimal threshold of test execution speed where speculative racing of 3 cheap models beats a single frontier model run?
3. How effectively can historical repository outcomes predict $P(\text{pass} \mid \text{task}, \text{model})$ for incoming novel tasks?

---

## 10. Roadmap & Publication Criteria

This document establishes the **Idea Bank architectural RFC** for tracking issue [#306](https://github.com/gaia-research/gaia-research/issues/306).

### Immediate Next Steps
1. **Idea Bank Indexing:** Register under `## Unranked Editorial Ideas (not yet prioritized)` in [`docs/idea-bank/README.md`](./README.md) without altering ranked ideas 1–21.
2. **Pull Request Tracking:** Open a documentation pull request against `main` linking tracking issue [#306](https://github.com/gaia-research/gaia-research/issues/306) and precedent issue [#304](https://github.com/gaia-research/gaia-research/issues/304).
3. **Editorial Review:** Await founder feedback on the architectural framing and verbatim quotations.

### Future Editorial Publication Gates
- [ ] Founder sign-off on narrative outline and verbatim quotes.
- [ ] Full essay authoring in the founder's first-person voice.
- [ ] Brand thumbnail asset generation (Milim Pink `#ec4899`, Rimuru Blue `#38bdf8`, obsidian dark canvas).
- [ ] Lexicon compliance check (`scripts/lexicon/check-lexicon.ts`).
- [ ] Playwright visual and mobile cut-off audit (`scripts/visual-audit.mjs`).
