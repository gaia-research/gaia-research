import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MILIM_RIVE } from "./asset";

const pub = (p: string) => join(process.cwd(), "public", p);
const sha = (buf: Buffer) => createHash("sha256").update(buf).digest("hex");

describe("Milim Rive assets", () => {
  it("ships the .riv that asset.ts describes", () => {
    const buf = readFileSync(pub(MILIM_RIVE.src));
    expect(buf.length).toBe(MILIM_RIVE.riv.bytes);
    expect(sha(buf)).toBe(MILIM_RIVE.riv.sha256);
  });

  it("ships the poster and the self-hosted wasm", () => {
    expect(existsSync(pub(MILIM_RIVE.poster.src))).toBe(true);
    expect(existsSync(pub(MILIM_RIVE.wasm))).toBe(true);
  });

  it("self-hosts the wasm of the installed runtime version", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "node_modules/@rive-app/webgl2/package.json"), "utf8"));
    expect(MILIM_RIVE.runtime).toBe(`@rive-app/webgl2@${pkg.version}`);
    const installed = readFileSync(join(process.cwd(), "node_modules/@rive-app/webgl2/rive.wasm"));
    expect(sha(readFileSync(pub(MILIM_RIVE.wasm)))).toBe(sha(installed));
  });
});
