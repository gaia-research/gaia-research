import { describe, expect, it } from "vitest";
import identitiesRaw from "./data/r2/content-identities.json";
import matrixRaw from "./data/r2/task-matrix.json";
import { validateAttempt, validateIdentityManifest, validateJudgeAssignment, validateTaskMatrix } from "./r2-contract";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

describe("R2 pre-registration contract", () => {
  it("accepts the committed identities and full task matrix", () => {
    const identities = validateIdentityManifest(identitiesRaw);
    expect(() => validateTaskMatrix(matrixRaw, identities)).not.toThrow();
  });
  it("rejects unresolved identities and invented rung caps", () => {
    const badIds = clone(identitiesRaw); badIds.skills[0].skillId = "TBD";
    expect(() => validateIdentityManifest(badIds)).toThrow(/unresolved/);
    const identities = validateIdentityManifest(identitiesRaw);
    const badMatrix = clone(matrixRaw); (badMatrix.tasks[0].loadouts[1] as Record<string, unknown>).maxSkills = 1;
    expect(() => validateTaskMatrix(badMatrix, identities)).toThrow(/invent rung count/);
  });
  it("keeps invalid attempts out of the frozen ledger", () => {
    expect(() => validateAttempt({ schema:"hh-r2-attempt/v1", attemptId:"a", taskId:"t", loadoutId:"l", repeatIndex:0, attemptIndex:0,
      startedAt:"2026-08-24T00:00:00Z", finishedAt:"2026-08-24T00:00:01Z", status:"invalid", invalidReason:"rate-limit",
      artifactSha256:"a".repeat(64), ledgerRecordSha256:null })).not.toThrow();
    expect(() => validateAttempt({ schema:"hh-r2-attempt/v1", attemptId:"a", taskId:"t", loadoutId:"l", repeatIndex:0, attemptIndex:0,
      startedAt:"2026-08-24T00:00:00Z", finishedAt:"2026-08-24T00:00:01Z", status:"invalid", invalidReason:"model-disliked-answer", artifactSha256:"a".repeat(64), ledgerRecordSha256:null })).toThrow(/enumerated/);
  });
  it("rejects treatment leaks in blind-judge records", () => {
    const j = { schema:"hh-r2-blind-judge/v1", assignmentId:"j", taskId:"t", rubricVersion:"r1",
      candidateAArtifactSha256:"a".repeat(64), candidateBArtifactSha256:"b".repeat(64), verdict:"A", scores:{correctness:4}, arm:"heaven" };
    expect(() => validateJudgeAssignment(j)).toThrow(/leaks/);
  });
});
