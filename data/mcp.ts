// Single source of truth for the @gaia-research/mcp package.
// All downstream pages, tests, and docs derive from this file.

/** Immutable release fact; public commands intentionally use the moving @latest selector. */
export const version = "0.4.0";
export const packageName = "@gaia-research/mcp";
export const packageSelector = `${packageName}@latest`;

/** "ACT" = active/released, "PLN" = planned. */
export const status = "ACT" as const;

export const npmInstallCmd = `npm install ${packageSelector}`;
/** The scoped package publishes two binaries, so select gaia-mcp explicitly. */
export const npxCmd = `npx -y -p ${packageSelector} gaia-mcp`;
/** Public npx-friendly selector for the separate summon CLI package. */
export const summonNpxCmd = "npx -y skill-hell@latest";
/** The scoped package also publishes a `skill-hell` bin; keep this selector explicit. */
export const scopedSummonNpxCmd = `npx -y -p ${packageSelector} skill-hell`;

// ── Available tools (published four-tool package surface) ───────────────────

export type McpTool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
};

export const availableTools: readonly McpTool[] = [
  {
    name: "gaia_search",
    description: "Find generic and Named Skills in the public Gaia Registry. Returns ranked structured results with trust and source freshness metadata.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Task, capability, or skill to find." },
        limit: { type: "number", description: "Max number of results to return (default: 20)." },
        kinds: { type: "array", description: "Filter by kinds: generic or named." },
      },
      required: ["query"],
    },
  },
  {
    name: "gaia_inspect",
    description: "Return an evidence-backed dossier for one generic or Named Skill, including relationships, implementations, trust, sources, and data freshness.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Generic id, Named Skill id, or Named catalog reference." },
      },
      required: ["id"],
    },
  },
  {
    name: "summon",
    description: "Install the best-matching Named Skill into a session-locked temporary directory without changing your real configuration. Returns a printable card, inspect URL, trust fields, timing, cache state, and ranking disclosure.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Task or capability to summon a matching skill for." },
        limit: { type: "number", description: "Max number of candidates to consider (1–5)." },
      },
      required: ["query"],
    },
  },
  {
    name: "gaia_status",
    description: "Report server version, Registry mode, data-contract compatibility, source freshness, counts, and available tools.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
] as const;

// ── Planned tools (future releases; no released local-checkout mode) ─────────

export const plannedTools: readonly McpTool[] = [
  {
    name: "gaia_skill_install",
    description: "Install a Gaia skill from the registry into the current agent harness configuration.",
    inputSchema: {
      type: "object",
      properties: {
        skill: { type: "string", description: "Skill slug, e.g. gaia-research/skill-ci-churn" },
        harness: { type: "string", description: "Target harness: claude-code | codex | cursor | pi" },
      },
      required: ["skill"],
    },
  },
  {
    name: "gaia_skill_list",
    description: "List all skills available in the Gaia Skill Tree registry, with optional category filter.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Optional category filter, e.g. ci, cost, context" },
      },
    },
  },
  {
    name: "gaia_skill_compose",
    description: "Compose two installed skills into a unified SKILL.md using skill-fuse.",
    inputSchema: {
      type: "object",
      properties: {
        skill_a: { type: "string", description: "First skill slug" },
        skill_b: { type: "string", description: "Second skill slug" },
        output_name: { type: "string", description: "Name for the composed skill" },
      },
      required: ["skill_a", "skill_b"],
    },
  },
  {
    name: "gaia_context_analyze",
    description: "Analyze a context/SKILL.md file and return a token-budget breakdown against the harness limit.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Absolute path to the context file to analyze" },
        harness_limit: { type: "number", description: "Token limit to check against (default: 200000)" },
      },
      required: ["path"],
    },
  },
  {
    name: "gaia_benchmark_submit",
    description: "Validate and submit a GSB benchmark result JSON to the Gaia Research ledger.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Absolute path to the GSB submission JSON file" },
        dry_run: { type: "boolean", description: "Set to true to validate without submitting" },
      },
      required: ["path"],
    },
  },
] as const;

// ── Integration instruction blocks (keyed by harness name) ───────────────────

export type IntegrationId = "claude-code" | "codex" | "cursor";

export type Integration = {
  id: IntegrationId;
  label: string;
  configFile: string;
  snippet: string;
};

export const integrations: readonly Integration[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    configFile: ".mcp.json (project root)",
    snippet: JSON.stringify(
      {
        mcpServers: {
          gaia: {
            command: "npx",
            args: ["-y", "-p", packageSelector, "gaia-mcp"],
          },
        },
      },
      null,
      2,
    ),
  },
  {
    id: "codex",
    label: "OpenAI Codex CLI",
    configFile: "~/.codex/config.toml",
    snippet: [
      "# ~/.codex/config.toml",
      "[mcp_servers.gaia]",
      'command = "npx"',
      `args = ["-y", "-p", "${packageSelector}", "gaia-mcp"]`,
      "",
      "# Equivalent Codex CLI registration:",
      `# codex mcp add gaia -- ${npxCmd}`,
    ].join("\n"),
  },
  {
    id: "cursor",
    label: "Cursor",
    configFile: ".cursor/mcp.json (project root)",
    snippet: JSON.stringify(
      {
        mcpServers: {
          gaia: {
            command: "npx",
            args: ["-y", "-p", packageSelector, "gaia-mcp"],
          },
        },
      },
      null,
      2,
    ),
  },
] as const;
