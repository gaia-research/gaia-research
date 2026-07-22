// Submission validation — client-side shape guards.
//
// The critical guarantee: a submission payload is built from a WHITELIST of
// numeric/enum fields, so raw prompt text can never be attached and sent — even
// by a careless future caller. Handles are sanitized to a safe charset.

import type { ContextDietEvidenceRequest } from "./types";
import { parsePublicGitHubUrl } from "@/lib/context-diet/github";

const HANDLE_MAX = 32;
const HANDLE_ALLOWED = /[^A-Za-z0-9_-]/g;

/** Reduce a raw handle to a safe token, or undefined if nothing usable remains. */
export function sanitizeHandle(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim().replace(HANDLE_ALLOWED, "").slice(0, HANDLE_MAX);
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Validate and normalize a context-diet payload. Throws on bad shape or
 * out-of-range values. Only whitelisted keys survive — any extra field
 * (e.g. an accidental `text`) is dropped, not forwarded.
 */
export function validateContextDietEvidence(input: unknown): ContextDietEvidenceRequest {
  if (typeof input !== "object" || input === null) {
    throw new Error("payload must be an object");
  }
  const p = input as Record<string, unknown>;

  if (typeof p.beforeUrl !== "string" || typeof p.afterUrl !== "string") {
    throw new Error("public beforeUrl and afterUrl are required");
  }
  const before = parsePublicGitHubUrl(p.beforeUrl);
  const after = parsePublicGitHubUrl(p.afterUrl);
  if (!before.ref || !before.path || !after.ref || !after.path) {
    throw new Error("evidence must use GitHub /blob/ file links");
  }
  if (before.owner !== after.owner || before.repo !== after.repo || before.path !== after.path) {
    throw new Error("before and after evidence must identify the same public file");
  }
  if (before.ref === after.ref) throw new Error("before and after evidence must use different revisions");

  const payload: ContextDietEvidenceRequest = { beforeUrl: p.beforeUrl, afterUrl: p.afterUrl };
  const handle = sanitizeHandle(typeof p.handle === "string" ? p.handle : undefined);
  if (handle) payload.handle = handle;

  return payload;
}
