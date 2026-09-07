# Source Ledger — The Context Compaction Curve

Phase 1 research completed: 2026-09-08.

---

## Primary Source 1: OpenAI Long-Context Pricing

**Claim:** Prompts exceeding 272,000 input tokens trigger a 2× input / 1.5× output multiplier on the entire request.

**Verified:** ✅ YES — from https://openai.com/api/pricing/ and https://developers.openai.com/api/docs/pricing

- "Pricing above reflects standard processing rates for context lengths under 272K."
- Confirmed multipliers across GPT-5.6 family (Sol, Terra, Luna) and GPT-6 Astra:
  - **Input: 2× base** (e.g. GPT-5.6-Terra: $2.00 → $4.00 / 1M)
  - **Cached input: 2× base** (e.g. GPT-5.6-Terra: $0.20 → $0.40 / 1M)
  - **Cache writes: 2× base** (e.g. GPT-5.6-Terra: $2.50 → $5.00 / 1M)
  - **Output: 1.5× base** (e.g. GPT-5.6-Terra: $12.00 → $18.00 / 1M)
- **The threshold is 272K tokens** — a billing boundary, not an architectural limit.

**Key models with long-context pricing (per 1M tokens):**

| Model | Short Input | Long Input | Short Output | Long Output |
|---|---|---|---|---|
| GPT-6 Astra | $10.00 | $20.00 | $50.00 | $75.00 |
| GPT-5.6 Sol | $4.00 | $8.00 | $20.00 | $30.00 |
| GPT-5.6 Terra | $2.00 | $4.00 | $12.00 | $18.00 |
| GPT-5.6 Luna | $0.20 | $0.40 | $1.20 | $1.80 |

---

## Primary Source 2: Anthropic Prompt Caching TTL & Pricing

**Claim:** Anthropic's prompt cache has a 5-minute TTL; cache writes cost 1.25× base; cache reads cost 0.10× base.

**Verified:** ✅ YES — from https://platform.claude.com/docs/en/build-with-claude/prompt-caching

- Default cache TTL: **5 minutes** (refreshed on each hit at no cost).
- 1-hour TTL available at **2× base input price** for cache writes.
- 5-minute cache writes: **1.25× base input price**.
- Cache reads: **0.10× base input price** (90% discount).
  - Exception: Claude Fable 5.1 and Mythos 5.1 use 0.025× (97.5% discount).
- Minimum cacheable prefix: 512–4,096 tokens depending on model family.
- TTL was **silently reduced from 1 hour to 5 minutes** in early March 2026 (confirmed by multiple independent sources).

**Anthropic does NOT have a long-context pricing surcharge** — 1M-context requests bill at standard per-token rates.

**Key model pricing for the post (per 1M tokens):**

| Model | Base Input | 5m Cache Write | Cache Read | Output |
|---|---|---|---|---|
| Claude Sonnet 5 | $2.00 | $2.50 | $0.20 | $10.00 |
| Claude Sonnet 4.6 | $3.00 | $3.75 | $0.30 | $15.00 |
| Claude Haiku 4.5 | $1.00 | $1.25 | $0.10 | $5.00 |

---

## Primary Source 3: Codex CLI Auto-Compaction

**Claim (from idea doc):** Codex defaults to auto-compacting at 272,000 tokens.

**Verified:** ⚠️ PARTIALLY CORRECT — needs correction.

- Config key: `model_auto_compact_token_limit` in `~/.codex/config.toml`
- **The default is NOT a fixed 272k.** It is **90% of the model's context window**, capped by a hard ceiling introduced in v0.100.0:
  ```
  effective_auto_compact_limit = min(user_config_limit, context_window * 90%)
  ```
- For a model with a ~302k context window, 90% ≈ 272k. This is where the "272k" figure originates.
- Values above 90% of the context window are **silently ignored** (GitHub issue #11805).
- The config is user-adjustable **downward** but not upward beyond the 90% cap.
- Companion key: `model_auto_compact_token_limit_scope` controls whether the threshold counts the full active context (`total`, default) or only growth after the compaction prefix (`body_after_prefix`).

**Source:** https://codex.danielvaughan.com/2026/03/31/codex-cli-context-compaction-architecture/ and https://learn.chatgpt.com/docs/config-file/config-reference

**Correction for post:** Say "90% of context window (≈272k for a 302k-window model)" — not "272k" as a universal constant.

---

## Primary Source 4: "Lost in the Middle" (Attention Degradation)

**Full citation:** Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2024). *Lost in the Middle: How Language Models Use Long Contexts.* Transactions of the Association for Computational Linguistics, 12, 157–173.

- **arXiv:** https://arxiv.org/abs/2307.03172
- **DOI:** https://doi.org/10.1162/tacl_a_00638
- **GitHub:** https://github.com/nelson-liu/lost-in-the-middle
- **Institution:** Stanford University, UC Berkeley, Samaya AI
- **Published:** Submitted 2023, published TACL February 2024 (1,051+ citations)

**Mechanism:** LLMs show a U-shaped retrieval accuracy curve — information at the beginning and end of long contexts is retrieved well, but information in the middle is severely degraded. This directly supports the claim that uncompacted contexts with important instructions buried in the middle will cause the model to miss them.

---

## Primary Source 5: "Scaling LLM Test-Time Compute" (Reasoning Token Dynamics)

**Full citation:** Snell, C., Lee, J., Xu, K., & Kumar, A. (2024). *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.* arXiv:2408.03314.

- **arXiv:** https://arxiv.org/abs/2408.03314
- **Institution:** UC Berkeley, Google DeepMind
- **Published:** August 2024

**Mechanism:** Test-time compute (reasoning tokens) scales with problem difficulty AND input complexity. When input entropy increases (noise, distractors in context), the model's internal search tree expands, generating more reasoning tokens. This supports the claim that bloated contexts inflate thinking token spend.

**Fabrication risk:** The idea doc claims "R² > 0.82" for thinking-tokens vs. prompt-length correlation and "5x–10x inflation." These are model-derived estimates, NOT measured from this paper. Must be labelled illustrative or derived from cost-model projections, not attributed to Snell et al.

---

## Fabrication Risks Identified

1. **"R² > 0.82" correlation** — not from any cited source; must label illustrative or remove.
2. **"5x–10x thinking token inflation"** — directionally supported by Snell et al. but the exact range is a projection, not a measurement.
3. **"$0.94 vs $0.19 cache miss cost"** — derived from the cost model at specific context sizes, not measured. Post must show the math or label as calculated.
4. **"Sweet Spot Zone 40k–65k"** — a model prediction, not an empirical finding (benchmark suite not yet run). Must be framed as model-derived.
5. **The 272k number** — is OpenAI's pricing cliff, but Codex CLI's compaction default is 90% of context window, not a hardcoded 272k.
