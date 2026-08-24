import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..", "scripts", "arbor-evidence-loop");
const fixture = (name: string) => resolve(root, "fixtures", name);
const run = (script: string, args: string[]) => JSON.parse(execFileSync("npx", ["tsx", resolve(root, script), ...args], { encoding: "utf8" }));

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
});
