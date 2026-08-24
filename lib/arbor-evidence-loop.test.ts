import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..", "scripts", "arbor-evidence-loop");
const fixture = (name: string) => resolve(root, "fixtures", name);
const run = (script: string, args: string[]) => JSON.parse(execFileSync("npx", ["tsx", resolve(root, script), ...args], { encoding: "utf8" }));
const runFailure = (script: string, args: string[]) => {
  try { execFileSync("npx", ["tsx", resolve(root, script), ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (error) { return String((error as { stderr?: string }).stderr ?? error); }
  throw new Error("expected command to fail");
};
const temporaryJson = (value: unknown) => {
  const path = resolve(mkdtempSync(resolve(tmpdir(), "arbor-test-")), "input.json");
  writeFileSync(path, JSON.stringify(value));
  return path;
};

describe("Arbor evidence loop fixture path", () => {
  it("declaration -> telemetry -> one uncertainty candidate -> conclusion-free receipt", () => {
    const declaration = fixture("declaration.json");
    const candidate = run("uncertainty-candidate.ts", [
      "--declaration", declaration, "--claim-id", "diagnose-human-led",
      "--telemetry", fixture("telemetry-control.json"),
      "--telemetry", fixture("telemetry-treatment.json"),
    ]);
    expect(candidate.schema).toBe("gaia.research-arbor-uncertainty-candidate/v1");
    expect(candidate.signal).toBe("mismatch");
    expect(candidate.target.claimId).toBe("diagnose-human-led");
    expect(candidate.telemetrySourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(candidate).not.toHaveProperty("conclusion");

    const receipt = run("targeted-receipt.ts", [
      "--declaration", declaration, "--claim-id", "diagnose-human-led",
      "--benchmark-id", "fixture-one-question", "--benchmark-version", "v0",
      "--control", fixture("control-arm.json"), "--treatment", fixture("treatment-arm.json"),
      "--measurement", fixture("measurement.json"), "--provenance", fixture("provenance.json"),
    ]);
    expect(receipt.schema).toBe("gaia.arbor-benchmark-receipt/v1");
    expect(receipt.target.claimId).toBe(candidate.target.claimId);
    expect(receipt.measurements).toHaveLength(1);
    expect(receipt).not.toHaveProperty("conclusion");
    expect(receipt).not.toHaveProperty("support");
    expect(receipt.provenance.artifacts[0].sha256).toBe("1".repeat(64));
  }, 30000);

  it("requires identical model and harness as well as artifact digests", () => {
    const control = JSON.parse(readFileSync(fixture("control-arm.json"), "utf8"));
    const treatment = { ...control, environment: { ...control.environment, model: "different-model" } };
    const output = runFailure("targeted-receipt.ts", [
      "--declaration", fixture("declaration.json"), "--claim-id", "diagnose-human-led",
      "--benchmark-id", "fixture-one-question", "--benchmark-version", "v0",
      "--control", fixture("control-arm.json"), "--treatment", temporaryJson(treatment),
      "--measurement", fixture("measurement.json"), "--provenance", fixture("provenance.json"),
    ]);
    expect(output).toContain("identical model, harness, task, fixture, and evaluator digests");
  });

  it.each(["/tmp/exported.txt", "C:\\\\Users\\\\agent\\\\exported.txt", "\\\\server\\\\share\\\\exported.txt", "file:///tmp/exported.txt"])("rejects local paths in telemetry (%s)", (leakedPath) => {
    const observation = JSON.parse(readFileSync(fixture("telemetry-control.json"), "utf8"));
    observation.taskFamily = `debug ${leakedPath}`;
    const output = runFailure("uncertainty-candidate.ts", [
      "--declaration", fixture("declaration.json"), "--claim-id", "diagnose-human-led", "--telemetry", temporaryJson(observation),
    ]);
    expect(output).toContain("contains an absolute local path");
  }, 30000);

  it("requires and stores an explicit decision-block reason", () => {
    const common = ["--declaration", fixture("declaration.json"), "--claim-id", "diagnose-human-led", "--telemetry", fixture("telemetry-control.json")];
    expect(runFailure("uncertainty-candidate.ts", [...common, "--decision-block"])).toContain("requires a non-empty reason");
    const candidate = run("uncertainty-candidate.ts", [...common, "--decision-block", "operator blocked deployment approval"]);
    expect(candidate.signal).toBe("decision-block");
    expect(candidate.decisionBlockReason).toBe("operator blocked deployment approval");
  }, 30000);

  it("never consumes a following flag as a value", () => {
    const common = ["--declaration", fixture("declaration.json"), "--claim-id", "diagnose-human-led"];
    expect(runFailure("uncertainty-candidate.ts", [...common, "--telemetry", "--decision-block", "reason"]))
      .toContain("--telemetry requires a file");
    expect(runFailure("uncertainty-candidate.ts", [...common, "--telemetry", fixture("telemetry-control.json"), "--decision-block", "--claim-id"]))
      .toContain("--decision-block requires a non-empty reason");
  }, 30000);

  it.each([
    ["unknown key", { unexpected: 1 }],
    ["empty object", {}],
    ["negative", { input: -1 }],
    ["fractional", { input: 1.5 }],
    ["unsafe", { input: Number.MAX_SAFE_INTEGER + 1 }],
    ["null", { input: null }],
    ["string", { input: "1" }],
  ])("rejects malformed metrics.tokens (%s)", (_label, tokens) => {
    const observation = JSON.parse(readFileSync(fixture("telemetry-control.json"), "utf8"));
    observation.metrics.tokens = tokens;
    const output = runFailure("uncertainty-candidate.ts", [
      "--declaration", fixture("declaration.json"), "--claim-id", "diagnose-human-led", "--telemetry", temporaryJson(observation),
    ]);
    expect(output).toMatch(/metrics\.tokens/);
  }, 30000);

  it("accepts only known non-negative safe-integer token fields", () => {
    const observation = JSON.parse(readFileSync(fixture("telemetry-control.json"), "utf8"));
    observation.metrics.tokens = { input: 10, output: 20, cacheCreationInput: 0, cacheReadInput: 3, total: 33 };
    const candidate = run("uncertainty-candidate.ts", [
      "--declaration", fixture("declaration.json"), "--claim-id", "diagnose-human-led", "--telemetry", temporaryJson(observation),
    ]);
    expect(candidate).toBeNull();
  }, 30000);
});
