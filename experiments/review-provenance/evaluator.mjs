#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_FIXTURE = join(HERE, "fixture.json");

function flag(name, args, required = true) {
  const index = args.indexOf(name);
  const value = index < 0 ? undefined : args[index + 1];
  if (required && (!value || value.startsWith("--"))) {
    throw new Error(`missing ${name}`);
  }
  return value;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function assertFixture(fixture) {
  if (fixture.schema !== "gaia.research.review-provenance-fixture/v1") {
    throw new Error("unsupported fixture schema");
  }
  if (typeof fixture.skillId !== "string" || !fixture.skillId) {
    throw new Error("fixture.skillId must be a non-empty string");
  }
  if (!fixture.records || typeof fixture.records !== "object") {
    throw new Error("fixture.records must be an object");
  }
  for (const field of ["digest", "checkedAt", "runId"]) {
    if (typeof fixture.observation?.[field] !== "string") {
      throw new Error(`fixture.observation.${field} must be a string`);
    }
  }
}

function projectionFor(fixture, record) {
  return {
    schema: "gaia.installability/v1",
    indexPath: fixture.projectionIndexPath,
    observations: [fixture.observation],
    skills: { [fixture.skillId]: clone(record) },
  };
}

function candidateFor(fixture, record) {
  return {
    id: fixture.skillId,
    sourceRoute: clone(record.currentSourceRoute),
    skillContentSha256: record.currentSkillContentSha256,
    resolvedRevision: record.resolvedRevision,
  };
}

function summary(value) {
  if (!value || typeof value !== "object") return null;
  return {
    state: value.state,
    reason: value.reason,
    applicability: value.applicability,
    applicabilityReason: value.applicabilityReason,
    upstream: value.upstream === null ? "absent" : "present",
  };
}

function equal(actual, expected) {
  return Object.is(actual, expected);
}

function summaryChecks(actual, expected) {
  const observed = summary(actual);
  return [
    ["state", expected.state, observed?.state],
    ["reason", expected.reason, observed?.reason],
    ["applicability", expected.applicability, observed?.applicability],
    ["applicabilityReason", expected.applicabilityReason, observed?.applicabilityReason],
    ["upstream-presence", expected.upstream, observed?.upstream],
  ].map(([observable, expectedValue, actualValue]) => ({
    observable,
    expected: expectedValue,
    actual: actualValue,
    passed: equal(actualValue, expectedValue),
  }));
}

function assertionCheck(task, assessment, expected) {
  let errorMessage = null;
  try {
    task.assertInstallabilityAssessment(assessment);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
  }
  const assertionOutcome = errorMessage === null ? "accepted" : "rejected";
  const checks = [
    {
      observable: "assertion-outcome",
      expected: expected.outcome,
      actual: assertionOutcome,
      passed: assertionOutcome === expected.outcome,
    },
  ];
  return {
    assertion: assertionOutcome,
    failureReason: errorMessage,
    checks,
  };
}

function withInstallabilityResult(task, fixture, record) {
  const index = { docs: [{ id: fixture.skillId }] };
  const assessments = new Map([[fixture.skillId, clone(record)]]);
  return task.withInstallability(index, assessments).docs[0].installability;
}

function caseWithInstallability(task, fixture, name, recordName, expected, assertion) {
  const record = fixture.records[recordName];
  const actual = withInstallabilityResult(task, fixture, {
    state: record.state,
    reason: record.reason,
    applicability: "verified",
    applicabilityReason: "matched",
    projectionIndexPath: fixture.projectionIndexPath,
    upstream: clone(record),
  });
  const checks = summaryChecks(actual, expected);
  const assertionResult = assertionCheck(
    task,
    {
      state: record.state,
      reason: record.reason,
      applicability: "verified",
      applicabilityReason: "matched",
      projectionIndexPath: fixture.projectionIndexPath,
      upstream: clone(record),
    },
    assertion,
  );
  const allChecks = [...checks, ...assertionResult.checks];
  return {
    id: name,
    surface: "withInstallability / safeAssessment",
    observable: "effective assessment plus validator behavior",
    expected,
    actual: summary(actual),
    failureReason: assertionResult.failureReason,
    checks: allChecks,
    passed: allChecks.every((check) => check.passed),
  };
}

function caseAssessment(task, fixture, name, recordName, candidate, expected) {
  const record = fixture.records[recordName];
  let actual;
  try {
    actual = task.assessInstallability(
      projectionFor(fixture, record),
      fixture.skillId,
      candidate === "undefined" ? undefined : candidateFor(fixture, record),
      "tree",
    );
  } catch (error) {
    return {
      id: name,
      surface: "assessInstallability",
      observable: "effective assessment plus malformed-input handling",
      expected,
      actual: { threw: error instanceof Error ? error.message : String(error) },
      failureReason: "unexpected evaluator exception",
      checks: [{ observable: "no-throw", expected: true, actual: false, passed: false }],
      passed: false,
    };
  }
  const checks = summaryChecks(actual, expected);
  return {
    id: name,
    surface: "assessInstallability",
    observable: "effective assessment plus malformed-input handling",
    expected,
    actual: summary(actual),
    failureReason: summary(actual)?.reason ?? null,
    checks,
    passed: checks.every((check) => check.passed),
  };
}

function run(task, fixture) {
  const unknownFromSafeAssessment = {
    state: "unknown",
    reason: "unverified-applicability",
    applicability: "unknown",
    applicabilityReason: "invalid-evidence",
    upstream: "absent",
  };
  const verifiedNoSource = {
    state: "not-materializable",
    reason: "no-source",
    applicability: "verified",
    applicabilityReason: "matched",
    upstream: "present",
  };
  const verifiedIntrinsicFailure = {
    state: "not-materializable",
    reason: "intrinsic-content-failure",
    applicability: "verified",
    applicabilityReason: "matched",
    upstream: "present",
  };
  const verifiedMaterializable = {
    state: "materializable",
    reason: "gaia-materialized",
    applicability: "verified",
    applicabilityReason: "matched",
    upstream: "present",
  };
  const results = [
    caseWithInstallability(
      task,
      fixture,
      "verified-negative-missing-observationDigest",
      "verifiedNegativeMissingDigest",
      unknownFromSafeAssessment,
      { outcome: "rejected" },
    ),
    caseWithInstallability(
      task,
      fixture,
      "verified-negative-missing-observedAt",
      "verifiedNegativeMissingObservedAt",
      unknownFromSafeAssessment,
      { outcome: "rejected" },
    ),
    caseWithInstallability(
      task,
      fixture,
      "verified-no-source-preserves-legitimate-null-fields",
      "verifiedNoSource",
      verifiedNoSource,
      { outcome: "accepted" },
    ),
    caseWithInstallability(
      task,
      fixture,
      "verified-intrinsic-failure-preserves-legitimate-null-fields",
      "verifiedIntrinsicFailure",
      verifiedIntrinsicFailure,
      { outcome: "accepted" },
    ),
    caseWithInstallability(
      task,
      fixture,
      "verified-materializable-remains-valid",
      "verifiedMaterializable",
      verifiedMaterializable,
      { outcome: "accepted" },
    ),
    caseWithInstallability(
      task,
      fixture,
      "malformed-negative-fails-closed",
      "malformedNegativeWithUnscopedReason",
      unknownFromSafeAssessment,
      { outcome: "rejected" },
    ),
    caseAssessment(
      task,
      fixture,
      "missing-candidate-yields-invalid-context",
      "unknownNotObserved",
      "undefined",
      {
        state: "unknown",
        reason: "unverified-applicability",
        applicability: "unknown",
        applicabilityReason: "invalid-context",
        upstream: "present",
      },
    ),
    caseAssessment(
      task,
      fixture,
      "malformed-evidence-is-not-upgraded",
      "malformedNegativeWithUnscopedReason",
      "undefined",
      {
        state: "unknown",
        reason: "unverified-applicability",
        applicability: "unknown",
        applicabilityReason: "invalid-evidence",
        upstream: "present",
      },
    ),
    caseAssessment(
      task,
      fixture,
      "valid-materializable-assessment-can-be-matched",
      "verifiedMaterializable",
      "provided",
      verifiedMaterializable,
    ),
  ];
  return results;
}

try {
  const args = process.argv.slice(2);
  const taskPath = resolve(flag("--task", args));
  const fixturePath = resolve(flag("--fixture", args, false) ?? DEFAULT_FIXTURE);
  const fixture = readJson(fixturePath);
  assertFixture(fixture);
  const task = await import(pathToFileURL(taskPath).href);
  const results = run(task, fixture);
  const report = {
    schema: "gaia.research.review-provenance-oracle/v1",
    kind: "fixture-oracle-check",
    taskSha256: sha256(readFileSync(taskPath)),
    fixtureSha256: sha256(readFileSync(fixturePath)),
    checks: results,
    passed: results.every((result) => result.passed),
    note: "Deterministic source/oracle checks only; no harness, model, skill exposure, behavioral observation, or Arbor conclusion.",
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.passed) process.exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
