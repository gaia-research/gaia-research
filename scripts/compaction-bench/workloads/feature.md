# Workload B: Feature Build (30 turns)

Used in: Scenario 2 (Always-Warm), Scenario 4 (Compaction Curve)

Build a small Express API endpoint from scratch with validation, tests, and docs.

**Fixture:** `scripts/compaction-bench/fixtures/feature-repo/`

**Planted instruction (for Scenario 5c):** Turn 1 includes a directive the agent
must remember throughout the session. After compaction discards it, we check
whether the agent still follows it.

---

## Turn 1

You are working in a TypeScript Express project. **IMPORTANT: Throughout this entire session, always use TypeScript strict mode (`strict: true` in tsconfig) and never use `any` type — use `unknown` with type guards instead.** This is a non-negotiable project standard.

Read the existing `tsconfig.json` and `package.json` to understand the project setup.

## Turn 2

Create a new API endpoint at `POST /api/v1/bookmarks`. It should accept a JSON body with `{ url: string, title?: string, tags?: string[] }`. Create the route file at `src/routes/bookmarks.ts`.

## Turn 3

Add request validation using zod. The `url` field must be a valid URL. `title` must be ≤200 characters if provided. `tags` must be an array of ≤10 strings, each ≤50 characters.

## Turn 4

Create a `BookmarkService` class at `src/services/bookmark-service.ts` that handles the business logic. For now, store bookmarks in an in-memory Map keyed by a generated UUID.

## Turn 5

Wire the route to the service. The endpoint should return `201 Created` with the created bookmark (including the generated `id` and `createdAt` timestamp).

## Turn 6

Add error handling middleware. Invalid JSON should return 400. Validation errors should return 422 with the zod error details. Unexpected errors should return 500 with no stack trace.

## Turn 7

Register the route in `src/app.ts`. Make sure the Express app uses `express.json()` middleware.

## Turn 8

Write unit tests for the zod validation schema. Test valid inputs, missing url, url too long, too many tags, tag too long. Put tests in `src/routes/bookmarks.test.ts`.

## Turn 9

Write unit tests for the `BookmarkService`. Test create, duplicate detection (same URL), and retrieval.

## Turn 10

Run `npx vitest run` and report results. Fix any failures.

## Turn 11

Add a `GET /api/v1/bookmarks` endpoint that returns all bookmarks, sorted by `createdAt` descending.

## Turn 12

Add a `GET /api/v1/bookmarks/:id` endpoint that returns a single bookmark or 404.

## Turn 13

Add a `DELETE /api/v1/bookmarks/:id` endpoint that deletes a bookmark or returns 404.

## Turn 14

Write integration tests that test the full request-response cycle using supertest. Cover the happy path for POST, GET (list), GET (single), and DELETE.

## Turn 15

Run all tests. Fix failures.

## Turn 16

Add pagination to `GET /api/v1/bookmarks`. Accept `?page=1&limit=20` query params. Return `{ data: Bookmark[], pagination: { page, limit, total, totalPages } }`.

## Turn 17

Add a `PATCH /api/v1/bookmarks/:id` endpoint that accepts partial updates to `title` and `tags` (not `url` — URLs are immutable after creation).

## Turn 18

Write tests for pagination (edge cases: page 0, negative limit, limit > 100 should cap at 100).

## Turn 19

Write tests for PATCH (partial update, 404 on missing ID, reject URL change attempt).

## Turn 20

Run all tests. Report the total count and any failures.

## Turn 21

Add request logging middleware that logs `method`, `path`, `status`, and `duration_ms` for every request. Use `console.log` with JSON format.

## Turn 22

Add a `GET /api/v1/bookmarks/search?q=term` endpoint that searches bookmarks by title (case-insensitive substring match) and tags (exact match).

## Turn 23

Write tests for the search endpoint. Test: search by title, search by tag, no results, empty query returns 400.

## Turn 24

Run all tests. Fix any failures.

## Turn 25

Add JSDoc comments to every public method in `BookmarkService` and every route handler. Include `@param`, `@returns`, and example usage.

## Turn 26

Run `npx tsc --noEmit` to verify no type errors. Fix any issues.

## Turn 27

Review all files you created. List any code smells or improvements you would make.

## Turn 28

Write a comprehensive README section documenting the Bookmarks API: endpoints, request/response examples, error codes.

## Turn 29

List all files you created or modified in this session, with a one-line description of each.

## Turn 30

Say "BENCHMARK COMPLETE" and nothing else.
