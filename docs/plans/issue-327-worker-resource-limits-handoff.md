# Cloudflare Worker Resource Limits Investigation & Runtime Mitigation Handoff (Issue #327)

**Status:** READY FOR REVIEW (Issue #327 Remains Open Pending Production Observation)  
**Date:** 2026-11-08  
**Scope:** `gaia-research/gaia-research`  
**Issue:** [Issue #327: infra(cloudflare): investigate intermittent Worker resource-limit errors on guide/preview routes](https://github.com/gaia-research/gaia-research/issues/327)  
**Author:** mbtiongson1 <marco.tngsn@gmail.com>  

---

## 1. Executive Summary

This investigation analyzed intermittent Cloudflare Worker `Worker exceeded resource limits` errors (HTTP 500/503) reported on `/research/orchestration-guide`.

In response to independent review feedback (PR #330), this handoff separates **local algorithm measurements from unverified production isolate assertions**. Production Cloudflare traces have not yet been extracted, so **Issue #327 remains explicitly OPEN**.

This PR provides a **targeted, reversible runtime mitigation**: module-level memoization (`createMarkdownMemoizer`) of the compiled Markdown React node tree inside `app/research/orchestration-guide/page.tsx`. This avoids repeated Markdown AST construction and KaTeX math parsing on subsequent requests within a warm isolate, significantly reducing local CPU time and memory churn while preserving 100% byte-for-byte AST and figure parity.

---

## 2. Technical Investigation & Root Cause Hypotheses

### 2.1 Failure Modalities Under Evaluation
1. **CPU & Isolate Workload (Primary Local Finding):**
   - The Orchestration Guide renders a 40.7 KB Markdown document with extensive LaTeX mathematical expressions via `remarkMath` and `rehypeKatex`.
   - On local Node.js benchmarks (`scripts/bench-guide-render.ts`), an unmemoized compile requires **~327 ms wall time and ~761 ms CPU time per render** across the full remark/rehype pipeline.
   - In a shared Cloudflare Worker isolate receiving rapid sequential requests or concurrent browser router prefetches (`RSC: 1`, `Next-Router-Prefetch: 1`), repeated synchronous KaTeX compilations pose a significant risk of exceeding CPU execution limits or exhausting isolate heap.
2. **Subrequest Limits (50/request):**
   - Confirmed: No external HTTP subrequests occur during `/research/orchestration-guide` rendering. Subrequest exhaustion is ruled out for this route.
3. **OpenNext Static vs Dynamic Execution Path:**
   - Although the route declares `dynamic = "force-static"` and `revalidate = false`, OpenNext bundle compilation embeds route-handling logic within the worker entrypoint. Under certain routing conditions or RSC prefetch requests, worker execution paths are invoked.

### 2.2 Rejection of `staticAssetsIncrementalCache` Workaround
* Investigation evaluated enabling `@opennextjs/cloudflare`'s `staticAssetsIncrementalCache` in `open-next.config.ts`.
* **Finding:** Upstream OpenNext issue #1454 documents that `staticAssetsIncrementalCache` causes prerendered pages to return 404 in production with Next.js >=15.5 because internal route-cache keys containing `$` trigger 307 redirects from Cloudflare's asset server.
* **Decision:** We avoided enabling experimental cache interception or introducing unratified R2/KV infrastructure. Instead, we addressed the expensive in-isolate render work directly.

---

## 3. Implementation: Reversible Runtime Mitigation

1. **Dedicated Memoizer Utility (`lib/orchestration-guide-memoizer.ts`):**
   - Implements `createMarkdownMemoizer<T>(compiler: () => T)` with explicit compilation tracking (`getCompileCount`) and invalidation support (`reset`).
2. **Page Integration (`app/research/orchestration-guide/page.tsx`):**
   - Moved `markdownComponents` to module scope.
   - Wrapped the Markdown compilation in `guideContentMemoizer = createMarkdownMemoizer(...)`.
   - On isolate boot, the first request compiles the Markdown AST and KaTeX math expressions once.
   - Subsequent requests (and concurrent prefetches handled by the same isolate) reuse the precompiled React tree directly.
3. **Scope & Invalidation Guarantees:**
   - Content is static and bundled at build time; there is no user-specific state or risk of cross-request data leakage.
   - Deployments instantiate fresh worker isolates, ensuring updated Markdown content is immediately active upon release.

---

## 4. Reproducible Benchmark & Parity Verification

A reproducible benchmark script is checked in at `scripts/bench-guide-render.ts`. It executes the complete Markdown pipeline (`remarkGfm`, `remarkMath`, `rehypeKatex`, `rehypeGuideFigures`, `rehypeTableLabels`) on `content/reports/orchestration-guide/guide.md`.

### 4.1 Benchmark Results (Local Node.js v24 / ARM64)
Command: `npx tsx scripts/bench-guide-render.ts`

| Metric | Unmemoized (5 runs) | Memoized (5 runs) | Difference |
|---|---|---|---|
| **Wall Time per Call** | 327.2 ms | 41.7 ms | **7.9× faster** |
| **CPU Time per Call** | 761.8 ms | 79.3 ms | **9.6× faster** |
| **Output AST Length** | 453,889 chars | 453,889 chars | **Exact Match** |
| **AST Parity Check** | Baseline | Identical | **100% byte parity** |

*Note: These measurements demonstrate algorithm efficiency in local Node.js. Production Cloudflare Worker isolate performance will vary and must be confirmed via Cloudflare traces.*

### 4.2 Test Suite Verification
- `lib/orchestration-guide-memoization.test.ts`: 3/3 tests pass (behavioral memoizer compilation count, full-pipeline AST and figure parity, and page integration).
- `lib/orchestration-guide.test.ts`: 3/3 tests pass (content, ladder, and prompt contract assertions).
- `npm run lint`: Clean (TypeScript check and edge filesystem check pass).
- `npx tsx scripts/lexicon/check-lexicon.ts --strict`: Clean (81 terms, 59 files scanned, 0 findings).

---

## 5. Required Follow-up & Production Observation

1. **Keep Issue #327 Open:**
   - Do not close Issue #327 upon merging this PR.
   - Keep the issue open as an active tracker until Cloudflare production logs (or `wrangler tail`) provide concrete evidence of error rates post-rollout.
2. **Post-Deployment Verification:**
   - Once deployed via PR #326's authoritative Actions pipeline, monitor Cloudflare Workers analytics for `exceededCpu` and `exceededMemory` metrics on `/research/orchestration-guide`.
   - Execute live browser prefetch smoke tests against `https://research.gaiaskilltree.com/research/orchestration-guide` to verify real isolate stability.
