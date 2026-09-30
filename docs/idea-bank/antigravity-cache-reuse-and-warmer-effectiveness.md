# Research Idea: Antigravity Cache Reuse & Pi Cache-Warmer Effectiveness

- **Status:** In Ideation / Proposed Research (Unverified)
- **Rank:** 18 (Idea Bank)
- **Viability:** Medium (Pi can observe provider metadata; Antigravity gateway and billing ground truth may remain inaccessible)
- **Potential:** High (practical guidance for agent builders and a fact check for Gaia's provider-cache comparisons)
- **Primary Deliverable:** A version-pinned model/harness matrix separating reported cache reuse, missing telemetry, and background refresh behavior
- **Tracking Issue:** [#276](https://github.com/gaia-research/gaia-research/issues/276)
- **Related:** [#255](https://github.com/gaia-research/gaia-research/issues/255) (provider cache-horizon matrix) · [#275](https://github.com/gaia-research/gaia-research/issues/275) (presentation of the initial Pi probe)

## The question

When an agent uses an Antigravity-routed model, which parts of its repeated prompt are actually served from a cache, and can Pi's background cache warmer preserve that reuse? Treat this as a model-by-model question: Antigravity routes more than one model family, and the gateway's cache behavior must not be inferred from Gemini API or Vertex behavior alone.

## Why now

Sanitized Pi probes of Gemini 3.8 Flash show two distinct observations: terminal usage metadata sometimes omits `cachedContentTokenCount`, while later responses report positive cached-token counts that agree with Pi's parsed `cacheRead`. The provider adapter maps an absent field to zero, so the early zeros do not prove cache misses.

A separate Pi-side pilot successfully ran a background replay after adding a local scheduling hint and a guarded warmer policy. That confirms a replay can be sent; raw cache metadata for the replay was not captured, so it does **not** establish that the replay hit the Antigravity cache. The provider's implicit-cache lifetime is also not documented for this gateway. A scheduling hint is not a provider TTL.

This focused study would ground—and, if needed, correct—the Antigravity assumptions in the broader cache-economics idea rather than treating a cross-provider analogy as evidence.

## Questions to resolve

1. **Per-model behavior:** Do Antigravity-routed Gemini Flash, Gemini Pro, Claude, and other available families report cache usage consistently? Which exact model/version and thinking level was used?
2. **Telemetry semantics:** For each model, does the final response report a field, an explicit zero, or no field? Does Pi preserve the raw final value?
3. **Reuse conditions:** How do a stable shared prefix, changed context, and elapsed time affect reported hits? Do not infer prefix length from total prompt-token count.
4. **Warmer effectiveness:** Does a Pi refresh produce a subsequent verified hit, or merely a successfully completed replay? Does the expected avoided miss justify the refresh under a bounded budget?
5. **Product boundary:** Which results are documented provider/API capabilities, which are specific to Antigravity's gateway, and which depend on Pi configuration?

## Proposed method

- Inventory the currently available Antigravity models and supported reasoning levels; pin provider, model ID, and adapter version for each run.
- Use small, repeatable, read-only probes with synthetic non-sensitive context. Compare stable-prefix turns with controlled context changes and bounded time gaps.
- Capture only sanitized per-request metadata: model/level, request index and timing, terminal cache-field presence/value, Pi's final parsed cache usage, and whether a warmer replay ran. Never retain prompts, transcripts, request bodies, credentials, or secrets.
- Evaluate the warmer only when its lifetime assumption is explicit. Compare the raw terminal metadata for the refresh with the next ordinary request; a success notification alone is not a cache hit.
- Keep missing metadata unresolved unless an authoritative upstream signal is available. If financial or aggregate token figures are published, source them through canonical `skill-cost` with provenance.

## Guardrails and outcomes

- Do not call an absent field a miss, claim a cache-warming policy label means warming occurred, or generalize one Antigravity model's result to the catalog.
- Keep implicit conversational caching separate from explicit cached-content objects and their user-managed TTLs.
- A useful outcome may be a confirmed limitation: if the gateway withholds hit telemetry or no provider lifetime can be established, document that Pi cannot yet validate warmer effectiveness. Do not present a local TTL guess as an Antigravity guarantee.

The result should be a concise, evidence-linked model matrix and a recommendation on whether Pi warming is measurable and worthwhile for each tested model family. No product or policy decision is implied by this idea.

## Sources

- [Gemini API caching](https://ai.google.dev/gemini-api/docs/caching)
- [Vertex AI context caching](https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-overview) — related API surface; not proof of Antigravity gateway behavior.
- [Sanitized Pi Antigravity probe issue](https://github.com/gaia-research/gaia-research/issues/275)
