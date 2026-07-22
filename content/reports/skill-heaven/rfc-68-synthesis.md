# RFC-68 Synthesis: Agent-Computer Interface (ACI) Tiering and Tool Exposure

## 1. Executive Summary
This report synthesizes empirical and conceptual research on Agent-Computer Interface (ACI) scaling to address Issue #68. Raw tool exposure consistently degrades Large Language Model reasoning. This degradation is driven by five core factors: logit readout bottlenecks, cognitive bandwidth saturation, causal indeterminacy, tool-use toxicity, and sheer length-induced degradation. To mitigate this, we propose a formalized 5-Tier ACI design that dynamically bounds the tool frontier, alongside specific "firebreaks" to safely scale to multi-agent "Hell Mode."

## 2. The Empirical Problem of Context and Tool Bloat
Providing an LLM with massive tool schemas flatly degrades reasoning, even with perfect retrieval. The root cause is fundamentally structural:
* **"Looking Is Not Picking"**: Studies show this is not a perceptual failure. Attention maps confirm models localize the correct tool 80% of the time. The degradation is a decision readout bottleneck at the final logit projection layer caused by representational collisions of semantically similar tools.
* **Context Degradation**: Raw context length increases cause performance to plummet by 13.9% to 85% despite perfect retrieval. SWE-agent ablations reinforce this: a 100-line viewer achieved an 18.0% success rate versus 12.7% for a full-file view, and summarized search outperformed iterative search (18.0% vs 12.0%).
* **ToolChoiceConfusion**: Exposing causally unnecessary tools leads to erroneous selections. For instance, Causal Minimal Tool Filtering (CMTF) tests show exposing exactly 1 necessary tool yields a 0.99 success rate (with minimal token cost). Exposing 100 tools drops success to 0.83 and explodes costs. Keyword-based Top-10 and Top-5 retrieval fared even worse (0.72 and 0.61 success rates, respectively) due to semantic distractors.
* **Optimal Tool Frontiers**: The AnyTool framework found optimal performance with an active tool limit of 5, which degraded at 10 and completely saturated at 64 candidates. Similarly, using adaptive Bits-over-Random (BoR) policies on the BFCL benchmark boosted Claude Sonnet 4.6’s selection accuracy from 87.1% (static) to 93.1% (adaptive), achieving 90.8% coverage by presenting an average of just 7.4 tools.

## 3. The 5-Tier ACI Design
To manage ToolChoiceConfusion, we propose the 5-Tier ACI Slider, which harmonizes strict limits on Active Pools ($A$), Branching Factors ($B$), and exposure policies ($K$):

| Tier | Role / Configuration | Mechanism / Boundaries |
| :--- | :--- | :--- |
| **0. Off** | Pure parametric reasoning (triage, architecture review). | $A=0$. Zero tools. Relies entirely on pre-trained knowledge and in-context learning. |
| **1. Low** | Read-only/dry-run primitives (search, read, diff). | $A \le 4$ (ideally $1 \text{--} 2$). Driven by Causal Minimal Tool Filtering (CMTF) using precondition-effect contracts. |
| **2. Native** | Composable primitives (inspect, edit, patch, run). | $A = 5 \text{--} 16$. Uses adaptive Bits-over-Random (BoR) semantic retrieval to balance tool coverage and semantic distractors. |
| **3. High** | Complex workflows and macroscopic intent generation. | $A \le 32, B \le 5$. Hierarchical routing and DAG compilation (GraSP/ToolNet) to topologically enforce state dependencies. |
| **4. Max** | "Hell Mode" - Open registry execution (16,000+ APIs). | $A \le 64$ (or unbounded via pools). Relies entirely on multi-agent delegation, Agent-as-a-Graph pools, and wRRF routing. |

## 4. Firebreaks for "Hell Mode"
When scaling into Tier 4 (Max Tool Exposure), standard flat retrieval fails entirely. We require architectural "firebreaks" to safely navigate massive API environments:
* **Tool-MVR (Multi-Verification and Reflection)**: Drastically improves error recovery. Tool-MVR achieves a 58.9% error correction rate on reflection benchmarks, completely dwarfing the 9.1% rate of unconstrained ToolLLM baselines.
* **Isolated Hierarchical Planning**: AnyTool's hierarchical search and reflection boosted pass rates on massive API groups from 14.0% (plain GPT-4 sequential scan) to 73.8%. Ablating this hierarchy causes performance to crater (down to ~20%).
* **Self-Healing Routers & Compression**: To mitigate token bloat and control loops, Self-Healing Routers can reduce control-plane LLM calls by up to 93%, while tools like RS-Claw can improve input token compression ratios by up to 86%.

## 5. Conclusion
Raw tool exposure is an anti-pattern. Addressing Issue #68 requires enforcing a strict, dynamic ACI slider. By implementing CMTF at lower tiers, adaptive BoR at native tiers, and aggressive hierarchical Tool-MVR topologies at maximum exposure, we can bypass the logit readout bottleneck and preserve the LLM's cognitive bandwidth for actual reasoning.