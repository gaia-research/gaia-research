"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./field-manual.css";

const REPO = "https://github.com/gaia-research/agent-playbook";

/* ── The Method × Memory map ───────────────────────────────────────────────
   A concept map, not a benchmark. Two switches: does the agent follow the
   Orchestration Guide's method, and does it carry the Agent Playbook's memory?
   Each combination lands the agent in one quadrant. */

type MapState = "none" | "method" | "memory" | "both";

const STATES: Record<MapState, { title: string; body: string }> = {
  none: {
    title: "A swarm of strangers",
    body: "Many agents, none of them know your rules. Tokens go to chatter and to re-explaining what “done” means.",
  },
  method: {
    title: "Right-sized, still a stranger",
    body: "The guide picks the cheapest rung that works. Every new session still asks how you want it done.",
  },
  memory: {
    title: "Remembers you, over-delegates",
    body: "Your rules carry across sessions, but work one agent could finish still fans out to many.",
  },
  both: {
    title: "Right-sized, and it remembers you",
    body: "One warm agent by default, climbing the ladder only when lanes pay for themselves, under rules you wrote once.",
  },
};

function stateOf(method: boolean, memory: boolean): MapState {
  if (method && memory) return "both";
  if (method) return "method";
  if (memory) return "memory";
  return "none";
}

// Quadrant centres in the 400×400 viewBox (plot area 48..392 × 8..352).
const TOKEN_POS: Record<MapState, [number, number]> = {
  none: [196, 246],
  method: [292, 272],
  memory: [126, 104],
  both: [284, 112],
};

/* ── Ladder & doors (condensed from the guide and the playbook) ─────────── */

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
    badge: "Default",
    methodRule: "Coherent files or shared state. One warm loop + domain SKILL.md + local tests; zero delegation tax.",
    memoryTie: "Playbook rule: verify before claiming done and close every delivery with the four-line receipt.",
  },
  {
    level: "B",
    name: "Bounded subagents",
    badge: "2–4 lanes",
    methodRule: "Disjoint tasks in isolated worktrees returning <200-token disk pointer manifests to a warm root.",
    memoryTie: "Profile example: cap at 4 subagents; named specialists fail closed with no silent fallback.",
  },
  {
    level: "C",
    name: "Existing workflows",
    badge: "Durable",
    methodRule: "Multi-stage pipelines with retries or checkpoints. Reuse CI, Dynamic Workflows, LangGraph, or Temporal.",
    memoryTie: "Playbook rule: use deterministic code for queues and state; never pay a frontier LLM to poll.",
  },
  {
    level: "D",
    name: "Thin scheduler",
    badge: "Optional",
    methodRule: "Deterministic cost/verifier router over existing tools only when recurring multi-model volume earns it.",
    memoryTie: "Consent gate: never install custom routing or widen permissions without explicit owner approval.",
  },
  {
    level: "E",
    name: "Human at the wheel",
    badge: "Abstain",
    methodRule: "Irreversible deploys, schema migrations, billing changes, or missing verifiers. Agent prepares; human executes.",
    memoryTie: "Authority boundary: preview, push, merge, and production deploy are separate permissions.",
  },
] as const;

interface PlaybookDoor {
  id: "memory" | "skills" | "profile";
  glyph: string;
  label: string;
  badge: string;
  summary: string;
  href: string;
  linkLabel: string;
}

const PLAYBOOK_DOORS: readonly PlaybookDoor[] = [
  {
    id: "memory",
    glyph: "◇",
    label: "Read",
    badge: "No install",
    summary:
      "Point any chat assistant at the repo. It separates universal defaults from personal profile choices and saves nothing until you approve.",
    href: "/research/agent-playbook#memory",
    linkLabel: "Read as memory",
  },
  {
    id: "skills",
    glyph: "◆",
    label: "Install",
    badge: "Needs consent",
    summary:
      "No one-line installer. Your coding agent checks your harness docs, proposes a copy plan with collision checks, and waits for your yes.",
    href: "/research/agent-playbook#skills",
    linkLabel: "Install optional skills",
  },
  {
    id: "profile",
    glyph: "◈",
    label: "Profile",
    badge: "Swappable",
    summary:
      "Keep your model roles, concurrency ceiling, and effort preferences in a replaceable folder, separate from the reusable skills.",
    href: "/research/agent-playbook#profile",
    linkLabel: "Inspect profile & template",
  },
] as const;

function arrowNav(e: React.KeyboardEvent<HTMLButtonElement>, idx: number, count: number, set: (n: number) => void) {
  const next = e.key === "ArrowRight" || e.key === "ArrowDown";
  const prev = e.key === "ArrowLeft" || e.key === "ArrowUp";
  if (!next && !prev) return;
  e.preventDefault();
  const target = next ? (idx + 1) % count : (idx - 1 + count) % count;
  set(target);
  const list = e.currentTarget.parentElement;
  const btn = list?.querySelectorAll<HTMLButtonElement>("[role='tab']")[target];
  btn?.focus();
}

export default function FieldManual() {
  // Server render and no-JS show the resolved state; the client rewinds and
  // plays the crossing once when the map scrolls into view.
  const [method, setMethod] = useState(true);
  const [memory, setMemory] = useState(true);
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("done");
  const [rungIdx, setRungIdx] = useState(0);
  const [doorIdx, setDoorIdx] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const touched = useRef(false);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const play = useCallback(() => {
    clearTimers();
    setPhase("playing");
    setMethod(false);
    setMemory(false);
    timers.current.push(window.setTimeout(() => setMethod(true), 900));
    timers.current.push(window.setTimeout(() => setMemory(true), 2100));
    timers.current.push(window.setTimeout(() => setPhase("done"), 2700));
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const el = mapRef.current;
    if (reduce || !el || typeof IntersectionObserver === "undefined") return;
    setMethod(false);
    setMemory(false);
    setPhase("idle");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          io.disconnect();
          if (!touched.current) play();
        }
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimers();
    };
  }, [play]);

  const toggle = (which: "method" | "memory") => {
    touched.current = true;
    clearTimers();
    setPhase("done");
    if (which === "method") setMethod((v) => !v);
    else setMemory((v) => !v);
  };

  const state = stateOf(method, memory);
  const [tx, ty] = TOKEN_POS[state];
  const rung = LADDER_RUNGS[rungIdx];
  const door = PLAYBOOK_DOORS[doorIdx];

  return (
    <section id="field-manual" className="fm" aria-labelledby="fm-title" data-state={state}>
      <div className="fm-shell">
        <header className="fm-head">
          <p className="fm-kicker">Field manual</p>
          <h2 id="fm-title">
            Learn the method. <em>Keep</em> your rules.
          </h2>
        </header>

        <div className="fm-stage">
          {/* ── The map ── */}
          <figure className="fm-map" ref={mapRef} aria-labelledby="fm-map-cap">
            <svg viewBox="0 0 400 400" role="img" aria-labelledby="fm-map-svg-title" className="fm-map-svg">
              <title id="fm-map-svg-title">{`Concept map. Horizontal axis: method, from the Orchestration Guide. Vertical axis: memory, from the Agent Playbook. Current position: ${STATES[state].title}.`}</title>
              <defs>
                <marker id="fm-arrow-x" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0 8 4 0 8z" className="fm-ax-method-fill" />
                </marker>
                <marker id="fm-arrow-y" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0 8 4 0 8z" className="fm-ax-memory-fill" />
                </marker>
              </defs>

              {/* Quadrants */}
              <g className="fm-q" data-q="memory" data-on={state === "memory"}>
                <rect x="48" y="8" width="172" height="172" />
                <text x="60" y="30">Remembers you</text>
                <text x="60" y="46" className="fm-q-sub">over-delegates</text>
                {/* many agents, one shared document */}
                <rect x="170" y="56" width="22" height="28" className="fm-doc" />
                <path d="M175 65h12M175 71h12M175 77h8" className="fm-doc-lines" />
                {[[70, 150], [96, 162], [124, 156], [152, 164], [184, 150], [70, 122], [198, 120]].map(([cx, cy]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" className="fm-agent" />
                ))}
              </g>
              <g className="fm-q" data-q="both" data-on={state === "both"}>
                <rect x="220" y="8" width="172" height="172" />
                <text x="232" y="30">Right-sized</text>
                <text x="232" y="46" className="fm-q-sub">remembers you</text>
                <rect x="342" y="56" width="22" height="28" className="fm-doc" />
                <path d="M347 65h12M347 71h12M347 77h8" className="fm-doc-lines" />
                <path d="M338 148l6 6 12-14" className="fm-check" />
              </g>
              <g className="fm-q" data-q="none" data-on={state === "none"}>
                <rect x="48" y="180" width="172" height="172" />
                <text x="60" y="202">A swarm</text>
                <text x="60" y="218" className="fm-q-sub">of strangers</text>
                {/* chatter: every agent talks to every other */}
                <path
                  d="M84 300 120 268M84 300 156 288M84 300 176 316M120 268 156 288M120 268 176 316M156 288 176 316M120 268 112 330M112 330 84 300M112 330 156 288M112 330 176 316"
                  className="fm-chatter"
                />
                {[[84, 300], [120, 268], [156, 288], [176, 316], [112, 330]].map(([cx, cy]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" className="fm-agent" />
                ))}
              </g>
              <g className="fm-q" data-q="method" data-on={state === "method"}>
                <rect x="220" y="180" width="172" height="172" />
                <text x="232" y="202">Right-sized</text>
                <text x="232" y="218" className="fm-q-sub">still a stranger</text>
                <text x="350" y="330" className="fm-ask">?</text>
              </g>

              {/* Axes */}
              <line x1="48" y1="352" x2="392" y2="352" className="fm-ax-method" markerEnd="url(#fm-arrow-x)" />
              <line x1="48" y1="352" x2="48" y2="10" className="fm-ax-memory" markerEnd="url(#fm-arrow-y)" />
              <text x="392" y="380" textAnchor="end" className="fm-ax-label fm-ax-method-fill">
                Method → Orchestration Guide
              </text>
              <text x="-352" y="34" transform="rotate(-90)" className="fm-ax-label fm-ax-memory-fill">
                Memory → Agent Playbook
              </text>

              {/* The agent */}
              <g className="fm-token" style={{ transform: `translate(${tx}px, ${ty}px)` }}>
                <circle r="20" className="fm-token-halo" />
                <circle r="9" className="fm-token-core" />
              </g>
            </svg>
            <div className="fm-switches" role="group" aria-label="Add a resource to the agent">
              <button
                type="button"
                className="fm-switch"
                data-tone="method"
                aria-pressed={method}
                onClick={() => toggle("method")}
              >
                <span className="fm-switch-knob" aria-hidden="true" />
                <span className="fm-switch-text">
                  <b>Method</b>
                  <small>Orchestration Guide</small>
                </span>
              </button>
              <button
                type="button"
                className="fm-switch"
                data-tone="memory"
                aria-pressed={memory}
                onClick={() => toggle("memory")}
              >
                <span className="fm-switch-knob" aria-hidden="true" />
                <span className="fm-switch-text">
                  <b>Memory</b>
                  <small>Agent Playbook</small>
                </span>
              </button>
              {phase === "done" && (
                <button type="button" className="fm-replay" onClick={() => { touched.current = false; play(); }}>
                  ↺ <span>Replay</span>
                </button>
              )}
            </div>

            <figcaption id="fm-map-cap" className="fm-readout" aria-live="polite">
              <strong>{STATES[state].title}</strong>
              <span>{STATES[state].body}</span>
            </figcaption>
          </figure>

          {/* ── Controls + resources ── */}
          <div className="fm-side">
            {/* Resource 01: the guide */}
            <article className="fm-ticket" data-tone="method" aria-labelledby="fm-guide-title">
              <div className="fm-ticket-head">
                <h3 id="fm-guide-title">
                  <small>01 · Method</small>
                  The Orchestration Guide
                </h3>
                <p>Learn how agents should coordinate.</p>
              </div>

              <div className="fm-ladder" role="tablist" aria-label="The A to E coordination ladder">
                {LADDER_RUNGS.map((r, i) => (
                  <button
                    key={r.level}
                    type="button"
                    role="tab"
                    id={`fm-rung-${r.level}`}
                    aria-selected={i === rungIdx}
                    aria-controls="fm-rung-panel"
                    tabIndex={i === rungIdx ? 0 : -1}
                    className="fm-rung"
                    data-level={r.level}
                    onClick={() => setRungIdx(i)}
                    onKeyDown={(e) => arrowNav(e, i, LADDER_RUNGS.length, setRungIdx)}
                  >
                    <span className="fm-rung-bar" aria-hidden="true" />
                    <b>{r.level}</b>
                    <span className="sr-only">: {r.name}</span>
                  </button>
                ))}
              </div>
              <div id="fm-rung-panel" role="tabpanel" aria-labelledby={`fm-rung-${rung.level}`} className="fm-rung-panel">
                <p className="fm-rung-name">
                  Level {rung.level} · {rung.name} <span>{rung.badge}</span>
                </p>
                <p>{rung.methodRule}</p>
                <p className="fm-rung-tie">
                  <span aria-hidden="true">⇄ </span>
                  {rung.memoryTie}
                </p>
              </div>

              <Link className="fm-cta" href="/research/orchestration-guide">
                Read the guide <span aria-hidden="true">→</span>
              </Link>
            </article>

            {/* Resource 02: the playbook */}
            <article className="fm-ticket" data-tone="memory" aria-labelledby="fm-playbook-title">
              <div className="fm-ticket-head">
                <h3 id="fm-playbook-title">
                  <small>02 · Memory</small>
                  The Agent Playbook
                </h3>
                <p>Preserve how you want your agents to work.</p>
              </div>

              <div className="fm-doors" role="tablist" aria-label="Three ways to use the Agent Playbook">
                {PLAYBOOK_DOORS.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    role="tab"
                    id={`fm-door-${d.id}`}
                    aria-selected={i === doorIdx}
                    aria-controls="fm-door-panel"
                    tabIndex={i === doorIdx ? 0 : -1}
                    className="fm-door"
                    onClick={() => setDoorIdx(i)}
                    onKeyDown={(e) => arrowNav(e, i, PLAYBOOK_DOORS.length, setDoorIdx)}
                  >
                    <span aria-hidden="true">{d.glyph}</span> {d.label}
                    <small>{d.badge}</small>
                  </button>
                ))}
              </div>
              <div id="fm-door-panel" role="tabpanel" aria-labelledby={`fm-door-${door.id}`} className="fm-door-panel">
                <p>{door.summary}</p>
                <Link href={door.href} className="fm-door-link">
                  {door.linkLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="fm-ticket-actions">
                <Link className="fm-cta" href="/research/agent-playbook">
                  Explore the Playbook <span aria-hidden="true">→</span>
                </Link>
                <a className="fm-gh" href={REPO} target="_blank" rel="noreferrer">
                  GitHub <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </article>
          </div>
        </div>

        <p className="fm-note">Concept map, not a benchmark. The evidence and its limits live in each guide.</p>
      </div>
    </section>
  );
}
