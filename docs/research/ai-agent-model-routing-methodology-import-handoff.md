# Research Methodology Import Handoff (2026-11-08)

## Implementation
Imported the supplied 501-line research methodology into `docs/research/ai-agent-model-routing-economics-methodology.md`, changing only the top-level heading to remove the agent-specific attribution. All sections, bibliography, inline URLs, equations, and wording below that heading are preserved.

## Reference spot-audit
The original has 361 Markdown link occurrences across 69 distinct URLs. Primary spot-checks established that key cited academic works and repositories exist, including FrugalGPT, RouteLLM, RouterBench, RouterArena, TwinRouterBench, LLMRouterBench, Triage, SWE-bench papers, NVIDIA Switchyard, TypeSafe JEV and OpenRouter's November 6 announcement. This is **not** a claim that every numerical assertion or every link was independently validated.

### Items for follow-up before scholarly publication
- **Hybrid LLM (Ding et al., ICLR 2024):** the manuscript links `github.com/microsoft/best-route-llm` as its source, but that repository describes a different BEST-Route project. Correct primary citation: https://arxiv.org/abs/2404.14618 or the ICLR proceedings.
- **UTBoost reference:** `https://casrai.org/guides/swe-bench` could not be retrieved. Actual UTBoost: https://arxiv.org/abs/2506.09289 and https://github.com/uiuc-kang-lab/UTBoost.
- `https://bufnets.tech/index.php/bufnets/article/view/188` returned a gateway error at verification time; citation needs independent checking.
- Secondary interpretations and the precise benchmark numbers/vendor-reported claims still need source-by-source scholarly audit. Vendor claims must remain labeled as such.

## Validation
- Preserved the original Markdown and extracted its 69 distinct linked URLs.
- Confirmed new repo path uses research-neutral naming and GitHub created the document on a dedicated branch.
- No experiments, paid inference benchmarks, source rewriting, website deployment, or merge.

## Outstanding
- Complete citation reconciliation and numerical provenance checking before any publication.
- Reviewer should inspect PR diff; no test suite or CI outcome claimed.
