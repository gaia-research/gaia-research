import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  appendRecord,
  calculateCostUSD,
  computeF2Score,
  readLedger,
  type ScoutBenchRecord,
  validateRecord,
} from "./ledger";

describe("ledger", () => {
  const sampleRecord: ScoutBenchRecord = {
    schema: "scout-bench/v1",
    recordedAt: "2026-08-01T12:00:00.000Z",
    benchmarkId: "parallel-scout-v1",
    taskId: "loc-1",
    taskSuite: "localization",
    architecture: "C",
    archConfig: {
      K: 4,
      fanOutStrategy: "subspace",
      aggregation: "rrf",
    },
    repeatIndex: 0,
    scoutModel: "google-antigravity/gemini-3.5-flash-lite",
    judgeModel: "antigravity/claude-opus-4-6",
    tokens: {
      scoutInputTotal: 12000,
      scoutOutputTotal: 1500,
      scoutCacheReadTotal: 6000,
      verifierInput: null,
      verifierOutput: null,
      verifierCacheRead: null,
      judgeInput: 1800,
      judgeOutput: 250,
      aggregatorTokens: 0,
    },
    costUSD: {
      scouts: 0.00573,
      verifier: null,
      judge: 0.01525,
      total: 0.02098,
    },
    wallClockMs: {
      scoutsParallel: 3200,
      scoutsSequential: 11500,
      verifier: null,
      judge: 2100,
      aggregator: 12,
      totalE2E: 5312,
    },
    results: {
      groundTruthSize: 6,
      predictedSize: 7,
      truePositives: 6,
      falsePositives: 1,
      falseNegatives: 0,
      recall: 1.0,
      precision: 0.8571,
      f2Score: 0.9677,
      validationFailures: 0,
    },
    notes: "Pilot run",
  };

  it("validates compliant record", () => {
    expect(() => validateRecord(sampleRecord)).not.toThrow();
  });

  it("rejects record with seed field", () => {
    const invalid = { ...sampleRecord, seed: 12345 };
    expect(() => validateRecord(invalid)).toThrow(/seed/);
  });

  it("rejects record with inconsistent TP/FN/groundTruthSize", () => {
    const invalid = {
      ...sampleRecord,
      results: {
        ...sampleRecord.results,
        truePositives: 4,
        falseNegatives: 0,
        groundTruthSize: 6,
      },
    };
    expect(() => validateRecord(invalid)).toThrow(/inconsistent results/);
  });

  it("calculates cost accurately", () => {
    const cost = calculateCostUSD("google-antigravity/gemini-3.5-flash-lite", 1000000, 1000000, 500000);
    // Uncached: 500k @ 0.30/1M = 0.15
    // Cached: 500k @ 0.03/1M = 0.015
    // Output: 1M @ 2.50/1M = 2.50
    // Total = 2.665
    expect(cost).toBe(2.665);
  });

  it("computes F2 score accurately", () => {
    const f2 = computeF2Score(0.8, 1.0);
    // (5 * 0.8 * 1.0) / (4 * 0.8 + 1.0) = 4.0 / 4.2 = 0.95238...
    expect(f2).toBe(0.9524);
  });

  it("appends and reads from disk ledger", () => {
    const tmp = mkdtempSync(join(tmpdir(), "scout-bench-test-"));
    const ledgerFile = join(tmp, "ledger.jsonl");

    try {
      appendRecord(sampleRecord, ledgerFile);
      const records = readLedger(ledgerFile);
      expect(records.length).toBe(1);
      expect(records[0].taskId).toBe("loc-1");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
