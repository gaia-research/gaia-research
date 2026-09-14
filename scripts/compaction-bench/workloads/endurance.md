# Workload D: Endurance (50 turns)

Used in: Scenario 6 (1M Window Endurance Test — no compaction)

Full feature lifecycle: spec → plan → scaffold → implement → test → debug →
document → refactor. Designed to push context past 200k+ tokens.

**Fixture:** `scripts/compaction-bench/fixtures/feature-repo/` (same as Workload B)

---

## Turn 1

Read the project structure. You are building a **Task Queue system** — an in-memory priority queue with workers, retry logic, and a REST API. List what files you expect to create.

## Turn 2

Create `src/queue/types.ts` with these types: `Task`, `TaskStatus`, `TaskPriority`, `TaskResult`, `QueueConfig`, `WorkerConfig`. A Task has `id`, `payload`, `priority`, `status`, `createdAt`, `startedAt`, `completedAt`, `attempts`, `maxAttempts`, `result`.

## Turn 3

Create `src/queue/task-queue.ts` — the core priority queue. Implement `enqueue(task)`, `dequeue(): Task | null` (highest priority first, FIFO within same priority), `peek()`, `size()`.

## Turn 4

Write tests for the task queue: enqueue/dequeue order, priority ordering, empty queue returns null.

## Turn 5

Run tests. Fix failures.

## Turn 6

Create `src/queue/worker.ts` — a Worker that processes tasks. It takes a `handler: (task) => Promise<TaskResult>`, polls the queue, and processes one task at a time.

## Turn 7

Add retry logic to the Worker: if a task fails and `attempts < maxAttempts`, re-enqueue it with exponential backoff delay.

## Turn 8

Write tests for the Worker: successful processing, retry on failure, give up after maxAttempts, backoff timing.

## Turn 9

Run tests. Fix failures.

## Turn 10

Create `src/queue/worker-pool.ts` — a WorkerPool that manages N workers. Implement `start(n)`, `stop()`, `scale(n)`, `getStats()`.

## Turn 11

Write tests for WorkerPool: start 3 workers, scale up to 5, scale down to 2, stop all.

## Turn 12

Run tests. Fix failures.

## Turn 13

Create `src/queue/dead-letter-queue.ts` — tasks that exceeded maxAttempts go here. Implement `add(task, lastError)`, `list()`, `retry(taskId)`, `purge()`.

## Turn 14

Wire the dead-letter queue into the Worker: when a task exceeds maxAttempts, move it to the DLQ instead of dropping it.

## Turn 15

Write tests for DLQ integration: task fails 3 times → appears in DLQ → retry moves it back to main queue.

## Turn 16

Run all tests. Fix failures.

## Turn 17

Create `src/routes/queue-api.ts` — REST API:
- `POST /api/v1/tasks` — enqueue a task
- `GET /api/v1/tasks/:id` — get task status
- `GET /api/v1/tasks` — list tasks with filtering by status

## Turn 18

Add more API routes:
- `GET /api/v1/queue/stats` — queue depth, active workers, processed count
- `POST /api/v1/workers/scale` — scale worker count
- `GET /api/v1/dlq` — list dead-letter tasks
- `POST /api/v1/dlq/:id/retry` — retry a DLQ task

## Turn 19

Write integration tests for the REST API: enqueue a task, poll for completion, check stats.

## Turn 20

Run all tests. Fix failures.

## Turn 21

Add task scheduling: `POST /api/v1/tasks` accepts an optional `scheduledAt` timestamp. Tasks with future timestamps are held until their time.

## Turn 22

Implement a `Scheduler` class that checks for due tasks every second and moves them to the main queue.

## Turn 23

Write tests for scheduling: schedule a task 2 seconds in the future, verify it's not immediately dequeued, verify it appears after 2 seconds.

## Turn 24

Run all tests. Fix failures.

## Turn 25

Add task dependencies: a task can declare `dependsOn: string[]` (task IDs). It should not be dequeued until all dependencies are completed.

## Turn 26

Write tests for task dependencies: task B depends on task A, B is not dequeued until A completes.

## Turn 27

Run all tests. Fix failures.

## Turn 28

Add metrics: track `tasksProcessed`, `tasksFailed`, `avgProcessingTimeMs`, `queueDepthOverTime` (sampled every second). Expose via `GET /api/v1/metrics`.

## Turn 29

Write tests for metrics: process 5 tasks, verify counts and avg time.

## Turn 30

Run all tests. Report total count and pass rate.

## Turn 31

Add rate limiting to the API: max 100 requests per minute per IP. Return 429 when exceeded.

## Turn 32

Write tests for rate limiting.

## Turn 33

Run all tests. Fix failures.

## Turn 34

Refactor: extract the in-memory storage into a `TaskStore` interface. Create `InMemoryTaskStore` that implements it. This prepares for future database-backed stores.

## Turn 35

Update all code to use `TaskStore` interface instead of direct Map access.

## Turn 36

Run all tests. Verify nothing broke.

## Turn 37

Add graceful shutdown: `WorkerPool.stop()` should wait for in-progress tasks to complete (with a 30-second timeout) before stopping.

## Turn 38

Write tests for graceful shutdown: start a slow task, call stop(), verify the task completes before workers exit.

## Turn 39

Run all tests. Fix failures.

## Turn 40

Add JSDoc to all public APIs in the queue system.

## Turn 41

Add JSDoc to all API route handlers.

## Turn 42

Run `npx tsc --noEmit`. Fix any type errors.

## Turn 43

Write a comprehensive README documenting the Task Queue system: architecture, API endpoints, configuration, examples.

## Turn 44

Review the entire codebase. List 5 improvements you would make if you had more time.

## Turn 45

Are there any files with more than 200 lines? If so, split them into smaller modules.

## Turn 46

Run all tests one final time. Report the total count.

## Turn 47

Generate a dependency graph: which files import which other files? List them.

## Turn 48

Write a migration guide: if someone wanted to replace `InMemoryTaskStore` with a PostgreSQL-backed store, what would they need to change?

## Turn 49

List every file you created or modified in this session, with line counts.

## Turn 50

Say "BENCHMARK COMPLETE" and nothing else.
