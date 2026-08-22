import { describe, expect, it } from "vitest";
import {
  aggregateScoutOutputs,
  canonicalizePath,
  computeRRF,
  validateCandidateSchema,
} from "./aggregate";

describe("aggregateScoutOutputs", () => {
  it("canonicalizes paths properly", () => {
    expect(canonicalizePath("./scripts/scout-bench/ledger.ts/")).toBe("scripts/scout-bench/ledger.ts");
    expect(canonicalizePath("src\\foo\\bar.ts")).toBe("src/foo/bar.ts");
  });

  it("validates candidate schema", () => {
    expect(validateCandidateSchema(null).valid).toBe(false);
    expect(validateCandidateSchema({}).valid).toBe(false);
    expect(
      validateCandidateSchema({ path: "foo.ts", relevance_signal: "defines ledger" }).valid,
    ).toBe(true);
    expect(
      validateCandidateSchema({ path: "", relevance_signal: "defines ledger" }).valid,
    ).toBe(false);
  });

  it("computes RRF score correctly", () => {
    const list1 = [
      { path: "a.ts", relevance_signal: "sig1" },
      { path: "b.ts", relevance_signal: "sig2" },
    ];
    const list2 = [
      { path: "b.ts", relevance_signal: "sig2_alt" },
      { path: "c.ts", relevance_signal: "sig3" },
    ];

    const rrfMap = computeRRF([list1, list2], 60);
    // a.ts rank 1 in list1 -> 1 / 61
    // b.ts rank 2 in list1 (1/62) + rank 1 in list2 (1/61)
    // c.ts rank 2 in list2 -> 1 / 62
    const bEntry = rrfMap.get("b.ts");
    expect(bEntry?.source_count).toBe(2);
    expect(bEntry?.rrf_score).toBeCloseTo(1 / 62 + 1 / 61, 5);

    const merged = aggregateScoutOutputs([{ candidates: list1 }, { candidates: list2 }], {
      algorithm: "rrf",
    });
    expect(merged.merged_candidates[0].path).toBe("b.ts");
    expect(merged.post_dedup_total).toBe(3);
    expect(merged.merged_candidates[0].relevance_signals).toEqual(["sig2", "sig2_alt"]);
  });

  it("applies quorum filtering when requested", () => {
    const list1 = [{ path: "common.ts", relevance_signal: "common" }, { path: "only1.ts", relevance_signal: "1" }];
    const list2 = [{ path: "common.ts", relevance_signal: "common" }, { path: "only2.ts", relevance_signal: "2" }];
    const list3 = [{ path: "common.ts", relevance_signal: "common" }, { path: "only3.ts", relevance_signal: "3" }];

    const merged = aggregateScoutOutputs(
      [{ candidates: list1 }, { candidates: list2 }, { candidates: list3 }],
      { algorithm: "quorum-then-rrf", quorumM: 2 },
    );

    expect(merged.post_dedup_total).toBe(1);
    expect(merged.merged_candidates[0].path).toBe("common.ts");
  });
});
