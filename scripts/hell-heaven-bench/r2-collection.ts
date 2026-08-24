import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { validateAttempt, validateJudgeAssignment, type Attempt, type JudgeAssignment } from "./r2-contract.ts";

export { type Attempt, validateAttempt } from "./r2-contract.ts";
export function appendShard(path: string, a: Attempt) { validateAttempt(a); appendFileSync(path, JSON.stringify(a) + "\n", { flag: "a" }); }
export function readAttempts(paths: string[]) {
  return paths.flatMap(p => existsSync(p) ? readFileSync(p, "utf8").split("\n").filter(Boolean).map((line, i) => {
    try { const x = JSON.parse(line); validateAttempt(x); return x; }
    catch (e) { throw new Error(`${p}:${i + 1}: ${(e as Error).message}`); }
  }) : []);
}
const key = (x: Pick<Attempt, "taskId" | "loadoutId" | "repeatIndex">) => `${x.taskId}\u0000${x.loadoutId}\u0000${x.repeatIndex}`;
/** Invalid launches remain in the chain, but only one valid launch fulfils a cell. */
export function detectCells(attempts: Attempt[], expected: { taskId: string; loadoutId: string; repeatIndex: number }[]) {
  const chains = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const k = key(a); const chain = chains.get(k) ?? []; chain.push(a); chains.set(k, chain);
  }
  for (const [k, chain] of chains) {
    const indexes = chain.map(a => a.attemptIndex).sort((a, b) => a - b);
    const unique = [...new Set(indexes)];
    if (unique.length > 1 && unique.some((n, i) => n !== i)) throw new Error(`non-monotonic retry chain ${k}`);
  }
  const valid = attempts.filter(a => a.status === "valid");
  const counts = new Map<string, number>(); for (const a of valid) counts.set(key(a), (counts.get(key(a)) ?? 0) + 1);
  const duplicates = [...counts].filter(([, n]) => n > 1).map(([k]) => k);
  const expectedKeys = new Set(expected.map(key)); const validKeys = new Set(valid.map(key));
  return { duplicates, incomplete: [...expectedKeys].filter(k => !validKeys.has(k)), unexpected: [...validKeys].filter(k => !expectedKeys.has(k)), complete: duplicates.length === 0 && expectedKeys.size === validKeys.size && [...expectedKeys].every(k => validKeys.has(k)) };
}

/** Returns judge packets only; the random A/B mapping is deliberately not represented. */
export function blindAssignments(attempts: Attempt[], rubricVersion: string): JudgeAssignment[] {
  const valid = attempts.filter(a => a.status === "valid"); const used = new Set<string>(); const out: JudgeAssignment[] = [];
  for (const treatment of valid.filter(a => a.loadoutId !== "placebo")) {
    const pairKey = `${treatment.taskId}\u0000${treatment.loadoutId}\u0000${treatment.repeatIndex}`;
    if (used.has(pairKey)) continue;
    const placebo = valid.find(a => a.loadoutId === "placebo" && a.taskId === treatment.taskId && a.repeatIndex === treatment.repeatIndex);
    if (!placebo || placebo.artifactSha256 === treatment.artifactSha256) continue;
    used.add(pairKey);
    const isTreatmentA = randomBytes(1)[0] % 2 === 0;
    const packet: JudgeAssignment = { schema: "hh-r2-blind-judge/v1", assignmentId: randomBytes(16).toString("hex"), taskId: treatment.taskId, rubricVersion,
      candidateAArtifactSha256: isTreatmentA ? treatment.artifactSha256 : placebo.artifactSha256,
      candidateBArtifactSha256: isTreatmentA ? placebo.artifactSha256 : treatment.artifactSha256,
      verdict: "invalid", scores: { overall: 1 }, rationale: "Awaiting independent judgment.", judgeIdPseudonym: "unassigned" };
    validateJudgeAssignment(packet); out.push(packet);
  }
  return out;
}
