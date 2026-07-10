// Submission validation — client-side shape guards.
//
// The critical guarantee: a submission payload is built from a WHITELIST of
// numeric/enum fields, so raw prompt text can never be attached and sent — even
// by a careless future caller. Handles are sanitized to a safe charset.

import type { ContextDietPayload } from "./types";

const HANDLE_MAX = 32;
const HANDLE_ALLOWED = /[^A-Za-z0-9_-]/g;

/** Reduce a raw handle to a safe token, or undefined if nothing usable remains. */
export function sanitizeHandle(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim().replace(HANDLE_ALLOWED, "").slice(0, HANDLE_MAX);
  return cleaned.length > 0 ? cleaned : undefined;
}

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/**
 * Validate and normalize a context-diet payload. Throws on bad shape or
 * out-of-range values. Only whitelisted keys survive — any extra field
 * (e.g. an accidental `text`) is dropped, not forwarded.
 */
export function validateContextDiet(input: unknown): ContextDietPayload {
  if (typeof input !== "object" || input === null) {
    throw new Error("payload must be an object");
  }
  const p = input as Record<string, unknown>;

  if (!isFiniteNumber(p.tokensBefore) || p.tokensBefore < 0) {
    throw new Error("tokensBefore must be a non-negative number");
  }
  if (!isFiniteNumber(p.tokensAfter) || p.tokensAfter < 0) {
    throw new Error("tokensAfter must be a non-negative number");
  }
  if (!isFiniteNumber(p.reductionPct) || p.reductionPct < 0 || p.reductionPct > 100) {
    throw new Error("reductionPct must be between 0 and 100");
  }

  const payload: ContextDietPayload = {
    kind: "context-diet",
    labId: "lab-001",
    tokensBefore: Math.round(p.tokensBefore),
    tokensAfter: Math.round(p.tokensAfter),
    reductionPct: Math.round(p.reductionPct * 10) / 10,
  };

  if (typeof p.strategyKey === "string" && p.strategyKey.length <= 40) {
    payload.strategyKey = p.strategyKey;
  }
  const handle = sanitizeHandle(typeof p.handle === "string" ? p.handle : undefined);
  if (handle) payload.handle = handle;

  return payload;
}
