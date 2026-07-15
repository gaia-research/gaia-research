"use client";

// Live Context Diet analyzer. Everything here runs in the browser: the pasted
// text lives only in React state, is analyzed by the pure lib/context-diet
// functions, and is NEVER uploaded, logged, or persisted. The only network call
// is the opt-in leaderboard submit, which sends anonymized metrics only.

import { useMemo, useRef, useState } from "react";
import { measure } from "@/lib/context-diet/analyze";
import { projectReduction } from "@/lib/context-diet/project";
import { estimateCost, MODEL_RATES } from "@/lib/context-diet/cost";
import { submitContextDiet, isSupabaseConfigured } from "@/lib/submissions/client";
import { LabLeaderboard } from "./LabLeaderboard";
import { PrivacyNote } from "./PrivacyNote";

const SKILL_REPO_URL = "https://github.com/gaia-research/skill-context-diet";

const num = (n: number) => n.toLocaleString("en-US");
const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

// Cap what we synchronously measure so an enormous paste can't freeze the tab.
// A real context file is well under this; anything larger is analyzed on its
// leading slice and flagged to the user.
const MAX_ANALYZE_CHARS = 200_000;

type SubmitState = "idle" | "sending" | "sent" | "error" | "offline";

export function ContextDietAnalyzer() {
  const [text, setText] = useState("");
  const [analyzed, setAnalyzed] = useState<string | null>(null);
  const [rateId, setRateId] = useState("sonnet");
  const [optIn, setOptIn] = useState(false);
  const [handle, setHandle] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const rate = MODEL_RATES.find((r) => r.id === rateId) ?? MODEL_RATES[1];

  // Recompute only when the user commits an analysis (analyzed snapshot).
  const result = useMemo(() => {
    if (analyzed === null) return null;
    const m = measure(analyzed);
    const band = projectReduction(m);
    const tokensSavedTarget = m.approxTokens - band.projectedTokensTarget;
    const cost = estimateCost(tokensSavedTarget, rate.inputPerMTok);
    return { m, band, tokensSavedTarget, cost };
  }, [analyzed, rate.inputPerMTok]);

  const handleAnalyze = () => {
    const capped = text.length > MAX_ANALYZE_CHARS;
    setTruncated(capped);
    setAnalyzed(capped ? text.slice(0, MAX_ANALYZE_CHARS) : text);
    setSubmitState("idle");
    setSubmitError("");
    // Milim companion reacts to a fresh analysis.
    window.dispatchEvent(new CustomEvent("milim:page-event", { detail: { topic: "context-diet:analyzed" } }));
    // Move focus to the results so keyboard/AT users land on the new output.
    requestAnimationFrame(() => resultsRef.current?.focus());
  };

  const handleSubmit = async () => {
    if (!result) return;
    if (!isSupabaseConfigured) {
      setSubmitState("offline");
      return;
    }
    setSubmitState("sending");
    const res = await submitContextDiet({
      tokensBefore: result.m.approxTokens,
      tokensAfter: result.band.projectedTokensTarget,
      reductionPct: result.band.targetPct,
      strategyKey: result.band.targetKey,
      handle: handle || undefined,
    });
    if (res.ok) {
      setSubmitState("sent");
      setRefreshKey((k) => k + 1); // refresh the leaderboard
    } else if (res.offline) {
      setSubmitState("offline");
    } else {
      setSubmitState("error");
      setSubmitError(res.error ?? "Submission failed.");
    }
  };

  return (
    <div className="cd-analyzer">
      <PrivacyNote />

      <label className="cd-field">
        <span className="cd-label">Paste your context file</span>
        <textarea
          className="cd-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a CLAUDE.md, .cursorrules, AGENTS.md, or system prompt…"
          rows={10}
          spellCheck={false}
          aria-label="Context file to analyze"
        />
      </label>
      <div className="cd-actions">
        <span className="cd-charcount">{num(text.length)} chars</span>
        <button
          type="button"
          className="button primary"
          onClick={handleAnalyze}
          disabled={text.trim().length === 0}
        >
          Analyze
        </button>
      </div>

      {result && (
        <>
          <div className="analyzer-console" role="status" ref={resultsRef} tabIndex={-1}>
            <header>
              <span className="led" /> ANALYZER LIVE ·{" "}
              {result.m.overLimit
                ? `OVER LIMIT BY ${num(result.m.overBy)} CHARS`
                : `WITHIN LIMIT · ${num(result.m.headroom)} HEADROOM`}
            </header>
            <div className="analyzer-readout">
              <b>{num(result.m.approxTokens)}</b>
              <span className="compression-arrow" aria-hidden="true">→</span>
              <b className="readout-target">~{num(result.band.projectedTokensTarget)}</b>
              <span className="readout-unit">tokens</span>
              <p className="readout-detail">
                {num(result.m.totalChars)} chars · {result.m.sectionCount} sections · limit{" "}
                {num(result.m.limit)} · projected via {result.band.targetTitle}
              </p>
            </div>
            {truncated && (
              <p className="cd-note cd-err" style={{ padding: "0 18px 14px" }}>
                Input exceeded {num(MAX_ANALYZE_CHARS)} chars — analyzed the leading{" "}
                {num(MAX_ANALYZE_CHARS)} only.
              </p>
            )}
          </div>

          <div className="reduction-band">
            <div>
              <span className="section-kicker">PROJECTED REDUCTION</span>
              <p>
                <strong>
                  {result.band.lowPct}%–{result.band.highPct}%
                </strong>{" "}
                — target <strong>{result.band.targetPct}%</strong> via {result.band.targetTitle}.
                Projected ~{num(result.band.projectedTokensTarget)} tokens (from{" "}
                {num(result.m.approxTokens)}).
              </p>
              <p className="cd-note">
                Projected from Context Diet — Lab 001&apos;s four reduction{" "}
                <em>strategies</em> (measured recipes for trimming a prompt), not a live rewrite.{" "}
                <a href="#evidence-title" className="cd-inline-link">
                  How is this projected? ↓
                </a>{" "}
                Verify faithfulness before adopting.
              </p>
            </div>
            <div className="reduction-cost">
              <label>
                <span className="cd-label">Rate</span>
                <select value={rateId} onChange={(e) => setRateId(e.target.value)}>
                  {MODEL_RATES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} (${r.inputPerMTok}/M in)
                    </option>
                  ))}
                </select>
              </label>
              <p className="cd-savings">
                <b>{usd(result.cost.dollarsSavedPerMReads)}</b>
                <span> saved / 1M reads</span>
              </p>
              <p className="cd-note">
                {num(result.tokensSavedTarget)} input tokens saved on every read.
              </p>
            </div>
          </div>

          <div className="cd-targets">
            <details className="cd-disclosure">
              <summary>
                Largest sections · compaction targets
                <span className="cd-disclosure-meta">
                  {result.m.ranked.filter((s) => s.title !== "(preamble)").length} sections
                </span>
              </summary>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Section</th>
                      <th scope="col">Chars</th>
                      <th scope="col">~Tokens</th>
                      <th scope="col">Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.m.ranked
                      .filter((s) => s.title !== "(preamble)")
                      .slice(0, 15)
                      .map((s) => (
                        <tr key={`${s.lineStart}-${s.title}`}>
                          <th scope="row">{s.title}</th>
                          <td>{num(s.chars)}</td>
                          <td>{num(s.approxTokens)}</td>
                          <td>{s.lineStart}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>

          <div className="cd-export">
            <details className="cd-disclosure">
              <summary>Adopt the skill &amp; leaderboard</summary>
              <div className="cd-export-body">
                <div>
                  <span className="cd-label">Adopt the skill</span>
                  <p>
                    Context Diet ships as an installable GAIA skill. Grab{" "}
                    <code>skill-context-diet</code> from GitHub — the packaged{" "}
                    <code>SKILL.md</code>, the four measured strategies, and the recipe for
                    running your own diet. Bring the projection above as your target.
                  </p>
                  <a
                    className="button secondary"
                    href={SKILL_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get the skill <span>↗</span>
                  </a>
                </div>
                <div className="cd-submit">
                  <label className="cd-optin">
                    <input
                      type="checkbox"
                      checked={optIn}
                      onChange={(e) => setOptIn(e.target.checked)}
                    />
                    <span>
                      Submit anonymized metrics to the leaderboard (token counts + reduction % only).
                    </span>
                  </label>
                  {optIn && (
                    <div className="cd-submit-row">
                      <input
                        type="text"
                        className="cd-handle"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="handle (optional)"
                        maxLength={32}
                        aria-label="Optional leaderboard handle"
                      />
                      <button
                        type="button"
                        className="button secondary"
                        onClick={handleSubmit}
                        disabled={!isSupabaseConfigured || submitState === "sending"}
                      >
                        {submitState === "sending" ? "Submitting…" : "Submit"}
                      </button>
                    </div>
                  )}
                  {!isSupabaseConfigured && optIn && (
                    <p className="cd-note">Leaderboard offline — submissions are disabled.</p>
                  )}
                  {submitState === "sent" && <p className="cd-note cd-ok">Submitted. Thanks!</p>}
                  {submitState === "offline" && (
                    <p className="cd-note">Leaderboard offline — not submitted.</p>
                  )}
                  {submitState === "error" && <p className="cd-note cd-err">{submitError}</p>}
                </div>
              </div>
            </details>
          </div>
        </>
      )}

      <details className="cd-disclosure cd-leaderboard-disclosure">
        <summary>
          Leaderboard
          <span className="cd-disclosure-meta">beat Lab 001 · 41.6%</span>
        </summary>
        <LabLeaderboard kind="context-diet" beatThreshold={41.6} refreshKey={refreshKey} />
      </details>
    </div>
  );
}
