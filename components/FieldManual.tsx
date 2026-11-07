"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "./field-manual.css";

const REPO = "https://github.com/gaia-research/agent-playbook";
const BLOB = `${REPO}/blob/main`;
const TREE = `${REPO}/tree/main`;

interface LadderRung {
  level: string;
  name: string;
  badge: string;
  methodRule: string;
  memoryTie: string;
}

const LADDER_RUNGS: readonly LadderRung[] = [
  {
    level: "A",
    name: "One agent",
    badge: "DEFAULT",
    methodRule: "Coherent files or shared state. One warm loop + domain SKILL.md + local tests; zero delegation tax.",
    memoryTie: "Playbook rule: verify before claiming done and close every delivery with the four-line receipt.",
  },
  {
    level: "B",
    name: "Bounded subagents",
    badge: "2–4 LANES",
    methodRule: "Disjoint tasks in isolated worktrees returning <200-token disk pointer manifests to a warm root.",
    memoryTie: "Profile example: cap at 4 subagents; named specialists fail closed with no silent fallback.",
  },
  {
    level: "C",
    name: "Existing workflows",
    badge: "DURABLE",
    methodRule: "Multi-stage pipelines with retries or checkpoints. Reuse CI, Dynamic Workflows, LangGraph, or Temporal.",
    memoryTie: "Playbook rule: use deterministic code for queues and state—never pay a frontier LLM to poll.",
  },
  {
    level: "D",
    name: "Thin scheduler",
    badge: "OPTIONAL",
    methodRule: "Deterministic cost/verifier router over existing tools only when recurring multi-model volume earns it.",
    memoryTie: "Consent gate: never install custom routing or widen permissions without explicit owner approval.",
  },
  {
    level: "E",
    name: "Human at the wheel",
    badge: "ABSTAIN",
    methodRule: "Irreversible deploys, schema migrations, billing changes, or missing verifiers. Agent prepares; human executes.",
    memoryTie: "Authority boundary: preview, push, merge, and production deploy are separate permissions.",
  },
] as const;

interface PlaybookDoor {
  id: "memory" | "skills" | "profile";
  glyph: string;
  tabLabel: string;
  badge: string;
  tone: "emerald" | "amber" | "cyan";
  summary: string;
  steps: readonly [string, string, string];
  files: readonly { name: string; desc: string; href: string }[];
  anchorHref: string;
  anchorLabel: string;
}

const PLAYBOOK_DOORS: readonly PlaybookDoor[] = [
  {
    id: "memory",
    glyph: "◇",
    tabLabel: "Read as memory",
    badge: "NO INSTALL",
    tone: "emerald",
    summary: "Point any chat assistant at the repo. It separates universal defaults from personal profile choices and saves nothing until you approve.",
    steps: [
      "Read MEMORY.md & PLAYBOOK.md",
      "Propose entries (profile withheld)",
      "Save only what you approve",
    ],
    files: [
      { name: "MEMORY.md", desc: "conversational entry point", href: `${BLOB}/MEMORY.md` },
      { name: "PLAYBOOK.md", desc: "canonical operating policy", href: `${BLOB}/PLAYBOOK.md` },
    ],
    anchorHref: "/research/agent-playbook#memory",
    anchorLabel: "Path A: Read as memory →",
  },
  {
    id: "skills",
    glyph: "◆",
    tabLabel: "Install skills",
    badge: "NEEDS CONSENT",
    tone: "amber",
    summary: "No one-line installer. Your coding agent checks your harness docs, proposes a copy plan with collision checks, and waits for your yes.",
    steps: [
      "Inspect harness & skill paths",
      "Show copy plan & collisions",
      "Copy on explicit yes & verify",
    ],
    files: [
      { name: "skills/orchestrate/", desc: "bounded routing & handoff", href: `${BLOB}/skills/orchestrate/SKILL.md` },
      { name: "skills/prompting/", desc: "compact, falsifiable briefs", href: `${BLOB}/skills/prompting/SKILL.md` },
    ],
    anchorHref: "/research/agent-playbook#skills",
    anchorLabel: "Path B: Install optional skills →",
  },
  {
    id: "profile",
    glyph: "◈",
    tabLabel: "Personal profile",
    badge: "SWAPPABLE",
    tone: "cyan",
    summary: "Keep your model roles, concurrency ceiling, and effort preferences in a replaceable folder—separate from the reusable skills.",
    steps: [
      "Fork profiles/template/",
      "Record only your deltas",
      "Keep secrets & live prices out",
    ],
    files: [
      { name: "profiles/marco/", desc: "real dated operator example", href: `${TREE}/profiles/marco` },
      { name: "profiles/template/", desc: "blank profile to make yours", href: `${BLOB}/profiles/template/PROFILE.md` },
    ],
    anchorHref: "/research/agent-playbook#profile",
    anchorLabel: "Inspect profile & template →",
  },
] as const;

export default function FieldManual() {
  const [activeRungIdx, setActiveRungIdx] = useState<number>(0);
  const [activeDoorIdx, setActiveDoorIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (matches: boolean) => {
      setReducedMotion(matches);
      if (matches) setIsPaused(true);
    };
    update(mq.matches);
    const handler = (e: MediaQueryListEvent) => update(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const currentRung = LADDER_RUNGS[activeRungIdx];
  const currentDoor = PLAYBOOK_DOORS[activeDoorIdx];
  const motionActive = !isPaused && !reducedMotion;

  const onRungKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActiveRungIdx((idx + 1) % LADDER_RUNGS.length);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveRungIdx((idx - 1 + LADDER_RUNGS.length) % LADDER_RUNGS.length);
    }
  };

  const onDoorKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActiveDoorIdx((idx + 1) % PLAYBOOK_DOORS.length);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActiveDoorIdx((idx - 1 + PLAYBOOK_DOORS.length) % PLAYBOOK_DOORS.length);
    }
  };

  return (
    <section
      id="field-manual"
      className="fm"
      aria-labelledby="fm-title"
      data-motion={motionActive ? "running" : "paused"}
    >
      <div className="fm-shell">
        <header className="fm-head">
          <div className="fm-head-top">
            <p className="fm-kicker">
              <span aria-hidden="true" /> Field manual · Method &amp; memory
            </p>
            <button
              type="button"
              className="fm-motion-btn"
              onClick={() => setIsPaused((p) => !p)}
              aria-pressed={isPaused}
              aria-label={isPaused ? "Resume signal animation" : "Pause signal animation"}
            >
              <span className="fm-motion-dot" aria-hidden="true" />
              {isPaused ? "Signal paused" : "Live signal"}
            </button>
          </div>
          <h2 id="fm-title">
            Learn the method. <em>Keep</em> your rules.
          </h2>
          <p className="fm-lede">
            One volume measures when multiple agents earn their keep; the other ensures a new session never begins as a{" "}
            <i>stranger</i>.
          </p>
        </header>

        <div className="fm-spread">
          {/* LEFT PAGE: 01 METHOD (ORCHESTRATION GUIDE) */}
          <article className="fm-page fm-guide" aria-labelledby="fm-guide-title">
            <p className="fm-folio">
              <b>01</b> Method <span>Research guide</span>
            </p>
            <div className="fm-title-block">
              <h3 id="fm-guide-title">The Orchestration Guide</h3>
              <p className="fm-question">
                &ldquo;What is the least expensive coordination architecture that reliably completes the work?&rdquo;
              </p>
            </div>
            <p className="fm-body">
              Most swarms spend more tokens talking than building. Start with one warm agent; climb the A–E ladder only
              when independent lanes pay for their own coordination tax.
            </p>

            <div className="fm-interactive-block">
              <div className="fm-interactive-bar">
                <span>Interactive A–E Ladder</span>
                <small>Select a rung to inspect</small>
              </div>
              <div className="fm-ladder" role="tablist" aria-label="The guide's A to E coordination ladder">
                {LADDER_RUNGS.map((rung, idx) => {
                  const selected = idx === activeRungIdx;
                  return (
                    <button
                      key={rung.level}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      data-active={selected ? "true" : "false"}
                      className="fm-ladder-btn"
                      onClick={() => setActiveRungIdx(idx)}
                      onKeyDown={(e) => onRungKey(e, idx)}
                    >
                      <b>{rung.level}</b>
                      <span>{rung.name}</span>
                      <small>{rung.badge}</small>
                    </button>
                  );
                })}
              </div>

              <div className="fm-readout" role="region" aria-live="polite" aria-label={`Level ${currentRung.level} details`}>
                <div className="fm-readout-row">
                  <span className="fm-readout-tag">Level {currentRung.level} · When it wins</span>
                  <p>{currentRung.methodRule}</p>
                </div>
                <div className="fm-readout-row fm-readout-tie">
                  <span className="fm-readout-tag">⇄ Playbook link</span>
                  <p>{currentRung.memoryTie}</p>
                </div>
              </div>
            </div>

            <div className="fm-actions">
              <Link className="fm-cta" href="/research/orchestration-guide">
                Read the guide <span aria-hidden="true">→</span>
              </Link>
              <span className="fm-mode">
                <i aria-hidden="true">◇</i> Browser guide · zero install
              </span>
            </div>
          </article>

          {/* RIGHT PAGE: 02 MEMORY (AGENT PLAYBOOK) */}
          <article className="fm-page fm-playbook" aria-labelledby="fm-playbook-title" data-tone={currentDoor.tone}>
            <p className="fm-folio">
              <b>02</b> Memory <span>Public repo · MIT</span>
            </p>
            <div className="fm-title-block">
              <h3 id="fm-playbook-title">The Agent Playbook</h3>
              <p className="fm-question">
                &ldquo;Your agent shouldn&rsquo;t have to rediscover how you want it to work.&rdquo;
              </p>
            </div>
            <p className="fm-body">
              Plain Markdown and YAML that carry your authority boundaries, model roles, and finish-line standards across
              chats and coding harnesses.
            </p>

            <div className="fm-interactive-block">
              <div className="fm-door-tabs" role="tablist" aria-label="Agent Playbook adoption layers">
                {PLAYBOOK_DOORS.map((door, idx) => {
                  const selected = idx === activeDoorIdx;
                  return (
                    <button
                      key={door.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      data-active={selected ? "true" : "false"}
                      data-tone={door.tone}
                      className="fm-door-tab"
                      onClick={() => setActiveDoorIdx(idx)}
                      onKeyDown={(e) => onDoorKey(e, idx)}
                    >
                      <span className="fm-door-tab-title">
                        <i aria-hidden="true">{door.glyph}</i> {door.tabLabel}
                      </span>
                      <small>{door.badge}</small>
                    </button>
                  );
                })}
              </div>

              <div className="fm-door-panel" role="region" aria-live="polite" aria-label={currentDoor.tabLabel}>
                <p className="fm-door-summary">{currentDoor.summary}</p>
                <ol className="fm-flow-steps" aria-label={`${currentDoor.tabLabel} sequence`}>
                  {currentDoor.steps.map((step, i) => (
                    <li key={step}>
                      <b>0{i + 1}</b>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="fm-door-files">
                  {currentDoor.files.map((f) => (
                    <a key={f.name} href={f.href} target="_blank" rel="noreferrer" className="fm-file-chip">
                      <code>{f.name}</code>
                      <span>{f.desc} ↗</span>
                    </a>
                  ))}
                </div>
              </div>

              <ul className="fm-paths" aria-label="Two separate ways to adopt it">
                <li>
                  <Link className="fm-path fm-path-read" href="/research/agent-playbook#memory">
                    <span className="fm-path-tag">◇ Read as memory</span>
                    <span className="fm-path-note">No install</span>
                  </Link>
                </li>
                <li>
                  <Link className="fm-path fm-path-install" href="/research/agent-playbook#skills">
                    <span className="fm-path-tag">◆ Install optional skills</span>
                    <span className="fm-path-note">Needs consent</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="fm-actions">
              <Link className="fm-cta" href="/research/agent-playbook">
                Explore the Playbook <span aria-hidden="true">→</span>
              </Link>
              <a className="fm-link" href={REPO} target="_blank" rel="noreferrer">
                GitHub <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </article>
        </div>

        {/* Animated Spine Signal Seam */}
        <div className="fm-seam" aria-label="How the two resources connect">
          <span className="fm-seam-left">
            <b>01 Method</b> The guide teaches the decision (Level {currentRung.level}).
          </span>
          <svg className="fm-seam-svg" viewBox="0 0 180 24" aria-hidden="true">
            <line x1="6" y1="12" x2="174" y2="12" stroke="rgba(52,211,153,0.35)" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="8" cy="12" r="3.5" fill="#34d399" />
            <circle cx="172" cy="12" r="3.5" fill="#fbbf24" />
            <circle className="fm-seam-pulse" cx="90" cy="12" r="4" fill="#34d399" />
          </svg>
          <span className="fm-seam-right">
            <b>02 Memory</b> The playbook remembers yours ({currentDoor.tabLabel.toLowerCase()}).
          </span>
        </div>
      </div>
    </section>
  );
}
