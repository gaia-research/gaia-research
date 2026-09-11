# Workload C: Refactor (25 turns)

Used in: Scenario 3 (Reasoning Token Inflation), Scenario 4 (Compaction Curve)

Refactor an existing 4-file callback-based module to async/await with
extracted types and proper error handling.

**Fixture:** `scripts/compaction-bench/fixtures/refactor-repo/`

---

## Turn 1

Read all four files in `src/data-pipeline/`:
- `fetcher.ts` — HTTP fetcher with callbacks
- `transformer.ts` — data transformation with callbacks  
- `loader.ts` — database loader with callbacks
- `pipeline.ts` — orchestrates fetch → transform → load with nested callbacks

Describe the current architecture and its problems.

## Turn 2

Create a new file `src/data-pipeline/types.ts`. Extract all shared types (FetchResult, TransformResult, LoadResult, PipelineConfig, PipelineError) into it. Do not modify the other files yet.

## Turn 3

Update `fetcher.ts` to import types from `types.ts` instead of defining them inline. Verify no type errors with `npx tsc --noEmit`.

## Turn 4

Update `transformer.ts` to import from `types.ts`. Verify no type errors.

## Turn 5

Update `loader.ts` to import from `types.ts`. Verify no type errors.

## Turn 6

Update `pipeline.ts` to import from `types.ts`. Verify no type errors.

## Turn 7

Now convert `fetcher.ts` from callback-based to async/await. The function signature should change from `fetch(url, callback)` to `async fetch(url): Promise<FetchResult>`. Replace the callback error handling with try/catch.

## Turn 8

Convert `transformer.ts` to async/await.

## Turn 9

Convert `loader.ts` to async/await.

## Turn 10

Convert `pipeline.ts` to async/await. The nested callback hell (`fetch → transform → load`) should become a clean sequential await chain.

## Turn 11

Run `npx tsc --noEmit`. Fix any type errors from the conversion.

## Turn 12

Add proper error handling to `fetcher.ts`: wrap HTTP errors in a custom `FetchError` class that preserves the URL and status code. Add retry logic (3 attempts with exponential backoff).

## Turn 13

Add proper error handling to `transformer.ts`: wrap validation errors in a `TransformError` that preserves the field name and expected type.

## Turn 14

Add proper error handling to `loader.ts`: wrap database errors in a `LoadError` that preserves the table name and operation.

## Turn 15

Update `pipeline.ts` to catch each stage's specific error type and wrap it in a `PipelineStageError` with the stage name.

## Turn 16

Write unit tests for `fetcher.ts`: test successful fetch, retry on 503, give up after 3 retries, timeout handling. Use vitest.

## Turn 17

Write unit tests for `transformer.ts`: test valid transformation, missing required field, type mismatch, null handling.

## Turn 18

Write unit tests for `loader.ts`: test successful load, duplicate key, connection error.

## Turn 19

Write unit tests for `pipeline.ts`: test full happy path, test that a fetch error is wrapped correctly, test that transform error preserves context.

## Turn 20

Run all tests. Fix failures.

## Turn 21

Add a `pipeline.run()` method that accepts a `PipelineConfig` with `concurrency: number` and processes multiple URLs in parallel using `Promise.allSettled`.

## Turn 22

Write tests for the concurrent pipeline: test 3 URLs with 2 concurrency, test that one failure doesn't stop others.

## Turn 23

Run all tests. Fix failures.

## Turn 24

Review all modified files. Are there any remaining callback patterns? Any `any` types? Any missing error handling paths? Fix them.

## Turn 25

Say "BENCHMARK COMPLETE" and nothing else.
