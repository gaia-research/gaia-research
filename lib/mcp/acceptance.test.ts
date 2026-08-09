/**
 * Executable acceptance test for the published @gaia-research/mcp package.
 *
 * This test deliberately exercises clean temporary environments and starts the
 * actual gaia-mcp binary through an explicit npx package selector. The scoped
 * package publishes two binaries, so a bare package name is not an invocation.
 *
 * The test verifies that the documented package:
 *   1. Installs from npm without errors in an isolated workspace.
 *   2. Exposes both published binary selectors.
 *   3. Starts over stdio without crashing.
 *   4. Completes an MCP initialize handshake.
 *   5. Sends an initialized notification without error.
 *   6. Responds to tools/list with exactly the current four-tool surface.
 *
 * The two skill-hell checks run the read-only list command only. They prove
 * both CLI paths/bins without performing a live summon or writing to a user's
 * skill configuration.
 */

import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ── Constants ─────────────────────────────────────────────────────────────────

const PACKAGE_NAME = "@gaia-research/mcp";
const PACKAGE_SELECTOR = `${PACKAGE_NAME}@latest`;
const MCP_COMMAND = "npx";
// Explicit package selection is required because the scoped package has two bins.
const MCP_ARGS = ["-y", "-p", PACKAGE_SELECTOR, "gaia-mcp"];
const ALIAS_SUMMON_ARGS = ["-y", "skill-hell@latest", "list", "--json"];
const SCOPED_SUMMON_ARGS = ["-y", "-p", PACKAGE_SELECTOR, "skill-hell", "list", "--json"];

const MCP_PROTOCOL_VERSION = "2024-11-05";
const EXPECTED_TOOLS = ["gaia_search", "gaia_inspect", "summon", "gaia_status"] as const;

/** Timeout (ms) for spawn + handshake. Keep generous for slow CI. */
const HANDSHAKE_TIMEOUT_MS = 30_000;

/** Timeout (ms) for clean npm installs and read-only CLI checks. */
const INSTALL_TIMEOUT_MS = 120_000;

/** Timeout for npx to prove that the server did not immediately exit. */
const STARTUP_GRACE_MS = 5_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

type JsonRpcMessage = Record<string, unknown>;
type SpawnedProcess = ReturnType<typeof spawn>;

type RunningServer = {
  proc: SpawnedProcess;
  stderr: () => string;
};

function describeError(error: unknown): string {
  if (error && typeof error === "object") {
    const candidate = error as {
      message?: string;
      stdout?: Buffer | string;
      stderr?: Buffer | string;
    };
    const stdout = candidate.stdout?.toString().trim();
    const stderr = candidate.stderr?.toString().trim();
    return [candidate.message, stdout && `stdout: ${stdout}`, stderr && `stderr: ${stderr}`]
      .filter(Boolean)
      .join("; ");
  }
  return String(error);
}

function testEnv(workDir: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: "production",
    npm_config_cache: join(workDir, ".npm-cache"),
    npm_config_update_notifier: "false",
    NPM_CONFIG_UPDATE_NOTIFIER: "false",
  };
}

function cleanup(workDir: string | undefined): void {
  if (!workDir) return;
  try {
    rmSync(workDir, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup; the test result should describe the package failure.
  }
}

/** Start the actual package binary via npx -y -p <package>@latest gaia-mcp. */
function startServer(workDir: string): RunningServer {
  const proc = spawn(MCP_COMMAND, MCP_ARGS, {
    stdio: ["pipe", "pipe", "pipe"],
    cwd: workDir,
    env: testEnv(workDir),
  });

  let stderrOutput = "";
  proc.stderr?.on("data", (chunk: Buffer | string) => {
    stderrOutput += chunk.toString();
  });

  return { proc, stderr: () => stderrOutput };
}

function stopServer(proc: SpawnedProcess): void {
  if (!proc.killed) proc.kill();
}

/** Wait long enough to catch an immediate startup failure, then keep the server alive. */
function expectServerStaysUp(server: RunningServer): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanupListeners = () => {
      clearTimeout(timer);
      server.proc.off("error", onError);
      server.proc.off("exit", onExit);
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanupListeners();
      reject(error);
    };
    const onError = (error: Error) => fail(error);
    const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
      fail(
        new Error(
          `Process exited during startup (code ${code}, signal ${signal}). stderr: ${server.stderr().slice(0, 800)}`,
        ),
      );
    };
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanupListeners();
      resolve();
    }, STARTUP_GRACE_MS);

    server.proc.once("error", onError);
    server.proc.once("exit", onExit);
  });
}

/** Send a single JSON-RPC 2.0 message over stdin and return the parsed response. */
function sendJsonRpc(proc: SpawnedProcess, message: JsonRpcMessage): Promise<JsonRpcMessage> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    let settled = false;

    const cleanupListeners = () => {
      clearTimeout(timeoutTimer);
      proc.stdout?.off("data", onData);
      proc.off("error", onError);
      proc.off("exit", onExit);
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanupListeners();
      reject(error);
    };
    const onError = (error: Error) => fail(error);
    const onExit = (code: number | null, signal: NodeJS.Signals | null) =>
      fail(new Error(`Process exited before JSON-RPC response (code ${code}, signal ${signal}).`));
    const onData = (chunk: Buffer | string) => {
      buffer += chunk.toString();
      // JSON-RPC over this server's stdio transport is newline-delimited JSON.
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed) as JsonRpcMessage;
          settled = true;
          cleanupListeners();
          resolve(parsed);
          return;
        } catch {
          // Not a complete JSON message yet — keep buffering.
        }
      }
    };
    const timeoutTimer = setTimeout(() => {
      fail(new Error(`Timeout waiting for response to: ${JSON.stringify(message)}`));
    }, HANDSHAKE_TIMEOUT_MS);

    proc.stdout?.on("data", onData);
    proc.once("error", onError);
    proc.once("exit", onExit);

    proc.stdin?.write(`${JSON.stringify(message)}\n`, (error) => {
      if (error) fail(error);
    });
  });
}

/** Send a notification (no response expected). */
function sendNotification(proc: SpawnedProcess, method: string): void {
  proc.stdin?.write(`${JSON.stringify({ jsonrpc: "2.0", method })}\n`);
}

async function initialize(proc: SpawnedProcess): Promise<JsonRpcMessage> {
  const response = await sendJsonRpc(proc, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "gaia-research-acceptance-test", version: "1.0.0" },
    },
  });

  expect(response).toMatchObject({ jsonrpc: "2.0", id: 1 });
  expect(response).not.toHaveProperty("error");
  expect(response).toHaveProperty("result");

  const result = response.result as Record<string, unknown>;
  expect(typeof result.protocolVersion).toBe("string");
  expect(result).toHaveProperty("serverInfo");
  const serverInfo = result.serverInfo as Record<string, unknown>;
  expect(serverInfo.name).toBe("gaia-mcp");
  // @latest is deliberately moving: assert a reported version exists, not a fixed release.
  expect(typeof serverInfo.version).toBe("string");
  expect((serverInfo.version as string).length).toBeGreaterThan(0);

  return response;
}

/** Run a read-only CLI path in the caller's isolated temporary environment. */
function runReadOnlyCli(workDir: string, args: string[]): string {
  const isolatedTmp = join(workDir, "tmp");
  mkdirSync(isolatedTmp, { recursive: true });
  const result = spawnSync("npx", args, {
    cwd: workDir,
    env: {
      ...testEnv(workDir),
      // Keep the CLI-created session root inside the disposable workspace.
      TMPDIR: isolatedTmp,
      TMP: isolatedTmp,
      TEMP: isolatedTmp,
    },
    encoding: "utf8",
    timeout: INSTALL_TIMEOUT_MS,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `npx ${args.join(" ")} exited with ${result.status ?? "no status"}. ` +
        `stdout: ${result.stdout?.trim() ?? ""}; stderr: ${result.stderr?.trim() ?? ""}`,
    );
  }

  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe(`${PACKAGE_SELECTOR} acceptance`, () => {
  let serverWorkDir: string | undefined;

  beforeAll(() => {
    // The server install and its npx cache live under a disposable workspace.
    serverWorkDir = mkdtempSync(join(tmpdir(), "gaia-mcp-acceptance-server-"));

    try {
      execFileSync(
        "npm",
        [
          "install",
          "--prefix",
          serverWorkDir,
          "--no-save",
          "--ignore-scripts",
          PACKAGE_SELECTOR,
        ],
        {
          stdio: "pipe",
          timeout: INSTALL_TIMEOUT_MS,
          env: testEnv(serverWorkDir),
        },
      );
    } catch (error) {
      throw new Error(`Clean install of ${PACKAGE_SELECTOR} failed: ${describeError(error)}`);
    }
  }, INSTALL_TIMEOUT_MS + 5_000);

  afterAll(() => cleanup(serverWorkDir));

  it("clean-installs the published package with both binary selectors", () => {
    const packageJsonPath = join(serverWorkDir!, "node_modules", PACKAGE_NAME, "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      version?: unknown;
      bin?: unknown;
    };

    expect(typeof packageJson.version).toBe("string");
    expect(packageJson.bin).toEqual({
      "gaia-mcp": expect.any(String),
      "skill-hell": expect.any(String),
    });
  });

  it("starts the selected gaia-mcp binary over stdio without immediate crash", async () => {
    const server = startServer(serverWorkDir!);
    try {
      await expectServerStaysUp(server);
    } finally {
      stopServer(server.proc);
    }
  }, HANDSHAKE_TIMEOUT_MS);

  it("completes the MCP initialize handshake", async () => {
    const server = startServer(serverWorkDir!);
    try {
      await initialize(server.proc);
    } finally {
      stopServer(server.proc);
    }
  }, HANDSHAKE_TIMEOUT_MS);

  it("accepts the initialized notification without crashing", async () => {
    const server = startServer(serverWorkDir!);
    try {
      await initialize(server.proc);
      sendNotification(server.proc, "notifications/initialized");
      await expectServerStaysUp(server);
    } finally {
      stopServer(server.proc);
    }
  }, HANDSHAKE_TIMEOUT_MS);

  it("tools/list returns exactly the current four-tool surface", async () => {
    const server = startServer(serverWorkDir!);
    try {
      await initialize(server.proc);
      sendNotification(server.proc, "notifications/initialized");

      const response = await sendJsonRpc(server.proc, {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      });

      expect(response).toMatchObject({ jsonrpc: "2.0", id: 2 });
      expect(response).not.toHaveProperty("error");
      expect(response).toHaveProperty("result");

      const result = response.result as Record<string, unknown>;
      expect(Array.isArray(result.tools)).toBe(true);
      const toolList = result.tools as Array<Record<string, unknown>>;

      for (const tool of toolList) {
        expect(typeof tool.name).toBe("string");
        expect(typeof tool.description).toBe("string");
        expect(tool.inputSchema).toEqual(expect.any(Object));
      }

      const toolNames = toolList.map((tool) => tool.name as string);
      expect(toolNames).toHaveLength(EXPECTED_TOOLS.length);
      expect([...toolNames].sort()).toEqual([...EXPECTED_TOOLS].sort());
    } finally {
      stopServer(server.proc);
    }
  }, HANDSHAKE_TIMEOUT_MS);

  it("runs the public npx skill-hell@latest selector without summoning", () => {
    const aliasWorkDir = mkdtempSync(join(tmpdir(), "gaia-mcp-acceptance-alias-"));
    try {
      const output = runReadOnlyCli(aliasWorkDir, ALIAS_SUMMON_ARGS);
      expect(output).toMatch(/"skills"/);
    } finally {
      cleanup(aliasWorkDir);
    }
  }, INSTALL_TIMEOUT_MS);

  it("runs the scoped package's skill-hell bin without summoning", () => {
    const scopedWorkDir = mkdtempSync(join(tmpdir(), "gaia-mcp-acceptance-scoped-"));
    try {
      const output = runReadOnlyCli(scopedWorkDir, SCOPED_SUMMON_ARGS);
      expect(output).toMatch(/"skills"/);
    } finally {
      cleanup(scopedWorkDir);
    }
  }, INSTALL_TIMEOUT_MS);
});
