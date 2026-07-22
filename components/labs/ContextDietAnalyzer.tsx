"use client";

// Live Context Diet analyzer. Everything here runs in the browser: the pasted
// text lives only in React state, is analyzed by the pure lib/context-diet
// functions, and is NEVER uploaded, logged, or persisted. The only network call
// is the opt-in leaderboard submit, which sends anonymized metrics only.

import { useMemo, useRef, useState } from "react";
import CopyCommand from "@/components/CopyCommand";
import { installCmd } from "@/data/research";
import { measure } from "@/lib/context-diet/analyze";
import { projectReduction } from "@/lib/context-diet/project";
import { projectTarget, MAX_ESTIMATED_REDUCTION_PCT } from "@/lib/context-diet/target";
import { estimateCost, MODEL_RATES } from "@/lib/context-diet/cost";
import { submitContextDiet, isSupabaseConfigured } from "@/lib/submissions/client";
import { LabLeaderboard } from "./LabLeaderboard";
import { PrivacyNote } from "./PrivacyNote";
import { InfoTip } from "./InfoTip";

const SKILL_REPO_URL = "https://github.com/gaia-research/skill-context-diet";
const SKILL_INSTALL = installCmd("skill-context-diet");

const num = (n: number) => n.toLocaleString("en-US");
const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

// Cap what we synchronously measure so an enormous paste can't freeze the tab.
// A real context file is well under this; anything larger is analyzed on its
// leading slice and flagged to the user.
const MAX_ANALYZE_CHARS = 200_000;

type SubmitState = "idle" | "sending" | "sent" | "error" | "offline";
type GitHubFile = { name: string; url: string; size?: number; content?: string };

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
  const [desiredPct, setDesiredPct] = useState(42);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubFiles, setGithubFiles] = useState<GitHubFile[]>([]);
  const [selectedGithubUrl, setSelectedGithubUrl] = useState("");
  const [githubState, setGithubState] = useState<"idle" | "scanning" | "loading" | "ready" | "error">("idle");
  const [githubError, setGithubError] = useState("");
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const leaderboardRef = useRef<HTMLDetailsElement | null>(null);

  const rate = MODEL_RATES.find((r) => r.id === rateId) ?? MODEL_RATES[1];

  // Recompute only when the user commits an analysis (analyzed snapshot).
  const result = useMemo(() => {
    if (analyzed === null) return null;
    const m = measure(analyzed);
    const band = projectReduction(m);
    const target = projectTarget(m.totalChars, desiredPct);
    const cost = estimateCost(target.tokensSaved, rate.inputPerMTok);
    return { m, band, target, cost };
  }, [analyzed, desiredPct, rate.inputPerMTok]);

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

  const handleGitHubScan = async () => {
    setGithubState("scanning");
    setGithubError("");
    setGithubFiles([]);
    setSelectedGithubUrl("");
    try {
      const response = await fetch(`/api/context-diet/github?url=${encodeURIComponent(githubUrl.trim())}`);
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "GitHub scan failed.");
      const files: GitHubFile[] = data.file ? [data.file] : data.files ?? [];
      setGithubFiles(files);
      setGithubState("ready");
      if (files.length === 0) setGithubError("No recognized agent-context files were found in the bounded public repository scan.");
    } catch (error) {
      setGithubState("error");
      setGithubError(error instanceof Error ? error.message : "GitHub scan failed.");
    }
  };

  const handleGitHubChoose = async () => {
    const selected = githubFiles.find((file) => file.url === selectedGithubUrl);
    if (!selected) return;
    setGithubState("loading");
    setGithubError("");
    try {
      let content = selected.content;
      if (content === undefined) {
        const response = await fetch(`/api/context-diet/github?url=${encodeURIComponent(selected.url)}`);
        const data = await response.json();
        if (!response.ok || !data.ok || typeof data.file?.content !== "string") throw new Error(data.error || "Could not load that file.");
        content = data.file.content;
      }
      setText(content ?? "");
      setAnalyzed(null);
      setGithubState("ready");
    } catch (error) {
      setGithubState("error");
      setGithubError(error instanceof Error ? error.message : "Could not load that file.");
    }
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
      tokensAfter: result.target.projectedTokens,
      reductionPct: result.target.appliedPct,
      strategyKey: "user-target",
      handle: handle || undefined,
    });
    if (res.ok) {
      setSubmitState("sent");
      setLeaderboardOpen(true);
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

      <section className="cd-github" aria-labelledby="github-scan-title">
        <div className="cd-section-heading">
          <h2 id="github-scan-title">Scan a public GitHub repo</h2>
          <InfoTip label="Which GitHub links are supported">
            GitHub only. The scanner checks a bounded public repository tree for common agent-context
            files and never follows arbitrary URLs.
          </InfoTip>
        </div>
        <div className="cd-github-row">
          <input className="cd-handle" type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/owner/repo or …/blob/main/CLAUDE.md" aria-label="Public GitHub repository or agent-context file URL" />
          <button type="button" className="button secondary" onClick={handleGitHubScan} disabled={!githubUrl.trim() || githubState === "scanning" || githubState === "loading"}>{githubState === "scanning" ? "Scanning…" : "Find files"}</button>
        </div>
        {githubFiles.length > 0 && (
          <fieldset className="cd-github-files">
            <legend className="cd-label">Choose one file to load</legend>
            {githubFiles.map((file) => (
              <label key={file.url}>
                <input type="radio" name="github-context-file" value={file.url} checked={selectedGithubUrl === file.url} onChange={() => setSelectedGithubUrl(file.url)} />
                <span>{file.name}</span>
                {file.size !== undefined && <small>{num(file.size)} bytes</small>}
              </label>
            ))}
            <button type="button" className="button primary" disabled={!selectedGithubUrl || githubState === "loading"} onClick={handleGitHubChoose}>{githubState === "loading" ? "Loading…" : "Use selected file"}</button>
          </fieldset>
        )}
        {githubError && <p className="cd-note cd-err" role="alert">{githubError}</p>}
      </section>

      <label className="cd-field">
        <span className="cd-section-heading"><span>Or paste a context file</span></span>
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

      <div className="cd-quickstart" aria-label="Context Diet quick actions">
        <div>
          <span className="cd-label">Install Context Diet</span>
          <CopyCommand command={SKILL_INSTALL} />
        </div>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            setLeaderboardOpen(true);
            requestAnimationFrame(() => leaderboardRef.current?.scrollIntoView({ block: "start" }));
          }}
        >
          View leaderboard <span aria-hidden="true">↓</span>
        </button>
      </div>

      {result && (
        <>
          <p className="sr-only" role="status" aria-live="polite">
            Estimate updated: {num(result.m.approxTokens)} tokens before, approximately {num(result.target.projectedTokens)} after a {result.target.appliedPct}% reduction.
          </p>
          <div className="analyzer-console" role="region" aria-label="Context Diet estimate" ref={resultsRef} tabIndex={-1}>
            <header>
              <span className="led" /> ANALYZER LIVE ·{" "}
              {result.m.overLimit
                ? `BUDGET ALERT · ${num(result.m.overBy)} CHARS OVER OPTIONAL LIMIT`
                : `OPTIMIZATION SCAN · ${num(result.m.totalChars)} CHARS`}
            </header>
            <div className="analyzer-readout">
              <b>{num(result.m.approxTokens)}</b>
              <span className="compression-arrow" aria-hidden="true">→</span>
              <b className="readout-target">~{num(result.target.projectedTokens)}</b>
              <span className="readout-unit">tokens</span>
              <p className="readout-detail">
                {num(result.m.totalChars)} chars · {result.m.sectionCount} sections · optional budget{" "}
                {num(result.m.limit)} · measured benchmark projection
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
              <div className="cd-section-heading">
                <h2>Tune the estimate</h2>
                <InfoTip label="What this estimate means">
                  This is a read-only projection. The installed skill audits protected rules before
                  recommending any actual changes.
                </InfoTip>
              </div>
              <label className="cd-target-slider">
                <span><b>Desired reduction</b><strong>{result.target.requestedPct}%</strong></span>
                <input type="range" min="0" max="100" step="1" value={desiredPct} onChange={(event) => setDesiredPct(Number(event.target.value))} aria-describedby="target-guidance" />
              </label>
              <dl className="cd-target-stats">
                <div><dt>Recommended</dt><dd>{result.band.targetPct}%</dd></div>
                <div><dt>Projected size</dt><dd>{num(result.target.projectedChars)} chars</dd></div>
                <div><dt>Projected tokens</dt><dd>~{num(result.target.projectedTokens)}</dd></div>
              </dl>
              <div className="cd-target-graph" role="img" aria-label={`Projected remaining context after ${result.target.appliedPct}% reduction`}><span style={{ width: `${100 - result.target.appliedPct}%` }} /></div>
              <p className={`cd-note${result.target.requestedPct >= 80 ? " cd-warn" : ""}`} id="target-guidance">
                {result.target.clamped
                  ? `100% would imply deleting protected context. Projection is clamped at the estimated ${MAX_ESTIMATED_REDUCTION_PCT}% reduction floor until the installed skill audits the actual rules.`
                  : result.target.requestedPct >= 80
                    ? "80% is a stretch target. The installed skill may recommend less after identifying protected context."
                    : result.target.requestedPct > result.band.targetPct
                      ? "This target exceeds the measured recommendation. Treat it as owner-approved retirement, not ordinary compaction."
                      : "This target sits within the measured recommendation; the installed skill still verifies every protected rule."}
              </p>
              <a href="#evidence-title" className="cd-inline-link">See benchmark evidence ↓</a>
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
                {num(result.target.tokensSaved)} input tokens saved on every read.
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
              <summary>Next steps</summary>
              <div className="cd-export-body">
                <div>
                  <span className="cd-label">Run the verified audit</span>
                  <p>Install the skill to audit protected rules and generate a recoverable plan before anything changes.</p>
                  <details className="cd-mini-details">
                    <summary>How applying changes works</summary>
                    <p>The first run is read-only. A later explicit “apply” authorizes changes against a hash-verified plan. Leaderboard sharing requires separate consent.</p>
                  </details>
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
                    <></>
                  )}
                  {submitState === "sent" && <p className="cd-note cd-ok">Submitted. Thanks!</p>}
                  {submitState === "offline" && (
                    <p className="cd-note">Couldn&apos;t reach the leaderboard — run didn&apos;t land, boss.</p>
                  )}
                  {submitState === "error" && <p className="cd-note cd-err">{submitError}</p>}
                </div>
              </div>
            </details>
          </div>
        </>
      )}

      <details
        className="cd-disclosure cd-leaderboard-disclosure"
        id="context-diet-leaderboard"
        ref={leaderboardRef}
        open={leaderboardOpen}
        onToggle={(event) => setLeaderboardOpen(event.currentTarget.open)}
      >
        <summary>
          Leaderboard
          <span className="cd-disclosure-meta">beat Lab 001 · 41.6%</span>
        </summary>
        <LabLeaderboard kind="context-diet" beatThreshold={41.6} refreshKey={refreshKey} />
      </details>
    </div>
  );
}
