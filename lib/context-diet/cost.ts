// Context Diet — cost estimation.
//
// Context lives in the INPUT token budget, so savings are valued at each model's
// input rate. Rates are USD per 1M tokens (Anthropic list pricing as of the
// lab's authoring). The UI exposes the rate so the assumption stays transparent.

import type { CostEstimate } from "./types";

export interface ModelRate {
  id: string;
  label: string;
  /** USD per 1M input tokens. */
  inputPerMTok: number;
  /** USD per 1M output tokens (shown for context; not used in the estimate). */
  outputPerMTok: number;
}

export const MODEL_RATES: ModelRate[] = [
  { id: "opus", label: "Claude Opus", inputPerMTok: 5, outputPerMTok: 25 },
  { id: "sonnet", label: "Claude Sonnet", inputPerMTok: 3, outputPerMTok: 15 },
  { id: "haiku", label: "Claude Haiku", inputPerMTok: 1, outputPerMTok: 5 },
];

/** Default to Sonnet's input rate — a sensible middle-of-the-road assumption. */
export const DEFAULT_RATE_PER_MTOK = 3;

export function estimateCost(
  tokensSaved: number,
  ratePerMTok = DEFAULT_RATE_PER_MTOK,
): CostEstimate {
  const dollarsSaved = (tokensSaved / 1_000_000) * ratePerMTok;
  return {
    tokensSaved,
    ratePerMTok,
    dollarsSaved,
    // The trimmed context is re-read on every turn/request; valuing the saved
    // tokens across 1M reads gives the headline figure (== tokensSaved × rate).
    dollarsSavedPerMReads: dollarsSaved * 1_000_000,
  };
}
