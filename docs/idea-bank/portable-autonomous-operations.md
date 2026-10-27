# Portable Autonomous Operations Toolkit

- **Disposition:** **Not now** (parked, unranked idea)
- **Recorded:** 2026-10-27
- **Scope:** Reusable, provider-agnostic operating machinery for durable coding agents
- **Tracking issue:** [#312](https://github.com/gaia-research/gaia-research/issues/312)
- **Internal Gaia context:** Complementary to [Gaia AO #311](https://github.com/gaia-research/gaia-research/issues/311)
- **Decision:** Pure idea exploration. No repository creation, package publishing, runtime implementation, or architecture commitment is authorized by this note.

## Thesis

Durable coding agents (such as Claude Code Routines, Grok Bot, OpenAI Dots, or headless harnesses) are increasingly capable of proactive coordination. However, proactive agents lack safe, deterministic operating machinery out-of-the-box: they risk runaway retries, unbounded token costs, unverified writes, race conditions across concurrent runs, and ambiguous authority.

The thesis of **Portable Autonomous Operations (Portable AO)** is that the hard parts of operational governance can be factored out into a lightweight, provider-agnostic toolkit:
1. The **durable agent** provides proactive coordination, task planning, and semantic reasoning.
2. The **reusable operating machinery** handles deterministic observation, work admission, leases, execution boundaries, independent verification, recovery, and cryptographic receipts.

Rather than building a heavyweight SaaS orchestrator or requiring specific proprietary subscriptions (e.g. GitHub Copilot, dedicated cluster runtimes), developers can bring their own existing repositories, GitHub Actions, and interchangeable agents to run safe autonomous maintenance loops.

## Core Principles

- **Provider-agnostic:** Operates across interchangeable models and harnesses without requiring a specific subscription, platform tier, or Copilot license.
- **Tool reuse over platform sprawl:** Composes with existing Git workflows, GitHub CLI/API, CI workflows, and standard agent CLIs rather than introducing a competing orchestration platform.
- **Zero-model routine observation:** Quiet ticks (checking workflow health, cron schedules, contract digests, issue triage states) consume zero LLM tokens and zero API dollars.
- **Bring-your-own policies & verification:** Repositories declare their own capability envelopes, allowed/forbidden paths, and required verification commands; the machinery enforces them mechanically.
- **Agent-independent durable state:** Leases, attempt logs, and execution receipts persist in deterministic, inspectable storage (e.g., git-backed, branch ledger, SQLite, or local file) decoupled from the ephemeral memory of any single LLM session.
- **Safe recovery & bounded spend:** Hard timeouts, circuit breakers, and cost ceilings prevent cascading retries; unresolvable failures escalate quietly to human maintainers.
- **Individual-first with multi-repo expansion:** Operates seamlessly on a single solo-developer repository with zero cloud dependencies, with an optional path to multi-repository contract tracking.
- **No self-granted authority:** Agents cannot expand their own permissions, approve their own PRs to protected branches, or auto-authorize self-filed tasks.

## Potential Users

- **Solo maintainers & open-source authors:** Need low-maintenance, quiet background triage, automated dependency and health reconciliation, and draft fix creation without babysitting terminals or paying continuous platform retainers.
- **Multi-repository engineering teams:** Require consistent, policy-governed maintenance across microservices or library matrices with distinct owners, ensuring cross-repo contract drift is caught early without sprawling orchestration infrastructure.
- **Harness & agent developers:** Building domain-specific agents or routines who need battle-tested admission control, concurrency leasing, and independent verification primitives rather than hand-rolling safety scaffolding.

## Minimal Reusable Components

A minimal portable toolkit consists of six decoupled primitives:

1. **Deterministic Observer / Sensor:** Headless scripts running zero-token checks against repo events, workflow status, dependency pins, or contract digests.
2. **Work Admission & Lease Controller:** Lightweight Compare-And-Swap (CAS) or token leasing to prevent duplicate ticks, concurrent write collisions, and runaway loops.
3. **Capability Envelope & Policy Guard:** Declarative configuration defining task classes, allowed/forbidden file paths, approved tool boundaries, and maximum token/spend quotas.
4. **Interchangeable Dispatch Adapter:** Uniform interface to trigger a bounded agent execution (Claude Code, Pi, OpenAI Dots, Grok Bot, or standard shell commands) with task isolation.
5. **Independent Verifier & Receipt Generator:** Runs mandatory out-of-band validation checks (build, test, lint, contract check) before changes are packaged into PRs; records signed/hashed receipts.
6. **Durable State Store:** Simple persistence layer for leases, run histories, and outcome records independent of agent context windows.

## Possible Host Adapters

The operating machinery is decoupled from the host triggering it. Candidate host adapters include:
- **Claude Code Routines:** Scheduled or event-triggered proactive passes executing inside repo checkouts.
- **Grok Bot / OpenAI Dots:** Webhook-driven or proactive bot actors reacting to issue labels and dispatching bounded tasks.
- **GitHub Actions / Cron Dispatchers:** Fully headless, schedule-based triggers invoking local agent CLIs.
- **Local Developer Daemons:** Background watch tasks running on maintainer workstations or dedicated development servers.

## Portability Challenges

- **State persistence without dedicated infrastructure:** Balancing simplicity (e.g., git-orphan branches, repo cache, or issue comments) against concurrency safety across distributed runners.
- **Disparate harness capabilities:** Different agent harnesses expose varying hook lifecycles, sandbox boundaries, and subagent delegation models; the toolkit must remain unopinionated about internal agent structure.
- **Branch protection & credential isolation:** GitHub token permissions (`GITHUB_TOKEN` vs. PAT/App tokens) impose varying constraints on PR creation, workflow modification, and branch protection bypasses across different organizations.
- **Cost observability disparity:** Heterogeneous inference providers report usage differently (or not at all in stream mode); tracking spend requires robust fallback estimation.

## Relationship to Gaia Steward

- **Gaia Steward / Gaia AO ([#311](https://github.com/gaia-research/gaia-research/issues/311)):** The internal, full-featured operational engine of the Gaia ecosystem. It encodes Gaia-specific governance (Tree, Skill Heaven, Research, Class A/B/C tasks, Yggdrasil taxonomy, and founder ratification contracts).
- **Portable Autonomous Operations:** A generalized, unbundled conceptual sibling. It extracts the proven mechanical foundations (deterministic observation, leasing, bounded execution, verification receipts) while leaving repository governance, policy definitions, and agent selection entirely in the hands of external adopters.
- Gaia-specific governance is an implementation policy, not a universal requirement of the portable toolkit.

## Measurable Criteria for a Future Pilot

Should this parked idea ever be activated for an experimental pilot, success should be measured by:

1. **Setup friction:** A clean, unconfigured GitHub repository can install and run one bounded maintenance loop in <15 minutes with no external cloud database or SaaS account.
2. **Zero-token quiet baseline:** 100% of quiet ticks (no work detected or admitted) execute with 0 LLM API calls and $0.00 cost.
3. **Lease concurrency safety:** 0% duplicate task executions or file write collisions under simulated concurrent dispatch.
4. **Blast-radius containment:** 0 unauthorized file edits or command executions outside the repository's declared capability envelope.
5. **Independent verification integrity:** 100% of generated PRs or commits are gated by out-of-band verification receipts before promotion.
6. **Host interchangeability:** Swapping the host adapter (e.g., from Claude Code to a headless CLI runner) requires zero modifications to the core observation, policy, or verification rules.
