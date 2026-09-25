# Blast-Radius Metrics for Agent Harness Evaluation

**Status:** idea bank  
**Tracking:** #262  
**Theme:** agent evaluation, reliability, operational safety

## Thesis

Task success is not enough to compare agent harnesses. Two agents can produce the same correct outcome while consuming radically different amounts of authority, infrastructure, money, human attention, and irreversible world change.

Evaluate the **shape of the run**, not only the finish line.

## Candidate evaluation vector

```text
success
elapsed_time
human_interventions
systems_touched
actions_or_tool_calls
cost
peak_privilege
externally_visible_actions
irreversible_actions
rollback_burden
```

This is deliberately not a single score at first. Collapsing it too early could hide the trade-offs we are trying to expose.

## Why investigate this

Recent analyses of agentic misuse emphasize uplift through speed, scale, and depth. The same dimensions are useful defensively. A harness that succeeds by spraying actions across a broad surface may be less reliable operationally than one that reaches the same result through a bounded path.

## Research questions

1. Which blast-radius dimensions are model-independent enough to standardize?
2. How do we distinguish productive breadth from unnecessary surface expansion?
3. What should count as irreversible?
4. Can rollback burden be measured mechanically?
5. How should human approval events appear in the vector?
6. Do these metrics predict incidents better than task-success benchmarks alone?

## Candidate experiment

Run equivalent browser/API tasks under multiple harness policies and model tiers. Hold the task outcome constant where possible, then compare operational footprints.

Look specifically for cases where “better benchmark performance” hides wider authority use or larger cleanup cost.

## Possible artifact

A harness-evaluation schema, reference tasks, trace extractor, and visualization of success versus operational footprint.

## Research lead

- Anthropic, *Detecting and countering misuse of AI: September 2026*, especially the assistant-to-orchestrator framing.

## Related

- #262
