import React from "react";

// ============================================================================
// 1. MobileFigureFourArtifacts (viewBox="0 0 420 780")
// ============================================================================
export function MobileFigureFourArtifacts() {
  return (
    <svg
      viewBox="0 0 420 780"
      role="img"
      aria-labelledby="m4a-title m4a-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="m4a-title">4-Tier Artifact Pipeline (Mobile)</title>
      <desc id="m4a-desc">
        Vertical 4-tier pipeline illustrating intent.md flowing through spec.md and plan.md into code diff,
        with a direct residual skip-connection pinning Tier 0 invariants into pre-commit verification.
      </desc>

      <defs>
        <marker id="m4a-arr-cyan" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#38bdf8" />
        </marker>
        <marker id="m4a-arr-amber" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#fbbf24" />
        </marker>
        <marker id="m4a-arr-emerald" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#34d399" />
        </marker>
      </defs>

      <rect width="420" height="780" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header Block */}
      <text x="210" y="28" textAnchor="middle" fill="#f8fafc" fontSize="13.5" fontWeight="800" letterSpacing="0.3">
        THE 4-TIER ARTIFACT CHAIN
      </text>
      <text x="210" y="46" textAnchor="middle" fill="#94a3b8" fontSize="10.5">
        INTENT.MD to Code Diff with Residual Skip-Connection
      </text>

      {/* Tier 0: INTENT.MD */}
      <g transform="translate(16, 62)">
        <rect width="388" height="114" rx="10" fill="#091322" stroke="#0284c7" strokeWidth="1.4" />
        <path d="M 0 10 Q 0 0 10 0 L 378 0 Q 388 0 388 10 L 388 28 L 0 28 Z" fill="#0c2b48" />
        <circle cx="16" cy="14" r="4" fill="#38bdf8" />
        <text x="28" y="19" fill="#e0f2fe" fontSize="11" fontWeight="800" fontFamily="monospace">
          TIER 0 · INTENT.MD
        </text>
        <rect x="270" y="6" width="108" height="16" rx="4" fill="#0369a1" />
        <text x="324" y="18" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="800">
          HUMAN RATIFIED
        </text>
        <text x="14" y="46" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#38bdf8" fontWeight="700">Outcome &amp; Non-Goals:</tspan> Strategic target + negative boundaries
        </text>
        <text x="14" y="64" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#f1f5f9" fontWeight="600">Invariants:</tspan> Zero external calls on hot path; no DB migration
        </text>
        <text x="14" y="82" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#f1f5f9" fontWeight="600">Discipline:</tspan> 50-Line Budget strictly enforced; zero fluff
        </text>
        <rect x="14" y="92" width="360" height="14" rx="3" fill="#06182c" />
        <text x="194" y="103" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="800">
          ★ Pinned into agent context as immutable ground truth
        </text>
      </g>

      <line x1="210" y1="176" x2="210" y2="204" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="3 2" markerEnd="url(#m4a-arr-cyan)" />
      <rect x="150" y="182" width="120" height="16" rx="4" fill="#081b33" stroke="#0284c7" strokeWidth="0.8" />
      <text x="210" y="193" textAnchor="middle" fill="#7dd3fc" fontSize="8.5" fontWeight="700">
        Hop 1: Schema Spec ↓
      </text>

      {/* Tier 1: SPEC.MD */}
      <g transform="translate(16, 206)">
        <rect width="388" height="106" rx="10" fill="#091424" stroke="#38bdf8" strokeWidth="1.4" />
        <path d="M 0 10 Q 0 0 10 0 L 378 0 Q 388 0 388 10 L 388 28 L 0 28 Z" fill="#0d2844" />
        <circle cx="16" cy="14" r="4" fill="#38bdf8" />
        <text x="28" y="19" fill="#f0f9ff" fontSize="11" fontWeight="800" fontFamily="monospace">
          TIER 1 · SPEC.MD
        </text>
        <rect x="264" y="6" width="114" height="16" rx="4" fill="#0284c7" />
        <text x="321" y="18" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="800">
          SKILL CONSTRAINED
        </text>
        <text x="14" y="46" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#38bdf8" fontWeight="700">Machine Contracts:</tspan> Input/output schemas &amp; type contracts
        </text>
        <text x="14" y="64" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#f1f5f9" fontWeight="600">Security Bounds:</tspan> Token validation logic, rate limit rules
        </text>
        <text x="14" y="82" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#f1f5f9" fontWeight="600">NFR Budgets:</tspan> Latency budget &lt; 25ms; memory delta &lt; 512B
        </text>
      </g>

      <line x1="210" y1="312" x2="210" y2="340" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="3 2" markerEnd="url(#m4a-arr-amber)" />
      <rect x="150" y="318" width="120" height="16" rx="4" fill="#241403" stroke="#d97706" strokeWidth="0.8" />
      <text x="210" y="329" textAnchor="middle" fill="#fde68a" fontSize="8.5" fontWeight="700">
        Hop 2: Plan Mode DAG ↓
      </text>

      {/* Tier 2: PLAN.MD */}
      <g transform="translate(16, 342)">
        <rect width="388" height="106" rx="10" fill="#1c1206" stroke="#d97706" strokeWidth="1.4" />
        <path d="M 0 10 Q 0 0 10 0 L 378 0 Q 388 0 388 10 L 388 28 L 0 28 Z" fill="#3a1c04" />
        <circle cx="16" cy="14" r="4" fill="#fbbf24" />
        <text x="28" y="19" fill="#fef3c7" fontSize="11" fontWeight="800" fontFamily="monospace">
          TIER 2 · PLAN.MD
        </text>
        <rect x="270" y="6" width="108" height="16" rx="4" fill="#b45309" />
        <text x="324" y="18" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="800">
          PLAN MODE GATE
        </text>
        <text x="14" y="46" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#fbbf24" fontWeight="700">Execution DAG:</tspan> Whitelisted target files &amp; modification steps
        </text>
        <text x="14" y="64" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#f1f5f9" fontWeight="600">Test Assertions:</tspan> Explicit command suite for each step
        </text>
        <text x="14" y="82" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#f1f5f9" fontWeight="600">Blast Radius:</tspan> Calibrated to task ambiguity &amp; reversibility
        </text>
      </g>

      <line x1="210" y1="448" x2="210" y2="476" stroke="#34d399" strokeWidth="1.8" strokeDasharray="3 2" markerEnd="url(#m4a-arr-emerald)" />
      <rect x="150" y="454" width="120" height="16" rx="4" fill="#042016" stroke="#059669" strokeWidth="0.8" />
      <text x="210" y="465" textAnchor="middle" fill="#6ee7b7" fontSize="8.5" fontWeight="700">
        Hop 3: Code Diff ↓
      </text>

      {/* Tier 3: CODE DIFF */}
      <g transform="translate(16, 478)">
        <rect width="388" height="114" rx="10" fill="#071b12" stroke="#059669" strokeWidth="1.4" />
        <path d="M 0 10 Q 0 0 10 0 L 378 0 Q 388 0 388 10 L 388 28 L 0 28 Z" fill="#0d3522" />
        <circle cx="16" cy="14" r="4" fill="#34d399" />
        <text x="28" y="19" fill="#d1fae5" fontSize="11" fontWeight="800" fontFamily="monospace">
          TIER 3 · CODE DIFF
        </text>
        <rect x="270" y="6" width="108" height="16" rx="4" fill="#047857" />
        <text x="324" y="18" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="800">
          AGENT CODE GEN
        </text>
        <text x="14" y="46" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#34d399" fontWeight="700">AST Mutations:</tspan> Concrete code authored in seconds (&lt; 10s)
        </text>
        <text x="14" y="64" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#f1f5f9" fontWeight="600">Test Additions:</tspan> TDD assertions compile and pass cleanly
        </text>
        <text x="14" y="82" fill="#cbd5e1" fontSize="10.5">
          • <tspan fill="#f1f5f9" fontWeight="600">Compiler Verification:</tspan> Clean typecheck &amp; strict linter run
        </text>
        <rect x="14" y="92" width="360" height="14" rx="3" fill="#041f14" />
        <text x="194" y="103" textAnchor="middle" fill="#34d399" fontSize="8.5" fontWeight="800">
          RECEIVING TIER 0 INVARIANTS DIRECTLY (Zero Semantic Dropout)
        </text>
      </g>

      {/* CI Verifier Gate */}
      <g transform="translate(16, 608)">
        <rect width="388" height="106" rx="10" fill="#0d111d" stroke="#ec4899" strokeWidth="1.4" />
        <path d="M 0 10 Q 0 0 10 0 L 378 0 Q 388 0 388 10 L 388 28 L 0 28 Z" fill="#2a0c1e" />
        <circle cx="16" cy="14" r="4" fill="#ec4899" />
        <text x="28" y="19" fill="#fce7f3" fontSize="10.5" fontWeight="800">
          PRE-COMMIT GATE: Δ(Code Diff, intent.md)
        </text>
        <rect x="286" y="6" width="92" height="16" rx="4" fill="#be185d" />
        <text x="332" y="18" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="800">
          ZERO BREACHES
        </text>
        <text x="14" y="48" fill="#f472b6" fontSize="10" fontWeight="700" fontFamily="monospace">
          assert(Δ(AST_Diff, Tier0_Invariants) == ∅)
        </text>
        <text x="14" y="68" fill="#cbd5e1" fontSize="10">
          • <tspan fill="#34d399" fontWeight="700">Pass Condition:</tspan> Zero scope violations, clean AST diff
        </text>
        <text x="14" y="86" fill="#94a3b8" fontSize="9.5">
          • Blocks synthetic spec slop before pull request merge
        </text>
      </g>

      {/* Provenance */}
      <text x="210" y="746" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Spec-driven 4-tier pipeline &amp; residual invariant rail · Gaia Research
      </text>
    </svg>
  );
}

// ============================================================================
// 2. MobileFigureDiffBridge (viewBox="0 0 420 840")
// ============================================================================
export function MobileFigureDiffBridge() {
  return (
    <svg
      viewBox="0 0 420 840"
      role="img"
      aria-labelledby="mdb-title mdb-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="mdb-title">Spec Verification Gate (Mobile)</title>
      <desc id="mdb-desc">
        Vertical verification bridge showing candidate code diff and spec invariants feeding into a
        deterministic verification engine, splitting into clean merge or blocked PR.
      </desc>
      <defs>
        <marker id="mdb-arr-green" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#34d399" />
        </marker>
        <marker id="mdb-arr-rose" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#f87171" />
        </marker>
      </defs>

      <rect width="420" height="840" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header */}
      <text x="210" y="28" textAnchor="middle" fill="#f8fafc" fontSize="13.5" fontWeight="800" letterSpacing="0.3">
        SPEC VERIFICATION GATE
      </text>
      <text x="210" y="46" textAnchor="middle" fill="#94a3b8" fontSize="10.5">
        Compiling Upstream Intent into Pre-Merge Verification
      </text>

      {/* Top 2 Inputs Stacked Vertically */}
      <g transform="translate(16, 62)">
        <rect width="388" height="68" rx="9" fill="#081526" stroke="#0284c7" strokeWidth="1.2" />
        <rect width="388" height="22" rx="9" fill="#0c2744" />
        <circle cx="14" cy="11" r="3.5" fill="#38bdf8" />
        <text x="24" y="15" fill="#e0f2fe" fontSize="10" fontWeight="800">
          INPUT 1: SPEC &amp; INVARIANTS (Tier 0)
        </text>
        <text x="14" y="38" fill="#cbd5e1" fontSize="10">
          • Hard non-goals, schema interfaces &amp; memory budget rules
        </text>
        <text x="14" y="54" fill="#94a3b8" fontSize="9.5">
          Source: Tier 0 intent.md ratified specification
        </text>
      </g>

      <g transform="translate(16, 138)">
        <rect width="388" height="68" rx="9" fill="#091424" stroke="#38bdf8" strokeWidth="1.2" />
        <rect width="388" height="22" rx="9" fill="#0c2744" />
        <circle cx="14" cy="11" r="3.5" fill="#38bdf8" />
        <text x="24" y="15" fill="#f0f9ff" fontSize="10" fontWeight="800">
          INPUT 2: CANDIDATE AGENT DIFF
        </text>
        <text x="14" y="38" fill="#cbd5e1" fontSize="10">
          • Concrete AST mutations, touch files &amp; newly generated tests
        </text>
        <text x="14" y="54" fill="#94a3b8" fontSize="9.5">
          Source: Coding Agent Loop (fast-path generation)
        </text>
      </g>

      {/* Middle Layer: Verification Engine */}
      <g transform="translate(16, 218)">
        <rect width="388" height="248" rx="12" fill="#090d16" stroke="#38bdf8" strokeWidth="1.4" />
        <path d="M 0 12 Q 0 0 12 0 L 376 0 Q 388 0 388 12 L 388 32 L 0 32 Z" fill="#0f2942" />
        <circle cx="16" cy="16" r="4.5" fill="#38bdf8" />
        <text x="28" y="20" fill="#f0f9ff" fontSize="11" fontWeight="800">
          VERIFICATION ENGINE: Δ(Diff, intent.md)
        </text>
        <rect x="296" y="7" width="80" height="18" rx="4" fill="#0369a1" />
        <text x="336" y="19" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
          DETERMINISTIC
        </text>

        {/* 3 Tracks */}
        <g transform="translate(12, 42)">
          <rect width="364" height="54" rx="6" fill="#06121f" stroke="#1e3a5f" strokeWidth="1" />
          <text x="12" y="20" fill="#7dd3fc" fontSize="10" fontWeight="800">
            1. AST SCOPE &amp; FILE WHITELIST CHECK
          </text>
          <text x="12" y="36" fill="#cbd5e1" fontSize="9.5">
            Validates touched files against plan.md DAG.
          </text>
          <text x="12" y="48" fill="#f87171" fontSize="9" fontWeight="600">
            Reject if diff touches unapproved modules (e.g. auth DB).
          </text>
        </g>

        <g transform="translate(12, 104)">
          <rect width="364" height="54" rx="6" fill="#08182a" stroke="#1e3a5f" strokeWidth="1" />
          <text x="12" y="20" fill="#38bdf8" fontSize="10" fontWeight="800">
            2. LINTER &amp; DEPENDENCY FIREWALL
          </text>
          <text x="12" y="36" fill="#cbd5e1" fontSize="9.5">
            Strict linter + package scanner checks package.json.
          </text>
          <text x="12" y="48" fill="#f87171" fontSize="9" fontWeight="600">
            Reject unauthorized npm imports not in specification.
          </text>
        </g>

        <g transform="translate(12, 166)">
          <rect width="364" height="54" rx="6" fill="#041812" stroke="#134e38" strokeWidth="1" />
          <text x="12" y="20" fill="#6ee7b7" fontSize="10" fontWeight="800">
            3. TDD INVARIANT &amp; BENCHMARK RUNNER
          </text>
          <text x="12" y="36" fill="#cbd5e1" fontSize="9.5">
            Executes verification suite (e.g., npm run test).
          </text>
          <text x="12" y="48" fill="#34d399" fontSize="9" fontWeight="600">
            Asserts 0 external network calls; memory delta &lt; 512 bytes.
          </text>
        </g>

        <rect x="12" y="224" width="364" height="18" rx="4" fill="#020813" />
        <text x="194" y="236" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
          DECISION: Invariants Satisfied ∧ Scope In Bounds ∧ Tests Pass
        </text>
      </g>

      {/* Dual Outcomes Stacked Vertically */}
      <g transform="translate(16, 480)">
        <rect width="388" height="136" rx="10" fill="#071b12" stroke="#059669" strokeWidth="1.4" />
        <rect width="388" height="24" rx="10" fill="#0d3824" />
        <circle cx="14" cy="12" r="4" fill="#34d399" />
        <text x="26" y="16" fill="#d1fae5" fontSize="10.5" fontWeight="800">
          OUTCOME A: CLEAN PR MERGE
        </text>
        <rect x="300" y="4" width="76" height="16" rx="3" fill="#047857" />
        <text x="338" y="15" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
          APPROVED
        </text>
        <text x="14" y="44" fill="#6ee7b7" fontSize="9.5" fontWeight="700">
          ✓ 0 Invariant Breaches · AST within approved DAG
        </text>
        <text x="14" y="60" fill="#cbd5e1" fontSize="9.5">
          • All TDD assertions green · Zero forbidden file touches
        </text>
        <rect x="14" y="74" width="360" height="24" rx="5" fill="#047857" />
        <text x="194" y="89" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
          ✓ Fast-Forward Merge to Main
        </text>
        <text x="194" y="118" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="600">
          Continuous delivery ready with verified receipt
        </text>
      </g>

      <g transform="translate(16, 626)">
        <rect width="388" height="136" rx="10" fill="#1c070c" stroke="#e11d48" strokeWidth="1.4" />
        <rect width="388" height="24" rx="10" fill="#3a0c16" />
        <circle cx="14" cy="12" r="4" fill="#f87171" />
        <text x="26" y="16" fill="#ffe4e6" fontSize="10.5" fontWeight="800">
          OUTCOME B: BLOCKED PR GATE
        </text>
        <rect x="300" y="4" width="76" height="16" rx="3" fill="#be123c" />
        <text x="338" y="15" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
          REJECTED
        </text>
        <text x="14" y="44" fill="#f87171" fontSize="9.5" fontWeight="700">
          ✗ Scope Creep Detected · Touched unwhitelisted module
        </text>
        <text x="14" y="60" fill="#cbd5e1" fontSize="9.5">
          • Violates Tier 0 non-goal · Unauthorized dependencies
        </text>
        <rect x="14" y="74" width="360" height="24" rx="5" fill="#be123c" />
        <text x="194" y="89" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
          ✗ Rollback &amp; Emit Failure Telemetry
        </text>
        <text x="194" y="118" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">
          Feeds deterministic diagnostic trace back to agent loop
        </text>
      </g>

      {/* Provenance */}
      <text x="210" y="806" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Invariant verification engine &amp; merge gates · Gaia Research
      </text>
    </svg>
  );
}

// ============================================================================
// 3. MobileFigureFailureModes (viewBox="0 0 420 860")
// ============================================================================
export function MobileFigureFailureModes() {
  return (
    <svg
      viewBox="0 0 420 860"
      role="img"
      aria-labelledby="mfm-title mfm-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="mfm-title">Three Critical Failure Modes in Spec-Driven Agent SDLC (Mobile)</title>
      <desc id="mfm-desc">
        Three stacked failure mode cards illustrating Scope Creep, Silent Degradation, and Spec Drift,
        detailing root causes, failure impacts, and engineering remedies.
      </desc>

      <rect width="420" height="860" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header */}
      <text x="210" y="28" textAnchor="middle" fill="#f8fafc" fontSize="13.5" fontWeight="800" letterSpacing="0.3">
        THREE CRITICAL FAILURE MODES
      </text>
      <text x="210" y="46" textAnchor="middle" fill="#94a3b8" fontSize="10.5">
        Root Causes, Systemic Impacts, and Hardening Remedies
      </text>

      {/* Card 1: SCOPE CREEP */}
      <g transform="translate(16, 62)">
        <rect width="388" height="236" rx="12" fill="#13090e" stroke="#f87171" strokeWidth="1.3" />
        <path d="M 0 12 Q 0 0 12 0 L 376 0 Q 388 0 388 12 L 388 32 L 0 32 Z" fill="#2d0a15" />
        <circle cx="16" cy="16" r="4.5" fill="#f87171" />
        <text x="28" y="20" fill="#ffe4e6" fontSize="11" fontWeight="800">
          01 · SCOPE CREEP &amp; SPEC SLOP
        </text>
        <rect x="296" y="7" width="82" height="18" rx="4" fill="#9f1239" />
        <text x="337" y="19" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
          ANTIPATTERN
        </text>

        <g transform="translate(12, 40)">
          <rect width="364" height="42" rx="6" fill="#1f0a12" stroke="#4c0519" strokeWidth="0.8" />
          <text x="10" y="16" fill="#fca5a5" fontSize="9.5" fontWeight="800">
            ROOT CAUSE: Unbounded Spec Self-Prompting
          </text>
          <text x="10" y="32" fill="#cbd5e1" fontSize="9">
            Agent generates 500 lines of defensive boilerplate; humans vibe-approve.
          </text>
        </g>

        <g transform="translate(12, 88)">
          <rect width="364" height="42" rx="6" fill="#18070e" stroke="#4c0519" strokeWidth="0.8" />
          <text x="10" y="16" fill="#f87171" fontSize="9.5" fontWeight="800">
            IMPACT: Phantom Architecture &amp; Rogue Mutations
          </text>
          <text x="10" y="32" fill="#cbd5e1" fontSize="9">
            Downstream agents treat hallucinated details as gospel; rewrite core DBs.
          </text>
        </g>

        <g transform="translate(12, 136)">
          <rect width="364" height="88" rx="8" fill="#062217" stroke="#059669" strokeWidth="1.2" />
          <rect x="10" y="8" width="68" height="16" rx="3" fill="#047857" />
          <text x="44" y="19" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
            REMEDY
          </text>
          <text x="86" y="20" fill="#6ee7b7" fontSize="9.5" fontWeight="800">
            50-Line Budget + Explicit Non-Goals
          </text>
          <text x="10" y="42" fill="#e2e8f0" fontSize="9.5">
            • Cap intent.md strictly at 50 lines: hard boundaries only.
          </text>
          <text x="10" y="58" fill="#e2e8f0" fontSize="9.5">
            • Document explicit non-goals (&quot;MUST NOT migrate auth DB&quot;).
          </text>
          <text x="10" y="74" fill="#34d399" fontSize="9.5" fontWeight="700">
            • AST validator rejects PR if diff alters unwhitelisted files.
          </text>
        </g>
      </g>

      {/* Card 2: SILENT DEGRADATION */}
      <g transform="translate(16, 310)">
        <rect width="388" height="236" rx="12" fill="#140f06" stroke="#fbbf24" strokeWidth="1.3" />
        <path d="M 0 12 Q 0 0 12 0 L 376 0 Q 388 0 388 12 L 388 32 L 0 32 Z" fill="#382004" />
        <circle cx="16" cy="16" r="4.5" fill="#fbbf24" />
        <text x="28" y="20" fill="#fef3c7" fontSize="11" fontWeight="800">
          02 · SILENT DEGRADATION (TELEPHONE 2.0)
        </text>
        <rect x="296" y="7" width="82" height="18" rx="4" fill="#b45309" />
        <text x="337" y="19" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
          ANTIPATTERN
        </text>

        <g transform="translate(12, 40)">
          <rect width="364" height="42" rx="6" fill="#241403" stroke="#522a04" strokeWidth="0.8" />
          <text x="10" y="16" fill="#fcd34d" fontSize="9.5" fontWeight="800">
            ROOT CAUSE: Multi-Hop Generative Semantic Loss
          </text>
          <text x="10" y="32" fill="#cbd5e1" fontSize="9">
            Negative constraints vanish during progressive summarization steps.
          </text>
        </g>

        <g transform="translate(12, 88)">
          <rect width="364" height="42" rx="6" fill="#1c0f02" stroke="#522a04" strokeWidth="0.8" />
          <text x="10" y="16" fill="#f59e0b" fontSize="9.5" fontWeight="800">
            IMPACT: Invariant Breach at Code Generation
          </text>
          <text x="10" y="32" fill="#cbd5e1" fontSize="9">
            Coding agent executes positive task list only; negative guards are lost.
          </text>
        </g>

        <g transform="translate(12, 136)">
          <rect width="364" height="88" rx="8" fill="#062217" stroke="#059669" strokeWidth="1.2" />
          <rect x="10" y="8" width="68" height="16" rx="3" fill="#047857" />
          <text x="44" y="19" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
            REMEDY
          </text>
          <text x="86" y="20" fill="#6ee7b7" fontSize="9.5" fontWeight="800">
            Residual Skip-Connection into Tier 3 Coding Prompt
          </text>
          <text x="10" y="42" fill="#e2e8f0" fontSize="9.5">
            • Inject raw Tier 0 invariants directly into Tier 3 prompt.
          </text>
          <text x="10" y="58" fill="#e2e8f0" fontSize="9.5">
            • Deterministic pre-commit gate evaluates Δ(Code Diff, intent.md).
          </text>
          <text x="10" y="74" fill="#34d399" fontSize="9.5" fontWeight="700">
            • Compiler and linter treat invariant breaches as fatal errors.
          </text>
        </g>
      </g>

      {/* Card 3: SPEC DRIFT */}
      <g transform="translate(16, 558)">
        <rect width="388" height="236" rx="12" fill="#091322" stroke="#38bdf8" strokeWidth="1.3" />
        <path d="M 0 12 Q 0 0 12 0 L 376 0 Q 388 0 388 12 L 388 32 L 0 32 Z" fill="#0c2b48" />
        <circle cx="16" cy="16" r="4.5" fill="#38bdf8" />
        <text x="28" y="20" fill="#e0f2fe" fontSize="11" fontWeight="800">
          03 · SPEC DRIFT &amp; CONTEXT POLLUTION
        </text>
        <rect x="296" y="7" width="82" height="18" rx="4" fill="#0369a1" />
        <text x="337" y="19" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
          ANTIPATTERN
        </text>

        <g transform="translate(12, 40)">
          <rect width="364" height="42" rx="6" fill="#071b30" stroke="#0c3c6a" strokeWidth="0.8" />
          <text x="10" y="16" fill="#7dd3fc" fontSize="9.5" fontWeight="800">
            ROOT CAUSE: Mega-Prompts &amp; Split-Brain PRDs
          </text>
          <text x="10" y="32" fill="#cbd5e1" fontSize="9">
            Dumping 6,000+ tokens every turn dilutes attention; docs rot in Jira.
          </text>
        </g>

        <g transform="translate(12, 88)">
          <rect width="364" height="42" rx="6" fill="#051526" stroke="#0c3c6a" strokeWidth="0.8" />
          <text x="10" y="16" fill="#38bdf8" fontSize="9.5" fontWeight="800">
            IMPACT: Attention Degradation &amp; Stale Directives
          </text>
          <text x="10" y="32" fill="#cbd5e1" fontSize="9">
            Tool call precision drops 40%; agents build against stale documents.
          </text>
        </g>

        <g transform="translate(12, 136)">
          <rect width="364" height="88" rx="8" fill="#062217" stroke="#059669" strokeWidth="1.2" />
          <rect x="10" y="8" width="68" height="16" rx="3" fill="#047857" />
          <text x="44" y="19" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
            REMEDY
          </text>
          <text x="86" y="20" fill="#6ee7b7" fontSize="9.5" fontWeight="800">
            Git Single Source of Truth + Outbound Projection
          </text>
          <text x="10" y="42" fill="#e2e8f0" fontSize="9.5">
            • Git markdown is authoritative; CI syncs frontmatter to tickets.
          </text>
          <text x="10" y="58" fill="#e2e8f0" fontSize="9.5">
            • Tiered governance: ephemeral issue intent for small PRs.
          </text>
          <text x="10" y="74" fill="#34d399" fontSize="9.5" fontWeight="700">
            • Load only relevant tier into context to preserve attention budget.
          </text>
        </g>
      </g>

      {/* Provenance */}
      <text x="210" y="830" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Autonomous agent harness antipatterns · Gaia Research
      </text>
    </svg>
  );
}
