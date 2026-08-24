#!/usr/bin/env node
import { readFileSync } from "node:fs";
import {
  DEFAULT_IDENTITIES, DEFAULT_MATRIX, readJson, validateAttempt,
  validateIdentityManifest, validateJudgeAssignment, validateTaskMatrix, verifyRemoteIdentities,
} from "./r2-contract.ts";

function validateJsonl(path: string, fn: (raw: unknown) => void) {
  readFileSync(path, "utf8").split("\n").filter(Boolean).forEach((line, i) => {
    try { fn(JSON.parse(line)); } catch (error) { throw new Error(`${path}:${i + 1}: ${(error as Error).message}`); }
  });
}
async function main() {
  const args = new Set(process.argv.slice(2));
  const identitiesRaw = readJson(DEFAULT_IDENTITIES);
  const identities = validateIdentityManifest(identitiesRaw);
  validateTaskMatrix(readJson(DEFAULT_MATRIX), identities);
  validateJsonl("scripts/hell-heaven-bench/__fixtures__/r2/attempts.valid.jsonl", validateAttempt);
  validateJsonl("scripts/hell-heaven-bench/__fixtures__/r2/judges.valid.jsonl", validateJudgeAssignment);
  if (args.has("--verify-sources")) await verifyRemoteIdentities(identitiesRaw);
  console.log(`OK — R2 contract: ${identities.skills.length} identities, 20 tasks${args.has("--verify-sources") ? ", remote bytes verified" : ""}`);
}
main().catch((error) => { console.error((error as Error).message); process.exit(1); });
