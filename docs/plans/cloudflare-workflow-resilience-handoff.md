# Cloudflare Workflow Resilience & Deployment Architecture Handoff

**Status:** READY FOR REVIEW  
**Date:** 2026-11-08  
**Scope:** `gaia-research/gaia-research`  
**Author:** mbtiongson1 <marco.tngsn@gmail.com>  

---

## 1. Executive Summary

This investigation analyzed recurring workflow and build failures in `gaia-research/gaia-research`, specifically focusing on Cloudflare deployment pipelines, PR build collisions, and GitHub Actions CI flakiness.

A comprehensive root-cause analysis across Cloudflare Workers Builds, GitHub CheckRuns, and GitHub Actions execution logs identified five distinct failure vectors. Rather than masking these symptoms, this change introduces a resilient, decoupled architecture that isolates PR validation from production deployment, prevents overlapping deployments, ensures actionable observability, and eliminates test-runner race conditions.

In response to independent review feedback (PR #330), this iteration establishes:
1. **Single Authoritative Deployment Pipeline:** Removes ambiguous check-run guessing. GitHub Actions acts as the canonical production release authority using authenticated Cloudflare credentials.
2. **Authoritative Deployed Revision Verification:** Verifies actual live release identity post-deploy via `/api/version`, asserting that `curl https://research.gaiaskilltree.com/api/version` matches `github.sha` within a bounded timeout.
3. **Fail-Closed Credentials:** Missing production credentials in `cloudflare-deploy.yml` fail closed (`exit 1`) to eliminate silent deployment bypasses.
4. **Manual Recovery Ref Guard & Rollback Safety:** Workflow dispatch validates that the checked-out ref matches current `origin/main` tip, preventing accidental stale code releases. A deliberate rollback requires explicit operator input (`force_rollback: true`).
5. **Comprehensive Trigger & Test Coverage:** Added `public/**` to deployment and website CI path filters, and integrated Vitest (`npm run test`) directly into `website-ci.yml`.
6. **Guaranteed Outcome Reporting:** Skipped or dry-run deployments can never report deployment success in the GitHub Step Summary.

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
* **Missing Paths & Coverage:** `website-ci.yml` omitted `open-next.config.ts`, `wrangler.jsonc`, and `public/**`, and did not execute unit tests.

### 2.3 Unconstrained PR Build Triggers on Cloudflare Workers Builds
* **Symptom:** Pure markdown and research idea-bank PRs (e.g. PR #320, #324, #325) triggered full Cloudflare Worker builds targeting the `production` service binding.
* **Mechanism:** The Cloudflare GitHub App integration (`cloudflare-workers-and-pages`, App ID 85455) was attached to the repository without branch filtering. Every branch push initiated a build against `production/builds/`, causing:
  - Wasted Cloudflare build minute quota.
  - Concurrency lock contention and build cancellation when multiple commits were pushed in quick succession.
  - Dual deployment race conditions with GitHub Actions releases.

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

## 3. Architecture Review & Deployment Authority Contract

### 3.1 Establishing a Single Authoritative Release Pipeline
To eliminate dual-authority race conditions between GitHub Actions and Cloudflare's Git integration:
1. **GitHub Actions owns the Canonical Release Gate:**
   - Every push to `main` triggers `.github/workflows/cloudflare-deploy.yml`.
   - The job validates dependencies, executes unit tests, builds the OpenNext bundle with the commit SHA baked in (`NEXT_PUBLIC_GIT_COMMIT_SHA: ${{ github.sha }}`), and deploys via authenticated `wrangler deploy`.
   - Bounded live-site release verification queries `https://research.gaiaskilltree.com/api/version` to prove that the newly deployed commit is actively serving before marking the release successful.
2. **Cloudflare Dashboard Configuration Directive:**
   - The repository operator must configure Cloudflare Workers Git integration to **disable automatic deployments on the `main` branch** (or disconnect Git auto-deployment).
   - This ensures Cloudflare never initiates an uncoordinated parallel build on `main` push.
3. **Manual Recovery & Rollback Safety:**
   - `workflow_dispatch` requires that the checked out commit equals the current `origin/main` tip before initiating deployment.
   - If an operator needs to roll back to an older commit, they must explicitly opt in with `force_rollback: true`.

---

## 4. Changes Implemented

1. **`package.json` & `package-lock.json`**:
   - Added `"tsx": "^4.23.15"` to `devDependencies`.
   - Pre-installs `tsx` during `npm ci`, eliminating on-the-fly npx downloads and cache collision bugs in CI.

2. **`app/api/version/route.ts` & `app/api/version/route.test.ts`**:
   - Dedicated release identity endpoint exposing `{ commitSha, status: "ok" }`.
   - Configured with `Cache-Control: no-store, no-cache, must-revalidate` for authoritative release verification.

3. **`.github/workflows/website-ci.yml`**:
   - Added path triggers for `open-next.config.ts`, `wrangler.jsonc`, and `public/**`.
   - Added `concurrency` with `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`.
   - Added `timeout-minutes: 15`.
   - Added `Run unit tests (Vitest)` step (`npm run test`).
   - Added `Verify OpenNext Cloudflare Worker build` step to ensure all PRs prove Cloudflare bundle compatibility before merging.

4. **`.github/workflows/cloudflare-deploy.yml`**:
   - Concurrency queue with `group: cloudflare-production-deploy, cancel-in-progress: false`.
   - Guard against stale ref deployments during manual dispatch.
   - Fail-closed credential validation.
   - Authoritative live-site release revision verification matching `${{ github.sha }}` via `/api/version`.
   - Bounded live-site route smoke checks (`/`, `/robots.txt`, `/blog`, `/research/orchestration-guide`, `/research/agent-playbook`).
   - Step summary reporting that strictly differentiates deployed, failed, dry run, and skipped outcomes.

---

## 5. Verification Evidence

- **Unit Test Suite:** 31 test files, 300/300 Vitest tests passing (`npm run test`).
- **Static Analysis & FS Check:** `npm run lint` clean (TypeScript check + edge fs usage check).
- **Lexicon Governance Gate:** `npx tsx scripts/lexicon/check-lexicon.ts --strict` clean (81 terms, 58 files scanned, 0 new findings).
- **Workflow Syntax Validation:** All `.github/workflows/*.yml` files parsed and verified.

---

## 6. Operational Recommendations for Repository Operator

1. **Disable Cloudflare Git Integration Auto-Deploy on `main`:**
   - In Cloudflare Dashboard: `Workers & Pages` -> `gaia-research` -> `Settings` -> `Builds` -> `Build triggers`:
   - Set automatic builds to "None" or restrict to PR preview branches only. This enforces GitHub Actions as the sole deployment authority.
2. **Provision Production Repository Secrets:**
   - Set `CLOUDFLARE_API_TOKEN` (Workers:Edit permissions) and `CLOUDFLARE_ACCOUNT_ID` in GitHub repository secrets under the `production` environment.
3. **Disable Deprecated GitHub Pages:**
   - In GitHub repository settings (`Settings` -> `Pages`), change `Source` from `Deploy from a branch` to `None` to prevent the failing legacy Jekyll workflow.
