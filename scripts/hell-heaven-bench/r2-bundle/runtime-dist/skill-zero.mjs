// scripts/hell-heaven-bench/r2-bundle/runtime/src/cli.ts
import { writeFileSync as writeFileSync2 } from "node:fs";

// scripts/hell-heaven-bench/r2-bundle/runtime/src/compile.ts
var POSTURES = ["floor", "product-floor", "curated", "native"];
function floorOf(posture) {
  if (posture === "floor") return "benchmark";
  if (posture === "product-floor") return "product";
  return null;
}
var POSTURE_ALIASES = {
  "benchmark-floor": "floor"
};
var FLOOR_EVIDENCE = {
  finding: "F6/F7",
  harness: { name: "claude", version: "2.1.216" },
  probedAt: "2026-07-24",
  /** native standing dose, same harness */
  nativeTokens: 28379,
  /** the doorless benchmark floor (T9b) — placebo-of-record */
  benchmarkFloorTokens: 19661,
  /** the doorful product floor (T9b minus --disable-slash-commands) */
  productFloorTokens: 20176,
  /** what the door costs, priced on its own and never folded into either floor */
  doorTokens: 515,
  /** product floor vs native, one decimal, as reported in F7 */
  productFloorVsNativePct: -28.9
};
var HARNESSES = ["claude", "pi", "codex", "hermes", "cursor", "grok"];
var MECHANISMS = ["plugin-dir", "config-dir"];
var DEFAULT_CLAUDE_MECHANISM = "plugin-dir";
var LEVEL_ALIASES = {
  zero: "product-floor",
  low: "curated",
  med: "native",
  native: "native"
};
var SUMMON_ONLY_LEVELS = ["high", "xhigh", "max", "ultra"];
function doseSummary(skills) {
  return {
    tokenizer: "chars4",
    skills: skills.map((s) => ({
      id: s.id,
      standingTokens: s.standingTokens,
      invocationTokens: s.invocationTokens
    })),
    standingTotal: skills.reduce((a, s) => a + s.standingTokens, 0),
    invocationTotal: skills.reduce((a, s) => a + s.invocationTokens, 0)
  };
}
function compile(input) {
  const { posture, harness, skills } = input;
  if (posture === "curated" && skills.length === 0) {
    throw new Error("--posture curated requires at least one --skill <path>");
  }
  if (posture !== "curated" && skills.length > 0) {
    throw new Error(`--skill is only valid with --posture curated (got posture ${posture})`);
  }
  if (input.doorPluginDir && posture !== "product-floor") {
    throw new Error(
      `doorPluginDir is only valid with --posture product-floor (got posture ${posture}) \u2014 the benchmark floor is doorless by ruling (V5-5/B2) and curated mounts its own set`
    );
  }
  const PRODUCT_FLOOR_VERIFIED_HARNESSES = ["claude", "pi", "codex", "hermes", "grok"];
  if (posture === "product-floor" && !PRODUCT_FLOOR_VERIFIED_HARNESSES.includes(harness)) {
    throw new Error(
      `--posture product-floor has no verified cell for harness ${harness} \u2014 only claude (F7, 2.1.216), pi (PROBE.md, 0.83.0), codex (PROBE.md, 0.146.0), hermes (PROBE.md, 0.20.0), and grok (PROBE.md, 0.2.118) were probed. This is a harness-capability gap, not a policy hold: nobody has verified whether this composes here at all, so there is nothing to withhold or grant a key to. Refusing to guess (M0 discipline); use --posture floor, or add the row to the harness capability matrix first.`
    );
  }
  const base = {
    env: {},
    fsPlan: [],
    notes: [],
    doseSummary: doseSummary(skills)
  };
  switch (harness) {
    case "claude":
      return compileClaude(input, base);
    case "pi":
      return compilePi(input, base);
    case "codex":
      return compileCodex(input, base);
    case "hermes":
      return compileHermes(input, base);
    case "cursor":
      return compileCursor(input, base);
    case "grok":
      return compileGrok(input, base);
  }
}
function tailArgs(input, harness) {
  const argv = [];
  if (input.model) argv.push("--model", input.model);
  if (input.effort && harness === "claude") argv.push("--effort", input.effort);
  if (input.prompt !== void 0) {
    if (harness === "claude") {
      argv.push("-p", input.prompt);
      if (input.jsonOutput) argv.push("--output-format", "json");
    } else {
      argv.push("-p", input.prompt);
      if (input.jsonOutput) argv.push("--mode", "json");
    }
  }
  if (input.passthrough?.length) argv.push(...input.passthrough);
  return argv;
}
function compileClaude(input, base) {
  const floorArgv = [
    "--disable-slash-commands",
    // T2: full per-session skills suppression
    "--strict-mcp-config",
    // AT-H5 zero-server
    "--mcp-config",
    '{"mcpServers":{}}'
  ];
  const notes = [...base.notes];
  const fsPlan = [...base.fsPlan];
  const env = { ...base.env };
  let argv;
  if (input.posture === "native") {
    argv = [];
  } else if (input.posture === "floor") {
    argv = [...floorArgv, "--setting-sources", "project"];
    env.CLAUDE_CODE_DISABLE_BUNDLED_SKILLS = "1";
    notes.push(
      "floor (T9b route) = the BENCHMARK floor: completely doorless, the placebo-of-record (B2, V5-5). skills+server floor with zero listing residual. F6: --disable-slash-commands suppresses plugin COMMANDS too, so /skill-heaven does not exist here \u2014 that is intended, not a defect. CLAUDE_CODE_DISABLE_BUNDLED_SKILLS is an undocumented env knob (string-probed from the 2.1.215 binary, verified live) \u2014 version-pinned, re-verify on CLI upgrades. --setting-sources project also evicts user CLAUDE.md (prompt-content side effect; full prompt eviction remains M2b)."
    );
  } else if (input.posture === "product-floor") {
    argv = [
      "--strict-mcp-config",
      "--mcp-config",
      '{"mcpServers":{}}',
      "--setting-sources",
      ""
    ];
    env.CLAUDE_CODE_DISABLE_BUNDLED_SKILLS = "1";
    if (input.doorPluginDir) argv.push("--plugin-dir", input.doorPluginDir);
    notes.push(
      `product-floor (F7 route, P8 scope fix) = the DOORFUL floor: retaining the minimum control surface and using --setting-sources '' so project scope is not admitted. F7's locked evidence prices the door at +${FLOOR_EVIDENCE.doorTokens} tok (${FLOOR_EVIDENCE.productFloorTokens} vs the benchmark floor's ${FLOOR_EVIDENCE.benchmarkFloorTokens}), still ${FLOOR_EVIDENCE.productFloorVsNativePct}% off native's ${FLOOR_EVIDENCE.nativeTokens} \u2014 ${FLOOR_EVIDENCE.harness.name} ${FLOOR_EVIDENCE.harness.version}, probed ${FLOOR_EVIDENCE.probedAt}. Measured and named separately from the benchmark floor and priced as its own arm (B1): never average the two. Keeping slash commands live also leaves the built-in CLI commands present, so this posture is NOT a valid placebo \u2014 the placebo-of-record stays the doorless floor (B2). Same undocumented, version-pinned env knob as T9b \u2014 re-verify on CLI upgrades.`
    );
    if (!input.doorPluginDir) {
      notes.push(
        "no doorPluginDir supplied: the route permits a door but none is mounted. Mounting one is the door package's call (core does not assume a package topology)."
      );
    }
  } else {
    const mechanism = input.mechanism ?? DEFAULT_CLAUDE_MECHANISM;
    if (mechanism === "plugin-dir") {
      argv = [
        "--setting-sources",
        "",
        "--strict-mcp-config",
        "--mcp-config",
        '{"mcpServers":{}}',
        "--plugin-dir",
        "$SESSION/heaven-set"
      ];
      env.CLAUDE_CODE_DISABLE_BUNDLED_SKILLS = "1";
      fsPlan.push({
        kind: "write",
        path: "$SESSION/heaven-set/.claude-plugin/plugin.json",
        contents: JSON.stringify(
          {
            name: "heaven-set",
            description: "Session-scoped curated skill set (Skill Heaven launcher)",
            version: "0.0.0"
          },
          null,
          2
        ) + "\n"
      });
      for (const s of input.skills) {
        fsPlan.push({ kind: "copyDir", from: s.dir, to: `$SESSION/heaven-set/skills/${s.id}` });
      }
      notes.push(
        "curated via --setting-sources '' (empty allowlist) + --plugin-dir + CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1. T9 (--setting-sources project) is SUPERSEDED as of KC4 (2026-07-30): naming `project` keeps project-scope skills live (an allowlist, not a suppression flag), which is the residual KC4 measured. T6 remains NEGATIVE on 2.1.215: --disable-slash-commands suppresses plugin-provided skills too, so curated does not use it. KC4 re-probe (claude 2.1.220, packages/claude-zero/scripts/probe-kc4-listing-residual.sh) with the empty-value composition: system:init `skills` array contains only the curated marker plus `doctor` \u2014 no project-scope leak, no marketplace-plugin leak (system:init `plugins` showed only heaven-set). `doctor` survives CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 in every scenario tested \u2014 an upstream harness limitation (founder-ruled acceptable residual), not a composition defect. The env knob is undocumented (string-probed from the 2.1.215 binary) \u2014 version-pinned, re-verify on CLI upgrades."
      );
    } else {
      const home = input.homeDir ?? "$HOME";
      argv = [];
      env.CLAUDE_CONFIG_DIR = "$SESSION/config";
      fsPlan.push({
        kind: "copyFileIfExists",
        from: `${home}/.claude/.credentials.json`,
        to: "$SESSION/config/.credentials.json"
      });
      for (const s of input.skills) {
        fsPlan.push({ kind: "copyDir", from: s.dir, to: `$SESSION/config/skills/${s.id}` });
      }
      notes.push(
        "curated via CLAUDE_CONFIG_DIR (T3 route). Known leaks: fresh config dirs are auto-seeded with bundled skills, and project-level .claude/skills of the cwd repo still load (T3 observation)."
      );
    }
  }
  argv.push(...tailArgs(input, "claude"));
  return { command: "claude", argv, env, fsPlan, notes, doseSummary: base.doseSummary, execSupport: "exec" };
}
function compilePi(input, base) {
  const argv = [...tailArgs(input, "pi")];
  const notes = [
    ...base.notes,
    "pi argv ordering is load-bearing: `--no-skills -p` (adjacent) drops suppression on pi 0.80.10 \u2014 launcher emits -p before the skill flags. CORRECTION (2026-08-07, PROBE.md): re-probed on pi 0.83.0 before writing any door code \u2014 order no longer matters there (--no-skills before vs. after -p/--no-session both measured ~4371 totalTokens vs an 11271 baseline, --mode json ground truth). The quirk does not reproduce on 0.83.0; kept here as the historical 0.80.10 finding, not current guidance."
  ];
  if (input.posture === "floor") {
    argv.push("--no-skills");
  } else if (input.posture === "curated") {
    argv.push("--no-skills");
    for (const s of input.skills) argv.push("--skill", s.dir);
  } else if (input.posture === "product-floor") {
    argv.push("--no-skills", "--no-context-files", "--no-prompt-templates");
  }
  return { ...base, notes, command: "pi", argv, execSupport: "exec" };
}
function compileHermes(input, base) {
  const env = { ...base.env };
  const fsPlan = [...base.fsPlan];
  const notes = [...base.notes];
  const argv = input.prompt === void 0 ? [] : input.posture === "curated" ? ["chat", "-q", input.prompt, "--quiet"] : ["-z", input.prompt];
  const skillsLessToolsets = "terminal,web,file";
  if (input.posture === "floor") {
    argv.push("--toolsets", skillsLessToolsets, "--safe-mode");
    notes.push(
      "Hermes 0.20.0 benchmark floor: explicit terminal,web,file toolset allowlist omits the skills toolset, so the implementation never builds the skills index; --safe-mode additionally suppresses user config, context files/memory, plugins, and MCP. Repeated authenticated probes answered successfully with identical prompt-side usage. No priced dose is claimed."
    );
  } else if (input.posture === "product-floor") {
    argv.push("--toolsets", skillsLessToolsets, "--ignore-user-config", "--ignore-rules");
    notes.push(
      "Hermes 0.20.0 product floor: the verified terminal,web,file allowlist omits the skills toolset/index; --ignore-user-config --ignore-rules suppresses behavioral config and context files/memory while leaving plugins/MCP available as the door-capable control surface. Repeated authenticated probes answered successfully. No priced dose is claimed."
    );
  } else if (input.posture === "curated") {
    env.HERMES_HOME = "$SESSION/hermes";
    fsPlan.push(
      {
        kind: "copyFileIfExists",
        from: `${input.homeDir ?? "$HOME"}/.hermes/auth.json`,
        to: "$SESSION/hermes/auth.json"
      },
      { kind: "write", path: "$SESSION/hermes/.no-bundled-skills", contents: "" }
    );
    for (const skill of input.skills) {
      fsPlan.push({ kind: "copyDir", from: skill.dir, to: `$SESSION/hermes/skills/${skill.id}` });
      argv.push("--skills", skill.id);
    }
    argv.push("--safe-mode");
    notes.push(
      "Hermes 0.20.0 curated clean room: session-scoped HERMES_HOME receives only auth.json, the .no-bundled-skills marker, and copies of the named skill directories. --skills then preloads each resolved name; --safe-mode suppresses other customizations. Hard listing probes showed exactly one copied local skill and zero bundled skills, and the copied marker skill loaded under safe mode twice. config.yaml is deliberately not copied, avoiding re-imported behavioral customizations. For headless curated runs core uses `hermes chat -q --quiet`, because Hermes 0.20.0's top-level -z oneshot path does not pass --skills through."
    );
  } else {
    notes.push("Hermes native posture is untouched.");
  }
  if (input.model) argv.push("--model", input.model);
  if (input.passthrough?.length) argv.push(...input.passthrough);
  return {
    command: "hermes",
    argv,
    env,
    fsPlan,
    notes,
    doseSummary: base.doseSummary,
    execSupport: "exec"
  };
}
function compileCodex(input, base) {
  const env = { ...base.env };
  const fsPlan = [...base.fsPlan];
  const notes = [...base.notes];
  const argv = ["exec"];
  if (input.posture !== "native") {
    argv.push(
      "--skip-git-repo-check",
      "--ephemeral",
      "--sandbox",
      "read-only",
      "--ignore-rules"
    );
    env.CODEX_HOME = "$SESSION/codex";
    fsPlan.push({
      kind: "copyFileIfExists",
      from: `${input.homeDir ?? "$HOME"}/.codex/auth.json`,
      to: "$SESSION/codex/auth.json"
    });
    if (input.posture === "curated") {
      for (const skill of input.skills) {
        fsPlan.push({ kind: "copyDir", from: skill.dir, to: `$SESSION/codex/skills/${skill.id}` });
      }
    }
    notes.push(
      `codex-cli 0.146.0 live route: the launcher copies auth.json into session-scoped CODEX_HOME, materializes curated skills when requested, asks app-server skills/list for exact discovered SKILL.md paths, and writes a session-local skills.config disable entry for every non-readmitted path before spawning. The flag-only negative remains true; dynamic exact-path discovery is the WP14 license. ${input.posture === "product-floor" ? "Codex has no separate in-session door/plugin surface, so product-floor uses the same verified clean-room composition as floor." : "No shared ~/.codex state is mutated."}`
    );
  }
  if (input.model) argv.push("-m", input.model);
  if (input.prompt !== void 0) argv.push(input.prompt);
  if (input.passthrough?.length) argv.push(...input.passthrough);
  return { command: "codex", argv, env, fsPlan, notes, doseSummary: base.doseSummary, execSupport: "exec" };
}
function compileCursor(input, base) {
  const env = { ...base.env };
  const notes = [...base.notes];
  const argv = [];
  if (input.posture !== "native") {
    env.CURSOR_CONFIG_DIR = "$SESSION/cursor-config";
    notes.push(
      "cursor recipe: CURSOR_CONFIG_DIR scopes user config, but tracked .cursor/rules of the cwd repo cannot be suppressed per-session \u2014 cursor stays on the documented-recipe track (matrix 'eviction dirties git' = yes)."
    );
  }
  if (input.prompt !== void 0) argv.push("-p", input.prompt);
  if (input.passthrough?.length) argv.push(...input.passthrough);
  return { command: "cursor-agent", argv, env, fsPlan: base.fsPlan, notes, doseSummary: base.doseSummary, execSupport: "recipe" };
}
var grokSkillFlags = ["--no-memory", "--no-subagents", "--no-plan", "--disable-web-search"];
var grokBaseConfig = `[compat.claude]
skills = false

[compat.cursor]
skills = false

[skills]
ignore = []
`;
function tailGrok(input) {
  const argv = [];
  if (input.model) argv.push("-m", input.model);
  if (input.prompt !== void 0) argv.push("-p", input.prompt);
  if (input.jsonOutput) argv.push("--output-format", "json");
  if (input.passthrough?.length) argv.push(...input.passthrough);
  return argv;
}
function compileGrok(input, base) {
  const env = { ...base.env };
  const fsPlan = [...base.fsPlan];
  const notes = [...base.notes];
  let argv = [];
  if (input.posture === "native") {
    notes.push("grok native posture is untouched: no GROK_HOME override, config copy, or suppression flags.");
  } else {
    env.GROK_HOME = "$SESSION/grok";
    fsPlan.push({
      kind: "copyFileIfExists",
      from: `${input.homeDir ?? "$HOME"}/.grok/auth.json`,
      to: "$SESSION/grok/auth.json"
    });
    fsPlan.push({ kind: "write", path: "$SESSION/grok/config.toml", contents: grokBaseConfig });
    argv = [...grokSkillFlags];
    if (input.posture === "curated") {
      for (const skill of input.skills) {
        fsPlan.push({ kind: "copyDir", from: skill.dir, to: `$SESSION/grok/skills/${skill.id}` });
      }
      notes.push(
        "grok curated exec route (WP14, 0.2.118): session-scoped GROK_HOME receives auth.json, the named skill directories, and a dynamic inspect-derived exact-path ignore config. Four discovery passes reached exactly one readmitted canary skill and answered successfully twice; observed plugin names are disabled only in this session."
      );
    } else if (input.posture === "floor") {
      notes.push(
        "grok floor exec route (WP14, 0.2.118): GROK_HOME plus auth.json, --no-memory, --no-subagents, --no-plan, --disable-web-search, iterative inspect-derived exact-path ignores, and session-local disables for the observed plugin names. Repeated pinned scans reached Skills (0) and answered successfully; no global plugin state is mutated."
      );
    } else {
      notes.push(
        "grok product-floor exec route (WP14, 0.2.118): GROK_HOME plus auth.json and the documented suppression flags, with iterative inspect-derived exact-path ignores while leaving observed plugins as the door surface. Repeated pinned scans reached the 9-skill plugin surface and answered successfully; the route does not claim zero plugin skills."
      );
    }
  }
  argv.push(...tailGrok(input));
  return {
    ...base,
    notes,
    command: "grok",
    argv,
    env,
    fsPlan,
    execSupport: "exec"
  };
}

// scripts/hell-heaven-bench/r2-bundle/runtime/src/exec.ts
import { spawnSync } from "node:child_process";
import { cpSync as cpSync2, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join as join2 } from "node:path";

// scripts/hell-heaven-bench/r2-bundle/runtime/src/provision.ts
import { createHash } from "node:crypto";
import { cpSync, lstatSync, readFileSync, readdirSync, readlinkSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
function assertHash(value, label) {
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error(`${label} must be a lowercase 64-hex sha256`);
}
function safeEntry(root, entry) {
  if (!entry || isAbsolute(entry)) throw new Error("--harness-entry must be a non-empty path relative to --harness-bundle");
  const absoluteRoot = resolve(root);
  const target = resolve(absoluteRoot, entry);
  const lexicalRelative = relative(absoluteRoot, target);
  if (!lexicalRelative || lexicalRelative === ".." || lexicalRelative.startsWith(`..${sep}`) || isAbsolute(lexicalRelative)) {
    throw new Error("--harness-entry must stay inside --harness-bundle");
  }
  const realRoot = realpathSync(absoluteRoot);
  const realTarget = realpathSync(target);
  const realRelative = relative(realRoot, realTarget);
  if (!realRelative || realRelative === ".." || realRelative.startsWith(`..${sep}`) || isAbsolute(realRelative)) {
    throw new Error("--harness-entry resolves outside --harness-bundle");
  }
  if (!statSync(target).isFile()) throw new Error(`--harness-entry is not a regular file: ${entry}`);
  return target;
}
function hashBundle(root) {
  const absolute = resolve(root);
  if (!lstatSync(absolute).isDirectory()) throw new Error(`harness bundle is not a directory: ${root}`);
  const hash = createHash("sha256");
  let files = 0;
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) {
        const target = readlinkSync(path);
        const resolvedTarget = resolve(dir, target);
        const prefix = absolute + sep;
        if (isAbsolute(target) || !resolvedTarget.startsWith(prefix)) {
          throw new Error(`harness bundle symlink escapes the bundle: ${relative(absolute, path)}`);
        }
        hash.update("symlink\0");
        hash.update(relative(absolute, path).split(sep).join("/"));
        hash.update("\0");
        hash.update(target);
        hash.update("\0");
        files++;
      } else if (stat.isDirectory()) walk(path);
      else if (stat.isFile()) {
        hash.update(relative(absolute, path).split(sep).join("/"));
        hash.update("\0");
        hash.update(readFileSync(path));
        hash.update("\0");
        files++;
      } else {
        throw new Error(`harness bundle contains unsupported entry: ${relative(absolute, path)}`);
      }
    }
  };
  walk(absolute);
  if (files === 0) throw new Error("harness bundle must contain at least one regular file");
  return hash.digest("hex");
}
function validateBundlePin(pin) {
  if (!isAbsolute(pin.sourceDir)) throw new Error("--harness-bundle must be an absolute path to an isolated install bundle");
  if (!pin.pinnedVersion) throw new Error("--harness-version must be non-empty");
  assertHash(pin.contentSha256, "--harness-sha256");
  safeEntry(pin.sourceDir, pin.entry);
}
function provisionHarness(pin, sessionDir) {
  validateBundlePin(pin);
  const sourceHash = hashBundle(pin.sourceDir);
  if (sourceHash !== pin.contentSha256) {
    throw new Error(`harness bundle hash mismatch: pinned ${pin.contentSha256}, observed ${sourceHash}`);
  }
  const destination = join(sessionDir, "harness-bundle");
  cpSync(pin.sourceDir, destination, { recursive: true, errorOnExist: true, verbatimSymlinks: true });
  const copiedHash = hashBundle(destination);
  if (copiedHash !== sourceHash) throw new Error("harness bundle changed while copying into the disposable sandbox");
  const command = safeEntry(destination, pin.entry);
  return {
    command,
    entry: pin.entry,
    bundleContentSha256: copiedHash,
    entryContentSha256: createHash("sha256").update(readFileSync(command)).digest("hex")
  };
}

// scripts/hell-heaven-bench/r2-bundle/runtime/src/exec.ts
var subst = (p, session) => p.replaceAll("$SESSION", session).replaceAll("$HOME", homedir());
function materialize(fsPlan, session) {
  for (const op of fsPlan) {
    if (op.kind === "write") {
      const path = subst(op.path, session);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, op.contents);
    } else if (op.kind === "copyDir") {
      cpSync2(subst(op.from, session), subst(op.to, session), { recursive: true });
    } else {
      const from = subst(op.from, session);
      if (existsSync(from)) {
        const to = subst(op.to, session);
        mkdirSync(dirname(to), { recursive: true });
        cpSync2(from, to);
      }
    }
  }
}
function exec(compiled, opts = {}) {
  if (compiled.execSupport !== "exec") {
    throw new Error(
      `${compiled.command}: compiled as a recipe (cells not verified for live exec) \u2014 use --print`
    );
  }
  const session = mkdtempSync(join2(tmpdir(), "hh-heaven-"));
  try {
    materialize(compiled.fsPlan, session);
    const argv = compiled.argv.map((a) => subst(a, session));
    const env = { ...process.env };
    for (const [k, v] of Object.entries(compiled.env)) env[k] = subst(v, session);
    let command = compiled.command;
    let provision;
    if (opts.harnessBundle) {
      const copied = provisionHarness(opts.harnessBundle, session);
      command = copied.command;
      const reportedVersion = harnessVersion(command);
      if (reportedVersion !== opts.harnessBundle.pinnedVersion) {
        throw new Error(
          `harness version mismatch: pinned ${JSON.stringify(opts.harnessBundle.pinnedVersion)}, reported ${JSON.stringify(reportedVersion)}`
        );
      }
      provision = { ...copied, pinnedVersion: opts.harnessBundle.pinnedVersion, reportedVersion };
    }
    const headless = compiled.argv.includes("-p");
    const t0 = Date.now();
    const res = spawnSync(command, argv, {
      env,
      stdio: headless ? ["ignore", "pipe", "inherit"] : "inherit",
      encoding: "utf-8",
      maxBuffer: 64 * 1024 * 1024
    });
    const wallClockMs = Date.now() - t0;
    if (res.error) throw res.error;
    return {
      status: res.status ?? 1,
      stdout: headless ? res.stdout : null,
      wallClockMs,
      sessionDir: session,
      keptTemp: !!opts.keepTemp,
      ...provision ? { provision } : {}
    };
  } finally {
    if (!opts.keepTemp) rmSync(session, { recursive: true, force: true });
  }
}
function harnessVersion(command) {
  const res = spawnSync(command, ["--version"], { encoding: "utf-8" });
  return (res.stdout || res.stderr || "unknown").trim().split("\n")[0];
}

// scripts/hell-heaven-bench/r2-bundle/runtime/src/receipt.ts
import { createHash as createHash2 } from "node:crypto";
var RUN_RECEIPT_SCHEMA = "skill-zero/r2-run-receipt/v1";
function sha256Json(value) {
  return createHash2("sha256").update(JSON.stringify(value)).digest("hex");
}
function assembleRunReceipt(args) {
  const activation = args.rung === "benchmark-floor" ? "doorless-placebo" : args.rung === "zero" ? "product-floor" : "summon";
  return {
    schema: RUN_RECEIPT_SCHEMA,
    recordedAt: args.record.recordedAt,
    ledger: {
      benchmarkId: args.record.benchmarkId,
      task: args.record.task,
      arm: args.record.arm,
      repeatIndex: args.record.repeatIndex,
      recordSha256: sha256Json(args.record)
    },
    coordinate: {
      rung: args.rung,
      posture: args.posture,
      floor: floorOf(args.posture),
      activation
    },
    harness: {
      name: args.harnessName,
      pinnedVersion: args.provision.pinnedVersion,
      reportedVersion: args.provision.reportedVersion,
      bundleEntry: args.provision.entry,
      bundleContentSha256: args.provision.bundleContentSha256,
      entryContentSha256: args.provision.entryContentSha256
    },
    sandbox: {
      provisioning: "copied-pinned-bundle",
      disposable: !args.keptTemp,
      sharedStateMutation: false,
      keptTemp: args.keptTemp
    },
    skillsLoaded: args.record.skillsLoaded
  };
}

// scripts/hell-heaven-bench/r2-bundle/runtime/src/vendor/ledger-record.ts
var LEDGER_SCHEMA = "hh-ledger/v1";
var ARMS = ["placebo", "heaven", "hell", "ultra"];
function validateRecord(raw) {
  const fail = (msg) => {
    throw new Error(`invalid ledger record: ${msg}`);
  };
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) fail("not an object");
  const r = raw;
  if ("seed" in r) {
    fail(
      "carries a `seed` field. No target harness offers seed control \u2014 determinism does not exist; use repeatIndex (N repeats + CIs) instead. (Binding: RFC \xA77.3.)"
    );
  }
  if (r.schema !== LEDGER_SCHEMA) fail(`schema must be "${LEDGER_SCHEMA}"`);
  for (const k of ["recordedAt", "benchmarkId", "task", "model"]) {
    if (typeof r[k] !== "string" || !r[k]) fail(`${k} must be a non-empty string`);
  }
  if (Number.isNaN(Date.parse(r.recordedAt))) fail("recordedAt must be an ISO timestamp");
  if (!ARMS.includes(r.arm)) fail(`arm must be one of ${ARMS.join("/")}`);
  if (!Array.isArray(r.skillsLoaded)) fail("skillsLoaded must be an array");
  for (const s of r.skillsLoaded) {
    const sr = s;
    if (typeof sr?.id !== "string" || !sr.id) fail("skillsLoaded[].id must be a non-empty string");
    if (typeof sr?.contentSha256 !== "string" || !/^[a-f0-9]{64}$/.test(sr.contentSha256)) {
      fail("skillsLoaded[].contentSha256 must be a 64-hex sha256 of the loaded SKILL.md");
    }
  }
  if (r.arm === "placebo" && r.skillsLoaded.length > 0) {
    fail("placebo arm must have skillsLoaded: [] (it is our own same-harness no-skill run)");
  }
  const h = r.harness;
  if (typeof h?.name !== "string" || typeof h?.version !== "string" || !h.name || !h.version) {
    fail("harness must be { name, version } (non-empty strings)");
  }
  if (!Number.isInteger(r.repeatIndex) || r.repeatIndex < 0) {
    fail("repeatIndex must be a non-negative integer");
  }
  const t = r.tokens;
  for (const k of ["system", "skillStanding", "skillInvocation", "perTurn"]) {
    const v = t?.[k];
    if (v === void 0) fail(`tokens.${k} missing \u2014 use null for unmeasured, never omit or write 0`);
    if (v !== null && (typeof v !== "number" || v < 0 || !Number.isFinite(v))) {
      fail(`tokens.${k} must be a non-negative number or null (null = unmeasured)`);
    }
  }
  if (typeof r.wallClockMs !== "number" || r.wallClockMs < 0) {
    fail("wallClockMs must be a non-negative number");
  }
  const o = r.objectiveEndpoint;
  if (typeof o?.kind !== "string" || !o.kind) fail("objectiveEndpoint.kind must be a non-empty string");
  if (o?.pass !== null && typeof o?.pass !== "boolean") {
    fail("objectiveEndpoint.pass must be boolean or null (null = Tier-3-only run)");
  }
  if (r.judgeVerdict !== null && typeof r.judgeVerdict !== "string") {
    fail("judgeVerdict must be a string (Tier 3) or null");
  }
}

// scripts/hell-heaven-bench/r2-bundle/runtime/src/record.ts
var TRIAL_RUNGS = ["benchmark-floor", "zero", "low", "med", "high", "xhigh", "max", "ultra"];
var ARM_RUNGS = {
  placebo: ["benchmark-floor"],
  heaven: ["zero", "low", "med"],
  hell: ["high", "xhigh", "max"],
  ultra: ["ultra"]
};
function validateTrialCoordinate(arm, rung, posture) {
  if (!ARM_RUNGS[arm].includes(rung)) {
    throw new Error(`--arm ${arm} cannot record --rung ${rung}; valid rungs: ${ARM_RUNGS[arm].join("|")}`);
  }
  if (posture === "floor" && (arm !== "placebo" || rung !== "benchmark-floor")) {
    throw new Error(
      "--posture floor is doorless and only allows --arm placebo with --rung benchmark-floor; treatment coordinates require a doorful posture"
    );
  }
  if (arm === "placebo" && posture !== "floor") {
    throw new Error(
      "--arm placebo is only allowed for --posture floor, the doorless benchmark floor (own-placebo anchoring, B2). The product floor retains a control surface, so it can never stand in as the placebo-of-record."
    );
  }
  if (rung === "zero" && posture !== "product-floor") {
    throw new Error("--rung zero is the doorful product floor and requires --posture product-floor; it is not placebo");
  }
  if (["high", "xhigh", "max", "ultra"].includes(rung) && posture !== "product-floor") {
    throw new Error(
      `--rung ${rung} is activated by in-session summon behavior, not a boot posture; record it over --posture product-floor so the door remains available`
    );
  }
}
function validateTrialSkills(opts, skills) {
  if (opts.arm === "placebo" && skills.length > 0) {
    throw new Error("--arm placebo cannot record loaded skills; the doorless own-placebo has skillsLoaded: []");
  }
  if (opts.rung !== "benchmark-floor" && opts.rung !== "zero" && skills.length === 0) {
    throw new Error(`--rung ${opts.rung} requires at least one exact loaded skill hash (--skill or --record-skill)`);
  }
}
function perTurnFromUsage(u) {
  if (!u) return null;
  const parts = [
    u.input_tokens,
    u.cache_creation_input_tokens,
    u.cache_read_input_tokens,
    u.output_tokens
  ];
  if (parts.every((p) => p === void 0)) return null;
  return parts.reduce((a, p) => a + (p ?? 0), 0);
}
function assembleRecord(args) {
  const { opts, posture, skills } = args;
  validateTrialCoordinate(opts.arm, opts.rung, posture);
  validateTrialSkills(opts, skills);
  const floorKind = floorOf(posture);
  const zeroDose = opts.rung === "benchmark-floor" || opts.rung === "zero";
  const noteParts = [];
  noteParts.push(`rung=${opts.rung}.`);
  if (floorKind === "benchmark") {
    noteParts.push("floor=benchmark (doorless; the placebo-of-record, B2). Separate arm from floor=product \u2014 never averaged (B1).");
  } else if (floorKind === "product") {
    noteParts.push("floor=product (doorful; retains the minimum control surface). Separate arm from floor=benchmark \u2014 never averaged (B1).");
  }
  if (!zeroDose) noteParts.push("skillInvocation null: stream-json invocation instrumentation is a follow-up (M2).");
  if (args.notes) noteParts.push(args.notes);
  const record = {
    schema: LEDGER_SCHEMA,
    recordedAt: args.recordedAt,
    benchmarkId: opts.benchmarkId,
    task: opts.task,
    arm: opts.arm,
    skillsLoaded: skills.map((s) => ({ id: s.id, contentSha256: s.contentSha256 })),
    model: args.model,
    harness: args.harness,
    repeatIndex: opts.repeatIndex,
    tokens: {
      system: null,
      // M2a unratified — stays honestly null
      skillStanding: zeroDose ? 0 : skills.reduce((a, s) => a + s.standingTokens, 0),
      skillInvocation: zeroDose ? 0 : null,
      perTurn: perTurnFromUsage(args.usage)
    },
    wallClockMs: args.wallClockMs,
    objectiveEndpoint: opts.endpointRegex ? {
      kind: "regex-match",
      pass: args.resultText !== void 0 ? new RegExp(opts.endpointRegex).test(args.resultText.trim()) : null,
      detail: `/${opts.endpointRegex}/ vs final result text`
    } : { kind: "unscored", pass: null },
    judgeVerdict: null,
    ...noteParts.length ? { notes: noteParts.join(" ") } : {}
  };
  validateRecord(record);
  return record;
}

// scripts/hell-heaven-bench/r2-bundle/runtime/src/skills.ts
import { readFileSync as readFileSync2, statSync as statSync2 } from "node:fs";
import { basename, dirname as dirname2, join as join3, resolve as resolve2 } from "node:path";

// scripts/hell-heaven-bench/r2-bundle/runtime/src/vendor/census-pure.ts
import { createHash as createHash3 } from "node:crypto";
function tokenize(text, backend = "chars4") {
  if (backend !== "chars4") throw new Error(`unknown tokenizer backend: ${backend}`);
  return Math.max(1, Math.floor((text ?? "").length / 4));
}
function readFrontmatter(src) {
  const lines = src.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return {};
  const out = {};
  let key = null;
  let buf = [];
  const flush = () => {
    if (key) out[key] = buf.join(" ").replace(/\s+/g, " ").trim();
    key = null;
    buf = [];
  };
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "---") break;
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (m) {
      flush();
      key = m[1];
      const v = m[2].trim();
      buf = v === ">-" || v === ">" || v === "|" || v === "|-" ? [] : [stripQuotes(v)];
    } else if (key && /^\s+\S/.test(line)) {
      buf.push(line.trim());
    } else if (key && line.trim() === "") {
    } else {
      flush();
    }
  }
  flush();
  return out;
}
function stripQuotes(v) {
  if (v.length >= 2 && (v[0] === '"' && v.endsWith('"') || v[0] === "'" && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}
function makeListingLine(id, description) {
  return `- ${id}: ${description}`.replace(/\s+/g, " ").trim();
}
function contentSha256(src) {
  return createHash3("sha256").update(src).digest("hex");
}

// scripts/hell-heaven-bench/r2-bundle/runtime/src/skills.ts
function resolveSkill(path) {
  const p = resolve2(path);
  let skillMdPath;
  if (statSync2(p).isDirectory()) {
    skillMdPath = join3(p, "SKILL.md");
  } else if (basename(p) === "SKILL.md") {
    skillMdPath = p;
  } else {
    throw new Error(`--skill must point at a SKILL.md or its directory: ${path}`);
  }
  const src = readFileSync2(skillMdPath, "utf-8");
  const fm = readFrontmatter(src);
  const dir = dirname2(skillMdPath);
  const id = fm.name || basename(dir);
  const listingLine = makeListingLine(id, fm.description ?? "");
  return {
    id,
    dir,
    skillMdPath,
    listingLine,
    standingTokens: tokenize(listingLine),
    invocationTokens: tokenize(src),
    contentSha256: contentSha256(src)
  };
}

// scripts/hell-heaven-bench/r2-bundle/runtime/src/cli.ts
function parseArgs(argv) {
  let posture;
  let level;
  let harness = "claude";
  let mechanism;
  const skillPaths = [];
  const recordSkillPaths = [];
  let doorPluginDir;
  let print = false;
  let prompt;
  let model;
  let effort;
  let keepTemp = false;
  const passthrough = [];
  let record = false;
  let benchmarkId;
  let task;
  let arm;
  let rung;
  let repeat = 0;
  let endpointRegex;
  let recordOut;
  let receiptOut;
  let harnessBundleDir;
  let harnessEntry;
  let pinnedHarnessVersion;
  let harnessSha256;
  let note;
  const need = (flag, i) => {
    const v = argv[i];
    if (v === void 0) throw new Error(`${flag} requires a value`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--") {
      passthrough.push(...argv.slice(i + 1));
      break;
    } else if (a === "--posture") {
      const raw = need(a, ++i);
      const v = POSTURE_ALIASES[raw] ?? raw;
      if (!POSTURES.includes(v)) {
        throw new Error(`--posture must be one of ${POSTURES.join("|")} (alias: benchmark-floor = floor)`);
      }
      posture = v;
    } else if (a === "--door-plugin-dir") doorPluginDir = need(a, ++i);
    else if (a === "--level") level = need(a, ++i);
    else if (a === "--harness") {
      const v = need(a, ++i);
      if (!HARNESSES.includes(v)) throw new Error(`--harness must be one of ${HARNESSES.join("|")}`);
      harness = v;
    } else if (a === "--mechanism") {
      const v = need(a, ++i);
      if (!MECHANISMS.includes(v)) throw new Error(`--mechanism must be one of ${MECHANISMS.join("|")}`);
      mechanism = v;
    } else if (a === "--skill") skillPaths.push(need(a, ++i));
    else if (a === "--record-skill") recordSkillPaths.push(need(a, ++i));
    else if (a === "--print") print = true;
    else if (a === "-p") prompt = need(a, ++i);
    else if (a === "--model") model = need(a, ++i);
    else if (a === "--effort") effort = need(a, ++i);
    else if (a === "--keep-temp") keepTemp = true;
    else if (a === "--record") record = true;
    else if (a === "--benchmark-id") benchmarkId = need(a, ++i);
    else if (a === "--task") task = need(a, ++i);
    else if (a === "--arm") {
      const v = need(a, ++i);
      if (!ARMS.includes(v)) throw new Error(`--arm must be one of ${ARMS.join("|")}`);
      arm = v;
    } else if (a === "--rung") {
      const v = need(a, ++i);
      if (!TRIAL_RUNGS.includes(v)) throw new Error(`--rung must be one of ${TRIAL_RUNGS.join("|")}`);
      rung = v;
    } else if (a === "--repeat") repeat = Number(need(a, ++i));
    else if (a === "--endpoint-regex") endpointRegex = need(a, ++i);
    else if (a === "--record-out") recordOut = need(a, ++i);
    else if (a === "--receipt-out") receiptOut = need(a, ++i);
    else if (a === "--harness-bundle") harnessBundleDir = need(a, ++i);
    else if (a === "--harness-entry") harnessEntry = need(a, ++i);
    else if (a === "--harness-version") pinnedHarnessVersion = need(a, ++i);
    else if (a === "--harness-sha256") harnessSha256 = need(a, ++i);
    else if (a === "--note") note = need(a, ++i);
    else throw new Error(`unknown arg: ${a}`);
  }
  if (level !== void 0) {
    if (SUMMON_ONLY_LEVELS.includes(level)) {
      const arm2 = level === "ultra" ? "/skill-ultra" : `/skill-hell ${level}`;
      throw new Error(
        `--level ${level} is a live summon rung, not a boot posture \u2014 launch a Heaven rung (zero|low|med), then arm ${arm2}`
      );
    }
    const aliased = LEVEL_ALIASES[level];
    if (!aliased) throw new Error(`--level must be one of zero|low|med (or native)`);
    if (posture !== void 0 && posture !== aliased) {
      throw new Error(`--level ${level} (= ${aliased}) contradicts --posture ${posture}`);
    }
    posture = aliased;
  }
  posture ??= "floor";
  let recordOpts;
  if (record) {
    if (prompt === void 0) throw new Error("--record is headless-only: -p <text> is required");
    if (print) throw new Error("--record cannot be combined with --print because no trial would execute");
    if (!benchmarkId || !task) throw new Error("--record requires --benchmark-id and --task");
    if (!arm || !rung) throw new Error("--record requires an exact --arm and --rung");
    if (!Number.isInteger(repeat) || repeat < 0) throw new Error("--repeat must be a non-negative integer");
    validateTrialCoordinate(arm, rung, posture);
    if (!recordOut || !receiptOut) throw new Error("--record requires --record-out and --receipt-out companion artifact paths");
    if (recordOut === receiptOut) throw new Error("--record-out and --receipt-out must be different paths");
    if (!harnessBundleDir || !harnessEntry || !pinnedHarnessVersion || !harnessSha256) {
      throw new Error(
        "--record requires a clean pinned harness bundle: --harness-bundle, --harness-entry, --harness-version, and --harness-sha256"
      );
    }
    recordOpts = { benchmarkId, task, arm, rung, repeatIndex: repeat, endpointRegex, recordOut, note };
  } else if (recordSkillPaths.length || receiptOut || harnessBundleDir || harnessEntry || pinnedHarnessVersion || harnessSha256) {
    throw new Error("--record-skill, receipt, and pinned harness bundle flags are only valid with --record");
  }
  const harnessBundle = harnessBundleDir && harnessEntry && pinnedHarnessVersion && harnessSha256 ? { sourceDir: harnessBundleDir, entry: harnessEntry, pinnedVersion: pinnedHarnessVersion, contentSha256: harnessSha256 } : void 0;
  return {
    posture,
    harness,
    mechanism,
    skillPaths,
    recordSkillPaths,
    doorPluginDir,
    print,
    prompt,
    model,
    effort,
    keepTemp,
    passthrough,
    record: recordOpts,
    receiptOut,
    harnessBundle
  };
}
function main(argv) {
  const args = parseArgs(argv);
  const skills = args.skillPaths.map(resolveSkill);
  const recordedSkills = [...skills];
  for (const skillPath of args.recordSkillPaths) {
    const skill = resolveSkill(skillPath);
    const existing = recordedSkills.find((candidate) => candidate.id === skill.id);
    if (existing && existing.contentSha256 !== skill.contentSha256) {
      throw new Error(`recorded skill id ${skill.id} resolves to more than one content hash`);
    }
    if (!existing) recordedSkills.push(skill);
  }
  if (args.record) validateTrialSkills(args.record, recordedSkills);
  const input = {
    posture: args.posture,
    harness: args.harness,
    mechanism: args.mechanism,
    skills,
    model: args.model,
    effort: args.effort,
    prompt: args.prompt,
    jsonOutput: !!args.record,
    passthrough: args.passthrough,
    doorPluginDir: args.doorPluginDir
  };
  const compiled = compile(input);
  const kind = floorOf(args.posture);
  if (kind === "benchmark") {
    console.error("[skill-zero] benchmark floor (doorless) \u2014 the placebo-of-record. Not the product floor; never average the two.");
  } else if (kind === "product") {
    console.error("[skill-zero] product floor (doorful) \u2014 retains the minimum control surface. Its own arm, priced separately from the benchmark floor.");
  }
  if (args.posture === "curated") {
    const d = compiled.doseSummary;
    console.error(
      `[skill-zero] curated loadout dose (${d.tokenizer}): standing=${d.standingTotal} invocation=${d.invocationTotal} (${d.skills.map((s) => `${s.id}: ${s.standingTokens}/${s.invocationTokens}`).join(", ")})`
    );
  }
  if (args.print || compiled.execSupport === "recipe") {
    if (!args.print) {
      console.error(
        `[skill-zero] ${args.harness}: verified cells allow recipe only \u2014 printing the compiled profile (as if --print)`
      );
    }
    console.log(JSON.stringify({ ...compiled, execSupport: void 0, recipe: compiled.execSupport === "recipe" }, null, 2));
    return 0;
  }
  const result = exec(compiled, { keepTemp: args.keepTemp, harnessBundle: args.harnessBundle });
  if (result.keptTemp) console.error(`[skill-zero] kept temp dir: ${result.sessionDir}`);
  if (args.record) {
    if (result.stdout === null) throw new Error("--record requires headless output");
    let usage;
    let resultText;
    try {
      let parsed = JSON.parse(result.stdout);
      if (Array.isArray(parsed)) parsed = parsed.find((x) => x?.type === "result") ?? parsed[parsed.length - 1];
      usage = parsed?.usage;
      resultText = typeof parsed?.result === "string" ? parsed.result : void 0;
    } catch {
    }
    const record = assembleRecord({
      opts: args.record,
      posture: args.posture,
      skills: recordedSkills,
      model: args.model ?? "unknown",
      harness: {
        name: args.harness,
        version: result.provision?.reportedVersion ?? "unknown (unprovisioned)"
      },
      usage,
      resultText,
      wallClockMs: result.wallClockMs,
      recordedAt: (/* @__PURE__ */ new Date()).toISOString(),
      notes: args.record.note
    });
    if (!result.provision || !args.receiptOut) {
      throw new Error("--record requires verified provision evidence and a companion receipt path");
    }
    const receipt = assembleRunReceipt({
      record,
      rung: args.record.rung,
      posture: args.posture,
      harnessName: args.harness,
      provision: result.provision,
      keptTemp: result.keptTemp
    });
    const json = JSON.stringify(record);
    writeFileSync2(args.record.recordOut, json + "\n");
    writeFileSync2(args.receiptOut, JSON.stringify(receipt, null, 2) + "\n");
    console.log(json);
    if (resultText !== void 0) console.error(`[skill-zero] result: ${resultText.trim()}`);
  } else if (result.stdout !== null) {
    process.stdout.write(result.stdout);
  }
  return result.status;
}
var isMain = process.argv[1]?.endsWith("cli.ts") || process.argv[1]?.endsWith("skill-zero.mjs");
if (isMain) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (e) {
    console.error(`skill-zero: ${e.message}`);
    process.exit(2);
  }
}
export {
  main,
  parseArgs
};
