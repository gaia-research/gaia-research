import { describe, expect, it } from "vitest";
import { computeParetoFrontier, generateParetoSVG } from "./analysis/pareto";
import { type AggregateStats, computeSummary, mean, stdDev } from "./analysis/summary";
import type { ScoutBenchRecord } from "./ledger";

describe("analysis summary & pareto", () => {
  it("calculates mean and stdDev correctly", () => {
    const nums = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(mean(nums)).toBe(5);
    expect(stdDev(nums)).toBeCloseTo(2.138, 2);
  });

  const dummyRecord = (arch: "A" | "B" | "C" | "D", k: number, f2: number, cost: number): ScoutBenchRecord => ({
    schema: "scout-bench/v1",
    recordedAt: "2026-08-01T12:00:00.000Z",
    benchmarkId: "parallel-scout-v1",
    taskId: "loc-1",
    taskSuite: "localization",
    architecture: arch,
    archConfig: { K: k },
    repeatIndex: 0,
    scoutModel: "model-x",
    judgeModel: "claude-opus-4-6",
    tokens: {
      scoutInputTotal: 1000,
      scoutOutputTotal: 100,
      scoutCacheReadTotal: 500,
      verifierInput: null,
      verifierOutput: null,
      verifierCacheRead: null,
      judgeInput: 100,
      judgeOutput: 10,
      aggregatorTokens: 0,
    },
    costUSD: {
      scouts: cost * 0.8,
      verifier: null,
      judge: cost * 0.2,
      total: cost,
    },
    wallClockMs: {
      scoutsParallel: 1000,
      scoutsSequential: 1000,
      verifier: null,
      judge: 500,
      aggregator: 10,
      totalE2E: 1510,
    },
    results: {
      groundTruthSize: 5,
      predictedSize: 5,
      truePositives: Math.round(5 * f2),
      falsePositives: 1,
      falseNegatives: 5 - Math.round(5 * f2),
      recall: f2,
      precision: 0.8,
      f2Score: f2,
      validationFailures: 0,
    },
  });

  it("computes summary aggregates", () => {
    const records = [
      dummyRecord("A", 1, 0.8, 0.01),
      dummyRecord("A", 1, 0.85, 0.012),
      dummyRecord("C", 4, 0.92, 0.008),
    ];

    const stats = computeSummary(records);
    expect(stats.length).toBe(2);
    expect(stats[0].architecture).toBe("A");
    expect(stats[0].count).toBe(2);
    expect(stats[1].architecture).toBe("C");
    expect(stats[1].k).toBe(4);
  });

  it("identifies Pareto optimal points", () => {
    const stats: AggregateStats[] = [
      {
        architecture: "B",
        k: 1,
        count: 1,
        recallMean: 0.5,
        recallStd: 0,
        precisionMean: 0.5,
        precisionStd: 0,
        f2Mean: 0.5,
        f2Std: 0,
        costScoutsMean: 0.001,
        costTotalMean: 0.002, // cheapest, low quality -> Pareto optimal
        latencyP50Ms: 1000,
        latencyP95Ms: 1000,
        cacheHitRatio: 0.5,
        costEfficiency: 250,
      },
      {
        architecture: "A",
        k: 1,
        count: 1,
        recallMean: 0.85,
        recallStd: 0,
        precisionMean: 0.85,
        precisionStd: 0,
        f2Mean: 0.85,
        f2Std: 0,
        costScoutsMean: 0.01,
        costTotalMean: 0.015, // more expensive, but lower quality than C -> dominated by C
        latencyP50Ms: 2000,
        latencyP95Ms: 2000,
        cacheHitRatio: 0.3,
        costEfficiency: 56.6,
      },
      {
        architecture: "C",
        k: 4,
        count: 1,
        recallMean: 0.95,
        recallStd: 0,
        precisionMean: 0.9,
        precisionStd: 0,
        f2Mean: 0.93,
        f2Std: 0,
        costScoutsMean: 0.004,
        costTotalMean: 0.007, // cheaper than A AND higher F2 -> dominates A
        latencyP50Ms: 1200,
        latencyP95Ms: 1200,
        cacheHitRatio: 0.7,
        costEfficiency: 132.8,
      },
    ];

    const frontier = computeParetoFrontier(stats);
    const bPoint = frontier.find((p) => p.architecture === "B");
    const aPoint = frontier.find((p) => p.architecture === "A");
    const cPoint = frontier.find((p) => p.architecture === "C");

    expect(bPoint?.isParetoOptimal).toBe(true);
    expect(cPoint?.isParetoOptimal).toBe(true);
    expect(aPoint?.isParetoOptimal).toBe(false); // Dominated by C!

    const svg = generateParetoSVG(frontier);
    expect(svg).toContain("<svg");
    expect(svg).toContain("Scout Fan-Out Cost vs. F2 Quality Pareto Frontier");
  });
});
