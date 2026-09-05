/**
 * Type definitions for the Context Compaction Curve & 272k Window Benchmark (#214).
 * Tracks per-turn token breakdowns, caching performance, reasoning compute, and cost models.
 */

export type BenchmarkModel =
  | "claude-3.7-sonnet"
  | "claude-3.7-sonnet-thinking"
  | "gpt-5-codex"
  | "o3-mini"
  | "gemini-3.7-flash";

export type BenchmarkScenario =
  | "breached-ttl"          // Scenario 1: delta-t > 300s, testing TTL eviction penalties
  | "in-grace"              // Scenario 2: delta-t < 60s, continuous cached reads
  | "long-context-clutter"   // Scenario 3: distractor-heavy logs, measuring thinking bloat & 272k tripwire
  | "sweet-spot-sweep"      // Scenario 4: sweeping L_compact across 15k..272k
  | "harness-limits";       // Scenario 5: Codex vs Claude Code vs Pi auto-compact configs

export interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
  cacheWritePerMillion: number;
  cacheReadPerMillion: number;
  longContextInputMultiplier?: number;  // e.g. 2.0x for OpenAI > 272k
  longContextOutputMultiplier?: number; // e.g. 1.5x for OpenAI > 272k
  longContextThreshold?: number;        // e.g. 272_000
}

export interface TurnTelemetry {
  turnIndex: number;
  deltaSeconds: number;
  isCacheHit: boolean;
  isCacheWrite: boolean;
  rawInputTokens: number;
  cachedReadTokens: number;
  cacheWriteTokens: number;
  thinkingTokens: number;
  responseTokens: number;
  totalTokens: number;
  billedInputCostUsd: number;
  billedOutputCostUsd: number;
  turnCostUsd: number;
  reacquisitionToolCalls: number;
  wallClockLatencyMs: number;
}

export interface CompactionRunRecord {
  runId: string;
  timestampIso: string;
  issueNumber: 214;
  scenario: BenchmarkScenario;
  model: BenchmarkModel;
  compactionThresholdTokens: number;
  workloadName: "bugfix" | "feature" | "refactor";
  totalTurns: number;
  totalCostUsd: number;
  cacheHitFraction: number;
  totalThinkingTokens: number;
  turns: TurnTelemetry[];
}
