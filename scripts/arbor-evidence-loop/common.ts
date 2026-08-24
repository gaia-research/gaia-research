import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export const TELEMETRY_SCHEMA = "gaia.skill-zero-runtime-observation/v1";
export const RECEIPT_SCHEMA = "gaia.arbor-benchmark-receipt/v1";

export type JsonObject = { [key: string]: unknown };

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as JsonObject).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson((value as JsonObject)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function digestJson(value: unknown): string { return sha256(canonicalJson(value) + "\n"); }
export function readJson(path: string): unknown { return JSON.parse(readFileSync(path, "utf8")); }

const isObject = (v: unknown): v is JsonObject => !!v && typeof v === "object" && !Array.isArray(v);
const keys = (v: JsonObject, allowed: string[], at: string) => {
  const extra = Object.keys(v).filter((k) => !allowed.includes(k));
  if (extra.length) throw new Error(`${at} has unknown field(s): ${extra.join(", ")}`);
};
const required = (v: JsonObject, names: string[], at: string) => {
  for (const name of names) if (!(name in v)) throw new Error(`${at}.${name} is required`);
};
const str = (v: unknown, at: string) => {
  if (typeof v !== "string" || !v) throw new Error(`${at} must be a non-empty string`);
  return v;
};
const hash = (v: unknown, at: string) => {
  if (typeof v !== "string" || !/^[a-f0-9]{64}$/.test(v)) throw new Error(`${at} must be a lowercase SHA-256`);
  return v;
};

export interface Declaration { schema: string; declarationId: string; declaredAt: string; skill: { id: string; contentSha256: string }; claims: Array<{ id: string; facet: "human-led" | "model-led"; conditions: string; rationale: string; authority: { actor: string; basis: string } }> }
export function validateDeclaration(value: unknown): asserts value is Declaration {
  if (!isObject(value)) throw new Error("declaration must be an object");
  keys(value, ["schema", "declarationId", "declaredAt", "skill", "claims"], "declaration"); required(value, ["schema", "declarationId", "declaredAt", "skill", "claims"], "declaration");
  if (value.schema !== "gaia.arbor-expert-declaration/v1") throw new Error("unsupported declaration schema");
  str(value.declarationId, "declaration.declarationId"); str(value.declaredAt, "declaration.declaredAt");
  const skill = value.skill; if (!isObject(skill)) throw new Error("declaration.skill must be an object"); keys(skill, ["id", "contentSha256"], "declaration.skill"); required(skill, ["id", "contentSha256"], "declaration.skill"); str(skill.id, "declaration.skill.id"); hash(skill.contentSha256, "declaration.skill.contentSha256");
  if (!Array.isArray(value.claims) || value.claims.length === 0) throw new Error("declaration.claims must be non-empty");
  for (const [i, item] of value.claims.entries()) { const claim = item; if (!isObject(claim)) throw new Error(`declaration.claims[${i}] must be an object`); keys(claim, ["id", "facet", "conditions", "rationale", "authority"], `declaration.claims[${i}]`); required(claim, ["id", "facet", "conditions", "rationale", "authority"], `declaration.claims[${i}]`); str(claim.id, `declaration.claims[${i}].id`); if (claim.facet !== "human-led" && claim.facet !== "model-led") throw new Error(`declaration.claims[${i}].facet is invalid`); str(claim.conditions, `declaration.claims[${i}].conditions`); str(claim.rationale, `declaration.claims[${i}].rationale`); const authority = claim.authority; if (!isObject(authority)) throw new Error(`declaration.claims[${i}].authority must be an object`); keys(authority, ["actor", "basis"], `declaration.claims[${i}].authority`); required(authority, ["actor", "basis"], `declaration.claims[${i}].authority`); str(authority.actor, "authority.actor"); str(authority.basis, "authority.basis"); }
}

export interface Observation { schema: string; sessionPseudonym: string; observedAt: string; harness: { name: string; version?: string }; model?: { id: string; version?: string }; composition: { posture: string; mechanism?: string; loadedSkills: Array<{ id: string; contentSha256: string; invocationObserved: true | null }> }; taskFamily?: string; signals: { outcome: { status: "succeeded" | "failed"; exitCode: number }; retryCount: number | null; recoveryObserved: boolean | null; churnCount: number | null }; metrics: { latencyMs: number; tokens?: Record<string, number> } }
const localPathPatterns = [
  /(?:^|\s|["'(={])file:[^\s"'<>]+/i,
  /(?:^|\s|["'(={])[A-Za-z]:[\\/][^\s"'<>]*/,
  /(?:^|\s|["'(={])\\[^\s"'<>]+/,
  /(?:^|\s|["'(={])\/\/(?!\/)[^\s"'<>]+/,
  /(?:^|\s|["'(={])\/(?![\/\s])[^\s"'<>]*/,
];

function rejectLocalPaths(value: unknown, at = "observation"): void {
  if (typeof value === "string") {
    if (localPathPatterns.some((pattern) => pattern.test(value))) throw new Error(`${at} contains an absolute local path`);
    return;
  }
  if (Array.isArray(value)) { value.forEach((item, index) => rejectLocalPaths(item, `${at}[${index}]`)); return; }
  if (isObject(value)) for (const [key, item] of Object.entries(value)) rejectLocalPaths(item, `${at}.${key}`);
}

export function validateObservation(value: unknown): asserts value is Observation {
  if (!isObject(value)) throw new Error("telemetry observation must be an object");
  rejectLocalPaths(value);
  keys(value, ["schema", "sessionPseudonym", "observedAt", "harness", "model", "composition", "taskFamily", "signals", "metrics"], "observation"); required(value, ["schema", "sessionPseudonym", "observedAt", "harness", "composition", "signals", "metrics"], "observation");
  if (value.schema !== TELEMETRY_SCHEMA) throw new Error("unsupported telemetry schema");
  if (typeof value.sessionPseudonym !== "string" || !/^szs_[a-f0-9]{64}$/.test(value.sessionPseudonym)) throw new Error("invalid session pseudonym");
  if (typeof value.observedAt !== "string" || !Number.isFinite(Date.parse(value.observedAt))) throw new Error("invalid observedAt");
  const harness = value.harness; if (!isObject(harness)) throw new Error("observation.harness must be an object"); keys(harness, ["name", "version"], "observation.harness"); str(harness.name, "harness.name"); if (harness.version !== undefined) str(harness.version, "harness.version");
  if (value.model !== undefined) { if (!isObject(value.model)) throw new Error("observation.model must be an object"); keys(value.model, ["id", "version"], "observation.model"); str(value.model.id, "model.id"); if (value.model.version !== undefined) str(value.model.version, "model.version"); }
  const composition = value.composition; if (!isObject(composition)) throw new Error("observation.composition must be an object"); keys(composition, ["posture", "mechanism", "loadedSkills"], "observation.composition"); required(composition, ["posture", "loadedSkills"], "observation.composition"); if (!["floor", "product-floor", "curated", "native"].includes(String(composition.posture))) throw new Error("invalid posture"); if (!Array.isArray(composition.loadedSkills)) throw new Error("loadedSkills must be an array");
  for (const skill of composition.loadedSkills) { if (!isObject(skill)) throw new Error("loaded skill must be an object"); keys(skill, ["id", "contentSha256", "invocationObserved"], "loaded skill"); required(skill, ["id", "contentSha256", "invocationObserved"], "loaded skill"); str(skill.id, "loaded skill.id"); hash(skill.contentSha256, "loaded skill.contentSha256"); if (skill.invocationObserved !== true && skill.invocationObserved !== null) throw new Error("invocationObserved must be true or null"); }
  if (value.taskFamily !== undefined) str(value.taskFamily, "taskFamily");
  const signals = value.signals; if (!isObject(signals)) throw new Error("observation.signals must be an object"); keys(signals, ["outcome", "retryCount", "recoveryObserved", "churnCount"], "observation.signals"); required(signals, ["outcome", "retryCount", "recoveryObserved", "churnCount"], "observation.signals"); const outcome = signals.outcome; if (!isObject(outcome)) throw new Error("outcome must be an object"); keys(outcome, ["status", "exitCode"], "outcome"); if (outcome.status !== "succeeded" && outcome.status !== "failed") throw new Error("invalid outcome status"); if (!Number.isSafeInteger(outcome.exitCode) || Number(outcome.exitCode) < 0 || ((outcome.exitCode === 0) !== (outcome.status === "succeeded"))) throw new Error("outcome status/exitCode mismatch");
  for (const k of ["retryCount", "churnCount"]) if (signals[k] !== null && (!Number.isSafeInteger(signals[k]) || Number(signals[k]) < 0)) throw new Error(`${k} must be null or a non-negative integer`); if (signals.recoveryObserved !== null && typeof signals.recoveryObserved !== "boolean") throw new Error("recoveryObserved must be null or boolean");
  const metrics = value.metrics; if (!isObject(metrics)) throw new Error("observation.metrics must be an object"); keys(metrics, ["latencyMs", "tokens"], "observation.metrics"); required(metrics, ["latencyMs"], "observation.metrics"); if (!Number.isSafeInteger(metrics.latencyMs) || Number(metrics.latencyMs) < 0) throw new Error("latencyMs must be a non-negative integer");
}

export function loadObservations(paths: string[]): Observation[] { if (!paths.length) throw new Error("at least one telemetry export is required"); const values = paths.map((p) => { const value = readJson(p); validateObservation(value); return value; }); return values.sort((a, b) => canonicalJson(a).localeCompare(canonicalJson(b))); }
export function conditionKey(o: Observation): string { return canonicalJson({ harness: o.harness, model: o.model ?? null, posture: o.composition.posture, taskFamily: o.taskFamily ?? null }); }
export function claimQuestion(declaration: Declaration, claim: Declaration["claims"][number]): string { return `Does skill ${declaration.skill.id} exhibit the ${claim.facet} claim under these stated conditions: ${claim.conditions}?`; }
export function parseFlag(name: string, args: string[]): string | undefined { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; }
export function requireFlag(name: string, args: string[]): string { const value = parseFlag(name, args); if (!value) throw new Error(`missing ${name}`); return value; }
export function writeOutput(value: unknown): void { process.stdout.write(`${canonicalJson(value)}\n`); }
