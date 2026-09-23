"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_CLAUDE_PROMPT = `You are an expert orchestrator running Claude Code. Enforce the Gaia Research Orchestration Guide for this workspace:

1. **Choose the root cache horizon deliberately**:
   - Ensure \`.claude/settings.json\` enables 1-hour cache retention:
     \`\`\`json
     {
       "promptCacheTtl": "1h"
     }
     \`\`\`
   - Use 1h on the root only when expected reuse justifies the 2× cache-write rate; standard 5m writes cost 1.25×. Cached-read prices vary by model.
   - This requests a provider-side TTL; it does not guarantee a cache hit. Model, prefix, routing, and timing still affect reuse.
   - Keep root system instructions, CLAUDE.md, and tool definitions stable at the prefix to improve reuse across multi-turn worker dispatches.
   - Default leaf subagents to 5m; set their TTL separately only when their own expected reuse justifies the write premium.

2. **Step 0 Pre-Flight & Lane Partitioning**:
   - Refuse to orchestrate if a single Claude Code session can complete the task with high coherence.
   - When orchestrating, partition work into independent, non-overlapping lanes (tests, schema, refactors).

3. **Disk-Based Pointer Manifests**:
   - Subagents must NEVER paste raw terminal stdout, verbose logs, or large diffs into conversation context.
   - Workers write artifacts to \`/tmp/results/<task-id>.json\` and report back ONLY a compact (<200 tokens) JSON manifest:
     \`{"task": "<id>", "status": "PASSED|FAILED", "durationSec": <n>, "artifacts": {"diff": "..."}, "summary": "..."}\`
   - Keep orchestrator context strictly under 15,000–20,000 tokens to prevent cold-cache blowups.

4. **Telemetry & Idle Gap Tracking**:
   - Monitor idle gap time (Δt) between worker returns. Under \`promptCacheTtl: "1h"\`, idle pauses up to 55 minutes remain warm hits (\`cache_read_input_tokens > 0\`).`;

export const DEFAULT_PI_PROMPT = `You are an expert multi-agent coordinator operating inside the Pi harness. Enforce the Gaia Research Orchestration Guide:

1. **Sweet-Spot Orchestrator (GPT 6 Sol)**:
   - For the suggested pairing, select GPT 6 Sol through the OpenAI provider/model option exposed by your Pi setup; confirm the exact model ID supported there.
   - Standard API rates: $2.00/M input, $2.50/M cache writes, $0.20/M cached input, and $10/M output. GPT 6's 30m minimum can cover mid-length gaps, but writes are not free.
   - When gaps stay within 30 minutes, this can avoid artificial 5-minute keepalive loops.

2. **Subagent Task Isolation**:
   - Dispatch workers using Pi's isolated subagents (\`subagent\` tool or delegated worker panes) so worker contexts never leak into the coordinator session.
   - Fast-lane workers (lint, unit tests, syntax checks) target <4 minutes. Complex workers target <25 minutes to stay within the 30m cache floor.

3. **Pointer Manifest Contract**:
   - Direct all subagents to deposit diffs and test logs into \`/tmp/results/<task-id>.json\`.
   - Subagents return only a structured status manifest (<200 tokens) to the root coordinator.
   - Keep the root coordinator context under 15,000–20,000 tokens to prevent prefill bloat.

4. **Session Telemetry Logging**:
   - Inspect token usage and costs per turn with \`/pi-cost\` and session telemetry.
   - Verify cached-token and cache-write usage using the fields reported by the selected provider; compare each idle gap with the model's documented 30-minute minimum.`;

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
              1h TTL lease · .claude/settings.json
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
              30m floor · GPT 6 Sol default
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
