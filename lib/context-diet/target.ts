import { approxTokens } from "./analyze";

export const ESTIMATED_PROTECTED_FLOOR_PCT = 20;
export const MAX_ESTIMATED_REDUCTION_PCT = 100 - ESTIMATED_PROTECTED_FLOOR_PCT;

export function projectTarget(totalChars: number, requestedPct: number) {
  const requested = Math.min(100, Math.max(0, Math.round(requestedPct)));
  const appliedPct = Math.min(requested, MAX_ESTIMATED_REDUCTION_PCT);
  const projectedChars = Math.round(Math.max(0, totalChars) * (1 - appliedPct / 100));
  return {
    requestedPct: requested,
    appliedPct,
    projectedChars,
    projectedTokens: approxTokens(projectedChars),
    tokensSaved: approxTokens(Math.max(0, totalChars)) - approxTokens(projectedChars),
    clamped: requested > appliedPct,
  };
}
