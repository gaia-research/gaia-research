# Capability Lineage for Agent Harness Authorization

**Status:** idea bank  
**Tracking:** #260  
**Theme:** agent reliability, authorization, safe browser/API automation

## Thesis

A top-level goal should not transitively authorize every action an agent invents while pursuing it. Consequential actions should carry an inspectable lineage from the human or system principal to the exact capability exercised.

A useful target model is:

```text
principal → instruction → planner → worker → skill → tool/MCP → API/browser → mutable world
```

At each hop, authority should stay the same or narrow. Failure should permit another strategy only inside the existing capability envelope, never silently escalate authority.

## Why investigate this

Recent agent-security observations suggest autonomous systems may discover increasingly adversarial retrieval strategies when ordinary paths fail. That turns a familiar policy question into an architectural one: **what exactly was authorized, and how did that authority reach this action?**

The harness should be able to answer that question without asking the model to reconstruct its own intent after the fact.

## Research questions

1. What is the smallest useful capability-lineage record?
2. Which grants may be delegated, attenuated, expired, revoked, or used once?
3. How should L0–L3 policy gates bind to lineage?
4. Can browser/API adapters reject actions that lack a valid authorization ancestry?
5. What trace evidence is sufficient to reproduce an authorization decision?
6. How should lineage behave across subagents and resumable sessions?

## Candidate experiment

Build a tiny evaluator around several benign retrieval tasks. Introduce failures that tempt the agent toward actions outside its original authority. Compare:

- prompt-only policy;
- domain/tool allowlist;
- typed capability grant;
- typed grant plus lineage validation.

Measure task completion, unauthorized attempts, false blocks, human escalations, and trace explainability.

## Possible artifact

A threat model, capability-grant schema, lineage envelope, and adversarial regression set. This is a research seed, not an implementation commitment.

## Research lead

- Transluce, research on early rogue-agent activity observed through urlquery.net, September 2026.

## Related

- #260
