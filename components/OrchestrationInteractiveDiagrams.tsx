"use client";

import React, { useEffect, useId, useState } from "react";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ============================================================================
   1. INTERACTIVE STEP-0 PRE-FLIGHT & A-E DECISION FLOWCHART
   ============================================================================ */

interface DecisionRung {
  id: "A" | "B" | "C" | "D" | "E";
  title: string;
  badge: string;
  color: string;
  gateRule: string;
  whenFits: string;
  whatToUse: string;
  costProfile: string;
  escalationPath: string;
}

const DECISION_RUNGS: readonly DecisionRung[] = [
  {
    id: "A",
    title: "Level A · No Orchestration (Default)",
    badge: "DEFAULT · ~90% OF WORK",
    color: "#34d399",
    gateRule: "Stay here whenever lanes share state, files are coupled, or total context stays under ~20k tokens.",
    whenFits: "Coherent features, bug fixes, refactors with shared state, or coupled files.",
    whatToUse: "One capable model loop + domain SKILL.md + local compiler/test verifiers. Zero subagents.",
    costProfile: "0% coordination tax · 100% warm prefix (0.05×–0.10× read)",
    escalationPath: "If recall degrades past ~20k root tokens and subtasks are disjoint → climb to Level B.",
  },
  {
    id: "B",
    title: "Level B · Lightweight Harness Subagents",
    badge: "2–4 DISJOINT LANES",
    color: "#38bdf8",
    gateRule: "Requires all 4 Step-0 gates: zero inter-lane dependencies, >20k isolation value, binary verifier, and matched cache horizon.",
    whenFits: "2–4 genuinely disjoint tasks (parallel scouting, isolated module tests, independent route audits).",
    whatToUse: "Native subagents (Pi subagent, Claude Code subagents), task envelopes, and <200-token disk pointer manifests.",
    costProfile: "Root pinned at ~18k tokens · Workers run in isolated git worktrees",
    escalationPath: "If a worker fails verification after ≤1 targeted repair → escalate that lane to a stronger model or human.",
  },
  {
    id: "C",
    title: "Level C · Existing Workflow Infrastructure",
    badge: "DURABLE PIPELINES",
    color: "#fbbf24",
    gateRule: "Choose when pipelines span hours/days or require durable checkpoints, state machines, and automatic retries.",
    whenFits: "Recurring multi-stage pipelines needing durable state, checkpointing, or strict lifecycle gates.",
    whatToUse: "CI matrices, codemode scripts, Claude Dynamic Workflows, LangGraph, Temporal, Ray, or Auto Office.",
    costProfile: "Zero LLM tokens spent on polling, sleep loops, or state transitions",
    escalationPath: "Pause at deterministic lifecycle gates when human review or production authority is required (Level E).",
  },
  {
    id: "D",
    title: "Level D · Thin Economic Scheduler (Optional)",
    badge: "HIGH-VOLUME ROUTING",
    color: "#ec4899",
    gateRule: "Requires recurring high-volume multi-model dispatch, fast binary verifiers, and explicit owner consent.",
    whenFits: "High-frequency workloads where deterministic rate-card routing ($0.10/M Luna vs. $2.00/M Sol) pays off.",
    whatToUse: "Thin adapter implementing task envelopes, shared state by reference, and verifier-driven escalation (RFC #2158).",
    costProfile: "Minimizes E[C_total | verified = 1] subject to latency and safety bounds",
    escalationPath: "FrugalGPT cascade: ≤3 cheap turns with compiler diagnostics → escalate unresolved ambiguity to frontier model.",
  },
  {
    id: "E",
    title: "Level E · Human-Controlled Execution",
    badge: "ABSTAIN · HUMAN AT WHEEL",
    color: "#fb7185",
    gateRule: "Mandatory whenever actions are irreversible, touch production data/billing, or lack a trustworthy verifier.",
    whenFits: "Production deploys, schema migrations, credential/permission changes, or unverified architectural calls.",
    whatToUse: "Read-only agent analysis and diff preparation; human operator reviews, approves, and executes.",
    costProfile: "Prevents unbounded negative value from unverified or destructive execution",
    escalationPath: "Terminal authority boundary: preview, merge, and production deploy remain separate human permissions.",
  },
] as const;

export function InteractiveDecisionFlow() {
  const uid = useId();
  const reducedMotion = useReducedMotion();
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Interactive Step-0 Pre-Flight Check toggles
  const [gates, setGates] = useState({
    disjoint: false,
    contextLarge: false,
    verifierReady: true,
    irreversible: false,
  });

  const active = DECISION_RUNGS[selectedIdx];
  const animate = !isPaused && !reducedMotion;

  const toggleGate = (key: keyof typeof gates) => {
    const next = { ...gates, [key]: !gates[key] };
    setGates(next);
    if (next.irreversible || !next.verifierReady) {
      setSelectedIdx(4); // Level E
    } else if (next.disjoint && next.contextLarge) {
      setSelectedIdx(1); // Level B
    } else {
      setSelectedIdx(0); // Level A
    }
  };

  return (
    <figure className="report-figure oid-card" aria-labelledby={`${uid}-title`}>
      <style>{`
        .oid-card {
          margin: 1.5rem 0 2rem;
          border: 1px solid #1e293b;
          border-radius: 8px;
          background: linear-gradient(180deg, #0c1222 0%, #070a14 100%);
          padding: clamp(1rem, 2.5vw, 1.5rem);
          color: #f8fafc;
          font-family: var(--body, Manrope, sans-serif);
        }
        .oid-top {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem 1rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid #1e293b;
        }
        .oid-kicker {
          font: 700 0.7rem/1.2 var(--mono, monospace);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #38bdf8;
          margin: 0 0 0.2rem;
        }
        .oid-title {
          margin: 0;
          font: 700 clamp(1.05rem, 2vw, 1.25rem)/1.25 var(--body, sans-serif);
          color: #f8fafc;
        }
        .oid-pause {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          min-height: 32px;
          padding: 0.25rem 0.65rem;
          border: 1px solid #334155;
          border-radius: 4px;
          background: #080c18;
          color: #cbd5e1;
          font: 600 0.7rem/1 var(--mono, monospace);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .oid-pause:hover {
          border-color: #38bdf8;
          color: #f8fafc;
        }
        .oid-pause-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
        }
        .oid-pause[aria-pressed="true"] .oid-pause-dot {
          background: #64748b;
        }
        .oid-gates {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.45rem;
          margin: 0.85rem 0;
          padding: 0.65rem 0.75rem;
          border: 1px solid #1e293b;
          border-radius: 6px;
          background: rgba(8, 12, 24, 0.85);
        }
        .oid-gates-label {
          font: 700 0.68rem/1.2 var(--mono, monospace);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-right: 0.25rem;
        }
        .oid-gate-chip {
          min-height: 32px;
          padding: 0.25rem 0.6rem;
          border: 1px solid #334155;
          border-radius: 4px;
          background: #0c1324;
          color: #cbd5e1;
          font: 600 0.72rem/1.2 var(--mono, monospace);
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .oid-gate-chip[data-on="true"] {
          border-color: #38bdf8;
          background: rgba(56, 189, 248, 0.14);
          color: #f8fafc;
        }
        .oid-ladder-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 1rem;
          align-items: stretch;
          margin-top: 0.75rem;
        }
        .oid-rungs {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .oid-rung-btn {
          display: grid;
          grid-template-columns: 2.2rem minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.65rem;
          min-height: 44px;
          padding: 0.4rem 0.7rem 0.4rem 0;
          border: 1px solid #1e293b;
          border-radius: 6px;
          background: rgba(14, 20, 36, 0.78);
          color: #cbd5e1;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease;
        }
        .oid-rung-btn:hover {
          border-color: #475569;
        }
        .oid-rung-btn b {
          display: grid;
          place-items: center;
          height: 100%;
          border-right: 1px solid #1e293b;
          font: 800 0.85rem/1 var(--mono, monospace);
          color: var(--r-color);
        }
        .oid-rung-btn span {
          font: 600 0.82rem/1.25 var(--body, sans-serif);
          color: #f8fafc;
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .oid-rung-btn small {
          font: 700 0.62rem/1 var(--mono, monospace);
          letter-spacing: 0.05em;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .oid-rung-btn[data-active="true"] {
          border-color: var(--r-color);
          background: rgba(15, 23, 42, 0.96);
          box-shadow: inset 0 0 0 1px var(--r-color);
        }
        .oid-rung-btn[data-active="true"] small {
          color: var(--r-color);
        }
        .oid-detail {
          border: 1px solid var(--active-color, #34d399);
          border-radius: 6px;
          background: #080c18;
          padding: 0.95rem 1.05rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .oid-detail-head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #1e293b;
        }
        .oid-detail-head h4 {
          margin: 0;
          font: 700 0.98rem/1.25 var(--body, sans-serif);
          color: #f8fafc;
        }
        .oid-detail-badge {
          font: 700 0.65rem/1 var(--mono, monospace);
          padding: 0.2rem 0.45rem;
          border-radius: 3px;
          border: 1px solid var(--active-color);
          color: var(--active-color);
        }
        .oid-dl {
          margin: 0;
          display: grid;
          gap: 0.5rem;
        }
        .oid-dl div {
          display: flex;
          flex-direction: column;
          gap: 0.12rem;
        }
        .oid-dl dt {
          font: 700 0.65rem/1.2 var(--mono, monospace);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #64748b;
        }
        .oid-dl dd {
          margin: 0;
          font-size: 0.8125rem;
          line-height: 1.48;
          color: #cbd5e1;
        }
        .oid-svg-strip {
          margin-top: 0.85rem;
          border: 1px solid #1e293b;
          border-radius: 6px;
          background: #060913;
          padding: 0.4rem 0.6rem;
        }
        .oid-foot {
          margin: 0.7rem 0 0;
          color: #94a3b8;
          font: 500 0.78rem/1.45 var(--mono, monospace);
          text-align: center;
        }
        @media (max-width: 760px) {
          .oid-ladder-grid {
            grid-template-columns: 1fr;
          }
          .oid-svg-strip {
            display: none;
          }
        }
      `}</style>

      <div className="oid-top">
        <div>
          <p className="oid-kicker">Interactive Decision Flowchart · Levels A → E</p>
          <h3 id={`${uid}-title`} className="oid-title">
            Test the Step-0 Pre-Flight Gates or inspect any coordination rung
          </h3>
        </div>
        <button
          type="button"
          className="oid-pause"
          aria-pressed={isPaused}
          onClick={() => setIsPaused((p) => !p)}
        >
          <span className="oid-pause-dot" aria-hidden="true" />
          {isPaused ? "Flow paused" : "Live flow"}
        </button>
      </div>

      {/* Interactive Step-0 Gate Simulator */}
      <div className="oid-gates" role="group" aria-label="Step-0 pre-flight condition toggles">
        <span className="oid-gates-label">Step-0 Pre-Flight:</span>
        <button
          type="button"
          className="oid-gate-chip"
          data-on={gates.disjoint ? "true" : "false"}
          onClick={() => toggleGate("disjoint")}
        >
          {gates.disjoint ? "✓" : "○"} Disjoint lanes
        </button>
        <button
          type="button"
          className="oid-gate-chip"
          data-on={gates.contextLarge ? "true" : "false"}
          onClick={() => toggleGate("contextLarge")}
        >
          {gates.contextLarge ? "✓" : "○"} Context &gt;20k tok
        </button>
        <button
          type="button"
          className="oid-gate-chip"
          data-on={gates.verifierReady ? "true" : "false"}
          onClick={() => toggleGate("verifierReady")}
        >
          {gates.verifierReady ? "✓" : "○"} Binary verifier ready
        </button>
        <button
          type="button"
          className="oid-gate-chip"
          data-on={gates.irreversible ? "true" : "false"}
          onClick={() => toggleGate("irreversible")}
        >
          {gates.irreversible ? "⚠" : "○"} Irreversible / prod deploy
        </button>
      </div>

      <div className="oid-ladder-grid">
        <div className="oid-rungs" role="tablist" aria-label="Five-level coordination decision ladder">
          {DECISION_RUNGS.map((r, idx) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={selectedIdx === idx}
              data-active={selectedIdx === idx ? "true" : "false"}
              className="oid-rung-btn"
              style={{ "--r-color": r.color } as React.CSSProperties}
              onClick={() => setSelectedIdx(idx)}
            >
              <b>{r.id}</b>
              <span>{r.title.replace(/^Level [A-E] · /, "")}</span>
              <small>{r.badge.split(" · ")[0]}</small>
            </button>
          ))}
        </div>

        <div
          className="oid-detail"
          style={{ "--active-color": active.color } as React.CSSProperties}
          role="region"
          aria-live="polite"
        >
          <div className="oid-detail-head">
            <h4>{active.title}</h4>
            <span className="oid-detail-badge">{active.badge}</span>
          </div>
          <dl className="oid-dl">
            <div>
              <dt>Decision Gate</dt>
              <dd>{active.gateRule}</dd>
            </div>
            <div>
              <dt>Architecture &amp; Tooling</dt>
              <dd>{active.whatToUse}</dd>
            </div>
            <div>
              <dt>Economic Posture</dt>
              <dd style={{ color: active.color, fontWeight: 600 }}>{active.costProfile}</dd>
            </div>
            <div>
              <dt>Escalation / Fallback Path</dt>
              <dd>{active.escalationPath}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Animated SVG Flow Strip */}
      <div className="oid-svg-strip">
        <svg
          viewBox="0 0 680 54"
          style={{ width: "100%", height: "auto", display: "block" }}
          role="img"
          aria-label="Escalation flow across levels A through E"
        >
          {[0, 1, 2, 3].map((i) => {
            const x1 = 70 + i * 135 + 48;
            const x2 = 70 + (i + 1) * 135 - 48;
            const activeLink = selectedIdx > i;
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={27}
                  x2={x2}
                  y2={27}
                  stroke={activeLink ? active.color : "#334155"}
                  strokeWidth="2"
                  strokeDasharray={activeLink ? undefined : "4 4"}
                />
                {animate && selectedIdx === i + 1 && (
                  <circle r="3.5" fill={active.color} cy="27">
                    <animate attributeName="cx" values={`${x1};${x2}`} dur="1.4s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
          {DECISION_RUNGS.map((r, i) => {
            const cx = 70 + i * 135;
            const isSel = i === selectedIdx;
            return (
              <g
                key={r.id}
                onClick={() => setSelectedIdx(i)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={cx - 46}
                  y={9}
                  width={92}
                  height={36}
                  rx={4}
                  fill={isSel ? "rgba(15, 23, 42, 0.98)" : "#0b101e"}
                  stroke={isSel ? r.color : "#334155"}
                  strokeWidth={isSel ? "2" : "1"}
                />
                <text
                  x={cx}
                  y={24}
                  textAnchor="middle"
                  fill={r.color}
                  fontSize="10"
                  fontFamily="var(--mono)"
                  fontWeight="800"
                >
                  LEVEL {r.id}
                </text>
                <text
                  x={cx}
                  y={37}
                  textAnchor="middle"
                  fill={isSel ? "#f8fafc" : "#94a3b8"}
                  fontSize="9"
                  fontFamily="var(--mono)"
                >
                  {r.id === "A" ? "Single Loop" : r.id === "B" ? "2–4 Lanes" : r.id === "C" ? "Workflow" : r.id === "D" ? "Scheduler" : "Human Gate"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <figcaption className="oid-foot">
        Consent-First Rule: Reading or copying this guide never authorizes installing tooling without explicit owner approval.
      </figcaption>
    </figure>
  );
}

/* ============================================================================
   2. INTERACTIVE REASONING VS. DETERMINISTIC COORDINATION & POINTER LOOP
   ============================================================================ */

interface LoopNode {
  id: string;
  step: string;
  lane: "LLM Reasoning" | "Deterministic Code" | "Human / Escalation";
  title: string;
  color: string;
  summary: string;
  tokenCost: string;
  payloadTitle: string;
  payloadCode: string;
}

const LOOP_NODES: readonly LoopNode[] = [
  {
    id: "decompose",
    step: "01",
    lane: "LLM Reasoning",
    title: "Decompose & Scope",
    color: "#38bdf8",
    summary: "Invoke the model only where judgment is required: decomposing ambiguous goals and defining disjoint file scopes.",
    tokenCost: "Warm root prefix (~18k tokens)",
    payloadTitle: "ROOT JUDGMENT",
    payloadCode: "Split 16 endpoints into 4 disjoint directory lanes; assign vitest gate per lane.",
  },
  {
    id: "envelope",
    step: "02",
    lane: "Deterministic Code",
    title: "Outbound Task Envelope",
    color: "#34d399",
    summary: "Pass scoped file paths, skill references, and verification commands by path—never paste full conversation history.",
    tokenCost: "~85 tokens outbound JSON",
    payloadTitle: "STRUCTURED TASK ENVELOPE",
    payloadCode: `{"taskId":"lane-billing","scopedFiles":["src/api/billing/"],"skillRef":".agents/skills/prisma/SKILL.md","verificationCmd":"npx vitest run src/api/billing"}`,
  },
  {
    id: "worktree",
    step: "03",
    lane: "Deterministic Code",
    title: "Worktree & Test Gate",
    color: "#34d399",
    summary: "Scripts—not frontier LLMs—manage git worktrees, queues, timeouts, retries, and binary compiler/test execution.",
    tokenCost: "0 coordinator tokens during wait",
    payloadTitle: "DETERMINISTIC EXECUTION",
    payloadCode: "git worktree add .worktrees/lane-billing && npx tsc --noEmit && npx vitest run src/api/billing",
  },
  {
    id: "manifest",
    step: "04",
    lane: "Deterministic Code",
    title: "Inbound Pointer Manifest",
    color: "#fbbf24",
    summary: "Workers write full diffs and logs to disk (/tmp/results/*.json) and return a <200-token receipt to keep root context under 20k.",
    tokenCost: "<200 tokens returned to root",
    payloadTitle: "POINTER MANIFEST (<200 TOKENS)",
    payloadCode: `{"task":"lane-billing","status":"PASSED","durationSec":412,"verification":{"passed":true},"artifacts":{"diffFile":"/tmp/results/billing.diff"}}`,
  },
  {
    id: "escalate",
    step: "05",
    lane: "Human / Escalation",
    title: "Verify or Escalate",
    color: "#ec4899",
    summary: "If the verifier passes, merge cleanly. After at most 1 failed repair turn, escalate the diagnostic receipt to a stronger model or human.",
    tokenCost: "Reads full log ONLY when status === FAILED",
    payloadTitle: "ESCALATION RULE",
    payloadCode: "if (manifest.status === 'FAILED' && retries >= 1) escalateToReviewer(manifest.artifacts.logFile);",
  },
] as const;

export function InteractiveDelegationLoop() {
  const uid = useId();
  const reducedMotion = useReducedMotion();
  const [nodeIdx, setNodeIdx] = useState<number>(0);
  const [showAntiPattern, setShowAntiPattern] = useState<boolean>(false);

  const node = LOOP_NODES[nodeIdx];

  return (
    <figure className="report-figure oid-card" aria-labelledby={`${uid}-loop-title`}>
      <div className="oid-top">
        <div>
          <p className="oid-kicker">Interactive Architecture · Reasoning vs. Deterministic Code</p>
          <h3 id={`${uid}-loop-title`} className="oid-title">
            Invoke models for judgment; use deterministic software for state, queues, and transport
          </h3>
        </div>
        <button
          type="button"
          className="oid-pause"
          aria-pressed={showAntiPattern}
          onClick={() => setShowAntiPattern((p) => !p)}
          style={{
            borderColor: showAntiPattern ? "#f43f5e" : "#34d399",
            color: showAntiPattern ? "#fecdd3" : "#d1fae5",
          }}
        >
          {showAntiPattern ? "⚠ Viewing Anti-Pattern: Raw Dump (+45k tok)" : "✓ Viewing Pointer Manifest (<200 tok)"}
        </button>
      </div>

      {/* 5-step interactive node selector */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "0.4rem",
          margin: "0.85rem 0",
        }}
        role="tablist"
        aria-label="Delegation and verification pipeline steps"
      >
        {LOOP_NODES.map((n, i) => {
          const sel = i === nodeIdx;
          return (
            <button
              key={n.id}
              type="button"
              role="tab"
              aria-selected={sel}
              onClick={() => setNodeIdx(i)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.2rem",
                padding: "0.55rem 0.65rem",
                borderRadius: "6px",
                border: `1px solid ${sel ? n.color : "#1e293b"}`,
                background: sel ? "rgba(15, 23, 42, 0.95)" : "#080c18",
                color: "#f8fafc",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span style={{ font: "700 0.65rem/1 var(--mono)", color: n.color }}>
                {n.step} · {n.lane.split(" ")[0].toUpperCase()}
              </span>
              <strong style={{ fontSize: "0.8rem", lineHeight: 1.25 }}>{n.title}</strong>
            </button>
          );
        })}
      </div>

      {/* Inspector + Wire Comparison */}
      <div className="oid-ladder-grid">
        <div
          className="oid-detail"
          style={{ "--active-color": showAntiPattern ? "#f43f5e" : node.color } as React.CSSProperties}
        >
          <div className="oid-detail-head">
            <h4>
              {node.step}. {node.title}
            </h4>
            <span className="oid-detail-badge">{node.lane}</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.55, color: "#cbd5e1" }}>{node.summary}</p>
          <div
            style={{
              marginTop: "auto",
              paddingTop: "0.55rem",
              borderTop: "1px solid #1e293b",
              font: "600 0.75rem/1.3 var(--mono)",
              color: showAntiPattern ? "#fb7185" : node.color,
            }}
          >
            Token impact: {showAntiPattern ? "+45,000 tokens permanently billed on every subsequent turn" : node.tokenCost}
          </div>
        </div>

        <div
          className="oid-detail"
          style={{ "--active-color": showAntiPattern ? "#f43f5e" : "#38bdf8" } as React.CSSProperties}
        >
          <div className="oid-detail-head">
            <h4>{showAntiPattern ? "ANTI-PATTERN: RAW STDOUT / DIFF DUMP" : node.payloadTitle}</h4>
            <span className="oid-detail-badge">{showAntiPattern ? "100k+ BLOAT" : "18k PINNED"}</span>
          </div>
          <pre
            style={{
              margin: 0,
              padding: "0.7rem",
              borderRadius: "4px",
              background: "#04060c",
              border: "1px solid #1e293b",
              color: showAntiPattern ? "#fda4af" : "#e2e8f0",
              font: "0.74rem/1.55 var(--mono)",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            <code>
              {showAntiPattern
                ? `[worker-1..4 raw chat dump]: 1,420 lines of git diff + full test stdout pasted into root context → prefix balloons to 118,000 tokens (re-billed on every turn).`
                : node.payloadCode}
            </code>
          </pre>
          {!reducedMotion && (
            <div style={{ font: "0.68rem/1.3 var(--mono)", color: "#94a3b8" }}>
              Rule: Read <code>/tmp/results/*.log</code> only when <code>status === &quot;FAILED&quot;</code>.
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}

/* ============================================================================
   3. INTERACTIVE PROVIDER CACHE-HORIZON & WORKER DURATION MATCHER
   ============================================================================ */

interface DurationBand {
  id: string;
  label: string;
  minutes: number;
  exampleTask: string;
  horizon5m: { status: "WARM" | "COLD"; detail: string };
  horizon30m: { status: "WARM" | "COLD"; detail: string };
  horizon1h: { status: "WARM" | "COLD"; detail: string };
  recommendation: string;
  mathNote: string;
}

const DURATION_BANDS: readonly DurationBand[] = [
  {
    id: "band-1",
    label: "< 5m · Fast Lane (3.5m)",
    minutes: 3.5,
    exampleTask: "Unit tests, lint, fast symbol scouting (3.5m)",
    horizon5m: { status: "WARM", detail: "✓ WARM HIT (returns inside 5m sliding window)" },
    horizon30m: { status: "WARM", detail: "✓ WARM HIT (inside GPT 6 30m floor)" },
    horizon1h: { status: "WARM", detail: "✓ WARM HIT (2.0× write fee unnecessary here)" },
    recommendation: "Keep standard 5-minute TTL (1.25× write). Do not pay Anthropic's 2.0× 1-hour write premium when turns arrive every 1–4 minutes.",
    mathNote: "If a slower worker also runs on a 5m root, pair it with 1 genuine fast lane (<4m) to refresh the sliding lease.",
  },
  {
    id: "band-2",
    label: "5–25m · Async Sweet Spot (16m)",
    minutes: 16,
    exampleTask: "4-lane Prisma endpoint migration (16m)",
    horizon5m: { status: "COLD", detail: "✗ COLD EVICTION (5m lease expires → up to 25× write surcharge)" },
    horizon30m: { status: "WARM", detail: "✓ WARM on GPT 6 30m Floor (1.25× write, 0.1× read)" },
    horizon1h: { status: "WARM", detail: "✓ WARM on Claude 1h Lease (2.0× write, 0.05×–0.10× read)" },
    recommendation: "Fits OpenAI GPT 6's 30-minute minimum floor (Sol root + Luna workers) or Claude's 1-hour root TTL without artificial heartbeat pings.",
    mathNote: "On Sonnet 5 (100k root), a single 8–16m pause saves 16% with ttl: '1h' (2.10× vs. 2.50× cold re-write).",
  },
  {
    id: "band-3",
    label: "20–60m · Deep Suite (42m)",
    minutes: 42,
    exampleTask: "Full integration battery & multi-module audit (42m)",
    horizon5m: { status: "COLD", detail: "✗ COLD EVICTION (evicts 8× over without keepalives)" },
    horizon30m: { status: "COLD", detail: "✗ CAN EVICT (42m gap exceeds 30m minimum floor)" },
    horizon1h: { status: "WARM", detail: "✓ WARM on Claude 1h / Gemini CachedContent" },
    recommendation: "Configure root promptCacheTtl: '1h' on Claude (or Gemini CachedContent) while keeping ephemeral leaf subagents on 5-minute caching.",
    mathNote: "Across seven 7.5m gaps (52.5m), native 1h TTL cuts Sonnet 5 prefill spend by 73% ($0.54 vs. $2.00 cold 5m).",
  },
  {
    id: "band-4",
    label: "> 60m · Multi-Hour Epic (90m)",
    minutes: 60,
    exampleTask: "Long-running benchmark sweep or multi-hour migration",
    horizon5m: { status: "COLD", detail: "✗ COLD EVICTION (never hold live session)" },
    horizon30m: { status: "COLD", detail: "✗ COLD EVICTION (exceeds 30m window)" },
    horizon1h: { status: "COLD", detail: "✗ LEASE EXPIRES (>60m single pause)" },
    recommendation: "Do not hold a live coordinator session across multi-hour pauses. Use barrier aggregation: detached workers write disk manifests, then boot a fresh root (<20k tokens).",
    mathNote: "At 15k–18k root context from pointer manifests, even a fresh session cold write costs ~$0.05–$0.09.",
  },
] as const;

export function InteractiveCacheHorizons() {
  const uid = useId();
  const [bandIdx, setBandIdx] = useState<number>(1); // Default to 16m sweet spot
  const band = DURATION_BANDS[bandIdx];

  // Timeline spans 0..70 minutes so the 60m lease ends short of the edge and
  // a >60m worker visibly overruns it.
  const pct = (m: number) => Math.min(100, (m / 70) * 100);
  const workerPct = band.minutes >= 60 ? 100 : pct(band.minutes);

  return (
    <figure className="report-figure oid-card" aria-labelledby={`${uid}-ch-title`}>
      <div className="oid-top">
        <div>
          <p className="oid-kicker">Interactive Cache-Horizon Matcher · 5m vs. 30m vs. 1h</p>
          <h3 id={`${uid}-ch-title`} className="oid-title">
            Match root coordinator retention to worker wall-clock duration
          </h3>
        </div>
        <span style={{ font: "600 0.72rem/1 var(--mono)", color: "#fbbf24" }}>
          Leaf subagents always stay on 5m TTL
        </span>
      </div>

      {/* Duration Band Selector */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
          gap: "0.4rem",
          margin: "0.85rem 0",
        }}
        role="tablist"
        aria-label="Worker wall-clock duration bands"
      >
        {DURATION_BANDS.map((b, idx) => {
          const active = idx === bandIdx;
          return (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setBandIdx(idx)}
              style={{
                padding: "0.5rem 0.65rem",
                borderRadius: "6px",
                border: `1px solid ${active ? "#38bdf8" : "#1e293b"}`,
                background: active ? "rgba(56, 189, 248, 0.14)" : "#080c18",
                color: active ? "#f8fafc" : "#94a3b8",
                font: "700 0.73rem/1.25 var(--mono)",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      {/* Horizon timeline: fluid rows, no fixed-width canvas, so it never side-scrolls */}
      <div className="och" role="img" aria-label={`Cache horizon timeline: worker returns after ${band.minutes >= 60 ? "more than 60" : band.minutes} minutes. 5m lease ${band.horizon5m.status.toLowerCase()}, GPT 6 30m floor ${band.horizon30m.status.toLowerCase()}, Claude or Gemini 1h lease ${band.horizon1h.status.toLowerCase()}.`}>
        <div className="och-track" style={{ ["--worker" as string]: `${workerPct}%` }}>
          <div className="och-row och-worker" data-over={band.minutes >= 60 ? "true" : "false"}>
            <span className="och-name">Worker away</span>
            <span className="och-lane">
              <span className="och-bar" style={{ width: `${workerPct}%` }}>
                <b>{band.minutes >= 60 ? "> 60m · detached" : `${band.minutes}m`}</b>
              </span>
            </span>
          </div>
          {[
            { key: "5m", name: "5m sliding TTL", mins: 5, tone: "blue", data: band.horizon5m },
            { key: "30m", name: "GPT 6 · 30m floor", mins: 30, tone: "amber", data: band.horizon30m },
            { key: "1h", name: "Claude / Gemini · 1h", mins: 60, tone: "pink", data: band.horizon1h },
          ].map((h) => (
            <div key={h.key} className="och-row" data-tone={h.tone} data-status={h.data.status}>
              <span className="och-name">
                {h.name}
                <i>{h.data.status === "WARM" ? "✓ warm" : "✗ evicts"}</i>
              </span>
              <span className="och-lane">
                <span className="och-bar" style={{ width: `${pct(h.mins)}%` }} />
              </span>
            </div>
          ))}
          <span className="och-marker" aria-hidden="true" />
        </div>
        <div className="och-axis" aria-hidden="true">
          <span style={{ left: `${pct(5)}%` }}>5m</span>
          <span style={{ left: `${pct(30)}%` }}>30m</span>
          <span style={{ left: `${pct(60)}%` }}>60m</span>
        </div>
        <p className="och-task">Workload: {band.exampleTask}</p>
      </div>

      {/* 3 Horizon Status Readouts + Recommendation */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.5rem",
          marginTop: "0.75rem",
        }}
      >
        {[
          { title: "5m Sliding TTL", data: band.horizon5m },
          { title: "GPT 6 · 30m Floor", data: band.horizon30m },
          { title: "Claude / Gemini · 1h", data: band.horizon1h },
        ].map((h) => {
          const warm = h.data.status === "WARM";
          return (
            <div
              key={h.title}
              style={{
                padding: "0.65rem 0.75rem",
                borderRadius: "6px",
                border: `1px solid ${warm ? "rgba(52,211,153,0.4)" : "rgba(244,63,94,0.4)"}`,
                background: warm ? "rgba(16,185,129,0.08)" : "rgba(244,63,94,0.08)",
              }}
            >
              <div style={{ font: "700 0.68rem/1.2 var(--mono)", color: "#94a3b8", textTransform: "uppercase" }}>
                {h.title}
              </div>
              <div
                style={{
                  marginTop: "0.25rem",
                  font: "600 0.78rem/1.4 var(--mono)",
                  color: warm ? "#34d399" : "#fb7185",
                }}
              >
                {h.data.detail}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "0.75rem",
          padding: "0.75rem 0.9rem",
          borderRadius: "6px",
          border: "1px solid #1e293b",
          background: "#080c18",
          fontSize: "0.84rem",
          lineHeight: 1.55,
          color: "#cbd5e1",
        }}
      >
        <strong style={{ color: "#f8fafc" }}>Recommended posture: </strong>
        {band.recommendation}{" "}
        <span style={{ color: "#94a3b8", fontFamily: "var(--mono)", fontSize: "0.76rem" }}>
          ({band.mathNote})
        </span>
      </div>
    </figure>
  );
}
