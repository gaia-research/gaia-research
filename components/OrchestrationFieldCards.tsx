"use client";

import React, { useState } from "react";
import Link from "next/link";

interface LadderLevel {
  level: string;
  name: string;
  tag: string;
  color: string;
  summary: string;
  criteria: string;
  tools: string;
  example: string;
}

const LADDER_LEVELS: LadderLevel[] = [
  {
    level: "Level A",
    name: "Single Agent + Domain Skills",
    tag: "DEFAULT · 90% OF TASKS",
    color: "#10b981",
    summary: "One agent loop equipped with domain SKILL.md playbooks and deterministic local test/typecheck gates.",
    criteria: "Any task with shared files, causal dependencies, or under 15 minutes of work. If in doubt, stay here.",
    tools: "Native Claude Code / Pi loop + local test runner (vitest, pytest, cargo test) + AST search.",
    example: "Refactoring authentication middleware, fixing an API endpoint bug, or writing a new feature with tests.",
  },
  {
    level: "Level B",
    name: "Lightweight Harness Subagents",
    tag: "PARALLEL · DISJOINT LANES",
    color: "#38bdf8",
    summary: "2–4 parallel worker subagents executing in isolated git worktrees, returning <200-byte disk pointer receipts.",
    criteria: "Genuinely independent tasks across disjoint directories with zero shared state or merge conflicts.",
    tools: "Claude subagents or Pi subagent tool with git worktrees and disk receipts (/tmp/results/*.json).",
    example: "Scaffold 4 independent microservice clients, or parallel test suites across isolated modules.",
  },
  {
    level: "Level C",
    name: "Existing Workflow Infrastructure",
    tag: "DURABLE · PERSISTENT STATE",
    color: "#fbbf24",
    summary: "Leverage existing CI/CD runners, Temporal, LangGraph, or Claude Dynamic Workflows for multi-step durability.",
    criteria: "Pipelines spanning hours/days, requiring durable checkpoints, human approvals, or multi-stage retries.",
    tools: "GitHub Actions, Temporal, Ray, LangGraph, Claude Dynamic Workflows, or SQLite job queues.",
    example: "Nightly regression triage, multi-repository migration sweeps, or complex release trains.",
  },
  {
    level: "Level D",
    name: "Thin Economic Scheduler",
    tag: "OPTIONAL · HIGH VOLUME",
    color: "#ec4899",
    summary: "Deterministic cost/verifier routing over existing CLI tools only when recurring multi-model volume justifies it.",
    criteria: "High-volume repetitive workloads where rate-card arbitrage ($0.10 Luna vs $2.00 Sol) yields massive recurring savings.",
    tools: "Lightweight router script / skill adapter; never deploy without explicit owner consent.",
    example: "Filtering 10,000 issue triage candidates with lightweight models before escalating to frontier LLMs.",
  },
  {
    level: "Level E",
    name: "Human-Controlled Execution",
    tag: "ABSTAIN · SAFETY FIRST",
    color: "#f43f5e",
    summary: "Keep a human at the terminal. Agent generates proposals and diagnostic briefs; human executes.",
    criteria: "Irreversible actions: production database migrations, live deployments, credential rotations, or missing verifiers.",
    tools: "Human-in-the-loop CLI prompts, PR review workflows, manual staging execution.",
    example: "Running DROP TABLE migrations in production, rotating API secret keys, or pushing live releases.",
  },
];

export function OrchestrationFieldCards() {
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const current = LADDER_LEVELS[selectedLevel];

  return (
    <section className="orchestration-field-cards" aria-label="Executive field guide and decision ladder">
      <style>{`
        .orchestration-field-cards {
          margin: 0 0 3rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          color: var(--ink, #f0f1f5);
        }

        .ofc-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .ofc-kicker {
          font: 700 0.72rem/1.3 var(--mono, monospace);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--blue, #38bdf8);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ofc-kicker::before {
          content: "";
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--pink, #ec4899);
          box-shadow: 0 0 10px var(--pink, #ec4899);
        }

        .ofc-title {
          font: 700 clamp(1.6rem, 3vw, 2.2rem)/1.15 var(--display, Impact, sans-serif);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          margin: 0;
          color: #f8fafc;
        }

        .ofc-lede {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--muted, #bec2d4);
          max-width: 68ch;
          margin: 0;
        }

        /* 4 Key Takeaways Grid */
        .ofc-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .ofc-grid {
            grid-template-columns: 1fr;
          }
        }

        .ofc-card {
          background: rgba(14, 20, 36, 0.75);
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 1.25rem 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .ofc-card:hover {
          border-color: #334155;
          transform: translateY(-2px);
        }

        .ofc-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .ofc-card-tag {
          font: 700 0.68rem/1.2 var(--mono, monospace);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .tag-emerald {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
        }

        .tag-rose {
          background: rgba(244, 63, 94, 0.15);
          color: #fb7185;
          border: 1px solid rgba(244, 63, 94, 0.35);
        }

        .tag-cyan {
          background: rgba(56, 189, 248, 0.15);
          color: #7dd3fc;
          border: 1px solid rgba(56, 189, 248, 0.35);
        }

        .tag-amber {
          background: rgba(251, 191, 36, 0.15);
          color: #fde68a;
          border: 1px solid rgba(251, 191, 36, 0.35);
        }

        .ofc-card-num {
          font: 700 0.75rem/1 var(--mono, monospace);
          color: #64748b;
        }

        .ofc-card h3 {
          font: 700 1.05rem/1.3 var(--body, sans-serif);
          color: #f8fafc;
          margin: 0;
        }

        .ofc-card p {
          font-size: 0.875rem;
          line-height: 1.55;
          color: #94a3b8;
          margin: 0;
          flex: 1;
        }

        .ofc-card-stat {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          padding-top: 0.65rem;
          border-top: 1px solid rgba(30, 41, 59, 0.8);
          font: 600 0.75rem/1.3 var(--mono, monospace);
          color: #cbd5e1;
        }

        .ofc-card-stat b {
          color: var(--blue, #38bdf8);
        }

        /* Interactive Ladder Stepper */
        .ofc-ladder {
          background: #080b14;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .ofc-ladder-head {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem 1rem;
        }

        .ofc-ladder-title {
          font: 700 0.95rem/1.2 var(--mono, monospace);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ofc-ladder-rule {
          font: 500 0.78rem/1.3 var(--mono, monospace);
          color: #94a3b8;
        }

        .ofc-ladder-nav {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 0.4rem;
        }

        @media (max-width: 600px) {
          .ofc-ladder-nav {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .ofc-ladder-btn {
          background: #0e1424;
          border: 1px solid #1e293b;
          border-radius: 6px;
          padding: 0.6rem 0.5rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.18s ease;
        }

        .ofc-ladder-btn:hover {
          background: #141d33;
          border-color: #334155;
        }

        .ofc-ladder-btn[data-active="true"] {
          border-color: var(--lvl-color);
          background: rgba(14, 20, 36, 0.95);
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
        }

        .ofc-ladder-btn-lvl {
          font: 800 0.85rem/1 var(--mono, monospace);
          color: var(--lvl-color);
        }

        .ofc-ladder-btn-lbl {
          font: 600 0.68rem/1 var(--mono, monospace);
          color: #94a3b8;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .ofc-ladder-btn[data-active="true"] .ofc-ladder-btn-lbl {
          color: #f8fafc;
        }

        .ofc-ladder-detail {
          background: #0e1424;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 1.25rem 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .ofc-detail-top {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .ofc-detail-badge {
          font: 700 0.72rem/1 var(--mono, monospace);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--detail-color);
          background: rgba(255, 255, 255, 0.04);
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          border: 1px solid var(--detail-color);
        }

        .ofc-detail-name {
          font: 700 1.15rem/1.2 var(--body, sans-serif);
          color: #f8fafc;
          margin: 0;
        }

        .ofc-detail-summary {
          font-size: 0.925rem;
          line-height: 1.6;
          color: #cbd5e1;
          margin: 0;
        }

        .ofc-detail-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.85rem;
          padding-top: 0.85rem;
          border-top: 1px solid #1e293b;
        }

        @media (max-width: 640px) {
          .ofc-detail-grid {
            grid-template-columns: 1fr;
          }
        }

        .ofc-detail-col {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .ofc-detail-col dt {
          font: 700 0.68rem/1.2 var(--mono, monospace);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #64748b;
        }

        .ofc-detail-col dd {
          font-size: 0.8125rem;
          line-height: 1.5;
          color: #94a3b8;
          margin: 0;
        }

        /* Fast Jump Navigation Bar */
        .ofc-jump-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: rgba(8, 11, 20, 0.85);
          border: 1px solid #1e293b;
          border-radius: 8px;
        }

        .ofc-jump-text {
          font: 500 0.875rem/1.4 var(--body, sans-serif);
          color: #cbd5e1;
        }

        .ofc-jump-text strong {
          color: #f8fafc;
        }

        .ofc-jump-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .ofc-btn-jump {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 0.9rem;
          border-radius: 4px;
          font: 700 0.78rem/1 var(--mono, monospace);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.18s ease;
        }

        .ofc-btn-primary {
          background: var(--pink, #ec4899);
          color: #05060a;
          border: 1px solid var(--pink, #ec4899);
        }

        .ofc-btn-primary:hover {
          background: #f472b6;
          box-shadow: 0 0 14px rgba(236, 72, 153, 0.4);
        }

        .ofc-btn-secondary {
          background: rgba(56, 189, 248, 0.08);
          color: var(--blue, #38bdf8);
          border: 1px solid rgba(56, 189, 248, 0.35);
        }

        .ofc-btn-secondary:hover {
          background: rgba(56, 189, 248, 0.16);
          border-color: var(--blue, #38bdf8);
        }
      `}</style>

      <div className="ofc-header">
        <div className="ofc-kicker">Executive Brief · 60-Second Field Guide</div>
        <h2 className="ofc-title">The Four Economic Rules of Agent Coordination</h2>
        <p className="ofc-lede">
          Multi-agent swarms sound powerful, but naive orchestration burns money and triggers cold cache evictions. 
          Use these four principles before spinning up worker fleets.
        </p>
      </div>

      <div className="ofc-grid">
        {/* Card 1 */}
        <article className="ofc-card">
          <div className="ofc-card-top">
            <span className="ofc-card-tag tag-emerald">RULE #1 · DEFAULT TO 1 AGENT</span>
            <span className="ofc-card-num">01 / 04</span>
          </div>
          <h3>One Agent + Domain Skills Wins 90% of Tasks</h3>
          <p>
            Do not build a swarm if one focused agent loop with domain skills (<code>SKILL.md</code>) and local 
            test gates can complete the work. A single agent retains causal context, incurs zero coordination tax, 
            and stays 100% warm in cache.
          </p>
          <div className="ofc-card-stat">
            Impact: <b>$0.15 spend · 0% coordination tax · 1-shot verified</b>
          </div>
        </article>

        {/* Card 2 */}
        <article className="ofc-card">
          <div className="ofc-card-top">
            <span className="ofc-card-tag tag-rose">RULE #2 · ORCHESTRATOR TAX</span>
            <span className="ofc-card-num">02 / 04</span>
          </div>
          <h3>Re-Reading Context Burns Your Budget</h3>
          <p>
            The root coordinator pays to re-read its entire conversation history on every wakeup. If worker 
            runs outlast your provider&apos;s cache TTL (5m, 30m, 1h), you pay up to a 25× cold write surcharge. 
            Naive swarms often spend more on coordination than execution.
          </p>
          <div className="ofc-card-stat">
            Impact: <b>Up to 25× write penalty on 5m cold eviction (Opus 5.5)</b>
          </div>
        </article>

        {/* Card 3 */}
        <article className="ofc-card">
          <div className="ofc-card-top">
            <span className="ofc-card-tag tag-cyan">RULE #3 · POINTER MANIFESTS</span>
            <span className="ofc-card-num">03 / 04</span>
          </div>
          <h3>Pass Tiny File Receipts, Never Full Dumps</h3>
          <p>
            Never let subagents dump hundreds of lines of git diffs or raw terminal logs into the root conversation. 
            Have workers write artifacts to disk (<code>/tmp/results/lane.json</code>) and return only a compact 
            &lt;200-byte JSON receipt. Root context stays pinned at &lt;20,000 tokens.
          </p>
          <div className="ofc-card-stat">
            Impact: <b>18k tokens pinned vs 100k+ quadratic context bloat</b>
          </div>
        </article>

        {/* Card 4 */}
        <article className="ofc-card">
          <div className="ofc-card-top">
            <span className="ofc-card-tag tag-amber">RULE #4 · FAST VERIFIERS</span>
            <span className="ofc-card-num">04 / 04</span>
          </div>
          <h3>Deterministic Gates Beat Frontier Guessing</h3>
          <p>
            Small, fast models ($0.10/M Luna or Gemini Flash) paired with local test suites (<code>vitest</code>, <code>tsc</code>) 
            consistently outperform unverified $20/M flagship runs. Unverified code has negative value because a human 
            must untangle it. Verification makes cheap models viable.
          </p>
          <div className="ofc-card-stat">
            Impact: <b>Cheap models + test gates = lowest expected cost</b>
          </div>
        </article>
      </div>

      {/* Interactive Quick Decision Ladder */}
      <div className="ofc-ladder" style={{ "--lvl-color": current.color, "--detail-color": current.color } as React.CSSProperties}>
        <div className="ofc-ladder-head">
          <div className="ofc-ladder-title">
            <span>🪜 The Decision Ladder (Levels A → E)</span>
          </div>
          <div className="ofc-ladder-rule">
            Golden rule: Climb only when task decoupling or durability justifies the token overhead
          </div>
        </div>

        <div className="ofc-ladder-nav" role="tablist" aria-label="Coordination Ladder Levels">
          {LADDER_LEVELS.map((lvl, idx) => (
            <button
              key={lvl.level}
              type="button"
              role="tab"
              aria-selected={selectedLevel === idx}
              data-active={selectedLevel === idx ? "true" : "false"}
              className="ofc-ladder-btn"
              style={{ "--lvl-color": lvl.color } as React.CSSProperties}
              onClick={() => setSelectedLevel(idx)}
            >
              <span className="ofc-ladder-btn-lvl">{lvl.level}</span>
              <span className="ofc-ladder-btn-lbl">{lvl.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        <div className="ofc-ladder-detail">
          <div className="ofc-detail-top">
            <h3 className="ofc-detail-name">{current.level}: {current.name}</h3>
            <span className="ofc-detail-badge">{current.tag}</span>
          </div>
          <p className="ofc-detail-summary">{current.summary}</p>
          <dl className="ofc-detail-grid">
            <div className="ofc-detail-col">
              <dt>When to choose this level</dt>
              <dd>{current.criteria}</dd>
            </div>
            <div className="ofc-detail-col">
              <dt>Recommended runtime</dt>
              <dd>{current.tools}</dd>
            </div>
            <div className="ofc-detail-col">
              <dt>Concrete example</dt>
              <dd>{current.example}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Dual-Track Quick Jump Bar */}
      <div className="ofc-jump-bar">
        <div className="ofc-jump-text">
          <strong>Ready to evaluate your repository?</strong> Copy an automated prompt for Claude Code or Pi, or jump to the comprehensive technical specification.
        </div>
        <div className="ofc-jump-actions">
          <Link href="#copy-harness-prompts" className="ofc-btn-jump ofc-btn-primary">
            <span>📋</span> Copy Agent Prompt
          </Link>
          <Link href="#full-technical-spec" className="ofc-btn-jump ofc-btn-secondary">
            <span>📖</span> Full Technical Spec ↓
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OrchestrationFieldCards;
