# Agent Plugin Discoverability: From Problem Statement to First Use

**Status:** idea bank  
**Tracking:** #280  
**Theme:** agent plugins, marketplace discovery, tool selection, distribution

## Thesis

Agent-plugin discoverability is a machine-retrieval problem as much as a human marketing problem.

A useful plugin has to survive an end-to-end selection chain:

```text
ordinary problem statement
→ catalog / marketplace retrieval
→ capability match
→ trust choice
→ install / enable
→ successful first use
```

Optimizing only the repo name, launch post, or storefront copy can leave the plugin invisible to the agent that is actually deciding which capability to use.

## Why investigate this

Skill Heaven already ships as an Agent Plugin and has tested client-registration paths, including Claude marketplace compatibility. That makes it a practical subject for asking a more general question: **what metadata and evidence make an agent independently find the right plugin when the user never names it?**

The answer could inform how agent plugins should describe themselves across future catalogs, marketplaces, registries, and tool-selection layers.

## Research questions

1. When a user states a problem instead of a product name, which fields influence retrieval most: title, summary, capability verbs, examples, categories, tags, manifest metadata, README text, publisher identity, or usage evidence?
2. Does the vocabulary an agent uses to search differ from the vocabulary humans use in storefront search?
3. What makes a retrieved plugin lose at selection time: ambiguous scope, weak trust signals, installation friction, unclear first action, or overlapping competitors?
4. Which signals transfer across ChatGPT and Claude discovery surfaces, and which are platform-specific?
5. Can discoverability be measured with blind prompts without leaking the target plugin into the evaluator context?
6. What is the minimum metadata package that gets a fresh agent from “I have this problem” to one successful plugin action?

## Candidate experiment

Use Skill Heaven as the instrumented subject.

- Build five realistic, problem-first prompts per platform where Skill Heaven is relevant, but never mention Skill Heaven, Gaia, or its command names.
- Run fresh agent sessions against the current officially supported ChatGPT and Claude discovery surfaces.
- Record four stages separately: retrieved, selected, activated, successful first action.
- Patch only discoverability-facing surfaces such as marketplace/listing metadata, manifests, structured descriptions, README first-scroll language, and examples.
- Repeat with fresh sessions and keep a before/after iteration ledger.

Before testing, verify the current official publishing/discovery mechanism for each platform. If a public marketplace path does not exist or is account-gated, record that constraint rather than treating a local install as marketplace success.

## Proposed success threshold

For each supported platform surface:

- **Discovery:** Skill Heaven is independently surfaced or recommended in at least **4/5** blind relevant prompts.
- **Selection quality:** at least **4/5** runs explain the fit without invented capabilities.
- **Activation:** at least **one fresh end-to-end run** reaches a working Skill Heaven action.

Iterate until the threshold is met or a platform-owned blocker is evidenced.

## Possible artifacts

- A concise field guide to agent-plugin discoverability: **metadata → retrieval → selection → activation**.
- A reusable blind-prompt evaluation harness for plugin discovery.
- Before/after Skill Heaven receipts showing which discoverability changes moved the result.

## Execution handoff

Marketing execution is tracked as `MARKETING-2026-083` in `gaia-research/marketing-tasks`.

## Related

- #280
- `gaia-research/gaia-skill-heaven`
