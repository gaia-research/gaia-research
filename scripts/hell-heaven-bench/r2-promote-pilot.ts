import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { validateJudgeAssignment } from "./r2-contract.ts";

const out = resolve(process.argv[2] ?? "");
const judgesPath = resolve(process.argv[3] ?? "");
const concealedPath = resolve(process.argv[4] ?? "");
if (!out || !judgesPath || !concealedPath) throw new Error("usage: r2-promote-pilot.ts <run-dir> <completed-judges.jsonl> <concealed-mapping.jsonl>");
const endpointMarker = join(out, "PILOT-ENDPOINTS-PASSED");
if (!existsSync(endpointMarker)) throw new Error("pilot endpoint gate has not passed");
const lines = (path:string) => readFileSync(path, "utf8").split("\n").filter(Boolean).map((line, i) => { try { return JSON.parse(line); } catch { throw new Error(`${path}:${i+1}: invalid JSON`); } });
const judges = lines(judgesPath); const concealed = lines(concealedPath);
if (judges.length !== 10 || concealed.length !== 10) throw new Error(`task 02 pilot requires exactly 10 completed blind pairs; judges=${judges.length}, concealed=${concealed.length}`);
const mappings = new Map(concealed.map((x:any) => [x.assignmentId, x]));
for (const judge of judges) {
  validateJudgeAssignment(judge);
  if (judge.taskId !== "hh-r2-02-design-system" || judge.verdict === "invalid" || judge.judgeIdPseudonym === "unassigned") throw new Error(`incomplete/invalid control judgment ${judge.assignmentId}`);
  const mapping:any = mappings.get(judge.assignmentId); if (!mapping || mapping.taskId !== judge.taskId || mapping.candidateA === mapping.candidateB) throw new Error(`missing/corrupt concealed mapping ${judge.assignmentId}`);
  if (/placebo|heaven|hell|loadout|skillId/i.test(JSON.stringify(judge))) throw new Error(`treatment identity leaked in judge record ${judge.assignmentId}`);
}
const body = JSON.stringify({schema:"hh-r2-pilot-promotion/v1",endpointMarkerSha256:createHash("sha256").update(readFileSync(endpointMarker)).digest("hex"),judgesSha256:createHash("sha256").update(readFileSync(judgesPath)).digest("hex"),concealedMappingSha256:createHash("sha256").update(readFileSync(concealedPath)).digest("hex"),completedBlindPairs:judges.length},null,2)+"\n";
writeFileSync(join(out,"PILOT-PROMOTED"),body,{flag:"wx"});
console.log(body.trim());
