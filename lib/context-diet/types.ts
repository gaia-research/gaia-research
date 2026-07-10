// Context Diet — analyzer types.
// Ported from content/reports/context-diet-lab-001/context_diet.py.
// Char count is authoritative (the Claude Code budget is expressed in chars);
// approxTokens (chars/4) is a convenience figure only.

/** One section of a context file, split on Markdown headings. */
export interface Section {
  title: string;
  level: number;
  chars: number;
  approxTokens: number;
  lineStart: number;
}

/** Result of measuring a context file against a char budget. */
export interface Measured {
  file: string;
  totalChars: number;
  approxTokens: number;
  limit: number;
  overLimit: boolean;
  overBy: number;
  headroom: number;
  sectionCount: number;
  /** Sections in document order. */
  sections: Section[];
  /** Sections sorted by chars desc — the compaction targets. */
  ranked: Section[];
}

/** One Lab 001 compaction strategy and the reduction it achieved. */
export interface Strategy {
  key: string;
  title: string;
  reductionPct: number;
}

/**
 * A projected reduction range for an arbitrary context file, derived from the
 * four Lab 001 strategies. The band spans the weakest to the strongest
 * strategy; the target is the winning (best) strategy.
 */
export interface ReductionBand {
  lowPct: number;
  highPct: number;
  targetPct: number;
  targetKey: string;
  targetTitle: string;
  projectedCharsLow: number;
  projectedCharsHigh: number;
  projectedCharsTarget: number;
  projectedTokensLow: number;
  projectedTokensHigh: number;
  projectedTokensTarget: number;
  strategies: Strategy[];
}

/** A dollar estimate for the input tokens saved by a diet. */
export interface CostEstimate {
  tokensSaved: number;
  /** USD per 1M input tokens. */
  ratePerMTok: number;
  dollarsSaved: number;
}
