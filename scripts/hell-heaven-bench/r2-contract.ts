// Research-side R2 contracts. hh-ledger/v1 is imported only for its frozen arm names;
// exact rungs and trial attempt metadata deliberately live in companion artifacts.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS } from "./ledger.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "data", "r2");
const SHA = /^[a-f0-9]{64}$/;
const GIT_OID = /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/;
const RUNGS = new Set(["zero", "low", "med", "high", "xhigh", "max"]);
const ARM_RUNG: Record<string, Set<string>> = {
  placebo: new Set(["zero"]), heaven: new Set(["low", "med"]),
  hell: new Set(["high", "xhigh", "max"]), ultra: new Set(["ultra"]),
};
const INVALID_REASONS = new Set([
  "harness-crash", "provider-outage", "rate-limit", "sandbox-setup",
  "capture-corrupt", "endpoint-infrastructure", "protocol-deviation",
]);

export function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}
function object(v: unknown, where: string): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error(`${where}: expected object`);
  return v as Record<string, unknown>;
}
function text(v: unknown, where: string): string {
  if (typeof v !== "string" || !v) throw new Error(`${where}: expected non-empty string`);
  return v;
}
function array(v: unknown, where: string): unknown[] {
  if (!Array.isArray(v)) throw new Error(`${where}: expected array`);
  return v;
}

export function validateIdentityManifest(raw: unknown) {
  const r = object(raw, "identity manifest");
  if (r.schema !== "hh-r2-content-identities/v1") throw new Error("identity manifest: bad schema");
  const skills = array(r.skills, "identity manifest.skills").map((v, i) => object(v, `skills[${i}]`));
  if (skills.length !== 20) throw new Error(`identity manifest: expected 20 skills, got ${skills.length}`);
  const ids = new Set<string>(); const slots = new Set<string>();
  for (const [i, s] of skills.entries()) {
    const slot = text(s.slot, `skills[${i}].slot`); const id = text(s.skillId, `skills[${i}].skillId`);
    if (!/^\d{2}$/.test(slot) || slots.has(slot)) throw new Error(`skills[${i}]: duplicate/invalid slot`);
    if (ids.has(id) || id.includes("TBD")) throw new Error(`skills[${i}]: duplicate/unresolved skillId`);
    slots.add(slot); ids.add(id);
    const commit = text(s.commit, `skills[${i}].commit`);
    const hash = text(s.contentSha256, `skills[${i}].contentSha256`);
    if (!GIT_OID.test(commit) || !SHA.test(hash)) throw new Error(`skills[${i}]: commit must be a full git oid and content hash must be 64-hex`);
    const repo = text(s.repository, `skills[${i}].repository`); const path = text(s.path, `skills[${i}].path`);
    const expected = `https://raw.githubusercontent.com/${repo}/${commit}/${path}`;
    if (s.sourceUrl !== expected) throw new Error(`skills[${i}]: sourceUrl is not the immutable raw URL`);
  }
  return { ids, skills };
}

export function validateTaskMatrix(raw: unknown, identities: ReturnType<typeof validateIdentityManifest>) {
  const r = object(raw, "task matrix");
  if (r.schema !== "hh-r2-task-matrix/v1") throw new Error("task matrix: bad schema");
  const repeats = array(r.repeatIndices, "repeatIndices");
  if (repeats.length < 5 || repeats.some((v, i) => v !== i)) throw new Error("repeatIndices must be contiguous from 0 with N >= 5");
  const tasks = array(r.tasks, "tasks").map((v, i) => object(v, `tasks[${i}]`));
  if (tasks.length !== 20) throw new Error(`task matrix: expected 20 tasks, got ${tasks.length}`);
  const taskIds = new Set<string>(); const targetIds = new Set<string>();
  for (const [i, task] of tasks.entries()) {
    const taskId = text(task.taskId, `tasks[${i}].taskId`); const target = text(task.targetSkillId, `tasks[${i}].targetSkillId`);
    if (taskIds.has(taskId) || !identities.ids.has(target)) throw new Error(`tasks[${i}]: duplicate task or unknown target`);
    taskIds.add(taskId); targetIds.add(target); text(task.taskPrompt, `tasks[${i}].taskPrompt`);
    const ep = object(task.endpoint, `tasks[${i}].endpoint`);
    if (![2, 3].includes(ep.tier as number)) throw new Error(`tasks[${i}]: endpoint tier must be 2 or 3`);
    text(ep.kind, `tasks[${i}].endpoint.kind`); text(ep.command, `tasks[${i}].endpoint.command`);
    if (ep.network !== "denied") throw new Error(`tasks[${i}]: task endpoint network must be denied`);
    const loadouts = array(task.loadouts, `tasks[${i}].loadouts`).map((v, j) => object(v, `tasks[${i}].loadouts[${j}]`));
    const expected = new Set(["placebo", "heaven-low", "heaven-med", "hell-high", "hell-xhigh", "hell-max"]);
    for (const l of loadouts) {
      const lid = text(l.id, "loadout.id"); expected.delete(lid);
      const arm = text(l.arm, "loadout.arm"); const rung = text(l.rung, "loadout.rung");
      if (!ARMS.includes(arm as never) || !RUNGS.has(rung) || !ARM_RUNG[arm]?.has(rung)) throw new Error(`${taskId}/${lid}: arm/rung mismatch`);
      for (const id of array(l.skills, "loadout.skills")) if (typeof id !== "string" || !identities.ids.has(id)) throw new Error(`${taskId}/${lid}: unknown skill ref`);
      if (arm === "placebo" && (l.skills as unknown[]).length !== 0) throw new Error(`${taskId}: placebo must be empty`);
      if (arm !== "placebo" && !(l.skills as unknown[]).includes(target)) throw new Error(`${taskId}/${lid}: target skill missing`);
      for (const forbidden of ["skillCount", "maxSkills", "cap"]) if (forbidden in l) throw new Error(`${taskId}/${lid}: ${forbidden} would invent rung count semantics`);
    }
    if (expected.size) throw new Error(`${taskId}: missing loadouts ${[...expected].join(",")}`);
  }
  if (targetIds.size !== 20) throw new Error("task matrix must target every pinned identity exactly once");
  const pilot = object(r.controlPilot, "controlPilot");
  for (const id of array(pilot.taskIds, "controlPilot.taskIds")) if (typeof id !== "string" || !taskIds.has(id)) throw new Error("controlPilot references unknown task");
  return { taskIds };
}

export function validateAttempt(raw: unknown) {
  const a = object(raw, "attempt");
  if (a.schema !== "hh-r2-attempt/v1") throw new Error("attempt: bad schema");
  const attemptKeys = new Set(["schema", "attemptId", "taskId", "loadoutId", "repeatIndex", "attemptIndex", "startedAt", "finishedAt", "status", "invalidReason", "artifactSha256", "ledgerRecordSha256"]);
  for (const k of Object.keys(a)) if (!attemptKeys.has(k)) throw new Error(`attempt: unknown field ${k}`);
  for (const k of ["attemptId", "taskId", "loadoutId", "startedAt", "finishedAt", "artifactSha256"])
    text(a[k], `attempt.${k}`);
  if (Number.isNaN(Date.parse(a.startedAt as string)) || Number.isNaN(Date.parse(a.finishedAt as string))) throw new Error("attempt timestamps must be ISO date-times");
  if (!SHA.test(a.artifactSha256 as string)) throw new Error("attempt.artifactSha256 must be 64-hex");
  if (!Number.isInteger(a.repeatIndex) || (a.repeatIndex as number) < 0 || !Number.isInteger(a.attemptIndex) || (a.attemptIndex as number) < 0)
    throw new Error("attempt repeatIndex/attemptIndex must be non-negative integers");
  if (!['valid','invalid'].includes(a.status as string)) throw new Error("attempt.status must be valid|invalid");
  if (a.status === "valid" && (a.invalidReason !== null || typeof a.ledgerRecordSha256 !== "string" || !SHA.test(a.ledgerRecordSha256)))
    throw new Error("valid attempt needs ledgerRecordSha256 and null invalidReason");
  if (a.status === "invalid" && (!INVALID_REASONS.has(a.invalidReason as string) || a.ledgerRecordSha256 !== null))
    throw new Error("invalid attempt needs enumerated reason and no ledger record");
}

export function validateJudgeAssignment(raw: unknown) {
  const j = object(raw, "judge assignment");
  if (j.schema !== "hh-r2-blind-judge/v1") throw new Error("judge: bad schema");
  const judgeKeys = new Set(["schema", "assignmentId", "taskId", "rubricVersion", "candidateAArtifactSha256", "candidateBArtifactSha256", "verdict", "scores", "rationale", "judgeIdPseudonym"]);
  for (const k of Object.keys(j)) if (!judgeKeys.has(k)) throw new Error(`judge assignment leaks treatment identity or has unknown field: ${k}`);
  for (const k of ["assignmentId", "taskId", "rubricVersion", "candidateAArtifactSha256", "candidateBArtifactSha256", "rationale", "judgeIdPseudonym"])
    if (!SHA.test(text(j[k], `judge.${k}`)) && k.endsWith("Sha256")) throw new Error(`judge.${k}: expected 64-hex`);
  if (!['A','B','tie','invalid'].includes(j.verdict as string)) throw new Error("judge.verdict invalid");
  const scores = object(j.scores, "judge.scores");
  for (const [k,v] of Object.entries(scores)) if (!Number.isInteger(v) || (v as number) < 1 || (v as number) > 5) throw new Error(`judge.scores.${k}: expected integer 1..5`);
}

export async function verifyRemoteIdentities(raw: unknown) {
  const { skills } = validateIdentityManifest(raw);
  for (const s of skills) {
    const response = await fetch(s.sourceUrl as string);
    if (!response.ok) throw new Error(`${s.skillId}: fetch ${response.status}`);
    const digest = createHash("sha256").update(Buffer.from(await response.arrayBuffer())).digest("hex");
    if (digest !== s.contentSha256) throw new Error(`${s.skillId}: content hash mismatch`);
  }
}

export const DEFAULT_IDENTITIES = join(ROOT, "content-identities.json");
export const DEFAULT_MATRIX = join(ROOT, "task-matrix.json");
