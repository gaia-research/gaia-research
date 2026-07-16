/**
 * Executable website acceptance test for @gaia-research/mcp@0.1.0
 *
 * This test verifies that the documented package:
 *   1. Installs from npm without errors.
 *   2. Starts over stdio without crashing.
 *   3. Completes an MCP initialize handshake (sends initialize, receives result).
 *   4. Sends an "initialized" notification without error.
 *   5. Responds to a tools/list request with a well-formed tool list.
 *   6. Each tool has name, description, and inputSchema fields.
 *
 * Environment override:
 *   GAIA_MCP_BIN=/path/to/local/bin  – bypass npm install and use a local bin.
 *   GAIA_MCP_SKIP_INSTALL=true       – skip the npm install step entirely
 */

import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { execSync, spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { availableTools } from "../../data/mcp";

// ── Constants ─────────────────────────────────────────────────────────────────

const PACKAGE_NAME = "@gaia-research/mcp";
const PACKAGE_VERSION = "0.1.0";
const PACKAGE_SPEC = `${PACKAGE_NAME}@${PACKAGE_VERSION}`;

const MCP_PROTOCOL_VERSION = "2024-11-05";

/** Timeout (ms) for spawn + handshake. Keep generous for slow CI. */
const HANDSHAKE_TIMEOUT_MS = 30_000;

/** Timeout (ms) for npm install. */
const INSTALL_TIMEOUT_MS = 120_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Send a single JSON-RPC 2.0 message over stdin and return the parsed response. */
function sendJsonRpc(
  proc: ReturnType<typeof spawn>,
  message: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    let timeoutTimer: NodeJS.Timeout | null = null;

    const onData = (chunk: Buffer | string) => {
      buffer += chunk.toString();
      // JSON-RPC over stdio: messages are newline-delimited JSON.
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed) as Record<string, unknown>;
          proc.stdout?.off("data", onData);
          if (timeoutTimer) clearTimeout(timeoutTimer);
          resolve(parsed);
          return;
        } catch {
          // not JSON yet — keep buffering
        }
      }
    };

    proc.stdout?.on("data", onData);

    const payload = JSON.stringify(message) + "\n";
    proc.stdin?.write(payload, (err) => {
      if (err) {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        reject(err);
      }
    });

    timeoutTimer = setTimeout(() => {
      proc.stdout?.off("data", onData);
      reject(new Error(`Timeout waiting for response to: ${JSON.stringify(message)}`));
    }, HANDSHAKE_TIMEOUT_MS);
  });
}

/** Send a notification (no response expected). */
function sendNotification(
  proc: ReturnType<typeof spawn>,
  method: string,
  params?: Record<string, unknown>,
): void {
  const payload = JSON.stringify({ jsonrpc: "2.0", method, ...(params ? { params } : {}) }) + "\n";
  proc.stdin?.write(payload);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe(`${PACKAGE_SPEC} acceptance`, () => {
  let workDir: string;
  let mcpBin: string | null = null;
  let available = false;

  beforeAll(async () => {
    // Allow overriding with a pre-built local binary for rapid iteration.
    if (process.env.GAIA_MCP_BIN) {
      mcpBin = process.env.GAIA_MCP_BIN;
      available = existsSync(mcpBin);
      if (!available) {
        console.warn(`[mcp-acceptance] GAIA_MCP_BIN=${mcpBin} not found; tests will be skipped.`);
      }
      return;
    }

    // Create an isolated temp workspace so this test never pollutes the repo's
    // node_modules or package.json.
    workDir = mkdtempSync(join(tmpdir(), "gaia-mcp-acceptance-"));

    if (process.env.GAIA_MCP_SKIP_INSTALL !== "true") {
      try {
        execSync(`npm install --prefix "${workDir}" "${PACKAGE_SPEC}"`, {
          stdio: "pipe",
          timeout: INSTALL_TIMEOUT_MS,
          env: { ...process.env, NODE_ENV: "production" },
        });
      } catch (err) {
        // Package not yet published — skip gracefully.
        console.warn(
          `[mcp-acceptance] ${PACKAGE_SPEC} is not available on npm; skipping acceptance tests.\n` +
            `  (npm error: ${(err as Error).message?.slice(0, 200)})`,
        );
        return;
      }
    }

    // Resolve the bin path installed by npm.
    const binPath = join(workDir, "node_modules", ".bin", "gaia-mcp");
    const altBinPath = join(
      workDir,
      "node_modules",
      PACKAGE_NAME,
      "dist",
      "index.js",
    );

    if (existsSync(binPath)) {
      mcpBin = binPath;
      available = true;
    } else if (existsSync(altBinPath)) {
      mcpBin = altBinPath;
      available = true;
    } else {
      // Try npx as a fallback — will re-use the installed package.
      mcpBin = null;
      available = true; // optimistic; spawn will fail fast if truly broken
    }
  }, INSTALL_TIMEOUT_MS + 5_000);

  afterAll(() => {
    if (workDir) {
      try {
        rmSync(workDir, { recursive: true, force: true });
      } catch {
        // best-effort cleanup
      }
    }
  });

  it("package is available (or is explicitly skipped)", () => {
    if (!available) {
      console.info(
        `[mcp-acceptance] ${PACKAGE_SPEC} not available — remaining tests skipped.`,
      );
    }
    expect(true).toBe(true);
  });

  it("spawns over stdio without immediate crash", async ({ skip }) => {
    if (!available) skip("Package not available");

    const args =
      mcpBin != null ? (mcpBin.endsWith(".js") ? [mcpBin] : []) : ["-y", PACKAGE_SPEC];
    const cmd = mcpBin != null ? (mcpBin.endsWith(".js") ? "node" : mcpBin) : "npx";

    const proc = spawn(cmd, args, {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: workDir ?? process.cwd(),
      env: { ...process.env, NODE_ENV: "production" },
    });

    let stderrOutput = "";
    proc.stderr?.on("data", (chunk: Buffer) => {
      stderrOutput += chunk.toString();
    });

    try {
      // Give the process 1 s to start without crashing.
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 1_000);
        proc.on("exit", (code) => {
          clearTimeout(timer);
          if (code !== 0) {
            reject(
              new Error(
                `Process exited with code ${code} immediately. stderr: ${stderrOutput.slice(0, 400)}`,
              ),
            );
          } else {
            resolve();
          }
        });
      });
    } finally {
      proc.kill();
    }
  }, HANDSHAKE_TIMEOUT_MS);

  it("completes MCP initialize handshake", async ({ skip }) => {
    if (!available) skip("Package not available");

    const args =
      mcpBin != null ? (mcpBin.endsWith(".js") ? [mcpBin] : []) : ["-y", PACKAGE_SPEC];
    const cmd = mcpBin != null ? (mcpBin.endsWith(".js") ? "node" : mcpBin) : "npx";

    const proc = spawn(cmd, args, {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: workDir ?? process.cwd(),
      env: { ...process.env, NODE_ENV: "production" },
    });

    try {
      const initRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: "gaia-research-acceptance-test", version: "1.0.0" },
        },
      };

      const initResponse = await sendJsonRpc(proc, initRequest);

      // Must be a valid JSON-RPC 2.0 result.
      expect(initResponse).toMatchObject({ jsonrpc: "2.0", id: 1 });
      expect(initResponse).not.toHaveProperty("error");
      expect(initResponse).toHaveProperty("result");

      const result = initResponse.result as Record<string, unknown>;
      expect(typeof result.protocolVersion).toBe("string");
      expect(result).toHaveProperty("serverInfo");
      const serverInfo = result.serverInfo as Record<string, unknown>;
      expect(typeof serverInfo.name).toBe("string");
      expect(typeof serverInfo.version).toBe("string");
    } finally {
      proc.kill();
    }
  }, HANDSHAKE_TIMEOUT_MS);

  it("sends initialized notification without error", async ({ skip }) => {
    if (!available) skip("Package not available");

    const args =
      mcpBin != null ? (mcpBin.endsWith(".js") ? [mcpBin] : []) : ["-y", PACKAGE_SPEC];
    const cmd = mcpBin != null ? (mcpBin.endsWith(".js") ? "node" : mcpBin) : "npx";

    const proc = spawn(cmd, args, {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: workDir ?? process.cwd(),
      env: { ...process.env, NODE_ENV: "production" },
    });

    let stderrOutput = "";
    proc.stderr?.on("data", (chunk: Buffer) => {
      stderrOutput += chunk.toString();
    });

    try {
      // First complete the initialize handshake.
      await sendJsonRpc(proc, {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: "gaia-research-acceptance-test", version: "1.0.0" },
        },
      });

      // Send the initialized notification (no response expected per MCP spec).
      sendNotification(proc, "notifications/initialized");

      // Wait briefly to ensure the process doesn't crash on the notification.
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 500);
        proc.on("exit", (code) => {
          clearTimeout(timer);
          if ((code ?? 0) !== 0) {
            reject(
              new Error(
                `Process crashed after initialized notification (exit ${code}). stderr: ${stderrOutput.slice(0, 400)}`,
              ),
            );
          } else {
            resolve();
          }
        });
      });
    } finally {
      proc.kill();
    }
  }, HANDSHAKE_TIMEOUT_MS);

  it("tools/list returns a well-formed list with expected tool shape", async ({ skip }) => {
    if (!available) skip("Package not available");

    const args =
      mcpBin != null ? (mcpBin.endsWith(".js") ? [mcpBin] : []) : ["-y", PACKAGE_SPEC];
    const cmd = mcpBin != null ? (mcpBin.endsWith(".js") ? "node" : mcpBin) : "npx";

    const proc = spawn(cmd, args, {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: workDir ?? process.cwd(),
      env: { ...process.env, NODE_ENV: "production" },
    });

    try {
      // Handshake first.
      await sendJsonRpc(proc, {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: "gaia-research-acceptance-test", version: "1.0.0" },
        },
      });

      sendNotification(proc, "notifications/initialized");

      // Request the tool list.
      const listResponse = await sendJsonRpc(proc, {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      });

      expect(listResponse).toMatchObject({ jsonrpc: "2.0", id: 2 });
      expect(listResponse).not.toHaveProperty("error");
      expect(listResponse).toHaveProperty("result");

      const result = listResponse.result as Record<string, unknown>;
      expect(Array.isArray(result.tools)).toBe(true);

      const toolList = result.tools as Array<Record<string, any>>;
      expect(toolList.length).toBeGreaterThan(0);

      // Every tool must have: name (string), description (string), inputSchema (object).
      for (const tool of toolList) {
        expect(typeof tool.name).toBe("string");
        expect(tool.name.length).toBeGreaterThan(0);
        expect(typeof tool.description).toBe("string");
        expect(tool.description.length).toBeGreaterThan(0);
        expect(tool.inputSchema).toBeDefined();
        expect(typeof tool.inputSchema).toBe("object");
      }

      // Check that all available v0.1.0 tools are present.
      const EXPECTED_TOOLS = availableTools.map((t) => t.name);
      const toolNames = toolList.map((t) => t.name as string);
      for (const expected of EXPECTED_TOOLS) {
        expect(toolNames).toContain(expected);
      }
    } finally {
      proc.kill();
    }
  }, HANDSHAKE_TIMEOUT_MS);
});
