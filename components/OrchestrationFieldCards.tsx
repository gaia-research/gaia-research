"use client";

import React from "react";
import Link from "next/link";

export function OrchestrationFieldCards() {
  return (
    <section className="orchestration-field-cards" aria-label="Executive field guide">
      <style>{`
        .orchestration-field-cards {
          margin: 0 0 2.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          color: var(--ink, #f0f1f5);
        }

        .ofc-header {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
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
          font: 700 clamp(1.5rem, 2.8vw, 2rem)/1.12 var(--display, Impact, sans-serif);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          margin: 0;
          color: #f8fafc;
        }

        .ofc-lede {
          font-size: 0.9688rem;
          line-height: 1.58;
          color: var(--muted, #bec2d4);
          max-width: 64ch;
          margin: 0;
        }

        .ofc-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem;
        }

        @media (max-width: 768px) {
          .ofc-grid {
            grid-template-columns: 1fr;
          }
        }

        .ofc-card {
          background: rgba(14, 20, 36, 0.78);
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 1.05rem 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          transition: border-color 0.2s ease;
        }

        .ofc-card:hover {
          border-color: #334155;
        }

        .ofc-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .ofc-card-tag {
          font: 700 0.66rem/1.2 var(--mono, monospace);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.18rem 0.45rem;
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
          font: 700 0.72rem/1 var(--mono, monospace);
          color: #64748b;
        }

        .ofc-card h3 {
          font: 700 1rem/1.28 var(--body, sans-serif);
          color: #f8fafc;
          margin: 0;
        }

        .ofc-card p {
          font-size: 0.85rem;
          line-height: 1.52;
          color: #94a3b8;
          margin: 0;
          flex: 1;
        }

        .ofc-card-stat {
          display: flex;
          align-items: baseline;
          gap: 0.45rem;
          padding-top: 0.55rem;
          border-top: 1px solid rgba(30, 41, 59, 0.8);
          font: 600 0.73rem/1.3 var(--mono, monospace);
          color: #cbd5e1;
        }

        .ofc-card-stat b {
          color: var(--blue, #38bdf8);
        }

        .ofc-jump-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.85rem;
          padding: 0.85rem 1.1rem;
          background: rgba(8, 11, 20, 0.88);
          border: 1px solid #1e293b;
          border-radius: 8px;
        }

        .ofc-jump-text {
          font: 500 0.85rem/1.45 var(--body, sans-serif);
          color: #cbd5e1;
        }

        .ofc-jump-text strong {
          color: #f8fafc;
        }

        .ofc-jump-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .ofc-btn-jump {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          border-radius: 4px;
          font: 700 0.75rem/1 var(--mono, monospace);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.18s ease, border-color 0.18s ease;
        }

        .ofc-btn-primary {
          background: var(--pink, #ec4899);
          color: #05060a;
          border: 1px solid var(--pink, #ec4899);
        }

        .ofc-btn-primary:hover {
          background: #f472b6;
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
        <h2 className="ofc-title">Four Economic Laws of Agent Coordination</h2>
        <p className="ofc-lede">
          Swarms sound impressive, but unguided fan-out burns budget on cold-cache wakeups and merge collisions. Check
          these four invariants before spawning a single subagent.
        </p>
      </div>

      <div className="ofc-grid">
        <article className="ofc-card">
          <div className="ofc-card-top">
            <span className="ofc-card-tag tag-emerald">RULE 01 · DEFAULT TO LEVEL A</span>
            <span className="ofc-card-num">01 / 04</span>
          </div>
          <h3>One Warm Agent Beats a Chatty Swarm</h3>
          <p>
            Stay in one loop with domain skills (<code>SKILL.md</code>) and local test gates unless subtasks are truly
            disjoint. One agent holds causal state in a single head and pays zero coordination tax.
          </p>
          <div className="ofc-card-stat">
            Posture: <b>~$0.15 spend · 0% chatter tax · 1-shot verified</b>
          </div>
        </article>

        <article className="ofc-card">
          <div className="ofc-card-top">
            <span className="ofc-card-tag tag-rose">RULE 02 · THE ORCHESTRATOR TAX</span>
            <span className="ofc-card-num">02 / 04</span>
          </div>
          <h3>Cold Cache Evictions Multiply Prefill Spend</h3>
          <p>
            A root coordinator re-reads its entire prefix on every turn. When worker runs outlast a 5-minute TTL, cold
            re-writes cost up to 25× a warm read—match root retention to worker duration.
          </p>
          <div className="ofc-card-stat">
            Penalty: <b>Up to 25× write/read gap on 5m eviction (Opus 5.5)</b>
          </div>
        </article>

        <article className="ofc-card">
          <div className="ofc-card-top">
            <span className="ofc-card-tag tag-cyan">RULE 03 · POINTER MANIFESTS</span>
            <span className="ofc-card-num">03 / 04</span>
          </div>
          <h3>Return 200-Token Receipts, Never Raw Dumps</h3>
          <p>
            Every token returned to the root is re-billed on every later turn. Have workers write logs and diffs to disk
            (<code>/tmp/results/*.json</code>) and return only a compact pointer receipt.
          </p>
          <div className="ofc-card-stat">
            Discipline: <b>Root pinned at ~18k tokens vs. 100k+ diff dumps</b>
          </div>
        </article>

        <article className="ofc-card">
          <div className="ofc-card-top">
            <span className="ofc-card-tag tag-amber">RULE 04 · BINARY VERIFIERS</span>
            <span className="ofc-card-num">04 / 04</span>
          </div>
          <h3>Deterministic Gates Unlock Economical Models</h3>
          <p>
            Unverified code carries negative value because a human must untangle it. Fast compiler and test gates
            (<code>vitest</code>, <code>tsc</code>) make compact workers viable and bound retry loops.
          </p>
          <div className="ofc-card-stat">
            Objective: <b>Minimize expected cost per verified outcome</b>
          </div>
        </article>
      </div>

      <div className="ofc-jump-bar">
        <div className="ofc-jump-text">
          <strong>Need your preferences remembered across sessions?</strong> The Guide teaches the method; the{" "}
          <Link href="/research/agent-playbook" style={{ color: "#34d399", textDecoration: "underline" }}>
            Agent Playbook
          </Link>{" "}
          preserves your personal rules.
        </div>
        <div className="ofc-jump-actions">
          <Link href="#the-coordination-decision-framework" className="ofc-btn-jump ofc-btn-primary">
            Interactive A–E Ladder ↓
          </Link>
          <Link href="/research/agent-playbook" className="ofc-btn-jump ofc-btn-secondary">
            Explore Agent Playbook →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OrchestrationFieldCards;
