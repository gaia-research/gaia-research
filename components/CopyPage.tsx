"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_CLAUDE_PROMPT = `You are an expert orchestrator running Claude Code. Enforce the Gaia Research Orchestration Guide for this workspace:

1. **Orchestrator Selection (User-Led or Auto Repo-Aware)**:
   - Ask the user if they wish to pick the orchestrator model of their choice from available models, or let the agent determine the orchestrator automatically based on repository scale, language, and task complexity.
   - Never hardcode or force specific models. Respect the user's preferred or currently active model.

2. **Optimize Cache Settings for the Current Model**:
   - For the current model utilized by the user as orchestrator, configure cache settings to be optimal without altering the user's model selection:
     - When worker execution is expected to exceed 5 minutes and reuse justifies the 2× write surcharge, configure 1-hour cache retention in \`.claude/settings.json\` (or via \`CLAUDE_CODE_PROMPT_CACHE_TTL="1h"\`):
       \`\`\`json
       {
         "promptCacheTtl": "1h",
         "subagentPromptCacheTtl": "5m"
       }
       \`\`\`
     - Always keep leaf subagents on the standard 5-minute sliding cache (\`subagentPromptCacheTtl: "5m"\`) to avoid 1h write surcharges on ephemeral runs.
     - Structure root context with a stable prefix: keep system instructions, CLAUDE.md guidelines, and tool definitions early in the prompt before dynamic turn messages to ensure cache hits.

3. **Step 0 Pre-Flight & Lane Partitioning**:
   - Refuse to orchestrate if a single Claude Code session can complete the task with high coherence.
   - When orchestrating, partition work into independent, non-overlapping lanes with zero inter-lane dependencies.
   - Align lane execution to the active model's cache horizon: under a 5m horizon, ensure at least one fast lane (<4m) or assign the orchestrator productive in-flight work; under an extended horizon, allow workers to run asynchronously within the window.

4. **Disk-Based Pointer Manifests**:
   - Subagents must NEVER paste raw terminal stdout, verbose logs, or large diffs into conversation context.
   - Workers write artifacts to \`/tmp/results/<task-id>.json\` and report back ONLY a compact (<200 tokens) JSON manifest:
     \`{"task": "<id>", "status": "PASSED|FAILED", "durationSec": <n>, "artifacts": {"diff": "..."}, "summary": "..."}\`
   - Keep root orchestrator context strictly under 15,000–20,000 tokens to prevent cold-cache blowups.

5. **Telemetry & Idle Gap Tracking**:
   - Track idle gaps (Δt) between worker returns and inspect native usage metadata (\`cache_read_input_tokens\`, \`cache_creation_input_tokens\`) to verify warm cache reuse.`;

export const DEFAULT_PI_PROMPT = `You are an expert multi-agent coordinator operating inside the Pi harness. Enforce the Gaia Research Orchestration Guide:

1. **Orchestrator Selection (User-Led or Auto Repo-Aware)**:
   - Ask the user if they wish to pick the orchestrator model of their choice from their configured Pi providers and models, or let the coordinator automatically choose the best model based on repository characteristics (codebase size, language, architecture, and task complexity).
   - Never hardcode models in the workflow. Dynamically adapt to whatever model the user or repo-aware inspection selects.

2. **Optimize Cache Settings for the Current Model**:
   - For the current model utilized by the user as orchestrator, configure cache settings to be optimal for coordination:
     - Detect the active model and provider cache capabilities (e.g., Anthropic extended retention via \`PI_CACHE_RETENTION=long\`, OpenAI Responses cache retention options, or Gemini context caching).
     - Configure extended cache retention on the root orchestrator when worker flight times justify it, while ensuring leaf workers run with standard/ephemeral cache retention.
     - Keep the root prefix stable: place system instructions, repo guidelines, and tool schemas early so subsequent wakeups hit the warm cache.
     - Match worker schedules to the effective cache horizon: if constrained to a 5-minute cache, ensure a fast lane (<4m) or in-flight root work keeps memory warm; if on an extended horizon (30m or 1h), avoid artificial keepalives when gaps remain within the window.

3. **Subagent Task Isolation & Step 0 Check**:
   - Refuse to orchestrate if a single agent session can accomplish the task end-to-end.
   - Dispatch workers using Pi's isolated subagents (\`subagent\` tool or separate worker lanes) so worker execution contexts never leak into the root coordinator context.
   - Partition work into independent lanes with zero cross-lane blocking.

4. **Pointer Manifest Contract**:
   - Direct all subagents to deposit diffs, logs, and build artifacts into \`/tmp/results/<task-id>.json\`.
   - Subagents return only a structured status manifest (<200 tokens) to the root coordinator.
   - Keep the root coordinator context strictly under 15,000–20,000 tokens to prevent prefill bloat.

5. **Session Telemetry Logging**:
   - Inspect inter-turn idle gaps (Δt) and monitor provider cache read and write metrics directly through Pi's native session telemetry and provider usage metadata.`;

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
          <span>Choose a starting point</span>
        </div>
        <div className="copy-page-actions" role="group" aria-label="Orchestration prompt copy options">
          <button
            type="button"
            className="copy-page-btn copy-page-btn-claude"
            onClick={() => copy("claude", claudePrompt)}
            data-copied={copiedId === "claude"}
            aria-label="Copy tailored prompt for Claude Code"
          >
            <span className="copy-page-btn-title" aria-hidden="true">
              {copiedId === "claude" ? "✓ Copied Claude Code" : failedId === "claude" ? "Copy failed · preview open" : "⧉ Copy Claude Code prompt"}
            </span>
            <span className="copy-page-btn-sub" aria-hidden="true">
              Optimal cache setup · User or auto orchestrator
            </span>
          </button>

          <button
            type="button"
            className="copy-page-btn copy-page-btn-pi"
            onClick={() => copy("pi", piPrompt)}
            data-copied={copiedId === "pi"}
            aria-label="Copy tailored prompt for Pi"
          >
            <span className="copy-page-btn-title" aria-hidden="true">
              {copiedId === "pi" ? "✓ Copied Pi prompt" : failedId === "pi" ? "Copy failed · preview open" : "⧉ Copy Pi prompt"}
            </span>
            <span className="copy-page-btn-sub" aria-hidden="true">
              Optimal cache retention · User or auto orchestrator
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
            Select text here for manual copying. Each button copies the complete item shown.
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
