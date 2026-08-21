// Scout Benchmark Aggregator & Fusion Engine (aggregator-lite)
//
// Pure deterministic aggregator (no LLM tokens).
// Implements Reciprocal Rank Fusion (RRF), quorum voting, structural path
// deduplication, and schema validation per Plan §5.

import { existsSync, readFileSync } from "node:fs";
import { normalize, resolve } from "node:path";

export interface ScoutCandidate {
  path: string;
  relevance_signal: string;
  snippet?: string;
  confidence?: "high" | "medium" | "low";
  verified?: boolean;
}

export interface ScoutOutput {
  candidates: ScoutCandidate[];
  search_strategy?: string;
  wall_clock_ms?: number;
}

export interface MergedCandidate {
  path: string;
  rrf_score: number;
  source_count: number;
  relevance_signals: string[];
  confidences: string[];
  snippets: string[];
  verified?: boolean;
}

export interface AggregatorResult {
  merged_candidates: MergedCandidate[];
  algorithm_used: string;
  input_list_count: number;
  pre_dedup_total: number;
  post_dedup_total: number;
  validation_failures: Array<{
    candidate: unknown;
    reason: string;
  }>;
}

export interface AggregatorOptions {
  algorithm?: "rrf" | "quorum-then-rrf" | "rrf-then-quorum" | "union" | "passthrough";
  rrfK?: number; // default 60
  quorumM?: number; // default Math.ceil(K / 2)
  topN?: number; // top-N candidates to retain (for cascaded Tier 2)
  repoRoot?: string; // optional root to verify path existence
  verifySnippets?: boolean;
}

export function canonicalizePath(p: string): string {
  if (!p || typeof p !== "string") return "";
  let clean = p.trim().replace(/\\/g, "/");
  // strip leading ./
  clean = clean.replace(/^\.\//, "");
  // strip trailing slashes
  clean = clean.replace(/\/+$/, "");
  return clean;
}

export function validateCandidateSchema(
  item: unknown,
  repoRoot?: string,
  verifySnippets = false,
): { valid: boolean; error?: string; normalized?: ScoutCandidate } {
  if (typeof item !== "object" || item === null || Array.isArray(item)) {
    return { valid: false, error: "candidate must be a non-null object" };
  }

  const c = item as Record<string, unknown>;
  if (typeof c.path !== "string" || !c.path.trim()) {
    return { valid: false, error: "candidate.path must be a non-empty string" };
  }
  if (typeof c.relevance_signal !== "string" || !c.relevance_signal.trim()) {
    return { valid: false, error: "candidate.relevance_signal must be a non-empty string" };
  }

  const canonicalPath = canonicalizePath(c.path);

  if (repoRoot) {
    const absPath = resolve(repoRoot, canonicalPath);
    if (!existsSync(absPath)) {
      return {
        valid: false,
        error: `path "${canonicalPath}" does not exist in repository root "${repoRoot}"`,
      };
    }

    if (verifySnippets && typeof c.snippet === "string" && c.snippet.trim().length > 0) {
      try {
        const content = readFileSync(absPath, "utf-8");
        const snippetClean = c.snippet.trim();
        if (!content.includes(snippetClean)) {
          return {
            valid: false,
            error: `snippet "${snippetClean.slice(0, 40)}..." not found verbatim in ${canonicalPath}`,
          };
        }
      } catch (err) {
        return { valid: false, error: `failed to read file for snippet verification: ${(err as Error).message}` };
      }
    }
  }

  const normalized: ScoutCandidate = {
    path: canonicalPath,
    relevance_signal: c.relevance_signal.trim(),
    snippet: typeof c.snippet === "string" ? c.snippet.trim() : undefined,
    confidence: ["high", "medium", "low"].includes(c.confidence as string)
      ? (c.confidence as "high" | "medium" | "low")
      : undefined,
    verified: typeof c.verified === "boolean" ? c.verified : undefined,
  };

  return { valid: true, normalized };
}

export function computeRRF(
  rankedLists: ScoutCandidate[][],
  k = 60,
): Map<string, { rrf_score: number; source_count: number; candidates: ScoutCandidate[] }> {
  const map = new Map<string, { rrf_score: number; source_count: number; candidates: ScoutCandidate[] }>();

  rankedLists.forEach((list) => {
    const seenInThisList = new Set<string>();

    list.forEach((candidate, rankIndex) => {
      const p = canonicalizePath(candidate.path);
      if (seenInThisList.has(p)) return; // rank at first appearance in list
      seenInThisList.add(p);

      const rank = rankIndex + 1; // 1-based rank
      const score = 1 / (k + rank);

      const entry = map.get(p) ?? {
        rrf_score: 0,
        source_count: 0,
        candidates: [],
      };

      entry.rrf_score += score;
      entry.source_count += 1;
      entry.candidates.push(candidate);
      map.set(p, entry);
    });
  });

  return map;
}

export function aggregateScoutOutputs(
  scoutOutputs: ScoutOutput[],
  options: AggregatorOptions = {},
): AggregatorResult {
  const {
    algorithm = "rrf",
    rrfK = 60,
    quorumM,
    topN,
    repoRoot,
    verifySnippets = false,
  } = options;

  const inputListCount = scoutOutputs.length;
  const validationFailures: Array<{ candidate: unknown; reason: string }> = [];
  let preDedupTotal = 0;

  // 1. Schema validate and normalize each list
  const validatedLists: ScoutCandidate[][] = scoutOutputs.map((output) => {
    const list: ScoutCandidate[] = [];
    const rawCandidates = Array.isArray(output.candidates) ? output.candidates : [];
    preDedupTotal += rawCandidates.length;

    for (const raw of rawCandidates) {
      const res = validateCandidateSchema(raw, repoRoot, verifySnippets);
      if (res.valid && res.normalized) {
        list.push(res.normalized);
      } else {
        validationFailures.push({
          candidate: raw,
          reason: res.error ?? "unknown schema error",
        });
      }
    }
    return list;
  });

  const effectiveQuorumM = quorumM ?? Math.max(1, Math.ceil(inputListCount / 2));

  // Compute RRF map across all validated lists
  const rrfMap = computeRRF(validatedLists, rrfK);

  // Convert to candidate array
  let merged: MergedCandidate[] = Array.from(rrfMap.entries()).map(([path, data]) => {
    const relevance_signals = Array.from(
      new Set(data.candidates.map((c) => c.relevance_signal)),
    );
    const confidences = Array.from(
      new Set(data.candidates.map((c) => c.confidence).filter((x): x is string => Boolean(x))),
    );
    const snippets = Array.from(
      new Set(data.candidates.map((c) => c.snippet).filter((x): x is string => Boolean(x))),
    );
    const anyVerified = data.candidates.some((c) => c.verified === true);

    return {
      path,
      rrf_score: Number(data.rrf_score.toFixed(6)),
      source_count: data.source_count,
      relevance_signals,
      confidences,
      snippets,
      verified: anyVerified ? true : undefined,
    };
  });

  // Apply algorithm-specific filtering and sorting
  if (algorithm === "passthrough" || algorithm === "union") {
    // preserve order of appearance
    merged.sort((a, b) => b.source_count - a.source_count || b.rrf_score - a.rrf_score);
  } else if (algorithm === "rrf") {
    merged.sort((a, b) => b.rrf_score - a.rrf_score);
  } else if (algorithm === "quorum-then-rrf") {
    merged = merged.filter((c) => c.source_count >= effectiveQuorumM);
    merged.sort((a, b) => b.rrf_score - a.rrf_score);
  } else if (algorithm === "rrf-then-quorum") {
    merged.sort((a, b) => b.rrf_score - a.rrf_score);
    merged = merged.filter((c) => c.source_count >= effectiveQuorumM);
  }

  if (topN && topN > 0) {
    merged = merged.slice(0, topN);
  }

  return {
    merged_candidates: merged,
    algorithm_used: algorithm,
    input_list_count: inputListCount,
    pre_dedup_total: preDedupTotal,
    post_dedup_total: merged.length,
    validation_failures: validationFailures,
  };
}
