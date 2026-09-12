# Workload A: Bugfix (20 turns)

Used in: Scenario 1 (Cache-Cold Return)

This workload has a pre-broken TypeScript file with a failing test.
The agent must locate the bug, fix it, and verify.

**Fixture:** `scripts/compaction-bench/fixtures/bugfix-repo/`

---

## Turn 1

Read the file `src/utils/parse-config.ts` and the test file `src/utils/parse-config.test.ts`. Understand the purpose of the `parseConfig` function.

## Turn 2

Run the test suite with `npx vitest run src/utils/parse-config.test.ts` and report the failure.

## Turn 3

The test "should handle nested config keys with dot notation" is failing. Examine the function logic that handles dot-notation keys like `database.host`.

## Turn 4

Identify the root cause. The `splitKey` helper is splitting on ALL dots including those inside quoted strings. Explain the bug.

## Turn 5

Fix the `splitKey` function to correctly handle dots inside quoted values. Do not change the test.

## Turn 6

Run the tests again to verify your fix passes.

## Turn 7

There is a second failing test: "should preserve array indices in paths". Read it and understand what it expects.

## Turn 8

The issue is that array bracket notation `config[0].name` is not being parsed. Fix the path parser to handle brackets.

## Turn 9

Run all tests again. Report the results.

## Turn 10

Add a new test case: `parseConfig` should throw a `ConfigError` with message "Circular reference detected" when a config value references its own key path. Write the test.

## Turn 11

Implement the circular reference detection in `parseConfig`. Use a visited-keys set.

## Turn 12

Run all tests. Fix any failures.

## Turn 13

Add JSDoc comments to the `parseConfig` function and the `splitKey` helper. Include `@param`, `@returns`, and `@throws` tags.

## Turn 14

Run `npx tsc --noEmit` to check for type errors. Fix any issues.

## Turn 15

Review the entire `parse-config.ts` file. Is there any remaining code smell? Refactor if needed, but do not change behavior.

## Turn 16

Run the full test suite one final time. Report pass/fail count.

## Turn 17

Write a one-paragraph summary of what you changed and why. Format as a commit message.

## Turn 18

List all files you modified in this session.

## Turn 19

If you had to do this task again from scratch, what would you do differently? Answer in 2-3 sentences.

## Turn 20

Say "BENCHMARK COMPLETE" and nothing else.
