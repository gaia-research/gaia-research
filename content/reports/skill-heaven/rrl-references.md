# Bibliography & References: Skill-Heaven ACI Architecture

This document extracts and formalizes the canonical literature referenced in the Skill-Heaven Agent-Computer Interface (ACI) Tiering RRLs. Since the original documents utilized inline search engine citations, this list provides the formalized academic paper titles, core systems, and their specific architectural contributions to the RFC #68 blueprint.

## Core Agent-Computer Interface (ACI) & Interface Design

* **SWE-agent**: *SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering* (Yang et al., 2024). 
  * *Context:* Cited for isolating ACI design as a primary performance variable and proving that bounded, constrained interfaces (e.g., 100-line viewers, syntax-checked edits) drastically outperform raw Linux shell exposure.
* **CodeAct**: *Executable Code Actions Elicit Better LLM Agents* (Wang et al., 2024). 
  * *Context:* Cited for demonstrating that unifying action spaces into executable Python code improves success rates up to 20% over fragmented JSON tool schemas.
* **Context Length Degradation**: *Context Length Alone Hurts Large Language Models Despite Perfect Retrieval* (Shi et al., 2023/2024). 
  * *Context:* Cited for empirical proof that sheer input length degrades reasoning performance (by 13.9% to 85%) even when irrelevant context is masked or the correct tool is perfectly retrieved.
* **Looking Is Not Picking (Attention Bottlenecks)**: 
  * *Context:* Cited for activation-space evidence that models often correctly *attend* to the gold tool in a bloated context but suffer readout collisions at the final logit layer (ToolChoiceConfusion).

## Massive Tool Orchestration & Retrieval

* **ToolLLM / ToolBench**: *ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs* (Qin et al., 2023). 
  * *Context:* Cited as the foundational baseline for massive API ecosystems, proving the necessity of neural retrieval pipelines over flat tool exposure.
* **AnyTool**: *AnyTool: Self-Reflective, Hierarchical Agents for Large-Scale API Calls* (2024). 
  * *Context:* Cited for demonstrating that placing 16k tools into a 128k context window collapses performance. Introduced hierarchical meta/category/tool agent routing and identified the empirical ~64-API active exposure saturation point.
* **ToolNet**: *ToolNet: Connecting Large Language Models with Massive Tools via Tool Graph* (2024). 
  * *Context:* Cited for replacing flat retrieval with directed tool graphs and transition probabilities, revealing that ~80% of tools have fewer than 6 valid successor choices in real-world use.
* **ToolGen**: *ToolGen: Unified Tool Retrieval and Execution via LLM Parameters* (2024). 
  * *Context:* Cited as a unique counter-architecture that avoids context bloat by moving the tool universe out of prompt space and embedding tools directly into model parameter space as virtual tokens.
* **ToolRet**: *Retrieval-Augmented Tool Learning / Tool Retriever*. 
  * *Context:* Cited for demonstrating that conventional dense retrievers struggle heavily with tool sparsity, showing that retrieval failure is a primary bottleneck that directly degrades downstream multi-step pass rates.
* **GraSP (Graph-Structured Skill Compositions)**: 
  * *Context:* Cited for adding a compilation layer that transforms retrieved skills into typed Directed Acyclic Graphs (DAGs) to enforce execution preconditions and isolate failures to topological descendants.
* **CMTF (Causal Minimal Tool Filtering)**: 
  * *Context:* Cited for solving semantic retrieval collisions by treating tools as strict precondition-effect STRIPS contracts, exposing exactly 1 necessary tool per step instead of a Top-K semantic list.

## Hallucination, Tool-Use Toxicity & Mitigation

* **ToolBeHonest**: *ToolBeHonest: Benchmarking Tool Hallucination in Large Language Models*. 
  * *Context:* Cited for finding that the primary source of tool failure in LLMs is not syntax, but the misjudgment of *solvability* and tool necessity.
* **When2Tool**: *When2Tool: Tool Necessity Decodability*. 
  * *Context:* Cited for showing that tool necessity is linearly decodable from pre-generation hidden states (AUROC 0.89–0.96), enabling a lightweight "Probe&Prefill" classifier to prevent premature tool invocation.
* **Tool-MVR**: *Tool-MVR: Meta-Verification and Reflection for Tool Use*. 
  * *Context:* Cited for establishing the Multi-Agent Meta-Verification (MAMV) pipeline. It boosts error correction rates to 58.9% (vs 9.1%) by enforcing a secondary critic agent to reflect on schema validity before execution.
* **Relign**: *Relign: Re-aligning LLMs for Tool Use*. 
  * *Context:* Cited for mitigating tool hallucinations by introducing an "indecisive action space" (e.g., *TalkToUser*, *ChangeTools*) so models are not forced to hallucinate when preconditions are unmet.
* **SMART**: 
  * *Context:* Cited for identifying the "tool overuse bias," where models unnecessarily invoke external APIs even when their internal parametric knowledge is sufficient for the goal.

## Frameworks & Applied Benchmarks

* **Berkeley Function-Calling Leaderboard (BFCL)**: 
  * *Context:* Standard benchmark cited for evaluating tool shortlist sizing and chance-corrected BoR (Bits-over-Random) retrieval metrics.
* **RS-Claw**: *RS-Claw: Remote Sensing Autonomous Agents*. 
  * *Context:* Cited for using Hierarchical Skill Trees (Summary $\rightarrow$ Catalog $\rightarrow$ Documentation) to aggressively compress token exposure by 86%, freeing up context window capacity for spatial reasoning.