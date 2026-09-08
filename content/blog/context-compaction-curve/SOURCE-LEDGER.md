# Source Ledger — The Context Compaction Curve (Post 1 of 2)

Phase 1 research completed: 2026-09-08.
Refocused to Post 1 (cache-cold compaction economics): 2026-09-08.

Post 2 ("The 272k Tripwire") covers OpenAI long-context pricing and 1M-window
economics — see issue #220.

---

## Primary Source 1: Anthropic Prompt Caching TTL & Pricing

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

**Key model pricing used in the post (per 1M tokens):**

| Model | Base Input | 5m Cache Write | Cache Read | Output |
|---|---|---|---|---|
| Claude Sonnet 5 | $2.00 | $2.50 | $0.20 | $10.00 |
| Claude Sonnet 4.6 | $3.00 | $3.75 | $0.30 | $15.00 |
| Claude Haiku 4.5 | $1.00 | $1.25 | $0.10 | $5.00 |

---

## Primary Source 2: "Lost in the Middle" (Attention Degradation)

**Full citation:** Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2024). *Lost in the Middle: How Language Models Use Long Contexts.* Transactions of the Association for Computational Linguistics, 12, 157–173.

- **arXiv:** https://arxiv.org/abs/2307.03172
- **DOI:** https://doi.org/10.1162/tacl_a_00638
- **GitHub:** https://github.com/nelson-liu/lost-in-the-middle
- **Institution:** Stanford University, UC Berkeley, Samaya AI
- **Published:** Submitted 2023, published TACL February 2024 (1,051+ citations)

**Mechanism:** LLMs show a U-shaped retrieval accuracy curve — information at the beginning and end of long contexts is retrieved well, but information in the middle is severely degraded. This directly supports the claim that uncompacted contexts with important instructions buried in the middle will cause the model to miss them.

---

## Primary Source 3: "Scaling LLM Test-Time Compute" (Reasoning Token Dynamics)

**Full citation:** Snell, C., Lee, J., Xu, K., & Kumar, A. (2024). *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.* arXiv:2408.03314.

- **arXiv:** https://arxiv.org/abs/2408.03314
- **Institution:** UC Berkeley, Google DeepMind
- **Published:** August 2024

**Mechanism:** Test-time compute (reasoning tokens) scales with problem difficulty AND input complexity. When input entropy increases (noise, distractors in context), the model's internal search tree expands, generating more reasoning tokens. This supports the claim that bloated contexts inflate thinking token spend.

**Fabrication risk:** The idea doc claims "R² > 0.82" for thinking-tokens vs. prompt-length correlation and "5x–10x inflation." These are model-derived estimates, NOT measured from this paper. The post labels thinking token estimates as "model-derived projections, not empirical measurements."

---

## Sources Deferred to Post 2 (#220)

- **OpenAI long-context pricing** (272k cliff, 2× input / 1.5× output): verified but not used in Post 1.
- **Codex CLI auto-compaction defaults** (90% of context window, `model_auto_compact_token_limit`): verified but not used in Post 1.
- **GPT-5.6/GPT-6 pricing table**: verified but belongs in Post 2.

See the full verification in git history (commit `d6a9de69`, original source ledger).

---

## Fabrication Risks (Post 1)

1. **Thinking token estimates (1,200 / 1,500 / 4,000 / 8,000 per turn)** — directionally supported by Snell et al. but exact numbers are projections. **Mitigated:** post labels these as "model-derived projections, not empirical measurements" in both the worked math section and the table.
2. **"$0.39 cache miss at 100k"** — derived from published pricing ($3.75/M × 100k). **Mitigated:** post shows the math.
3. **"Sweet Spot Zone 40k–65k"** — a model prediction, not an empirical finding (benchmark suite not yet run). **Mitigated:** post frames as "model-derived prediction from published pricing, not yet validated by controlled benchmarks."
4. **"Compaction pays for itself after ~2 cache misses"** — derived from the cost model. **Mitigated:** post shows the arithmetic.
5. **"Rule of thumb: compact above 80k when cold"** — editorial recommendation derived from the cost model, not an empirically validated threshold. **Mitigated:** post explains the reasoning and lists exceptions.
