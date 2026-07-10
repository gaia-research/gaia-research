// Context Diet — reduction projection.
//
// For an arbitrary pasted context file we cannot run the live LLM bake-off, so
// we PROJECT a plausible reduction range from the four Lab 001 strategies. The
// strategy percentages are imported from the merged Lab 001 evidence
// (bakeoff.json) so this stays a single source of truth — if the lab is re-run,
// the projection band moves with it.

import bakeoff from "@/content/reports/context-diet-lab-001/bakeoff.json";
import { approxTokens } from "./analyze";
import type { Measured, ReductionBand, Strategy } from "./types";

interface BakeoffComparison {
  key: string;
  title: string;
  reductionPct: number;
}
interface Bakeoff {
  comparison: BakeoffComparison[];
  winnerKey: string;
}

const { comparison, winnerKey } = bakeoff as Bakeoff;

/** The four Lab 001 strategies, sorted weakest → strongest reduction. */
export const STRATEGIES: Strategy[] = comparison
  .map((c) => ({ key: c.key, title: c.title, reductionPct: c.reductionPct }))
  .sort((a, b) => a.reductionPct - b.reductionPct);

const WINNER: Strategy =
  STRATEGIES.find((s) => s.key === winnerKey) ?? STRATEGIES[STRATEGIES.length - 1];

/**
 * Project a reduction band for a measured file. The band spans the weakest
 * strategy (low) to the strongest (high); the target is the Lab 001 winner.
 * Projected chars/tokens are applied to the file's own total.
 */
export function projectReduction(m: Measured): ReductionBand {
  const low = STRATEGIES[0];
  const high = STRATEGIES[STRATEGIES.length - 1];

  const charsAfter = (pct: number) => Math.round(m.totalChars * (1 - pct / 100));
  const projectedCharsLow = charsAfter(low.reductionPct);
  const projectedCharsHigh = charsAfter(high.reductionPct);
  const projectedCharsTarget = charsAfter(WINNER.reductionPct);

  return {
    lowPct: low.reductionPct,
    highPct: high.reductionPct,
    targetPct: WINNER.reductionPct,
    targetKey: WINNER.key,
    targetTitle: WINNER.title,
    projectedCharsLow,
    projectedCharsHigh,
    projectedCharsTarget,
    projectedTokensLow: approxTokens(projectedCharsLow),
    projectedTokensHigh: approxTokens(projectedCharsHigh),
    projectedTokensTarget: approxTokens(projectedCharsTarget),
    strategies: STRATEGIES,
  };
}
