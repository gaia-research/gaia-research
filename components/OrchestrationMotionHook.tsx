"use client";

import React, { useEffect, useId, useState } from "react";

export type OrchestrationScenarioId = "naive-swarm" | "level-a" | "level-b";

interface ScenarioStageBeat {
  step: string;
  label: string;
  detail: string;
  costDisplay: string;
  tokensDisplay: string;
  cacheBadge: string;
}

interface ScenarioConfig {
  id: OrchestrationScenarioId;
  tabLabel: string;
  shortTag: string;
  title: string;
  headline: string;
  summary: string;
  tone: "danger" | "emerald" | "cyan";
  accentHex: string;
  secondaryHex: string;
  svgBadges: {
    cache: string;
    tokens: string;
    cost: string;
    passRate: string;
  };
  metrics: {
    contextPrefix: {
      value: string;
      sub: string;
      compareLabel: string;
      fillPct: number;
    };
    cacheState: {
      value: string;
      sub: string;
      compareLabel: string;
      fillPct: number;
    };
    coordinationOverhead: {
      value: string;
      sub: string;
      compareLabel: string;
      fillPct: number;
    };
    estimatedSpend: {
      value: string;
      sub: string;
      compareLabel: string;
      fillPct: number;
    };
  };
  wirePayload: {
    label: string;
    code: string;
    verdict: string;
  };
  beats: [ScenarioStageBeat, ScenarioStageBeat, ScenarioStageBeat];
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: "naive-swarm",
    tabLabel: "Naive Swarm (Trap)",
    shortTag: "ANTI-PATTERN · THE TICKET TRAP",
    title: "The Naive Swarm (The Ticket Trap)",
    headline: "Quadratic context explosion · Evicted cache · Merge conflicts",
    summary:
      "A root coordinator spawns 4 chatty role-play workers over shared files. Every worker dumps +45k tokens of diffs and logs back into the root conversation after the 5-minute cache TTL expires.",
    tone: "danger",
    accentHex: "#f43f5e",
    secondaryHex: "#fbbf24",
    svgBadges: {
      cache: "CACHE: COLD (25× WRITE)",
      tokens: "TOKENS: 100k+ BLOAT",
      cost: "COST: ~$2.40+",
      passRate: "PASS RATE: LOW (CONFLICTS)",
    },
    metrics: {
      contextPrefix: {
        value: "100k+ tok",
        sub: "+45k diff dumps per wakeup",
        compareLabel: "18k vs 100k (5.5× bloat)",
        fillPct: 96,
      },
      cacheState: {
        value: "Cold 2.50×",
        sub: "25× write surcharge on wake",
        compareLabel: "Warm 0.10× vs Cold 2.50×",
        fillPct: 95,
      },
      coordinationOverhead: {
        value: "85% tax",
        sub: "n(n−1)/2 cross-talk channels",
        compareLabel: "0% vs 85% chatter tax",
        fillPct: 85,
      },
      estimatedSpend: {
        value: "~$2.40+",
        sub: "Low pass rate · repeated retries",
        compareLabel: "$0.10 vs $2.40 (24×)",
        fillPct: 96,
      },
    },
    wirePayload: {
      label: "RETURNED TO ROOT CONTEXT (+45,200 TOKENS)",
      code: `[worker-1..4 diff dump]: 1,420 lines of raw git diff + conversational debate + colliding edits on shared schema.ts`,
      verdict: "COLD CACHE EVICTION (25× WRITE SURCHARGE)",
    },
    beats: [
      {
        step: "01",
        label: "Role-play fan-out",
        detail: "Root splits a coupled task across 4 chatty workers with duplicated 100k context prefixes.",
        costDisplay: "$0.85",
        tokensDisplay: "64k tok",
        cacheBadge: "TTL SLIDING · 4m 50s",
      },
      {
        step: "02",
        label: "+45k token diff dumps",
        detail: "Workers return after 5m expiry, dumping raw stdout and full file diffs into root memory.",
        costDisplay: "$1.75",
        tokensDisplay: "100k+ tok",
        cacheBadge: "COLD EVICTION · 25× SURCHARGE",
      },
      {
        step: "03",
        label: "Merge & retry spiral",
        detail: "Overlapping edits collide in one worktree; root re-prefills 100k+ tokens repeatedly to untangle.",
        costDisplay: "$2.40+",
        tokensDisplay: "145k tok",
        cacheBadge: "REPEATED COLD RE-WRITE",
      },
    ],
  },
  {
    id: "level-a",
    tabLabel: "Level A: Single Agent (Default)",
    shortTag: "LEVEL A · DEFAULT ARCHITECTURE",
    title: "Level A: Single Agent (The Default)",
    headline: "Clean context · Zero coordination tax · 1-shot verified",
    summary:
      "One calm, focused agent node centered with a docked SKILL.md cartridge and a direct feedback loop to a local deterministic verifier (vitest). Zero coordination overhead and steady 0.10× warm cache reads.",
    tone: "emerald",
    accentHex: "#10b981",
    secondaryHex: "#38bdf8",
    svgBadges: {
      cache: "CACHE: WARM (0.10× READ)",
      tokens: "TOKENS: 22k CLEAN",
      cost: "COST: ~$0.15",
      passRate: "PASS RATE: 100% (1-SHOT)",
    },
    metrics: {
      contextPrefix: {
        value: "22k tok",
        sub: "Single coherent prefix",
        compareLabel: "18k–22k vs 100k swarm",
        fillPct: 22,
      },
      cacheState: {
        value: "Warm 0.10×",
        sub: "Continuous local turn cadence",
        compareLabel: "Warm 0.10× vs Cold 2.50×",
        fillPct: 12,
      },
      coordinationOverhead: {
        value: "0% tax",
        sub: "Zero delegation ceremony",
        compareLabel: "0% vs 85% swarm",
        fillPct: 2,
      },
      estimatedSpend: {
        value: "~$0.15",
        sub: "100% pass rate · 1-shot verified",
        compareLabel: "$0.15 vs $2.40 (16× less)",
        fillPct: 14,
      },
    },
    wirePayload: {
      label: "DETERMINISTIC VERIFIER LOOP (0 COORDINATION TOKENS)",
      code: `SKILL.md docked → edit auth.ts → vitest run (18ms) → PASS (14/14 assertions) · prefix stays 100% warm`,
      verdict: "STEADY WARM CACHE (0.10× READ · ZERO SUBAGENTS)",
    },
    beats: [
      {
        step: "01",
        label: "Dock domain SKILL.md",
        detail: "Agent loads a compact 1.8k-token domain playbook directly into its warm working prefix.",
        costDisplay: "$0.06",
        tokensDisplay: "19k tok",
        cacheBadge: "WARM CACHE · 0.10× READ",
      },
      {
        step: "02",
        label: "Coherent in-place edit",
        detail: "Full causal state stays in one head—no ticket translation loss across coupled files.",
        costDisplay: "$0.11",
        tokensDisplay: "21k tok",
        cacheBadge: "WARM CACHE · 0.10× READ",
      },
      {
        step: "03",
        label: "Deterministic vitest gate",
        detail: "Local vitest + tsc verify the patch in milliseconds; loop finishes in one verified shot.",
        costDisplay: "$0.15",
        tokensDisplay: "22k tok",
        cacheBadge: "VERIFIED PASS · 100%",
      },
    ],
  },
  {
    id: "level-b",
    tabLabel: "Level B: Smart Pointers",
    shortTag: "LEVEL B · POINTER MANIFESTS",
    title: "Level B: Smart Economic Coordination (Pointer Manifests)",
    headline: "Isolated worktrees · Disk pointer manifests · Deterministic test gates",
    summary:
      "Root coordinator stays pinned at ~18k tokens under a 1-hour warm cache lease. Three parallel workers run in isolated git worktrees and return <200-byte JSON pointer envelopes instead of full transcripts.",
    tone: "cyan",
    accentHex: "#38bdf8",
    secondaryHex: "#10b981",
    svgBadges: {
      cache: "CACHE: 1H WARM (0.10×)",
      tokens: "TOKENS: 18k PINNED",
      cost: "COST: ~$0.10",
      passRate: "PASS RATE: 100% (3/3 GATES)",
    },
    metrics: {
      contextPrefix: {
        value: "18k tok",
        sub: "Pinned root + <200B receipts",
        compareLabel: "18k vs 100k swarm",
        fillPct: 18,
      },
      cacheState: {
        value: "Warm 0.10×",
        sub: "1-hour warm lease matched",
        compareLabel: "Warm 0.10× vs Cold 2.50×",
        fillPct: 10,
      },
      coordinationOverhead: {
        value: "<4% tax",
        sub: "<200B disk pointer manifests",
        compareLabel: "0%–4% vs 85% swarm",
        fillPct: 6,
      },
      estimatedSpend: {
        value: "~$0.10",
        sub: "100% pass rate · cheap leaf lanes",
        compareLabel: "$0.10 vs $2.40 (24× less)",
        fillPct: 10,
      },
    },
    wirePayload: {
      label: "POINTER MANIFEST RETURNED TO ROOT (142 BYTES · 38 TOKENS)",
      code: `{"lane":"wt-2","status":"PASS","gate":"vitest 12/12","artifacts":"/tmp/runs/lane-2-diff.patch"}`,
      verdict: "ROOT CONTEXT STAYS 18k · 1-HOUR CACHE LEASE WARM",
    },
    beats: [
      {
        step: "01",
        label: "Scoped task envelopes",
        detail: "Root pins an 18k prefix on a 1h warm lease and dispatches 3 disjoint worktree envelopes.",
        costDisplay: "$0.04",
        tokensDisplay: "18.0k tok",
        cacheBadge: "1H LEASE ARMED · WARM",
      },
      {
        step: "02",
        label: "Isolated git worktrees",
        detail: "3 compact workers execute in parallel .worktrees/lane-1..3 with local vitest gates.",
        costDisplay: "$0.08",
        tokensDisplay: "18.1k tok",
        cacheBadge: "ISOLATED · ZERO COLLISION",
      },
      {
        step: "03",
        label: "<200B pointer manifests",
        detail: "Tiny JSON receipts ({status: PASS, artifacts: /tmp/...}) glide back; root cache hits at 0.10×.",
        costDisplay: "$0.10",
        tokensDisplay: "18.2k tok",
        cacheBadge: "WARM 0.10× HIT · 100% PASS",
      },
    ],
  },
];

const BEAT_DURATION_MS = 2800;

export function OrchestrationMotionHook() {
  const regionId = useId();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [beatIndex, setBeatIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Detect prefers-reduced-motion and pause autoplay automatically if enabled
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = (matches: boolean) => {
      setReducedMotion(matches);
      if (matches) {
        setIsPlaying(false);
      }
    };
    applyPreference(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => applyPreference(event.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Auto-play loop stepping through beats (0 -> 1 -> 2) then advancing scenario
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;
    const timer = window.setInterval(() => {
      setBeatIndex((prevBeat) => {
        if (prevBeat < 2) {
          return prevBeat + 1;
        }
        setActiveIndex((prevScenario) => (prevScenario + 1) % SCENARIOS.length);
        return 0;
      });
    }, BEAT_DURATION_MS);

    return () => window.clearInterval(timer);
  }, [isPlaying, reducedMotion]);

  const activeScenario = SCENARIOS[activeIndex];
  const activeBeat = activeScenario.beats[beatIndex];
  const totalStageSteps = SCENARIOS.length * 3;
  const globalStepIndex = activeIndex * 3 + beatIndex;
  const animatePulses = isPlaying && !reducedMotion;

  const selectScenario = (index: number) => {
    setActiveIndex(index);
    setBeatIndex(0);
  };

  const selectGlobalStep = (stepIdx: number) => {
    const clamped = Math.max(0, Math.min(totalStageSteps - 1, stepIdx));
    setActiveIndex(Math.floor(clamped / 3));
    setBeatIndex(clamped % 3);
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = (index + 1) % SCENARIOS.length;
      selectScenario(next);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prev = (index - 1 + SCENARIOS.length) % SCENARIOS.length;
      selectScenario(prev);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectScenario(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectScenario(SCENARIOS.length - 1);
    }
  };

  return (
    <section
      className="orchestration-motion-hook"
      role="region"
      aria-label="Interactive orchestration architecture motion comparison"
      aria-labelledby={`${regionId}-heading`}
      data-scenario={activeScenario.id}
      data-paused={!animatePulses ? "true" : "false"}
    >
      <style>{`
        .orchestration-motion-hook {
          --omh-bg-deep: #080b14;
          --omh-bg-stage: #0e1424;
          --omh-border: #1e293b;
          --omh-border-bright: #334155;
          --omh-ink: #f8fafc;
          --omh-muted: #cbd5e1;
          --omh-dim: #94a3b8;
          --omh-ease: cubic-bezier(0.16, 1, 0.3, 1);
          --omh-danger: #f43f5e;
          --omh-emerald: #10b981;
          --omh-cyan: #38bdf8;
          --omh-amber: #fbbf24;
          --omh-pink: #ec4899;

          position: relative;
          margin: 0 0 2.5rem;
          border-radius: 12px;
          background:
            radial-gradient(120% 90% at 15% 0%, rgba(56, 189, 248, 0.08) 0%, transparent 55%),
            radial-gradient(100% 80% at 88% 10%, rgba(236, 72, 153, 0.07) 0%, transparent 55%),
            linear-gradient(180deg, #0e1424 0%, #080b14 100%);
          border: 1px solid var(--omh-border);
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          color: var(--omh-ink);
          overflow: hidden;
          font-family: var(--body, Manrope, system-ui, -apple-system, sans-serif);
        }

        .orchestration-motion-hook[data-scenario="naive-swarm"] {
          --omh-active: #f43f5e;
          --omh-active-soft: rgba(244, 63, 94, 0.14);
          --omh-active-glow: rgba(244, 63, 94, 0.35);
        }

        .orchestration-motion-hook[data-scenario="level-a"] {
          --omh-active: #10b981;
          --omh-active-soft: rgba(16, 185, 129, 0.14);
          --omh-active-glow: rgba(16, 185, 129, 0.35);
        }

        .orchestration-motion-hook[data-scenario="level-b"] {
          --omh-active: #38bdf8;
          --omh-active-soft: rgba(56, 189, 248, 0.14);
          --omh-active-glow: rgba(56, 189, 248, 0.35);
        }

        .omh-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem 1rem;
          padding: 1rem 1.25rem 0.85rem;
          border-bottom: 1px solid var(--omh-border);
          background: rgba(8, 11, 20, 0.78);
        }

        .omh-title-cluster {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }

        .omh-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--omh-active);
          transition: color 0.35s var(--omh-ease);
        }

        .omh-kicker-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--omh-active);
          box-shadow: 0 0 10px var(--omh-active);
          transition: background 0.35s var(--omh-ease), box-shadow 0.35s var(--omh-ease);
        }

        .omh-heading {
          margin: 0;
          font-family: var(--body, Manrope, sans-serif);
          font-size: clamp(1rem, 2vw, 1.2rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--omh-ink);
          text-transform: none;
          line-height: 1.3;
        }

        .omh-controls {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-wrap: wrap;
        }

        .omh-play-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          min-height: 36px;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          border: 1px solid var(--omh-border-bright);
          background: #0e1424;
          color: var(--omh-ink);
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.74rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            border-color 0.25s var(--omh-ease),
            background 0.25s var(--omh-ease),
            transform 0.2s var(--omh-ease);
        }

        .omh-play-btn:hover {
          border-color: var(--omh-active);
          background: rgba(30, 41, 59, 0.65);
        }

        .omh-play-btn:focus-visible {
          outline: 2px solid var(--omh-cyan);
          outline-offset: 2px;
        }

        .omh-play-icon {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--omh-active);
        }

        /* Mode Switcher Tabs */
        .omh-tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(14, 20, 36, 0.65);
          border-bottom: 1px solid var(--omh-border);
        }

        .omh-tab {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 0.2rem;
          min-height: 52px;
          padding: 0.55rem 0.75rem 0.7rem;
          border-radius: 8px;
          border: 1px solid var(--omh-border);
          background: #080b14;
          color: var(--omh-muted);
          text-align: left;
          cursor: pointer;
          overflow: hidden;
          transition:
            border-color 0.35s var(--omh-ease),
            background 0.35s var(--omh-ease),
            transform 0.25s var(--omh-ease),
            box-shadow 0.35s var(--omh-ease);
        }

        .omh-tab:hover {
          border-color: var(--omh-border-bright);
          background: rgba(14, 20, 36, 0.9);
        }

        .omh-tab[aria-selected="true"] {
          border-color: var(--omh-active);
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.55) 0%, rgba(14, 20, 36, 0.95) 100%);
          color: var(--omh-ink);
          box-shadow: 0 0 22px -6px var(--omh-active-glow);
        }

        .omh-tab-step {
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.66rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--omh-dim);
        }

        .omh-tab[aria-selected="true"] .omh-tab-step {
          color: var(--omh-active);
        }

        .omh-tab-label {
          font-size: 0.84rem;
          font-weight: 700;
          line-height: 1.25;
          color: inherit;
        }

        .omh-tab-progress {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
        }

        .omh-tab-progress-fill {
          height: 100%;
          background: var(--omh-active);
          transition: width 0.35s var(--omh-ease);
        }

        /* Scenario Banner & Headline */
        .omh-banner {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem 1rem;
          padding: 0.85rem 1.25rem 0.65rem;
        }

        .omh-headline {
          margin: 0;
          font-family: var(--mono, "DM Mono", monospace);
          font-size: clamp(0.78rem, 1.5vw, 0.9rem);
          font-weight: 600;
          color: var(--omh-active);
          letter-spacing: 0.02em;
          transition: color 0.35s var(--omh-ease);
        }

        .omh-summary {
          margin: 0.25rem 0 0;
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--omh-muted);
          max-width: 76ch;
        }

        /* Dynamic HUD Badges above Stage */
        .omh-hud-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.5rem;
          padding: 0.35rem 1.25rem 0.75rem;
        }

        .omh-hud-pill {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          padding: 0.45rem 0.65rem;
          border-radius: 6px;
          background: #0e1424;
          border: 1px solid var(--omh-border);
          min-width: 0;
        }

        .omh-hud-pill-key {
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.63rem;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--omh-dim);
        }

        .omh-hud-pill-val {
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--omh-ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .omh-hud-pill[data-highlight="true"] {
          border-color: color-mix(in srgb, var(--omh-active) 55%, var(--omh-border));
          background: color-mix(in srgb, var(--omh-active) 9%, #0e1424);
        }

        .omh-hud-pill[data-highlight="true"] .omh-hud-pill-val {
          color: var(--omh-active);
        }

        /* Animated SVG Canvas Stage */
        .omh-stage-wrap {
          position: relative;
          margin: 0 1.25rem;
          border-radius: 10px;
          background:
            radial-gradient(circle at 50% 48%, rgba(30, 41, 59, 0.42) 0%, rgba(14, 20, 36, 0.92) 70%, #080b14 100%);
          border: 1px solid var(--omh-border);
          overflow: hidden;
        }

        .omh-stage-svg {
          display: block;
          width: 100%;
          height: auto;
        }

        .omh-stage-desktop {
          display: block;
        }

        .omh-stage-mobile {
          display: none;
        }

        /* SVG Keyframe Animations */
        @keyframes omh-dash-flow {
          to {
            stroke-dashoffset: -48;
          }
        }

        @keyframes omh-dash-reverse {
          to {
            stroke-dashoffset: 48;
          }
        }

        @keyframes omh-chaos-flow {
          to {
            stroke-dashoffset: -72;
          }
        }

        @keyframes omh-pulse-ring {
          0%, 100% {
            opacity: 0.28;
            transform: scale(0.97);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.04);
          }
        }

        @keyframes omh-alert-blink {
          0%, 100% {
            opacity: 0.96;
          }
          50% {
            opacity: 0.48;
          }
        }

        .omh-stream-forward {
          stroke-dasharray: 7 9;
          animation: omh-dash-flow 1.8s linear infinite;
        }

        .omh-stream-return {
          stroke-dasharray: 6 10;
          animation: omh-dash-reverse 1.5s linear infinite;
        }

        .omh-stream-chaos {
          stroke-dasharray: 10 8;
          animation: omh-chaos-flow 1.1s linear infinite;
        }

        .omh-node-halo {
          transform-box: fill-box;
          transform-origin: center;
          animation: omh-pulse-ring 3.2s var(--omh-ease) infinite;
        }

        .omh-danger-pulse {
          animation: omh-alert-blink 1.35s ease-in-out infinite;
        }

        .orchestration-motion-hook[data-paused="true"] .omh-stream-forward,
        .orchestration-motion-hook[data-paused="true"] .omh-stream-return,
        .orchestration-motion-hook[data-paused="true"] .omh-stream-chaos,
        .orchestration-motion-hook[data-paused="true"] .omh-node-halo,
        .orchestration-motion-hook[data-paused="true"] .omh-danger-pulse {
          animation-play-state: paused;
        }

        /* Scrubber / Stage Beat Pills */
        .omh-scrubber-bar {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--omh-border);
        }

        .omh-beats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.5rem;
        }

        .omh-beat-pill {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.18rem;
          padding: 0.5rem 0.65rem;
          border-radius: 7px;
          border: 1px solid var(--omh-border);
          background: rgba(8, 11, 20, 0.75);
          color: var(--omh-muted);
          text-align: left;
          cursor: pointer;
          transition:
            border-color 0.25s var(--omh-ease),
            background 0.25s var(--omh-ease);
        }

        .omh-beat-pill:hover {
          border-color: var(--omh-border-bright);
        }

        .omh-beat-pill[aria-current="step"] {
          border-color: var(--omh-active);
          background: var(--omh-active-soft);
          color: var(--omh-ink);
        }

        .omh-beat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 0.35rem;
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.68rem;
          color: var(--omh-active);
        }

        .omh-beat-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--omh-ink);
        }

        .omh-beat-desc {
          font-size: 0.72rem;
          line-height: 1.38;
          color: var(--omh-dim);
        }

        .omh-scrubber-track-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .omh-scrubber-label {
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.68rem;
          color: var(--omh-dim);
          white-space: nowrap;
        }

        .omh-range {
          flex: 1;
          min-width: 0;
          height: 6px;
          accent-color: var(--omh-active);
          cursor: pointer;
        }

        /* Wire Payload Callout Strip */
        .omh-wire-strip {
          margin: 0 1.25rem 0.75rem;
          padding: 0.55rem 0.75rem;
          border-radius: 7px;
          background: #080b14;
          border: 1px solid var(--omh-border);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem 0.85rem;
        }

        .omh-wire-meta {
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.65rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--omh-dim);
        }

        .omh-wire-code {
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.74rem;
          color: var(--omh-ink);
          overflow-wrap: anywhere;
          word-break: break-word;
          flex: 1 1 100%;
        }

        /* Live Comparison Metric Bar */
        .omh-metrics-bar {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1px;
          background: var(--omh-border);
          border-top: 1px solid var(--omh-border);
        }

        .omh-metric-cell {
          background: #080b14;
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .omh-metric-label {
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.66rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--omh-dim);
        }

        .omh-metric-value {
          font-family: var(--mono, "DM Mono", monospace);
          font-size: clamp(1rem, 1.8vw, 1.22rem);
          font-weight: 800;
          color: var(--omh-active);
          line-height: 1.2;
          transition: color 0.35s var(--omh-ease);
        }

        .omh-metric-sub {
          font-size: 0.74rem;
          color: var(--omh-muted);
          line-height: 1.35;
        }

        .omh-metric-meter {
          height: 4px;
          width: 100%;
          border-radius: 999px;
          background: #1e293b;
          overflow: hidden;
          margin: 0.25rem 0 0.15rem;
        }

        .omh-metric-meter-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--omh-active);
          transition: width 0.55s var(--omh-ease), background 0.35s var(--omh-ease);
        }

        .omh-metric-compare {
          font-family: var(--mono, "DM Mono", monospace);
          font-size: 0.65rem;
          color: var(--omh-dim);
        }

        /* Responsive Breakpoints (320px - 720px+) */
        @media (max-width: 760px) {
          .omh-tabs {
            grid-template-columns: 1fr;
            gap: 0.4rem;
            padding: 0.65rem 0.9rem;
          }

          .omh-tab {
            min-height: 44px;
            padding: 0.45rem 0.65rem 0.55rem;
          }

          .omh-header,
          .omh-banner,
          .omh-scrubber-bar {
            padding-left: 0.9rem;
            padding-right: 0.9rem;
          }

          .omh-hud-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            padding-left: 0.9rem;
            padding-right: 0.9rem;
          }

          .omh-stage-wrap,
          .omh-wire-strip {
            margin-left: 0.9rem;
            margin-right: 0.9rem;
          }

          .omh-stage-desktop {
            display: none !important;
          }

          .omh-stage-mobile {
            display: block !important;
            width: 100%;
            height: auto;
            aspect-ratio: 3 / 4;
          }

          .omh-beats-grid {
            grid-template-columns: 1fr;
          }

          .omh-metrics-bar {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 420px) {
          .omh-hud-row {
            grid-template-columns: 1fr 1fr;
            gap: 0.35rem;
          }

          .omh-hud-pill {
            padding: 0.35rem 0.5rem;
          }

          .omh-hud-pill-val {
            font-size: 0.7rem;
          }

          .omh-metrics-bar {
            grid-template-columns: 1fr;
          }

          .omh-scrubber-track-row {
            flex-wrap: wrap;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .omh-stream-forward,
          .omh-stream-return,
          .omh-stream-chaos,
          .omh-node-halo,
          .omh-danger-pulse {
            animation: none !important;
          }

          .omh-tab,
          .omh-metric-meter-fill,
          .omh-tab-progress-fill {
            transition: none !important;
          }
        }
      `}</style>

      {/* Header bar with title and Play/Pause control */}
      <header className="omh-header">
        <div className="omh-title-cluster">
          <span className="omh-kicker">
            <span className="omh-kicker-dot" aria-hidden="true" />
            {activeScenario.shortTag}
          </span>
          <h2 id={`${regionId}-heading`} className="omh-heading">
            Interactive Architecture Comparison: Why Swarms Burn Cache &amp; How Pointers Fix It
          </h2>
        </div>

        <div className="omh-controls">
          <button
            type="button"
            className="omh-play-btn"
            onClick={() => setIsPlaying((prev) => !prev)}
            aria-pressed={animatePulses}
            aria-label={
              animatePulses
                ? "Pause architecture motion loop"
                : "Play architecture motion loop"
            }
          >
            <span className="omh-play-icon" aria-hidden="true" />
            {animatePulses ? "Pause Loop" : "Play Loop"}
          </button>
        </div>
      </header>

      {/* Mode Switcher Tabs */}
      <div
        className="omh-tabs"
        role="tablist"
        aria-label="Orchestration architecture modes"
      >
        {SCENARIOS.map((scenario, idx) => {
          const isSelected = idx === activeIndex;
          const progressWidth = isSelected ? `${((beatIndex + 1) / 3) * 100}%` : "0%";
          return (
            <button
              key={scenario.id}
              id={`${regionId}-tab-${scenario.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`${regionId}-panel`}
              tabIndex={isSelected ? 0 : -1}
              className="omh-tab"
              onClick={() => selectScenario(idx)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
            >
              <span className="omh-tab-step">
                Mode 0{idx + 1} · {idx === 0 ? "Anti-Pattern" : idx === 1 ? "Default" : "Parallel"}
              </span>
              <span className="omh-tab-label">{scenario.tabLabel}</span>
              <span className="omh-tab-progress" aria-hidden="true">
                <span
                  className="omh-tab-progress-fill"
                  style={{ width: progressWidth }}
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Mode Panel */}
      <div
        id={`${regionId}-panel`}
        role="tabpanel"
        aria-labelledby={`${regionId}-tab-${activeScenario.id}`}
      >
        <div className="omh-banner">
          <div>
            <p className="omh-headline">{activeScenario.headline}</p>
            <p className="omh-summary">{activeScenario.summary}</p>
          </div>
        </div>

        {/* Dynamic Live Badges */}
        <div className="omh-hud-row" aria-label="Live scenario telemetry badges">
          <div className="omh-hud-pill" data-highlight="true">
            <span className="omh-hud-pill-key">Cache Status</span>
            <span className="omh-hud-pill-val">{activeBeat.cacheBadge}</span>
          </div>
          <div className="omh-hud-pill">
            <span className="omh-hud-pill-key">Active Prefix</span>
            <span className="omh-hud-pill-val">{activeBeat.tokensDisplay}</span>
          </div>
          <div className="omh-hud-pill" data-highlight="true">
            <span className="omh-hud-pill-key">Session Cost</span>
            <span className="omh-hud-pill-val">{activeBeat.costDisplay}</span>
          </div>
          <div className="omh-hud-pill">
            <span className="omh-hud-pill-key">Verification</span>
            <span className="omh-hud-pill-val">{activeScenario.svgBadges.passRate}</span>
          </div>
        </div>

        {/* Animated SVG Stage */}
        <div className="omh-stage-wrap">
          {/* Desktop / Landscape SVG Stage (760x390, ~16:9) */}
          <svg
            className="omh-stage-svg omh-stage-desktop"
            viewBox="0 0 760 390"
            role="img"
            aria-labelledby={`${regionId}-svg-title ${regionId}-svg-desc`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <title id={`${regionId}-svg-title`}>
              {`${activeScenario.title} — ${activeScenario.headline}`}
            </title>
            <desc id={`${regionId}-svg-desc`}>
              {`${activeScenario.summary} Current beat: ${activeBeat.label} (${activeBeat.detail})`}
            </desc>

            <defs>
              <pattern
                id={`${regionId}-grid`}
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="0.7"
                  strokeOpacity="0.55"
                />
              </pattern>

              <radialGradient id={`${regionId}-danger-glow`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={`${regionId}-emerald-glow`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.36" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={`${regionId}-cyan-glow`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.36" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Stage Canvas & Subtle Grid */}
            <rect width="760" height="390" fill="#080b14" />
            <rect width="760" height="390" fill={`url(#${regionId}-grid)`} />

            {/* Top Embedded SVG Dynamic Badges Bar */}
            <g transform="translate(24, 12)">
              <rect
                x="0"
                y="0"
                width="210"
                height="24"
                rx="5"
                fill="#0e1424"
                stroke={activeScenario.accentHex}
                strokeWidth="1.1"
              />
              <text
                x="105"
                y="15.5"
                fill={activeScenario.accentHex}
                fontSize="9.5"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="var(--mono, monospace)"
              >
                {activeScenario.svgBadges.cache}
              </text>

              <rect
                x="220"
                y="0"
                width="165"
                height="24"
                rx="5"
                fill="#0e1424"
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x="302.5"
                y="15.5"
                fill="#f8fafc"
                fontSize="9.5"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="var(--mono, monospace)"
              >
                {activeScenario.svgBadges.tokens}
              </text>

              <rect
                x="395"
                y="0"
                width="130"
                height="24"
                rx="5"
                fill="#0e1424"
                stroke={activeScenario.accentHex}
                strokeWidth="1.1"
              />
              <text
                x="460"
                y="15.5"
                fill="#f8fafc"
                fontSize="9.5"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="var(--mono, monospace)"
              >
                {activeScenario.svgBadges.cost}
              </text>

              <rect
                x="535"
                y="0"
                width="177"
                height="24"
                rx="5"
                fill="#0e1424"
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x="623.5"
                y="15.5"
                fill="#cbd5e1"
                fontSize="9.2"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="var(--mono, monospace)"
              >
                {activeScenario.svgBadges.passRate}
              </text>
            </g>

            {/* ============================================================
                MODE 1: THE NAIVE SWARM (THE TICKET TRAP)
               ============================================================ */}
            {activeScenario.id === "naive-swarm" && (
              <g transform="translate(0, 26)">
                {/* Ambient Crimson Glow */}
                <circle
                  cx="175"
                  cy="168"
                  r="130"
                  fill={`url(#${regionId}-danger-glow)`}
                />

                {/* Cross-worker n(n-1)/2 chatter chords */}
                <path
                  d="M 555 58 C 500 110, 500 130, 555 136"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.3"
                  strokeOpacity="0.5"
                  className="omh-stream-chaos"
                />
                <path
                  d="M 555 136 C 500 175, 500 195, 555 214"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.3"
                  strokeOpacity="0.5"
                  className="omh-stream-chaos"
                />
                <path
                  d="M 555 214 C 500 250, 500 270, 555 292"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.3"
                  strokeOpacity="0.5"
                  className="omh-stream-chaos"
                />
                <path
                  d="M 650 58 C 705 130, 705 220, 650 292"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.4"
                  strokeOpacity="0.45"
                  className="omh-stream-chaos"
                />

                {/* 4 Heavy Bezier Channels between Root and Workers */}
                {[
                  { y: 58, label: "Worker 1 · Auth", dump: "+45k diff dump", dur: "1.9s" },
                  { y: 136, label: "Worker 2 · Schema", dump: "+38k raw stdout", dur: "2.2s" },
                  { y: 214, label: "Worker 3 · API", dump: "+42k chat log", dur: "1.7s" },
                  { y: 292, label: "Worker 4 · UI", dump: "+35k retry trace", dur: "2.4s" },
                ].map((worker, i) => {
                  const forwardPath = `M 265 168 C 370 168, 415 ${worker.y}, 530 ${worker.y}`;
                  const returnPath = `M 530 ${worker.y} C 415 ${worker.y}, 370 168, 265 168`;
                  return (
                    <g key={worker.label}>
                      {/* Base Track */}
                      <path
                        d={forwardPath}
                        fill="none"
                        stroke="#f43f5e"
                        strokeOpacity="0.24"
                        strokeWidth="3"
                      />
                      {/* Animated Chatter Stream */}
                      <path
                        d={forwardPath}
                        fill="none"
                        stroke={i % 2 === 0 ? "#f43f5e" : "#fbbf24"}
                        strokeWidth="2.4"
                        className="omh-stream-chaos"
                      />

                      {/* Animated Token Packet Pulses (Heavy Red Diff Dumps) */}
                      {animatePulses ? (
                        <g>
                          <circle r="5.5" fill="#f43f5e" opacity="0.9">
                            <animateMotion
                              dur={worker.dur}
                              repeatCount="indefinite"
                              path={returnPath}
                            />
                          </circle>
                          <circle r="3.5" fill="#fbbf24" opacity="0.85">
                            <animateMotion
                              dur={worker.dur}
                              begin="0.8s"
                              repeatCount="indefinite"
                              path={forwardPath}
                            />
                          </circle>
                        </g>
                      ) : (
                        <circle
                          cx={395}
                          cy={(168 + worker.y) / 2}
                          r="4.5"
                          fill="#f43f5e"
                        />
                      )}

                      {/* Bloated Transcript Pill on Channel */}
                      <g
                        transform={`translate(${355 + (i % 2) * 32}, ${
                          (168 + worker.y) / 2 - 11
                        })`}
                      >
                        <rect
                          width="104"
                          height="20"
                          rx="10"
                          fill="#1a0c14"
                          stroke="#f43f5e"
                          strokeWidth="1.1"
                        />
                        <text
                          x="52"
                          y="13.5"
                          fill="#fda4af"
                          fontSize="9.5"
                          fontWeight="700"
                          textAnchor="middle"
                          fontFamily="var(--mono, monospace)"
                        >
                          {worker.dump}
                        </text>
                      </g>

                      {/* Worker Node Box */}
                      <g transform={`translate(530, ${worker.y - 24})`}>
                        <rect
                          width="196"
                          height="48"
                          rx="8"
                          fill="#0e1424"
                          stroke={beatIndex === 2 ? "#f43f5e" : "#334155"}
                          strokeWidth="1.5"
                        />
                        <circle cx="18" cy="18" r="5" fill="#f43f5e" />
                        <text
                          x="30"
                          y="21"
                          fill="#f8fafc"
                          fontSize="11.5"
                          fontWeight="700"
                        >
                          {worker.label}
                        </text>
                        <text
                          x="18"
                          y="37"
                          fill="#94a3b8"
                          fontSize="9.5"
                          fontFamily="var(--mono, monospace)"
                        >
                          Shared worktree · 100k copy
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Root Coordinator Node (Overloaded) */}
                <g transform="translate(36, 98)">
                  <rect
                    x="-6"
                    y="-6"
                    width="241"
                    height="152"
                    rx="14"
                    fill="none"
                    stroke="#f43f5e"
                    strokeOpacity="0.45"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="omh-node-halo"
                  />
                  <rect
                    width="229"
                    height="140"
                    rx="11"
                    fill="#140c16"
                    stroke="#f43f5e"
                    strokeWidth="2"
                  />
                  <rect
                    x="14"
                    y="12"
                    width="136"
                    height="20"
                    rx="4"
                    fill="#f43f5e"
                    fillOpacity="0.2"
                  />
                  <text
                    x="22"
                    y="25.5"
                    fill="#fda4af"
                    fontSize="9.5"
                    fontWeight="800"
                    fontFamily="var(--mono, monospace)"
                  >
                    ROOT COORDINATOR
                  </text>

                  <text
                    x="14"
                    y="52"
                    fill="#f8fafc"
                    fontSize="14.5"
                    fontWeight="800"
                  >
                    Context: 100k+ Tokens
                  </text>
                  <text
                    x="14"
                    y="71"
                    fill="#cbd5e1"
                    fontSize="11"
                    fontFamily="var(--mono, monospace)"
                  >
                    5m TTL expired during wait
                  </text>

                  {/* Cost & Eviction Readout inside Root */}
                  <rect
                    x="14"
                    y="84"
                    width="201"
                    height="42"
                    rx="6"
                    fill="#080b14"
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                  />
                  <text
                    x="24"
                    y="101"
                    fill="#f43f5e"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="var(--mono, monospace)"
                  >
                    COLD RE-PREFILL: 25× WRITE
                  </text>
                  <text
                    x="24"
                    y="117"
                    fill="#fbbf24"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="var(--mono, monospace)"
                  >
                    Spend: {activeBeat.costDisplay} · Pass: Low
                  </text>
                </g>

                {/* Red Pulsing Warning Banner */}
                <g transform="translate(36, 318)" className="omh-danger-pulse">
                  <rect
                    width="690"
                    height="30"
                    rx="6"
                    fill="#250b16"
                    stroke="#f43f5e"
                    strokeWidth="1.4"
                  />
                  <text
                    x="345"
                    y="19.5"
                    fill="#fecdd3"
                    fontSize="11"
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="var(--mono, monospace)"
                    letterSpacing="0.04em"
                  >
                    ⚠ COLD CACHE EVICTION (25× WRITE SURCHARGE) · QUADRATIC CHATTER &amp; MERGE CONFLICTS
                  </text>
                </g>
              </g>
            )}

            {/* ============================================================
                MODE 2: LEVEL A — SINGLE AGENT (THE DEFAULT)
               ============================================================ */}
            {activeScenario.id === "level-a" && (
              <g transform="translate(0, 26)">
                {/* Calm Emerald & Cyan Ambient Glow */}
                <circle
                  cx="373"
                  cy="170"
                  r="140"
                  fill={`url(#${regionId}-emerald-glow)`}
                />

                {/* Skill Cartridge Dock Path (Left -> Center Agent) */}
                <path
                  d="M 208 172 C 235 172, 245 172, 268 172"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="omh-stream-forward"
                />

                {animatePulses ? (
                  <circle r="4.5" fill="#38bdf8">
                    <animateMotion
                      dur="1.6s"
                      repeatCount="indefinite"
                      path="M 208 172 C 235 172, 245 172, 268 172"
                    />
                  </circle>
                ) : (
                  <circle cx="238" cy="172" r="4" fill="#38bdf8" />
                )}

                {/* Docked SKILL.md Cartridge Node */}
                <g transform="translate(34, 118)">
                  <rect
                    width="174"
                    height="108"
                    rx="10"
                    fill="#0e1424"
                    stroke="#38bdf8"
                    strokeWidth="1.6"
                  />
                  <rect
                    x="12"
                    y="12"
                    width="96"
                    height="19"
                    rx="4"
                    fill="#38bdf8"
                    fillOpacity="0.16"
                  />
                  <text
                    x="20"
                    y="25"
                    fill="#7dd3fc"
                    fontSize="9.5"
                    fontWeight="800"
                    fontFamily="var(--mono, monospace)"
                  >
                    SKILL CARTRIDGE
                  </text>
                  <text
                    x="12"
                    y="50"
                    fill="#f8fafc"
                    fontSize="14"
                    fontWeight="800"
                    fontFamily="var(--mono, monospace)"
                  >
                    SKILL.md
                  </text>
                  <text x="12" y="69" fill="#cbd5e1" fontSize="11">
                    Domain rules &amp; AST guardrails
                  </text>
                  <text
                    x="12"
                    y="90"
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="var(--mono, monospace)"
                  >
                    Docked · +1.8k tokens
                  </text>
                </g>

                {/* Center: Calm Single Agent Node */}
                <g transform="translate(268, 94)">
                  <rect
                    x="-7"
                    y="-7"
                    width="224"
                    height="166"
                    rx="16"
                    fill="none"
                    stroke="#10b981"
                    strokeOpacity="0.4"
                    strokeWidth="2"
                    className="omh-node-halo"
                  />
                  <rect
                    width="210"
                    height="152"
                    rx="12"
                    fill="#0c1922"
                    stroke="#10b981"
                    strokeWidth="2.2"
                  />
                  <rect
                    x="16"
                    y="14"
                    width="178"
                    height="22"
                    rx="5"
                    fill="#10b981"
                    fillOpacity="0.18"
                  />
                  <text
                    x="105"
                    y="28.5"
                    fill="#6ee7b7"
                    fontSize="10"
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="var(--mono, monospace)"
                  >
                    LEVEL A · SINGLE AGENT LOOP
                  </text>

                  <text
                    x="105"
                    y="60"
                    fill="#f8fafc"
                    fontSize="15.5"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    Focused Working Context
                  </text>
                  <text
                    x="105"
                    y="80"
                    fill="#94a3b8"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="var(--mono, monospace)"
                  >
                    22k tokens · 0 subagent handoffs
                  </text>

                  <rect
                    x="18"
                    y="94"
                    width="174"
                    height="42"
                    rx="6"
                    fill="#080b14"
                    stroke="#10b981"
                    strokeWidth="1.2"
                  />
                  <text
                    x="105"
                    y="111"
                    fill="#34d399"
                    fontSize="10.5"
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="var(--mono, monospace)"
                  >
                    WARM CACHE: 0.10× READ
                  </text>
                  <text
                    x="105"
                    y="127"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    fontFamily="var(--mono, monospace)"
                  >
                    Spend: ~$0.15 · Pass: 100%
                  </text>
                </g>

                {/* Tight Bidirectional Feedback Loop to Local Deterministic Verifier */}
                <path
                  d="M 478 142 C 512 118, 535 118, 566 142"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.4"
                  className="omh-stream-forward"
                />
                <text
                  x="522"
                  y="118"
                  fill="#7dd3fc"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="var(--mono, monospace)"
                >
                  patch diff
                </text>

                <path
                  d="M 566 202 C 535 226, 512 226, 478 202"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.4"
                  className="omh-stream-forward"
                />
                <text
                  x="522"
                  y="234"
                  fill="#6ee7b7"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="var(--mono, monospace)"
                >
                  PASS (18ms)
                </text>

                {animatePulses ? (
                  <g>
                    <circle r="4.5" fill="#38bdf8">
                      <animateMotion
                        dur="1.4s"
                        repeatCount="indefinite"
                        path="M 478 142 C 512 118, 535 118, 566 142"
                      />
                    </circle>
                    <circle r="5" fill="#10b981">
                      <animateMotion
                        dur="1.4s"
                        begin="0.7s"
                        repeatCount="indefinite"
                        path="M 566 202 C 535 226, 512 226, 478 202"
                      />
                    </circle>
                  </g>
                ) : (
                  <g>
                    <circle cx="522" cy="126" r="4" fill="#38bdf8" />
                    <circle cx="522" cy="218" r="4" fill="#10b981" />
                  </g>
                )}

                {/* Local Deterministic Verifier Node (vitest) */}
                <g transform="translate(566, 114)">
                  <rect
                    width="160"
                    height="114"
                    rx="10"
                    fill="#0e1424"
                    stroke="#10b981"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="12"
                    y="12"
                    width="136"
                    height="20"
                    rx="4"
                    fill="#10b981"
                    fillOpacity="0.16"
                  />
                  <text
                    x="80"
                    y="25.5"
                    fill="#6ee7b7"
                    fontSize="9.5"
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="var(--mono, monospace)"
                  >
                    LOCAL VERIFIER
                  </text>
                  <text
                    x="80"
                    y="52"
                    fill="#f8fafc"
                    fontSize="14.5"
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="var(--mono, monospace)"
                  >
                    vitest · tsc
                  </text>
                  <text x="80" y="72" fill="#cbd5e1" fontSize="10.5" textAnchor="middle">
                    Deterministic binary gate
                  </text>
                  <text
                    x="80"
                    y="94"
                    fill="#34d399"
                    fontSize="10.5"
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="var(--mono, monospace)"
                  >
                    ✓ 14/14 assertions
                  </text>
                </g>

                {/* Calm Bottom Status Strip */}
                <g transform="translate(36, 318)">
                  <rect
                    width="690"
                    height="30"
                    rx="6"
                    fill="#071a18"
                    stroke="#10b981"
                    strokeWidth="1.2"
                  />
                  <text
                    x="345"
                    y="19.5"
                    fill="#a7f3d0"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    fontFamily="var(--mono, monospace)"
                    letterSpacing="0.03em"
                  >
                    ✓ ZERO COORDINATION OVERHEAD · STEADY WARM CACHE (0.10× READ) · ~$0.15 VERIFIED
                  </text>
                </g>
              </g>
            )}

            {/* ============================================================
                MODE 3: LEVEL B — SMART ECONOMIC COORDINATION (POINTER MANIFESTS)
               ============================================================ */}
            {activeScenario.id === "level-b" && (
              <g transform="translate(0, 26)">
                {/* Ambient Cyan Glow */}
                <circle
                  cx="165"
                  cy="170"
                  r="130"
                  fill={`url(#${regionId}-cyan-glow)`}
                />

                {/* 3 Isolated Worktree Lanes + Returning <200B Pointer Envelopes */}
                {[
                  {
                    y: 68,
                    lane: "Worktree 1 (.worktrees/auth)",
                    ptr: `status: "PASS" · /tmp/wt-1.json`,
                    dur: "2.1s",
                  },
                  {
                    y: 170,
                    lane: "Worktree 2 (.worktrees/api)",
                    ptr: `status: "PASS" · /tmp/wt-2.json`,
                    dur: "1.8s",
                  },
                  {
                    y: 272,
                    lane: "Worktree 3 (.worktrees/docs)",
                    ptr: `status: "PASS" · /tmp/wt-3.json`,
                    dur: "2.3s",
                  },
                ].map((item) => {
                  const forwardPath = `M 258 170 C 350 170, 395 ${item.y}, 498 ${item.y}`;
                  const returnPath = `M 498 ${item.y} C 395 ${item.y}, 350 170, 258 170`;
                  return (
                    <g key={item.lane}>
                      {/* Smooth Bezier Guide */}
                      <path
                        d={forwardPath}
                        fill="none"
                        stroke="#38bdf8"
                        strokeOpacity="0.22"
                        strokeWidth="2.5"
                      />
                      {/* Returning Pointer Stream */}
                      <path
                        d={forwardPath}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.2"
                        className="omh-stream-return"
                      />

                      {/* Animated Glowing Pointer Pulse Gliding Back to Root */}
                      {animatePulses ? (
                        <circle r="5" fill="#10b981">
                          <animateMotion
                            dur={item.dur}
                            repeatCount="indefinite"
                            path={returnPath}
                          />
                        </circle>
                      ) : (
                        <circle
                          cx={378}
                          cy={(170 + item.y) / 2}
                          r="4.5"
                          fill="#10b981"
                        />
                      )}

                      {/* Compact <200-Byte JSON Pointer Capsule */}
                      <g
                        transform={`translate(308, ${(170 + item.y) / 2 - 14})`}
                      >
                        <rect
                          width="164"
                          height="26"
                          rx="13"
                          fill="#091e26"
                          stroke="#38bdf8"
                          strokeWidth="1.3"
                        />
                        <circle cx="13" cy="13" r="4" fill="#10b981" />
                        <text
                          x="23"
                          y="16.5"
                          fill="#e0f2fe"
                          fontSize="9"
                          fontWeight="700"
                          fontFamily="var(--mono, monospace)"
                        >
                          &lt;200B · {item.ptr}
                        </text>
                      </g>

                      {/* Isolated Git Worktree Worker + Local Gate */}
                      <g transform={`translate(498, ${item.y - 30})`}>
                        <rect
                          width="228"
                          height="60"
                          rx="9"
                          fill="#0e1424"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                        />
                        <text
                          x="14"
                          y="22"
                          fill="#f8fafc"
                          fontSize="11.5"
                          fontWeight="700"
                        >
                          {item.lane}
                        </text>
                        <text
                          x="14"
                          y="41"
                          fill="#94a3b8"
                          fontSize="9.5"
                          fontFamily="var(--mono, monospace)"
                        >
                          Isolated FS · Compact worker
                        </text>
                        <rect
                          x="154"
                          y="30"
                          width="62"
                          height="19"
                          rx="4"
                          fill="#10b981"
                          fillOpacity="0.18"
                          stroke="#10b981"
                          strokeWidth="1"
                        />
                        <text
                          x="185"
                          y="43"
                          fill="#6ee7b7"
                          fontSize="9"
                          fontWeight="800"
                          textAnchor="middle"
                          fontFamily="var(--mono, monospace)"
                        >
                          ✓ vitest
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Slim Root Coordinator Node (Pinned at ~18k Tokens) */}
                <g transform="translate(34, 96)">
                  <rect
                    x="-6"
                    y="-6"
                    width="236"
                    height="160"
                    rx="14"
                    fill="none"
                    stroke="#38bdf8"
                    strokeOpacity="0.4"
                    strokeWidth="2"
                    className="omh-node-halo"
                  />
                  <rect
                    width="224"
                    height="148"
                    rx="11"
                    fill="#0b1728"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <rect
                    x="14"
                    y="12"
                    width="156"
                    height="20"
                    rx="4"
                    fill="#38bdf8"
                    fillOpacity="0.18"
                  />
                  <text
                    x="22"
                    y="25.5"
                    fill="#7dd3fc"
                    fontSize="9.5"
                    fontWeight="800"
                    fontFamily="var(--mono, monospace)"
                  >
                    SLIM ROOT COORDINATOR
                  </text>

                  <text
                    x="14"
                    y="52"
                    fill="#f8fafc"
                    fontSize="14.5"
                    fontWeight="800"
                  >
                    Pinned: ~18k Tokens
                  </text>
                  <text
                    x="14"
                    y="71"
                    fill="#cbd5e1"
                    fontSize="10.5"
                    fontFamily="var(--mono, monospace)"
                  >
                    Cache lease: 1-hour warm TTL
                  </text>

                  <rect
                    x="14"
                    y="84"
                    width="196"
                    height="48"
                    rx="6"
                    fill="#080b14"
                    stroke="#10b981"
                    strokeWidth="1.2"
                  />
                  <text
                    x="24"
                    y="102"
                    fill="#34d399"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="var(--mono, monospace)"
                  >
                    ✓ 0.10× WARM READ ON WAKE
                  </text>
                  <text
                    x="24"
                    y="120"
                    fill="#38bdf8"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="var(--mono, monospace)"
                  >
                    Spend: ~$0.10 · Pass: 100%
                  </text>
                </g>

                {/* Bottom Summary Strip */}
                <g transform="translate(36, 318)">
                  <rect
                    width="690"
                    height="30"
                    rx="6"
                    fill="#081926"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                  <text
                    x="345"
                    y="19.5"
                    fill="#bae6fd"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    fontFamily="var(--mono, monospace)"
                    letterSpacing="0.03em"
                  >
                    ✓ ISOLATED GIT WORKTREES · &lt;200B JSON POINTER MANIFESTS · 1H WARM LEASE (~$0.10)
                  </text>
                </g>
              </g>
            )}
          </svg>

          {/* Mobile / Portrait 4x3 (Tall, 3:4 aspect ratio) SVG Stage (420x560) */}
          <svg
            className="omh-stage-svg omh-stage-mobile"
            viewBox="0 0 420 560"
            role="img"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id={`${regionId}-mob-grid`}
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 28 0 L 0 0 0 28"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="0.65"
                  strokeOpacity="0.5"
                />
              </pattern>

              <radialGradient id={`${regionId}-mob-danger-glow`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={`${regionId}-mob-emerald-glow`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={`${regionId}-mob-cyan-glow`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Mobile Stage Canvas & Subtle Grid */}
            <rect width="420" height="560" fill="#080b14" />
            <rect width="420" height="560" fill={`url(#${regionId}-mob-grid)`} />

            {/* Mobile Top Badges: 2 Rows */}
            <g transform="translate(16, 10)">
              {/* Row 1 */}
              <rect
                x="0"
                y="0"
                width="190"
                height="22"
                rx="4"
                fill="#0e1424"
                stroke={activeScenario.accentHex}
                strokeWidth="1"
              />
              <text
                x="95"
                y="14.5"
                fill={activeScenario.accentHex}
                fontSize="8.5"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="var(--mono, monospace)"
              >
                {activeScenario.svgBadges.cache}
              </text>

              <rect
                x="198"
                y="0"
                width="190"
                height="22"
                rx="4"
                fill="#0e1424"
                stroke={activeScenario.accentHex}
                strokeWidth="1"
              />
              <text
                x="293"
                y="14.5"
                fill="#f8fafc"
                fontSize="8.5"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="var(--mono, monospace)"
              >
                {activeScenario.svgBadges.cost}
              </text>

              {/* Row 2 */}
              <rect
                x="0"
                y="26"
                width="190"
                height="22"
                rx="4"
                fill="#0e1424"
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x="95"
                y="40.5"
                fill="#cbd5e1"
                fontSize="8.5"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="var(--mono, monospace)"
              >
                {activeScenario.svgBadges.tokens}
              </text>

              <rect
                x="198"
                y="26"
                width="190"
                height="22"
                rx="4"
                fill="#0e1424"
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x="293"
                y="40.5"
                fill="#cbd5e1"
                fontSize="8.5"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="var(--mono, monospace)"
              >
                {activeScenario.svgBadges.passRate}
              </text>
            </g>

            {/* ============================================================
                MOBILE MODE 1: NAIVE SWARM (TALL 4x3)
               ============================================================ */}
            {activeScenario.id === "naive-swarm" && (
              <g>
                <circle cx="210" cy="120" r="95" fill={`url(#${regionId}-mob-danger-glow)`} />

                {/* Root Coordinator Node (Top) */}
                <rect
                  x="35"
                  y="66"
                  width="350"
                  height="92"
                  rx="8"
                  fill="#0e1424"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                />
                <text
                  x="210"
                  y="88"
                  fill="#f8fafc"
                  fontSize="12.5"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="var(--display, sans-serif)"
                  letterSpacing="0.04em"
                >
                  ROOT COORDINATOR (SOL · 100k)
                </text>
                <text
                  x="210"
                  y="106"
                  fill="#f43f5e"
                  fontSize="10"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="var(--mono, monospace)"
                >
                  COLD CACHE MISS · 25× WRITE SURCHARGE
                </text>
                <rect
                  x="55"
                  y="118"
                  width="310"
                  height="26"
                  rx="4"
                  fill="rgba(244, 63, 94, 0.12)"
                  stroke="#f43f5e"
                  strokeWidth="1"
                />
                <text
                  x="210"
                  y="134"
                  fill="#fb7185"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="var(--mono, monospace)"
                >
                  Context bloated: +45k diff dumps from workers
                </text>

                {/* Chaotic Flow Chords from Root to 4 Workers */}
                <path
                  d="M 120 158 C 90 200, 60 250, 90 312"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.2"
                  strokeOpacity="0.55"
                  className="omh-stream-chaos"
                />
                <path
                  d="M 170 158 C 150 200, 240 240, 270 312"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.2"
                  strokeOpacity="0.55"
                  className="omh-stream-chaos"
                />
                <path
                  d="M 250 158 C 270 230, 80 340, 90 418"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.3"
                  strokeOpacity="0.5"
                  className="omh-stream-chaos"
                />
                <path
                  d="M 300 158 C 330 230, 340 340, 310 418"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.3"
                  strokeOpacity="0.5"
                  className="omh-stream-chaos"
                />

                {/* Floating Chatty Token Pills */}
                <g transform="translate(25, 178)">
                  <rect width="170" height="22" rx="4" fill="#180e14" stroke="#fbbf24" strokeWidth="1" />
                  <text x="85" y="14" fill="#fde68a" fontSize="8.5" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    +45,200 tok diff dump
                  </text>
                </g>
                <g transform="translate(225, 202)">
                  <rect width="170" height="22" rx="4" fill="#180e14" stroke="#fbbf24" strokeWidth="1" />
                  <text x="85" y="14" fill="#fde68a" fontSize="8.5" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    1,420 lines raw stdout
                  </text>
                </g>
                <g transform="translate(60, 238)">
                  <rect width="300" height="22" rx="4" fill="#200d14" stroke="#f43f5e" strokeWidth="1.1" />
                  <text x="150" y="14" fill="#fb7185" fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    ⚠ MERGE CONFLICT: Colliding edits on schema.ts
                  </text>
                </g>

                {/* Middle Alert Banner */}
                <g transform="translate(35, 272)">
                  <rect width="350" height="26" rx="5" fill="#16080e" stroke="#f43f5e" strokeWidth="1.2" />
                  <text x="175" y="16.5" fill="#fb7185" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    5m TTL EXPIRED · ROOT PAYS 2.50× WRITE SURCHARGE
                  </text>
                </g>

                {/* 4 Workers 2x2 Grid */}
                <g transform="translate(20, 312)">
                  <rect width="182" height="92" rx="6" fill="#0e1424" stroke="#334155" strokeWidth="1" />
                  <text x="91" y="24" fill="#f8fafc" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily="var(--display, sans-serif)">
                    WORKER 1 (LUNA)
                  </text>
                  <text x="91" y="42" fill="#94a3b8" fontSize="8.5" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    LANE: src/auth/*
                  </text>
                  <text x="91" y="64" fill="#f43f5e" fontSize="8.2" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Dumping +45k diffs...
                  </text>
                </g>
                <g transform="translate(218, 312)">
                  <rect width="182" height="92" rx="6" fill="#0e1424" stroke="#334155" strokeWidth="1" />
                  <text x="91" y="24" fill="#f8fafc" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily="var(--display, sans-serif)">
                    WORKER 2 (LUNA)
                  </text>
                  <text x="91" y="42" fill="#94a3b8" fontSize="8.5" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    LANE: src/billing/*
                  </text>
                  <text x="91" y="64" fill="#f43f5e" fontSize="8.2" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Dumping +38k diffs...
                  </text>
                </g>
                <g transform="translate(20, 416)">
                  <rect width="182" height="92" rx="6" fill="#0e1424" stroke="#f43f5e" strokeWidth="1.2" />
                  <text x="91" y="24" fill="#f8fafc" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily="var(--display, sans-serif)">
                    WORKER 3 (LUNA)
                  </text>
                  <text x="91" y="42" fill="#94a3b8" fontSize="8.5" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    LANE: shared schema.ts
                  </text>
                  <text x="91" y="64" fill="#f43f5e" fontSize="8.2" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Conflict &amp; re-write
                  </text>
                </g>
                <g transform="translate(218, 416)">
                  <rect width="182" height="92" rx="6" fill="#0e1424" stroke="#334155" strokeWidth="1" />
                  <text x="91" y="24" fill="#f8fafc" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily="var(--display, sans-serif)">
                    WORKER 4 (LUNA)
                  </text>
                  <text x="91" y="42" fill="#94a3b8" fontSize="8.5" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    LANE: src/reports/*
                  </text>
                  <text x="91" y="64" fill="#f43f5e" fontSize="8.2" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Dumping +31k diffs...
                  </text>
                </g>

                {/* Bottom Verdict Bar */}
                <g transform="translate(20, 520)">
                  <rect width="380" height="28" rx="5" fill="#180b10" stroke="#f43f5e" strokeWidth="1" />
                  <text x="190" y="17.5" fill="#fb7185" fontSize="9.5" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    ❌ QUADRATIC CONTEXT BLOAT · EVICTED CACHE · ~$2.40+
                  </text>
                </g>
              </g>
            )}

            {/* ============================================================
                MOBILE MODE 2: LEVEL A (SINGLE AGENT - TALL 4x3)
               ============================================================ */}
            {activeScenario.id === "level-a" && (
              <g>
                {/* Docked Skill Cartridge (Top) */}
                <g transform="translate(45, 68)">
                  <rect width="330" height="52" rx="8" fill="#0e1424" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x="165" y="22" fill="#38bdf8" fontSize="10.5" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    DOCKED DOMAIN SKILL (SKILL.md)
                  </text>
                  <text x="165" y="38" fill="#cbd5e1" fontSize="9" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    +1.8k tokens · AST tools &amp; test verifiers
                  </text>
                </g>

                {/* Connecting arrow down */}
                <path d="M 210 120 L 210 148" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />

                {/* Emerald Halo & Agent Node (Middle) */}
                <circle cx="210" cy="225" r="95" fill={`url(#${regionId}-mob-emerald-glow)`} />
                <g transform="translate(35, 148)">
                  <rect width="350" height="155" rx="10" fill="#0e1424" stroke="#10b981" strokeWidth="1.75" />
                  <text x="175" y="28" fill="#10b981" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)" letterSpacing="0.06em">
                    LEVEL A · ZERO COORDINATION TAX
                  </text>
                  <text x="175" y="52" fill="#f8fafc" fontSize="13.5" fontWeight="800" textAnchor="middle" fontFamily="var(--display, sans-serif)">
                    SINGLE CAPABLE AGENT (SONNET 5)
                  </text>
                  <text x="175" y="74" fill="#34d399" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Prefix: 22,000 tokens · Steady 0.10× warm cache
                  </text>
                  <text x="175" y="96" fill="#cbd5e1" fontSize="9.5" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Full causal state retained in one unified context
                  </text>
                  <text x="175" y="114" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Zero serialization loss · No subagent chatter
                  </text>
                  <text x="175" y="134" fill="#34d399" fontSize="9.2" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Continuous turn cadence keeps prefix warm
                  </text>
                </g>

                {/* Vertical Bidirectional Feedback Loop */}
                <path d="M 140 303 L 140 355" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" className="omh-stream-flow" />
                <path d="M 280 355 L 280 303" stroke="#34d399" strokeWidth="2" strokeDasharray="4 4" className="omh-stream-reverse" />

                {/* Deterministic Verifier Gate (Bottom) */}
                <g transform="translate(35, 355)">
                  <rect width="350" height="150" rx="10" fill="#0e1424" stroke="#10b981" strokeWidth="1.5" />
                  <text x="175" y="26" fill="#10b981" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)" letterSpacing="0.05em">
                    DETERMINISTIC VERIFICATION GATE
                  </text>
                  <text x="175" y="48" fill="#f8fafc" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    vitest run auth.test.ts (18ms)
                  </text>

                  {/* Terminal Box Inside */}
                  <rect x="25" y="60" width="300" height="46" rx="4" fill="#080c14" stroke="#1e293b" />
                  <text x="40" y="80" fill="#34d399" fontSize="9.5" fontWeight="700" fontFamily="var(--mono, monospace)">
                    ✓ 14/14 tests passing (18ms)
                  </text>
                  <text x="40" y="96" fill="#cbd5e1" fontSize="9" fontFamily="var(--mono, monospace)">
                    ✓ 0 typecheck errors · tsc clean
                  </text>

                  <text x="175" y="130" fill="#34d399" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Total Spend: ~$0.15 · 1-Shot Pass · Clean Exit
                  </text>
                </g>

                {/* Bottom Verdict Bar */}
                <g transform="translate(20, 520)">
                  <rect width="380" height="28" rx="5" fill="#081812" stroke="#10b981" strokeWidth="1" />
                  <text x="190" y="17.5" fill="#a7f3d0" fontSize="9.5" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    ✓ 1 AGENT LOOP · 0% CHATTER TAX · 1-SHOT VERIFIED (~$0.15)
                  </text>
                </g>
              </g>
            )}

            {/* ============================================================
                MOBILE MODE 3: LEVEL B (SMART POINTERS - TALL 4x3)
               ============================================================ */}
            {activeScenario.id === "level-b" && (
              <g>
                <circle cx="210" cy="125" r="95" fill={`url(#${regionId}-mob-cyan-glow)`} />

                {/* Slim Root Coordinator (Top) */}
                <g transform="translate(35, 68)">
                  <rect width="350" height="115" rx="10" fill="#0e1424" stroke="#38bdf8" strokeWidth="1.75" />
                  <text x="175" y="26" fill="#38bdf8" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)" letterSpacing="0.06em">
                    ROOT COORDINATOR · PINNED 18k TOKENS
                  </text>
                  <text x="175" y="48" fill="#f8fafc" fontSize="12.5" fontWeight="800" textAnchor="middle" fontFamily="var(--display, sans-serif)">
                    1-HOUR WARM CACHE LEASE (0.10× READ)
                  </text>
                  <text x="175" y="68" fill="#cbd5e1" fontSize="9.5" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Dispatches isolated git worktree envelopes
                  </text>
                  <text x="175" y="86" fill="#38bdf8" fontSize="9.5" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Accepts ONLY &lt;200B JSON disk receipts
                  </text>

                  <rect x="25" y="94" width="300" height="14" rx="3" fill="rgba(56, 189, 248, 0.12)" stroke="#38bdf8" strokeWidth="0.8" />
                  <text x="175" y="104.5" fill="#7dd3fc" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    Pinned 18k prefix stays 100% warm
                  </text>
                </g>

                {/* 3 Flow Streams down to Worktrees */}
                <path d="M 115 183 C 95 220, 65 250, 77 302" fill="none" stroke="#38bdf8" strokeWidth="1.75" strokeDasharray="4 4" className="omh-stream-reverse" />
                <path d="M 210 183 L 210 302" fill="none" stroke="#38bdf8" strokeWidth="1.75" strokeDasharray="4 4" className="omh-stream-reverse" />
                <path d="M 305 183 C 325 220, 355 250, 343 302" fill="none" stroke="#38bdf8" strokeWidth="1.75" strokeDasharray="4 4" className="omh-stream-reverse" />

                {/* Glowing Envelope Receipts Gliding Back */}
                <g transform="translate(18, 206)">
                  <rect width="118" height="22" rx="4" fill="#081826" stroke="#38bdf8" strokeWidth="1" />
                  <text x="59" y="14" fill="#7dd3fc" fontSize="8.2" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    &#123;&quot;status&quot;:&quot;PASS&quot;&#125;
                  </text>
                </g>
                <g transform="translate(151, 230)">
                  <rect width="118" height="22" rx="4" fill="#081826" stroke="#38bdf8" strokeWidth="1" />
                  <text x="59" y="14" fill="#7dd3fc" fontSize="8.2" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    &#123;&quot;status&quot;:&quot;PASS&quot;&#125;
                  </text>
                </g>
                <g transform="translate(284, 206)">
                  <rect width="118" height="22" rx="4" fill="#081826" stroke="#38bdf8" strokeWidth="1" />
                  <text x="59" y="14" fill="#7dd3fc" fontSize="8.2" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    &#123;&quot;status&quot;:&quot;PASS&quot;&#125;
                  </text>
                </g>

                {/* Disk Pointers Banner in Middle */}
                <g transform="translate(35, 266)">
                  <rect width="350" height="24" rx="4" fill="#0c1828" stroke="#38bdf8" strokeWidth="1" />
                  <text x="175" y="15.5" fill="#7dd3fc" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    DISK RECEIPTS: /tmp/results/lane-N.json (&lt;200B)
                  </text>
                </g>

                {/* 3 Parallel Isolated Worktrees (Side by Side) */}
                <g transform="translate(16, 302)">
                  <rect width="122" height="206" rx="8" fill="#0e1424" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x="61" y="24" fill="#38bdf8" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    LANE 1 (LUNA)
                  </text>
                  <text x="61" y="44" fill="#cbd5e1" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    .worktrees/auth
                  </text>
                  <rect x="12" y="60" width="98" height="42" rx="4" fill="#080c14" stroke="#1e293b" />
                  <text x="61" y="78" fill="#34d399" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    vitest 14/14 ✓
                  </text>
                  <text x="61" y="93" fill="#94a3b8" fontSize="7.5" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    18ms isolated
                  </text>
                  <text x="61" y="130" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    writes diff to
                  </text>
                  <text x="61" y="146" fill="#7dd3fc" fontSize="7.8" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    /tmp/lane-1.json
                  </text>
                  <rect x="16" y="165" width="90" height="26" rx="4" fill="#081826" stroke="#38bdf8" strokeWidth="1" />
                  <text x="61" y="181" fill="#bae6fd" fontSize="8.2" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    RECEIPT: 142B
                  </text>
                </g>

                <g transform="translate(149, 302)">
                  <rect width="122" height="206" rx="8" fill="#0e1424" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x="61" y="24" fill="#38bdf8" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    LANE 2 (LUNA)
                  </text>
                  <text x="61" y="44" fill="#cbd5e1" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    .worktrees/api
                  </text>
                  <rect x="12" y="60" width="98" height="42" rx="4" fill="#080c14" stroke="#1e293b" />
                  <text x="61" y="78" fill="#34d399" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    vitest 28/28 ✓
                  </text>
                  <text x="61" y="93" fill="#94a3b8" fontSize="7.5" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    24ms isolated
                  </text>
                  <text x="61" y="130" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    writes diff to
                  </text>
                  <text x="61" y="146" fill="#7dd3fc" fontSize="7.8" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    /tmp/lane-2.json
                  </text>
                  <rect x="16" y="165" width="90" height="26" rx="4" fill="#081826" stroke="#38bdf8" strokeWidth="1" />
                  <text x="61" y="181" fill="#bae6fd" fontSize="8.2" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    RECEIPT: 138B
                  </text>
                </g>

                <g transform="translate(282, 302)">
                  <rect width="122" height="206" rx="8" fill="#0e1424" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x="61" y="24" fill="#38bdf8" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    LANE 3 (LUNA)
                  </text>
                  <text x="61" y="44" fill="#cbd5e1" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    .worktrees/docs
                  </text>
                  <rect x="12" y="60" width="98" height="42" rx="4" fill="#080c14" stroke="#1e293b" />
                  <text x="61" y="78" fill="#34d399" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    vitest 9/9 ✓
                  </text>
                  <text x="61" y="93" fill="#94a3b8" fontSize="7.5" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    12ms isolated
                  </text>
                  <text x="61" y="130" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    writes diff to
                  </text>
                  <text x="61" y="146" fill="#7dd3fc" fontSize="7.8" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    /tmp/lane-3.json
                  </text>
                  <rect x="16" y="165" width="90" height="26" rx="4" fill="#081826" stroke="#38bdf8" strokeWidth="1" />
                  <text x="61" y="181" fill="#bae6fd" fontSize="8.2" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    RECEIPT: 145B
                  </text>
                </g>

                {/* Bottom Verdict Bar */}
                <g transform="translate(20, 520)">
                  <rect width="380" height="28" rx="5" fill="#081926" stroke="#38bdf8" strokeWidth="1" />
                  <text x="190" y="17.5" fill="#bae6fd" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="var(--mono, monospace)">
                    ✓ ISOLATED WORKTREES · &lt;200B RECEIPTS · ~$0.10 SPEND
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Interactive Stage Beat Pills & Timeline Scrubber */}
        <div className="omh-scrubber-bar" aria-label="Scenario timeline stages">
          <div className="omh-beats-grid">
            {activeScenario.beats.map((beat, bIdx) => {
              const isCurrent = bIdx === beatIndex;
              return (
                <button
                  key={beat.step}
                  type="button"
                  className="omh-beat-pill"
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => setBeatIndex(bIdx)}
                >
                  <span className="omh-beat-top">
                    <span>STEP {beat.step}</span>
                    <span>{beat.costDisplay}</span>
                  </span>
                  <span className="omh-beat-title">{beat.label}</span>
                  <span className="omh-beat-desc">{beat.detail}</span>
                </button>
              );
            })}
          </div>

          <div className="omh-scrubber-track-row">
            <label htmlFor={`${regionId}-scrubber`} className="omh-scrubber-label">
              Timeline Scrubber ({globalStepIndex + 1}/{totalStageSteps}):
            </label>
            <input
              id={`${regionId}-scrubber`}
              className="omh-range"
              type="range"
              min={0}
              max={totalStageSteps - 1}
              step={1}
              value={globalStepIndex}
              aria-label="Scrub across all three orchestration modes and timeline steps"
              onChange={(e) => selectGlobalStep(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Wire Payload Preview */}
        <div className="omh-wire-strip" aria-live="polite">
          <span className="omh-wire-meta">{activeScenario.wirePayload.label}</span>
          <span className="omh-wire-meta" style={{ color: activeScenario.accentHex }}>
            {activeScenario.wirePayload.verdict}
          </span>
          <code className="omh-wire-code">{activeScenario.wirePayload.code}</code>
        </div>

        {/* Live Comparison Metric Bar */}
        <div
          className="omh-metrics-bar"
          role="group"
          aria-label="Live architecture comparison metrics"
        >
          <div className="omh-metric-cell">
            <span className="omh-metric-label">Context Prefix Size</span>
            <span className="omh-metric-value">
              {activeScenario.metrics.contextPrefix.value}
            </span>
            <span className="omh-metric-sub">
              {activeScenario.metrics.contextPrefix.sub}
            </span>
            <div className="omh-metric-meter" aria-hidden="true">
              <div
                className="omh-metric-meter-fill"
                style={{ width: `${activeScenario.metrics.contextPrefix.fillPct}%` }}
              />
            </div>
            <span className="omh-metric-compare">
              {activeScenario.metrics.contextPrefix.compareLabel}
            </span>
          </div>

          <div className="omh-metric-cell">
            <span className="omh-metric-label">Cache State</span>
            <span className="omh-metric-value">
              {activeScenario.metrics.cacheState.value}
            </span>
            <span className="omh-metric-sub">
              {activeScenario.metrics.cacheState.sub}
            </span>
            <div className="omh-metric-meter" aria-hidden="true">
              <div
                className="omh-metric-meter-fill"
                style={{ width: `${activeScenario.metrics.cacheState.fillPct}%` }}
              />
            </div>
            <span className="omh-metric-compare">
              {activeScenario.metrics.cacheState.compareLabel}
            </span>
          </div>

          <div className="omh-metric-cell">
            <span className="omh-metric-label">Coordination Overhead</span>
            <span className="omh-metric-value">
              {activeScenario.metrics.coordinationOverhead.value}
            </span>
            <span className="omh-metric-sub">
              {activeScenario.metrics.coordinationOverhead.sub}
            </span>
            <div className="omh-metric-meter" aria-hidden="true">
              <div
                className="omh-metric-meter-fill"
                style={{ width: `${activeScenario.metrics.coordinationOverhead.fillPct}%` }}
              />
            </div>
            <span className="omh-metric-compare">
              {activeScenario.metrics.coordinationOverhead.compareLabel}
            </span>
          </div>

          <div className="omh-metric-cell">
            <span className="omh-metric-label">Estimated Spend</span>
            <span className="omh-metric-value">
              {activeScenario.metrics.estimatedSpend.value}
            </span>
            <span className="omh-metric-sub">
              {activeScenario.metrics.estimatedSpend.sub}
            </span>
            <div className="omh-metric-meter" aria-hidden="true">
              <div
                className="omh-metric-meter-fill"
                style={{ width: `${activeScenario.metrics.estimatedSpend.fillPct}%` }}
              />
            </div>
            <span className="omh-metric-compare">
              {activeScenario.metrics.estimatedSpend.compareLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrchestrationMotionHook;
