"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_CLAUDE_PROMPT = `Apply the Gaia Research Orchestration Guide to this repository using a strict consent-first workflow. Reading or receiving this prompt is NOT authorization to modify files, edit .claude/settings.json, install tooling, or launch paid multi-agent runs without explicit user approval.

1. **Inspect Repository, Harness & Skills (Read-Only First)**:
   - Inspect \`CLAUDE.md\`, \`AGENTS.md\`, \`package.json\`, CI workflows, and existing skills (\`.agents/skills/\`, \`.claude/\`).
   - Identify native Claude Code capabilities already available (single-loop tools, bounded subagents, or Claude Dynamic Workflows) and deterministic verifiers (test runners, typecheckers, linters) so you never duplicate existing infrastructure.

2. **Confirm Owner Priorities & Preserve Model Autonomy**:
   - Ask or confirm whether the owner prioritizes API spend, $20-tier subscription quota preservation, wall-clock latency, simplicity, or human review.
   - Respect the user's active or preferred models. Never hardcode models or override user model preferences.

3. **Assess Workload on the A–E Coordination Ladder**:
   - Evaluate Expected Cost per Verified Deliverable (execution + coordination + verification divided by pass probability) and classify the workload into the lowest sufficient level:
     - **Level A (No orchestration — default):** Coherent or tightly coupled tasks. Keep work in one Claude Code session with progressive skills and local verifiers. Feel free to recommend doing nothing.
     - **Level B (Lightweight orchestration):** 2–4 genuinely disjoint, zero-dependency lanes where context isolation prevents bloat. Use native subagents, structured task envelopes, and disk pointer manifests (<200 tokens)—no new runtime.
     - **Level C (Existing workflow infrastructure):** Recurring multi-stage pipelines needing durable retries or checkpoints. Reuse existing CI, scripts, Claude Dynamic Workflows, LangGraph, Temporal, or SDLC state tools.
     - **Level D (Thin economic scheduler adapter):** Consider only when recurring multi-model dispatch overhead and fast deterministic verifiers clearly justify a thin deterministic routing/envelope adapter.
     - **Level E (Human-controlled execution):** Keep a human at the wheel for irreversible deploys, production data/schema changes, permissions, or unverified decisions.

4. **Report Suitability Verdict & Request Explicit Consent**:
   - Present a concise assessment: recommended Level (A–E), smallest sufficient option (including "no change needed"), expected tradeoffs (distinguishing rate-card math from hypotheses), what will be measured, and how to revert.
   - Wait for explicit owner consent before editing any repository files or harness settings.

5. **Execution, Cache Horizon & Manifest Discipline (Only When Authorized)**:
   - Separate LLM reasoning from deterministic software: use scripts, git worktrees, and test gates for queues, state transitions, and verification rather than conversational polling.
   - When running subagents with gaps >5 minutes where reuse justifies the 2× write cost, propose configuring 1-hour root retention while keeping leaf subagents on 5-minute sliding cache in \`.claude/settings.json\` (or via \`CLAUDE_CODE_PROMPT_CACHE_TTL="1h"\` and \`CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL="5m"\`—never pass a non-existent \`--prompt-cache-ttl\` CLI flag):
     \`\`\`json
     {
       "promptCacheTtl": "1h",
       "subagentPromptCacheTtl": "5m"
     }
     \`\`\`
   - Keep the static prefix stable (avoid mid-session model switches, \`/effort\` edits, or MCP tool mutations).
   - Enforce disk-based Pointer Manifests: workers write full logs/diffs to \`/tmp/results/<task-id>.json\` and return ONLY a compact (<200 tokens) JSON receipt (\`task\`, \`status\`, \`durationSec\`, \`verification\`, \`artifacts\`, \`summary\`) so root context stays under 15,000–20,000 tokens.
   - Track inter-turn idle gaps (Δt), \`cache_read_input_tokens\` / \`cache_creation_input_tokens\`, and verified pass rates (recording unavailable metrics as \`unknown\`, never \`0\`).`;

export const DEFAULT_PI_PROMPT = `Apply the Gaia Research Orchestration Guide inside the Pi harness using a strict consent-first workflow. Reading or receiving this prompt is NOT authorization to modify files, install packages, alter .pi configuration, or launch paid multi-agent runs without explicit user approval.

1. **Inspect Repository, Pi Harness & Skills (Read-Only First)**:
   - Inspect \`CLAUDE.md\`, \`AGENTS.md\`, \`package.json\`, CI workflows, and existing skills (\`.agents/skills/\`, \`.pi/skills/\`).
   - Identify native Pi capabilities already present (\`subagent\` profiles/worktrees, \`codemode\` batching, background task runners) and existing deterministic verifiers (test suites, typecheckers, linters) before proposing any new tooling.

2. **Confirm Owner Priorities & Preserve Model Autonomy**:
   - Ask or confirm whether the owner prioritizes API spend, subscription quota preservation, wall-clock latency, simplicity, or human review.
   - Respect the user's configured Pi providers and model preferences (or offer repo-aware selection only if requested). Never hardcode models or assume unverified harness-specific cache flags exist.

3. **Assess Workload on the A–E Coordination Ladder**:
   - Evaluate Expected Cost per Verified Deliverable (execution + coordination + verification divided by pass probability) and classify the workload into the lowest sufficient level:
     - **Level A (No orchestration — default):** Coherent or coupled tasks. Use a single Pi agent loop with existing skills, \`codemode\`, and local test verifiers. Feel free to recommend doing nothing.
     - **Level B (Lightweight orchestration):** 2–4 genuinely disjoint, zero-dependency lanes (or isolated worktree writers). Use Pi's native \`subagent\` tool, structured task envelopes, and disk pointer manifests (<200 tokens)—no new runtime.
     - **Level C (Existing workflow infrastructure):** Recurring multi-stage pipelines needing durable state or retries. Reuse existing scripts, CI workflows, LangGraph, Temporal, Ray, or SDLC state runners rather than reinventing them in prompts.
     - **Level D (Thin economic scheduler adapter):** Consider a lightweight deterministic routing/envelope/verifier adapter over Pi primitives only when recurring multi-model coordination overhead and fast verifiers clearly justify it (see \`gaia-skill-tree#2158\` as an exploratory pilot concept, not a required dependency).
     - **Level E (Human-controlled execution):** Abstain from automation when permissions, irreversible side effects, or missing verification require human judgment.

4. **Report Suitability Verdict & Request Explicit Consent**:
   - Present a concise suitability verdict: recommended Level (A–E), smallest sufficient option (including "no change needed"), cost/latency tradeoffs (separating rate-card math from hypotheses), what will be measured, and reversible scope.
   - Request explicit owner consent before modifying files, skills, or configuration.

5. **Execution, Cache Horizon & Manifest Discipline (Only When Authorized)**:
   - Separate LLM reasoning from deterministic coordination: use scripts, worktrees, and test runners for queues, retries, and verification rather than conversational polling.
   - Align worker duration to the active model's documented provider cache horizon (e.g., 5m sliding window, OpenAI GPT 6's 30m minimum eligibility, or Anthropic/Gemini 1h options where supported by the provider API/harness), keeping leaf workers on short/ephemeral cache and keeping the root static prefix stable.
   - Enforce disk-based Pointer Manifests: workers write logs, diffs, and diagnostics to \`/tmp/results/<task-id>.json\` and return ONLY a compact (<200 tokens) JSON receipt (\`task\`, \`status\`, \`durationSec\`, \`verification\`, \`artifacts\`, \`summary\`) so root coordinator context stays under 15,000–20,000 tokens.
   - Record inter-turn idle gaps (Δt), provider cache read/write token metadata, and verified outcomes (marking unavailable metrics as \`unknown\`, never \`0\`).`;

export interface CopyPageProps {
  markdown: string;
  claudePrompt?: string;
  piPrompt?: string;
  hint?: string;
}

// "Copy page" affordance for long-form guides: provides dedicated buttons
// for copying Claude Code and Pi orchestrator prompts, as well as the full
// markdown guide source.
export default function CopyPage({
  markdown,
  claudePrompt = DEFAULT_CLAUDE_PROMPT,
  piPrompt = DEFAULT_PI_PROMPT,
  hint,
}: CopyPageProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<"claude" | "pi" | "guide">("claude");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef<number>(0);
  const previewRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => () => {
    requestId.current += 1;
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(async (id: "claude" | "pi" | "guide", text: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const thisRequestId = ++requestId.current;
    setActivePreview(id);
    setCopiedId(null);
    setFailedId(null);

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      // Chrome can leave clipboard.writeText pending on a backgrounded
      // document. Bound the wait so the UI always reports a result.
      const timedOut = Symbol("timeout");
      const result = await Promise.race([
        navigator.clipboard.writeText(text).then(() => "ok" as const),
        new Promise<typeof timedOut>((resolve) => {
          timeoutId = setTimeout(() => resolve(timedOut), 2000);
        }),
      ]);
      if (thisRequestId !== requestId.current) return;
      if (result === timedOut) throw new Error("clipboard write did not settle");

      setFailedId(null);
      setCopiedId(id);
      timer.current = setTimeout(() => {
        if (thisRequestId === requestId.current) {
          setCopiedId(null);
          setFailedId(null);
        }
      }, 2600);
    } catch {
      // Clipboard blocked (insecure context / permission denied / hidden tab).
      if (thisRequestId !== requestId.current) return;
      setCopiedId(null);
      setFailedId(id);
      if (previewRef.current) previewRef.current.open = true;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, []);

  return (
    <div id="copy-harness-prompts" className="copy-page" role="region" aria-label="Copy orchestration prompts and guide">
      <div className="copy-page-bar">
        <div className="copy-page-label">
          <span className="copy-page-badge">COPY</span>
          <span>Run a consent-first orchestration assessment</span>
        </div>
        <div className="copy-page-actions" role="group" aria-label="Orchestration prompt copy options">
          <button
            type="button"
            className="copy-page-btn copy-page-btn-claude"
            onClick={() => copy("claude", claudePrompt)}
            data-copied={copiedId === "claude"}
            aria-label="Copy tailored assessment prompt for Claude Code"
          >
            <span className="copy-page-btn-title" aria-hidden="true">
              {copiedId === "claude" ? "✓ Copied Claude Code" : failedId === "claude" ? "Copy failed · preview open" : "⧉ Copy Claude Code prompt"}
            </span>
            <span className="copy-page-btn-sub" aria-hidden="true">
              A–E suitability · Consent-first · Cache &amp; pointer rules
            </span>
          </button>

          <button
            type="button"
            className="copy-page-btn copy-page-btn-pi"
            onClick={() => copy("pi", piPrompt)}
            data-copied={copiedId === "pi"}
            aria-label="Copy tailored assessment prompt for Pi"
          >
            <span className="copy-page-btn-title" aria-hidden="true">
              {copiedId === "pi" ? "✓ Copied Pi prompt" : failedId === "pi" ? "Copy failed · preview open" : "⧉ Copy Pi prompt"}
            </span>
            <span className="copy-page-btn-sub" aria-hidden="true">
              A–E suitability · Consent-first · Subagent &amp; cache rules
            </span>
          </button>

          <button
            type="button"
            className="copy-page-btn copy-page-btn-guide"
            onClick={() => copy("guide", markdown)}
            data-copied={copiedId === "guide"}
            aria-label="Copy full guide as Markdown"
          >
            <span className="copy-page-btn-title" aria-hidden="true">
              {copiedId === "guide" ? "✓ Copied full guide" : failedId === "guide" ? "Copy failed · preview open" : "⧉ Copy full guide"}
            </span>
            <span className="copy-page-btn-sub" aria-hidden="true">
              Authoritative Markdown source
            </span>
          </button>
        </div>

        {/* Expandable preview: allows inspection before copy or manual copy if clipboard blocked */}
        <details ref={previewRef} className="copy-prompt-preview">
          <summary className="copy-preview-toggle">
            <span>Preview the copied text</span>
            <span className="copy-preview-badge">{activePreview.toUpperCase()}</span>
          </summary>
          <label className="copy-preview-select-label" htmlFor="copy-preview-select">
            Preview payload
            <select
              id="copy-preview-select"
              className="copy-preview-select"
              value={activePreview}
              onChange={(event) => setActivePreview(event.target.value as "claude" | "pi" | "guide")}
            >
              <option value="claude">Claude Code prompt</option>
              <option value="pi">Pi coordinator prompt</option>
              <option value="guide">Full guide source</option>
            </select>
          </label>
          <div className="copy-preview-box">
            <label className="sr-only" htmlFor="copy-payload-preview">
              {activePreview === "claude"
                ? "Claude Code prompt preview"
                : activePreview === "pi"
                ? "Pi coordinator prompt preview"
                : "Full guide Markdown preview"}
            </label>
            <textarea
              id="copy-payload-preview"
              className="copy-preview-code"
              readOnly
              spellCheck={false}
              value={activePreview === "claude" ? claudePrompt : activePreview === "pi" ? piPrompt : markdown}
            />
          </div>
          <p className="copy-preview-note">
            Select text here for manual copying. Copying or reading never authorizes repo edits without your explicit consent.
          </p>
        </details>
      </div>
      {hint ? <p className="copy-page-hint">{hint}</p> : null}
      <span className="sr-only" role="status" aria-live="polite">
        {copiedId === "claude"
          ? "Claude Code orchestration prompt copied to clipboard"
          : copiedId === "pi"
          ? "Pi orchestration prompt copied to clipboard"
          : copiedId === "guide"
          ? "Full guide Markdown copied to clipboard"
          : failedId
          ? "Clipboard write failed — select text instead"
          : ""}
      </span>
    </div>
  );
}
