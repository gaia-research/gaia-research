"use client";

import React, { useEffect, useId, useState } from "react";

export type WalkthroughModeId = "memory" | "skills" | "profile";

interface WalkthroughStage {
  step: string;
  nodeLabel: string;
  actor: string;
  headline: string;
  detail: string;
  guardrail: string;
  artifactLabel: string;
  artifactCode: string;
}

interface WalkthroughMode {
  id: WalkthroughModeId;
  glyph: string;
  tabTitle: string;
  badge: string;
  tone: "emerald" | "amber" | "cyan";
  colorHex: string;
  tagline: string;
  neverImplies: string;
  jumpHref: string;
  jumpLabel: string;
  stages: readonly [WalkthroughStage, WalkthroughStage, WalkthroughStage, WalkthroughStage];
}

const MODES: readonly WalkthroughMode[] = [
  {
    id: "memory",
    glyph: "◇",
    tabTitle: "Door A · Read as Memory",
    badge: "NO INSTALL · LAYER 1",
    tone: "emerald",
    colorHex: "#34d399",
    tagline: "Conversational context for ChatGPT, Claude, or any assistant—nothing is installed or executed.",
    neverImplies: "Reading never syncs automatically across accounts or authorizes commands, installs, or deploys.",
    jumpHref: "#memory",
    jumpLabel: "Jump to Path A prompt ↓",
    stages: [
      {
        step: "01",
        nodeLabel: "Read Policy",
        actor: "Assistant (Read-only)",
        headline: "Ingest MEMORY.md and PLAYBOOK.md",
        detail: "The assistant reads the self-contained summary and canonical policy from GitHub (or raw text you paste).",
        guardrail: "No local files touched; no tools or shell commands invoked.",
        artifactLabel: "SOURCE READ",
        artifactCode: "GET github.com/gaia-research/agent-playbook/{MEMORY.md,PLAYBOOK.md}",
      },
      {
        step: "02",
        nodeLabel: "Split Layers",
        actor: "Boundary Filter",
        headline: "Separate universal defaults from personal profile",
        detail: "Universal rules (verification before claims, authority separation) are kept distinct from profiles/marco.",
        guardrail: "Example profile is withheld unless you explicitly ask to adopt it.",
        artifactLabel: "LAYER SEPARATION",
        artifactCode: "Defaults: PLAYBOOK.md (adoptable) | Profile: profiles/marco (withheld)",
      },
      {
        step: "03",
        nodeLabel: "Propose Entries",
        actor: "Human Gate",
        headline: "Present dated memory candidates for your review",
        detail: "The assistant drafts concise memory entries tagged with source and date, leaving prices and secrets out.",
        guardrail: "Nothing is saved to platform memory until you approve each entry.",
        artifactLabel: "CANDIDATE ENTRY",
        artifactCode: "[2026-11] Authority: preview, push, merge & deploy require separate approval.",
      },
      {
        step: "04",
        nodeLabel: "Confirm State",
        actor: "Verified Context",
        headline: "Save approved entries or hold in session context",
        detail: "Where the platform supports memory, approved rules persist; otherwise they govern the active session.",
        guardrail: "Repo updates never auto-sync; re-run when you want a newer revision.",
        artifactLabel: "SESSION CONTRACT",
        artifactCode: "Saved: 4 entries approved · Execution/install authority: NONE",
      },
    ],
  },
  {
    id: "skills",
    glyph: "◆",
    tabTitle: "Door B · Install Skills",
    badge: "CONSENT GATED · LAYER 2",
    tone: "amber",
    colorHex: "#fbbf24",
    tagline: "Two portable SKILL.md folders (orchestrate, prompting) copied into your coding harness only after your yes.",
    neverImplies: "No one-line installer, no hooks or background daemons, and no widened merge or deploy authority.",
    jumpHref: "#skills",
    jumpLabel: "Jump to Path B prompt ↓",
    stages: [
      {
        step: "01",
        nodeLabel: "Inspect Harness",
        actor: "Coding Agent (Read-only)",
        headline: "Identify harness version and documented skill path",
        detail: "Your agent checks its own docs (Claude Code, Codex, Pi) and inspects existing project or user skill folders.",
        guardrail: "No directories created or modified during inspection.",
        artifactLabel: "HARNESS PREFLIGHT",
        artifactCode: "Harness: detected · Target: .agents/skills/{orchestrate,prompting}/SKILL.md",
      },
      {
        step: "02",
        nodeLabel: "Show Copy Plan",
        actor: "Collision Check",
        headline: "List exact source files, destination scope, and collisions",
        detail: "The agent shows which skill folders it plans to copy and flags any existing files at the target path.",
        guardrail: "No hooks, extensions, npm packages, or config edits allowed.",
        artifactLabel: "PROPOSED PLAN",
        artifactCode: "Copy: skills/orchestrate/SKILL.md -> .agents/skills/orchestrate/SKILL.md (0 collisions)",
      },
      {
        step: "03",
        nodeLabel: "Explicit Consent",
        actor: "Hard Owner Gate",
        headline: "Pause and wait for your explicit approval",
        detail: "The agent stops completely until you confirm the scope (project vs. user) and selected skills.",
        guardrail: "Silence or ambiguity is treated as NO; zero files written before consent.",
        artifactLabel: "CONSENT GATE",
        artifactCode: "STATUS: AWAITING_OWNER_YES · Scope: project (.agents/skills/)",
      },
      {
        step: "04",
        nodeLabel: "Copy & Verify",
        actor: "Intact Copy",
        headline: "Copy intact SKILL.md files and verify discovery",
        detail: "Selected skill directories are copied unchanged; if discovery fails, the agent rolls back only its own files.",
        guardrail: "Installing a skill grants a procedure, never merge or deploy authority.",
        artifactLabel: "VERIFIED RECEIPT",
        artifactCode: "Installed: orchestrate, prompting · Config mutated: false · Verified: true",
      },
    ],
  },
  {
    id: "profile",
    glyph: "◈",
    tabTitle: "Layer 3 · Personal Profile",
    badge: "SWAPPABLE · LAYER 3",
    tone: "cyan",
    colorHex: "#38bdf8",
    tagline: "Keep your model roles, concurrency ceiling, and escalation rules in a replaceable folder apart from the skills.",
    neverImplies: "Never certifies live account availability, universal model rankings, or embedded credentials.",
    jumpHref: "#profile",
    jumpLabel: "Jump to Profile & Template ↓",
    stages: [
      {
        step: "01",
        nodeLabel: "Fork Template",
        actor: "Operator Setup",
        headline: "Start from profiles/template/PROFILE.md",
        detail: "Fork the repository or copy the blank profile template so your personal rules live under version control.",
        guardrail: "Core skills (orchestrate, prompting) remain untouched when profiles change.",
        artifactLabel: "TEMPLATE INIT",
        artifactCode: "cp -r profiles/template profiles/<your-name>",
      },
      {
        step: "02",
        nodeLabel: "Record Deltas",
        actor: "Personal Conviction",
        headline: "Write only where your choices add to the playbook",
        detail: "Specify your subagent cap (e.g. max 4), planner effort (MAX/HIGH), reviewer separation, and fail-closed rules.",
        guardrail: "Do not duplicate universal policy; record only your personal overrides.",
        artifactLabel: "ROSTER DELTAS",
        artifactCode: "max_subagents: 4 | planner_effort: [max, high] | fallback: fail_closed",
      },
      {
        step: "03",
        nodeLabel: "Sanitize Scope",
        actor: "Hygiene Gate",
        headline: "Keep secrets, tokens, and live prices out",
        detail: "Model IDs in a profile are dated observations (runtime_verified: false), never live account guarantees.",
        guardrail: "Never commit API keys, private URLs, or transient quota balances.",
        artifactLabel: "SAFETY CHECK",
        artifactCode: "runtime_verified: false · credentials: never_implicit · secrets: 0",
      },
      {
        step: "04",
        nodeLabel: "Use Anywhere",
        actor: "Portable Identity",
        headline: "Point either door at your profile when you want it",
        detail: "Opt into your profile during Door A chat ingestion or reference it alongside Door B coding skills.",
        guardrail: "Current instruction > project rules > adopted profile > playbook defaults.",
        artifactLabel: "AUTHORITY ORDER",
        artifactCode: "1. User prompt  2. Repo CLAUDE.md  3. Adopted Profile  4. Playbook default",
      },
    ],
  },
] as const;

export default function PlaybookWalkthrough() {
  const uid = useId();
  const [modeIdx, setModeIdx] = useState<number>(0);
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (matches: boolean) => {
      setReducedMotion(matches);
      if (matches) setIsPlaying(false);
    };
    sync(mq.matches);
    const handler = (e: MediaQueryListEvent) => sync(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isPlaying || reducedMotion) return;
    const timer = window.setInterval(() => {
      setStageIdx((prev) => (prev + 1) % 4);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [isPlaying, reducedMotion]);

  const mode = MODES[modeIdx];
  const stage = mode.stages[stageIdx];
  const animate = isPlaying && !reducedMotion;

  const selectMode = (idx: number) => {
    setModeIdx(idx);
    setStageIdx(0);
  };

  const onModeKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      selectMode((idx + 1) % MODES.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      selectMode((idx - 1 + MODES.length) % MODES.length);
    }
  };

  const onStageKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setStageIdx((idx + 1) % 4);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setStageIdx((idx + 3) % 4);
    }
  };

  // Node center X coordinates in the 680x110 SVG
  const nodeXs = [95, 265, 435, 605];

  return (
    <div
      className="apb-walk"
      data-tone={mode.tone}
      data-motion={animate ? "running" : "paused"}
      role="region"
      aria-labelledby={`${uid}-walk-title`}
    >
      <div className="apb-walk-head">
        <div>
          <p className="apb-walk-kicker">Interactive Walkthrough · Doors &amp; Layers</p>
          <h3 id={`${uid}-walk-title`}>Trace what happens before a single rule is adopted.</h3>
        </div>
        <div className="apb-walk-controls">
          <button
            type="button"
            className="apb-walk-play"
            onClick={() => setIsPlaying((p) => !p)}
            aria-pressed={!isPlaying}
            aria-label={isPlaying ? "Pause step walkthrough" : "Auto-step walkthrough"}
          >
            <span className="apb-walk-dot" aria-hidden="true" />
            {isPlaying ? "Auto-stepping · Pause" : "Paused · Resume"}
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="apb-walk-tabs" role="tablist" aria-label="Adoption path comparison">
        {MODES.map((m, idx) => {
          const active = idx === modeIdx;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-active={active ? "true" : "false"}
              data-tone={m.tone}
              className="apb-walk-tab"
              onClick={() => selectMode(idx)}
              onKeyDown={(e) => onModeKey(e, idx)}
            >
              <span className="apb-walk-tab-top">
                <i aria-hidden="true">{m.glyph}</i> {m.tabTitle}
              </span>
              <small>{m.badge}</small>
            </button>
          );
        })}
      </div>

      {/* Animated SVG Pipeline + Interactive Stage Nodes */}
      <div className="apb-walk-stage">
        <p className="apb-walk-tagline">{mode.tagline}</p>

        <div className="apb-walk-svg-wrap">
          <svg
            viewBox="0 0 700 108"
            className="apb-walk-svg"
            role="img"
            aria-label={`${mode.tabTitle} four-stage pipeline diagram`}
          >
            <defs>
              <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={mode.colorHex} stopOpacity="0.25" />
                <stop offset="50%" stopColor={mode.colorHex} stopOpacity="0.95" />
                <stop offset="100%" stopColor={mode.colorHex} stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* Connecting rail lines */}
            {[0, 1, 2].map((segIdx) => {
              const x1 = nodeXs[segIdx] + 60;
              const x2 = nodeXs[segIdx + 1] - 60;
              const passed = stageIdx > segIdx;
              const current = stageIdx === segIdx;
              return (
                <g key={segIdx}>
                  <line
                    x1={x1}
                    y1={48}
                    x2={x2}
                    y2={48}
                    stroke={passed ? mode.colorHex : "rgba(148,163,184,0.28)"}
                    strokeWidth="2"
                    strokeDasharray={passed ? undefined : "4 4"}
                  />
                  {animate && current && (
                    <circle r="4" fill={mode.colorHex} cy="48">
                      <animate attributeName="cx" values={`${x1};${x2}`} dur="1.6s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* 4 Interactive SVG Nodes */}
            {mode.stages.map((st, idx) => {
              const cx = nodeXs[idx];
              const isCurrent = idx === stageIdx;
              const isDone = idx < stageIdx;
              return (
                <g
                  key={st.step}
                  className="apb-walk-svg-node"
                  data-current={isCurrent ? "true" : "false"}
                  onClick={() => setStageIdx(idx)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={cx - 58}
                    y={18}
                    width={116}
                    height={60}
                    rx={3}
                    fill={isCurrent ? "rgba(15, 23, 34, 0.96)" : "rgba(8, 11, 18, 0.88)"}
                    stroke={isCurrent ? mode.colorHex : isDone ? "rgba(148,163,184,0.5)" : "rgba(148,163,184,0.22)"}
                    strokeWidth={isCurrent ? "2" : "1"}
                  />
                  <text
                    x={cx}
                    y={38}
                    textAnchor="middle"
                    fill={isCurrent ? mode.colorHex : "#94a3b8"}
                    fontSize="10"
                    fontFamily="var(--mono)"
                    fontWeight="700"
                  >
                    STEP {st.step}
                  </text>
                  <text
                    x={cx}
                    y={56}
                    textAnchor="middle"
                    fill={isCurrent ? "#f8fafc" : "#cbd5e1"}
                    fontSize="11.5"
                    fontFamily="var(--body)"
                    fontWeight={isCurrent ? "700" : "500"}
                  >
                    {st.nodeLabel}
                  </text>
                  <text
                    x={cx}
                    y={94}
                    textAnchor="middle"
                    fill={isCurrent ? mode.colorHex : "#64748b"}
                    fontSize="9.5"
                    fontFamily="var(--mono)"
                  >
                    {st.actor}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Accessible Step Buttons (also serves mobile & keyboard users) */}
        <div className="apb-walk-steps" role="tablist" aria-label="Pipeline stage selector">
          {mode.stages.map((st, idx) => {
            const active = idx === stageIdx;
            return (
              <button
                key={st.step}
                type="button"
                role="tab"
                aria-selected={active}
                data-active={active ? "true" : "false"}
                className="apb-walk-step-btn"
                onClick={() => setStageIdx(idx)}
                onKeyDown={(e) => onStageKey(e, idx)}
              >
                <b>{st.step}</b>
                <span>{st.nodeLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detail Card */}
        <div className="apb-walk-inspector" role="region" aria-live="polite" aria-label={`Step ${stage.step} details`}>
          <div className="apb-walk-inspector-copy">
            <div className="apb-walk-inspector-meta">
              <span className="apb-walk-step-pill">Step {stage.step} / 04</span>
              <span className="apb-walk-actor">{stage.actor}</span>
            </div>
            <h4>{stage.headline}</h4>
            <p>{stage.detail}</p>
            <p className="apb-walk-guard">
              <b>Boundary:</b> {stage.guardrail}
            </p>
          </div>
          <div className="apb-walk-artifact">
            <span className="apb-walk-artifact-label">{stage.artifactLabel}</span>
            <pre><code>{stage.artifactCode}</code></pre>
            <a className="apb-walk-jump" href={mode.jumpHref}>
              {mode.jumpLabel}
            </a>
          </div>
        </div>

        <p className="apb-walk-never">
          <b>Never implied:</b> {mode.neverImplies}
        </p>
      </div>
    </div>
  );
}
