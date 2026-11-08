# Cloudflare Workflow Resilience & Deployment Architecture Handoff

**Status:** READY FOR REVIEW  
**Date:** 2026-11-08  
**Scope:** `gaia-research/gaia-research`  
**Author:** mbtiongson1 <marco.tngsn@gmail.com>  

---

## 1. Executive Summary

This investigation analyzed recurring workflow and build failures in `gaia-research/gaia-research`, specifically focusing on Cloudflare deployment pipelines, PR build collisions, and GitHub Actions CI flakiness.

A comprehensive root-cause analysis across Cloudflare Workers Builds, GitHub CheckRuns, and GitHub Actions execution logs identified five distinct failure vectors. Rather than masking these symptoms, this change introduces a resilient, decoupled architecture that isolates PR validation from production deployment, prevents overlapping deployments, ensures actionable observability, and eliminates test-runner race conditions.

---

## 2. Confirmed Root Causes & Supporting Evidence

### 2.1 Earliest Failure: Next.js Version Incompatibility in OpenNext Build
* **Symptom:** Every PR check run named `Workers Builds: gaia-research` failed consistently across PRs #299, #301, #303, #305, #307, #309, #310, #313, #314, #315, and #316.
* **Mechanism:**
  - Cloudflare's connected Git integration triggers `npm run build` by default.
  - Prior to PR #317, `"build"` in `package.json` executed `opennextjs-cloudflare build`.
  - Upgrading Next.js to 15.4.x/15.5.x triggered `@opennextjs/cloudflare@1.20.1`'s strict version assertion:
    ```text
    Error: Next.js version 15.5.x is unsupported. Use --dangerouslyUseUnsupportedNextVersion to force.
    ```
  - While PR #317 resolved the script flag, the underlying organizational defect remained: **GitHub Actions CI never validated the OpenNext build**, so developers only saw failures after opening PRs or merging.

### 2.2 CI Validation Gap in `website-ci.yml`
* **Symptom:** `website-ci.yml` repeatedly passed green on PRs (e.g. PR #315, #316) while Cloudflare Workers Builds failed in the Cloudflare dashboard.
* **Mechanism:** `website-ci.yml` only executed `npm run build:next` (standard Next.js compiler), completely omitting `opennextjs-cloudflare build`. Any Cloudflare Worker edge-bundle failure, missing binding, or AST transform error went undetected until Cloudflare attempted deployment.
* **Missing Paths:** `website-ci.yml` did not trigger on changes to `open-next.config.ts` or `wrangler.jsonc`.

### 2.3 Unconstrained PR Build Triggers on Cloudflare Workers Builds
* **Symptom:** Pure markdown and research idea-bank PRs (e.g. PR #320, #324, #325) triggered full Cloudflare Worker builds targeting the `production` service binding.
* **Mechanism:** The Cloudflare GitHub App integration (`cloudflare-workers-and-pages`, App ID 85455) was attached to the repository without branch filtering. Every branch push initiated a build against `production/builds/`, causing:
  - Wasted Cloudflare build minute quota.
  - Concurrency lock contention and build cancellation when multiple commits were pushed in quick succession.
  - Risk of untracked build collisions with canonical production releases.

### 2.4 Race Conditions in Unit Tests Due to Missing `tsx` devDependency
* **Symptom:** `craft-ci.yml` run #42051308809 failed with `TAR_ENTRY_ERROR ENOENT` and `npm error ENOTEMPTY: directory not empty, rename .../tsx`.
* **Mechanism:**
  - `tsx` was not declared in `package.json` `devDependencies`.
  - Vitest test suites (such as `lib/arbor-evidence-loop.test.ts` and `lib/craft/sync-ygg2.test.ts`) invoke `npx tsx` child processes.
  - Running Vitest across multiple CPU threads triggered simultaneous, concurrent `npx` dynamic downloads into `~/.npm/_npx/fd45a72a545557e9/`, corrupting the shared extraction folder.

### 2.5 Legacy GitHub Pages Timeout
* **Symptom:** Dynamic workflow `pages build and deployment` ran on every push to `main` and timed out after 10 minutes (run #42051328147).
* **Mechanism:** GitHub Pages remained enabled pointing to `main` root `/` from an earlier Jekyll era, even though the site was migrated to Cloudflare (`research.gaiaskilltree.com`). GitHub Pages attempted to deploy the Next.js source repository as a static site and hung indefinitely.

---

## 3. Architecture Review & Tradeoff Analysis

| Dimension | Option 1: Deploy on Every PR Push | Option 2: Deploy on Merge to Main | Option 3: Isolated Workflow with Manual Recovery | **Proposed Hybrid (Adopted)** |
|---|---|---|---|---|
| **Trigger** | `pull_request` | `push: branches: [main]` | `workflow_dispatch` | `push: [main]` + `workflow_dispatch` |
| **Validation** | Coupled with deploy | Separate PR CI | Validation before manual deploy | PR CI gates bundle; Deploy verifies & ships |
| **Actions Quota** | Extremely high (burns quota on WIP commits) | Low (only on merged commits) | Zero automated (operator only) | **Minimal** (PR concurrency cancel, path filters) |
| **Cloudflare Overhead** | High (builds for every branch/fork) | Minimal (only canonical main) | Minimal | **Minimal** |
| **Recovery** | Push another commit | Push dummy commit to main | Operator-triggered from UI | **Immediate UI re-run / dry run dispatch** |
| **Concurrency Risk** | High (PR pushes collide) | Moderate (rapid merges collide) | Low (manual single queue) | **Zero** (`cancel-in-progress: false` queue) |

### Adopted Architecture:
1. **Validation Gating (PR Phase):**
   - `website-ci.yml` strictly validates: filesystem safety, Next.js build, OpenNext bundle compilation (`npm run build`), and Chromium Playwright visual audits.
   - Employs `concurrency: cancel-in-progress: true` for PRs to immediately abort superseded builds when new commits land.
2. **Production Deployment (`cloudflare-deploy.yml`):**
   - Automatically executes when relevant files merge into `main`.
   - Supports `workflow_dispatch` for manual operator recovery, emergency redeployment, and dry-run execution.
   - Uses `concurrency: group: cloudflare-production-deploy, cancel-in-progress: false` to ensure production deployments strictly queue and never abort mid-flight.
   - Enforces bounded retries (3 attempts with exponential backoff) for transient Cloudflare API/network glitches.
   - Emits structured `$GITHUB_STEP_SUMMARY` reports for clear operational observability.

---

## 4. Changes Implemented

1. **`package.json` & `package-lock.json`**:
   - Added `"tsx": "^4.23.15"` to `devDependencies`.
   - Pre-installs `tsx` during `npm ci`, eliminating on-the-fly npx downloads and cache collision bugs in CI.

2. **`.github/workflows/website-ci.yml`**:
   - Added path triggers for `open-next.config.ts` and `wrangler.jsonc`.
   - Added `concurrency` with `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`.
   - Added `timeout-minutes: 15`.
   - Added `Verify OpenNext Cloudflare Worker build` step to ensure all PRs prove Cloudflare bundle compatibility before merging.

3. **`.github/workflows/cloudflare-deploy.yml` (New Workflow)**:
   - Dedicated production deployment pipeline triggered on `push` to `main` and `workflow_dispatch`.
   - Concurrency queue with `cancel-in-progress: false` to guarantee deployment atomicity.
   - OpenNext worker compilation verification (`test -f .open-next/worker.js`).
   - Credential probing (`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`).
   - Bounded retries (up to 3 attempts with 10s backoff) for deployment execution.
   - Diagnostic step summary generation for auditability.

---

## 5. Verification Evidence

- **Unit Test Suite:** 30 test files, 299/299 Vitest tests passing (`npm run test`).
- **Static Analysis & FS Check:** `npm run lint` clean (TypeScript check + edge fs usage check).
- **Lexicon Governance Gate:** `npx tsx scripts/lexicon/check-lexicon.ts --strict` clean (81 terms, 57 files scanned, 0 new findings).
- **Workflow Syntax Validation:** All `.github/workflows/*.yml` files parsed and verified via YAML parser.
- **Dependency Integrity:** `npm ls tsx esbuild` verified tree compatibility with Node 22+ contract.

---

## 6. Remaining Risks & Operational Recommendations

1. **Cloudflare Dashboard Build Triggers:**
   - In Cloudflare Dashboard (`Workers & Pages` -> `gaia-research` -> `Settings` -> `Builds`):
   - Set **Build triggers** to build `main` only, or disable automatic PR builds. PR validation is now completely handled in GitHub Actions (`website-ci.yml`), which saves Cloudflare build limits.
2. **Repository Secrets Provisioning:**
   - To enable direct GitHub Actions deployment via `cloudflare-deploy.yml`, ensure `CLOUDFLARE_API_TOKEN` (Workers:Edit permissions) and `CLOUDFLARE_ACCOUNT_ID` are provisioned in GitHub repository secrets.
   - Until provisioned, `cloudflare-deploy.yml` gracefully compiles and verifies the bundle, logging setup instructions in the GitHub Step Summary.
3. **Disable Deprecated GitHub Pages:**
   - In GitHub repository settings (`Settings` -> `Pages`), change `Source` from `Deploy from a branch` to `None` to prevent the failing dynamic `pages build and deployment` action on `main`.
4. **Scheduled Registry Resync Token:**
   - `craft-registry-resync.yml` requires rotation of `GAIA_SKILL_TREE_RO_TOKEN` to resume daily synchronization with `gaia-research/gaia-skill-tree`.
