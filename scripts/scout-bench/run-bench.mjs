// Scout Benchmark Runner (run-bench.mjs)
//
// Workflow script and runner for the Parallel Cheap-Scout Fan-Out Benchmark (Issue #174).
// Orchestrates Architecture A, B, C, and D across 9 pinned benchmark tasks.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { aggregateScoutOutputs, canonicalizePath } from "./aggregate.js";
import {
  appendRecord,
  calculateCostUSD,
  computeF2Score,
  DEFAULT_LEDGER_FILE,
} from "./ledger.js";

export const meta = {
  name: "scout_bench_runner",
  description: "Orchestrates parallel cheap-scout fan-out benchmark experiments",
  phases: [
    { title: "Task Setup" },
    { title: "Architecture A: Single Standard Flash" },
    { title: "Architecture B: Single Ultra-Lite" },
    { title: "Architecture C: Parallel Lite Fan-Out" },
    { title: "Architecture D: Cascaded Funnel" },
    { title: "Evaluation & Ledger Recording" },
  ],
};

const __dirname = dirname(fileURLToPath(import.meta.url));

export const TASKS = [
  { id: "loc-1", suite: "localization" },
  { id: "loc-2", suite: "localization" },
  { id: "loc-3", suite: "localization" },
  { id: "ret-1", suite: "retrieval" },
  { id: "ret-2", suite: "retrieval" },
  { id: "ret-3", suite: "retrieval" },
  { id: "prune-1", suite: "pruning" },
  { id: "prune-2", suite: "pruning" },
  { id: "prune-3", suite: "pruning" },
];

export function readTaskPrompt(taskId) {
  const p = join(__dirname, "tasks", taskId, "prompt.md");
  return readFileSync(p, "utf-8");
}

export function readGroundTruth(taskId) {
  const p = join(__dirname, "tasks", taskId, "ground-truth.json");
  return JSON.parse(readFileSync(p, "utf-8"));
}

export function generatePartitions(taskId, K) {
  const strategies = [
    { strategy: "subspace", scope: "partition-core-source" },
    { strategy: "perspective", scope: "perspective-imports-and-deps" },
    { strategy: "diverse-query", scope: "query-synonym-expansion" },
    { strategy: "subspace", scope: "partition-tests-and-configs" },
    { strategy: "perspective", scope: "perspective-doc-and-schema" },
    { strategy: "diverse-query", scope: "query-structural-pattern" },
  ];
  return strategies.slice(0, K);
}

export function evaluateCandidates(predictedCandidates, groundTruth) {
  const gtSet = new Set(groundTruth.map((g) => canonicalizePath(g.path)));
  const predSet = new Set(predictedCandidates.map((p) => canonicalizePath(p.path)));

  let truePositives = 0;
  for (const pred of predSet) {
    if (gtSet.has(pred)) {
      truePositives++;
    }
  }

  const falsePositives = predSet.size - truePositives;
  const falseNegatives = gtSet.size - truePositives;

  const recall = gtSet.size > 0 ? Number((truePositives / gtSet.size).toFixed(4)) : 0;
  const precision =
    predSet.size > 0 ? Number((truePositives / predSet.size).toFixed(4)) : 0;
  const f2Score = computeF2Score(precision, recall);

  return {
    groundTruthSize: gtSet.size,
    predictedSize: predSet.size,
    truePositives,
    falsePositives,
    falseNegatives,
    recall,
    precision,
    f2Score,
  };
}

export function formatScoutPrompt(taskPrompt, { strategy = "full", partition = "all" } = {}) {
  return `You are a high-speed codebase scout.

## Task
${taskPrompt}

## Search Strategy Assigned
Strategy: ${strategy}
Scope / Partition: ${partition}

## Instructions
1. Discover all matching candidate files or entries.
2. Return ONLY a valid JSON object matching this schema:
{
  "candidates": [
    {
      "path": "exact/relative/file/path.ext",
      "relevance_signal": "One sentence explaining why this file is relevant",
      "snippet": "Verbatim snippet (optional)",
      "confidence": "high" | "medium" | "low"
    }
  ],
  "search_strategy": "${strategy}"
}`;
}

export function formatVerifierPrompt(taskPrompt, candidateList) {
  return `You are a precision verifier agent.

## Task
${taskPrompt}

## Candidate Set to Verify
${JSON.stringify(candidateList, null, 2)}

## Instructions
1. Inspect each candidate in the list.
2. Verify if it is genuinely relevant to the task. Prune any false positives or irrelevant files.
3. Return ONLY a valid JSON object:
{
  "candidates": [
    {
      "path": "exact/path",
      "relevance_signal": "Confirmed reason for relevance",
      "confidence": "high",
      "verified": true
    }
  ]
}`;
}
