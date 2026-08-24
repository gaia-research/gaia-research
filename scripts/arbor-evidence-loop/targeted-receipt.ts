import { digestJson, readJson, requireFlag, validateDeclaration, writeOutput, type JsonObject, type Declaration } from "./common.js";

const args = process.argv.slice(2);
const hash = (value: unknown, at: string): string => { if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) throw new Error(`${at} must be a lowercase SHA-256`); return value; };
const text = (value: unknown, at: string): string => { if (typeof value !== "string" || !value) throw new Error(`${at} must be a non-empty string`); return value; };
const object = (value: unknown, at: string): JsonObject => { if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${at} must be an object`); return value as JsonObject; };
const exact = (value: JsonObject, allowed: string[], at: string) => { const extra = Object.keys(value).filter((k) => !allowed.includes(k)); if (extra.length) throw new Error(`${at} has unknown field(s): ${extra.join(", ")}`); };
const required = (value: JsonObject, fields: string[], at: string) => fields.forEach((field) => { if (!(field in value)) throw new Error(`${at}.${field} is required`); });

function validateArm(value: unknown, at: string): JsonObject {
  const arm = object(value, at); exact(arm, ["definition", "environment"], at); required(arm, ["definition", "environment"], at); text(arm.definition, `${at}.definition`);
  const environment = object(arm.environment, `${at}.environment`); exact(environment, ["model", "harness", "artifacts"], `${at}.environment`); required(environment, ["model", "harness", "artifacts"], `${at}.environment`); text(environment.model, `${at}.environment.model`); text(environment.harness, `${at}.environment.harness`);
  const artifacts = object(environment.artifacts, `${at}.environment.artifacts`); exact(artifacts, ["taskSha256", "fixtureSha256", "evaluatorSha256"], `${at}.environment.artifacts`); required(artifacts, ["taskSha256", "fixtureSha256", "evaluatorSha256"], `${at}.environment.artifacts`); for (const field of ["taskSha256", "fixtureSha256", "evaluatorSha256"]) hash(artifacts[field], `${at}.environment.artifacts.${field}`);
  return arm;
}

try {
  const declarationValue = readJson(requireFlag("--declaration", args)); validateDeclaration(declarationValue); const declaration = declarationValue as Declaration;
  const claimId = requireFlag("--claim-id", args); if (!declaration.claims.some((claim) => claim.id === claimId)) throw new Error(`claim not found: ${claimId}`);
  const control = validateArm(readJson(requireFlag("--control", args)), "control"); const treatment = validateArm(readJson(requireFlag("--treatment", args)), "treatment");
  const controlEnvironment = object(control.environment, "control.environment"); const treatmentEnvironment = object(treatment.environment, "treatment.environment");
  if (digestJson(controlEnvironment.artifacts) !== digestJson(treatmentEnvironment.artifacts)) throw new Error("control and treatment must pin identical task, fixture, and evaluator digests");
  const measurementValue = readJson(requireFlag("--measurement", args)); const measurement = object(measurementValue, "measurement"); exact(measurement, ["metric", "unit", "control", "treatment", "difference"], "measurement"); required(measurement, ["metric", "unit", "control", "treatment"], "measurement"); text(measurement.metric, "measurement.metric"); text(measurement.unit, "measurement.unit");
  for (const field of ["control", "treatment"]) { const observation = object(measurement[field], `measurement.${field}`); exact(observation, ["value", "count"], `measurement.${field}`); required(observation, ["value"], `measurement.${field}`); if (typeof observation.value !== "number" || !Number.isFinite(observation.value)) throw new Error(`measurement.${field}.value must be a finite number`); if (observation.count !== undefined && (!Number.isSafeInteger(observation.count) || Number(observation.count) < 1)) throw new Error(`measurement.${field}.count must be a positive integer`); }
  if (measurement.difference !== undefined && (typeof measurement.difference !== "number" || !Number.isFinite(measurement.difference))) throw new Error("measurement.difference must be a finite number");
  const provenanceValue = readJson(requireFlag("--provenance", args)); const provenance = object(provenanceValue, "provenance"); exact(provenance, ["runner", "observedAt", "artifacts"], "provenance"); required(provenance, ["runner", "observedAt", "artifacts"], "provenance"); text(provenance.runner, "provenance.runner"); text(provenance.observedAt, "provenance.observedAt"); if (!Number.isFinite(Date.parse(String(provenance.observedAt)))) throw new Error("provenance.observedAt must be date-time");
  if (!Array.isArray(provenance.artifacts) || provenance.artifacts.length === 0) throw new Error("provenance.artifacts must be non-empty"); for (const [i, item] of provenance.artifacts.entries()) { const artifact = object(item, `provenance.artifacts[${i}]`); exact(artifact, ["uri", "sha256"], `provenance.artifacts[${i}]`); required(artifact, ["uri", "sha256"], `provenance.artifacts[${i}]`); text(artifact.uri, `provenance.artifacts[${i}].uri`); hash(artifact.sha256, `provenance.artifacts[${i}].sha256`); }
  const receipt = { schema: "gaia.arbor-benchmark-receipt/v1", skill: declaration.skill, target: { declarationSha256: digestJson(declaration), claimId }, benchmark: { id: requireFlag("--benchmark-id", args), version: requireFlag("--benchmark-version", args) }, control, treatment, provenance, measurements: [measurement] };
  writeOutput(receipt);
} catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
