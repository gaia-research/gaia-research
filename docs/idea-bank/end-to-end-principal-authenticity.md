# End-to-End Principal Authenticity Across the Agent Security Chain

**Status:** idea bank  
**Tracking:** #263  
**Theme:** agent security, input provenance, approval integrity

## Thesis

A secure tool boundary is insufficient if an attacker can manipulate the path before the instruction reaches the planner. Agent security should include the entire chain from principal input to world mutation.

```text
principal → client/input → planner → worker → skill → tool/MCP → network/API → mutable world
```

The harness should know not only whether an action was approved, but **who or what produced the instruction or approval, what exact action it covered, and whether that binding is still fresh**.

## Why investigate this

Agent-security designs increasingly harden execution with sandboxes, mediation, and human-in-the-loop gates. Client-side configuration, IPC, authentication handoff, input routing, and approval UI can remain separate trust surfaces. A strong gate in the middle does not compensate for an attacker impersonating the principal upstream.

## Research questions

1. What establishes principal authenticity for instructions and approvals?
2. Which local client/IPC/configuration surfaces belong in the harness threat model?
3. Should consequential approval bind principal identity, exact action, capability, context hash, and freshness nonce?
4. How should voice, dictation, browser extension, mobile handoff, and remote-control inputs declare provenance?
5. Can provenance survive subagent delegation without becoming ambient authority?
6. What should the trace preserve for later incident reconstruction?

## Candidate experiment

Create a toy privileged agent with a downstream approval gate, then attack the upstream input/configuration path. Measure which architectures distinguish authentic principal intent from manipulated input.

Test whether action-bound, fresh approvals remain safe when the client channel is partially compromised.

## Possible artifact

A boundary map, principal-authenticity invariants, approval-envelope proposal, and red-team scenarios.

## Research leads

- Meta's published Muse security architecture.
- Patrick Wardle / Objective-See research on client-side security boundaries.

## Related

- #263
