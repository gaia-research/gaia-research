# MCP Trust Should Be Capability-Scoped, Not Server-Scoped

**Status:** idea bank  
**Tracking:** #261  
**Theme:** MCP security, tool governance, prompt injection

## Thesis

Trusting an MCP server is too coarse. A durable approval should authorize a narrow capability under explicit provenance and environmental assumptions, not everything a server may later induce an agent to do.

A possible trust key:

```text
publisher × source revision × endpoint × ownership × capability × approval scope × attestation
```

Changes to important dimensions should force re-evaluation rather than inherit ambient trust.

## Why investigate this

Large-scale MCP ecosystem measurements make the supply-chain problem less hypothetical. At the same time, prompt injection can interact badly with persistent tool approvals. The dangerous composition is not merely “malicious server”; it is **untrusted content + durable authority + agent-selected arguments/actions**.

## Research questions

1. What exactly should “always allow” mean in a least-authority MCP harness?
2. Can approval bind to a typed operation and data projection rather than a whole server?
3. Which endpoint, DNS, publisher, source, or schema changes invalidate prior approval?
4. How should the registry express provenance and freshness?
5. Can a server description or returned content cause authority to expand indirectly?
6. How should secrets and context be projected into tool calls?

## Candidate experiment

Construct a benign MCP server with several capabilities, grant one narrow persistent permission, then inject adversarial server metadata/content that attempts to exercise another capability.

Compare server-scoped approval with capability-scoped grants and explicit argument/data-flow policy.

## Possible artifact

An MCP trust-record schema, permission attenuation rules, provenance requirements, and a compact adversarial test suite.

## Research lead

- OX Security, large-scale MCP server governance/security measurement, September 2026.

## Related

- #261
