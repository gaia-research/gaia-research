import React from "react";

// ============================================================================
// 1. MobileFigureEffortSpectrum (viewBox="0 0 420 900")
// ============================================================================
export function MobileFigureEffortSpectrum() {
  return (
    <svg
      viewBox="0 0 420 900"
      role="img"
      aria-labelledby="m-eff-title m-eff-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="m-eff-title">Reasoning Effort: A Search Budget, Not an Intelligence Slider</title>
      <desc id="m-eff-desc">
        Mobile vertical breakdown showing reasoning effort as a test-time search budget across frozen weights
        rather than an intelligence slider.
      </desc>
      <defs>
        <linearGradient id="m-eff-dial-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* Canvas Background */}
      <rect width="420" height="900" rx="14" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header */}
      <text x="210" y="28" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="800" letterSpacing="0.4">
        REASONING EFFORT: SEARCH BUDGET
      </text>
      <text x="210" y="46" textAnchor="middle" fill="#94a3b8" fontSize="11">
        Deliberation depth over frozen weights — not an intelligence slider
      </text>

      {/* False Model Banner */}
      <g id="m-eff-false-model">
        <rect x="14" y="58" width="392" height="56" rx="8" fill="#0f0910" stroke="#7f1d1d" strokeWidth="1" strokeDasharray="4 3" />
        <rect x="22" y="65" width="156" height="20" rx="4" fill="#450a0a" stroke="#dc2626" strokeWidth="0.8" />
        <text x="100" y="79" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="800" letterSpacing="0.3">
          ✕ FLAWED MODEL
        </text>
        <text x="186" y="79" fill="#fca5a5" fontSize="11" fontWeight="700">
          &quot;The Intelligence Slider&quot;
        </text>
        <rect x="312" y="65" width="86" height="20" rx="4" fill="#200d14" stroke="#ef4444" strokeWidth="0.8" />
        <text x="355" y="79" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="700">
          IQ Fixed
        </text>
        <text x="24" y="102" fill="#94a3b8" fontSize="10.5" fontWeight="600">
          &quot;Dumb&quot; Fast Mode
        </text>
        <line x1="126" y1="98" x2="276" y2="98" stroke="#475569" strokeWidth="1.5" />
        <line x1="126" y1="98" x2="276" y2="98" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" />
        <rect x="178" y="89" width="48" height="18" rx="9" fill="#2d0b14" stroke="#f87171" strokeWidth="0.8" />
        <text x="202" y="102" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="800">
          MYTH
        </text>
        <text x="286" y="102" fill="#f87171" fontSize="10.5" fontWeight="600">
          &quot;Genius&quot; Slow Mode
        </text>
      </g>

      {/* True Model Section Header */}
      <g id="m-eff-true-model-hdr">
        <rect x="14" y="122" width="392" height="30" rx="6" fill="#070e1a" stroke="#1e3a5f" strokeWidth="1" />
        <rect x="20" y="127" width="156" height="20" rx="4" fill="#0c2d48" stroke="#0284c7" strokeWidth="0.8" />
        <text x="98" y="141" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="800" letterSpacing="0.3">
          ✓ GROUND TRUTH
        </text>
        <text x="184" y="141" fill="#f8fafc" fontSize="11" fontWeight="700">
          Test-Time Search Budget
        </text>
        <text x="312" y="141" fill="#38bdf8" fontSize="10" fontWeight="700" textAnchor="end">
          0k
        </text>
        <rect x="318" y="134" width="56" height="6" rx="3" fill="url(#m-eff-dial-grad)" />
        <text x="380" y="141" fill="#ec4899" fontSize="10" fontWeight="700" textAnchor="start">
          64k+
        </text>
      </g>

      {/* 6 Effort Tier Cards */}
      {/* Tier 1: none */}
      <g id="m-eff-card-none" transform="translate(14, 158)">
        <rect width="392" height="106" rx="8" fill="#090d16" stroke="#334155" strokeWidth="1" />
        <g transform="translate(10, 10)">
          <rect width="104" height="86" rx="6" fill="#040711" stroke="#1e293b" strokeWidth="0.8" />
          <circle cx="52" cy="18" r="4" fill="#94a3b8" />
          <line x1="52" y1="22" x2="52" y2="52" stroke="#475569" strokeWidth="1.5" />
          <circle cx="52" cy="54" r="3.5" fill="#64748b" />
          <rect x="12" y="65" width="80" height="15" rx="3" fill="#0f172a" />
          <text x="52" y="76" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">
            1 direct pass
          </text>
        </g>
        <rect x="124" y="10" width="58" height="20" rx="4" fill="#1e293b" />
        <text x="153" y="24" textAnchor="middle" fill="#cbd5e1" fontSize="11.5" fontWeight="800" fontFamily="monospace">
          none
        </text>
        <rect x="188" y="10" width="80" height="20" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
        <text x="228" y="24" textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontWeight="700">
          0 tokens
        </text>
        <text x="380" y="24" textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="600">
          Greedy
        </text>
        <text x="124" y="49" fill="#f8fafc" fontSize="13" fontWeight="800">
          Direct Pass
        </text>
        <text x="124" y="68" fill="#cbd5e1" fontSize="10.5">
          Zero thinking tokens · Single forward pass
        </text>
        <text x="124" y="86" fill="#94a3b8" fontSize="10">
          Instant output without deliberative search
        </text>
      </g>

      {/* Tier 2: low */}
      <g id="m-eff-card-low" transform="translate(14, 270)">
        <rect width="392" height="106" rx="8" fill="#071322" stroke="#0284c7" strokeWidth="1.2" />
        <g transform="translate(10, 10)">
          <rect width="104" height="86" rx="6" fill="#040711" stroke="#0c2d48" strokeWidth="0.8" />
          <circle cx="52" cy="16" r="4" fill="#38bdf8" />
          <line x1="52" y1="20" x2="34" y2="44" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="52" y1="20" x2="70" y2="44" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="34" cy="46" r="3.5" fill="#38bdf8" />
          <circle cx="70" cy="46" r="3" fill="#64748b" />
          <rect x="14" y="65" width="40" height="15" rx="3" fill="#0c2d48" />
          <text x="34" y="76" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="800">
            accept
          </text>
          <rect x="58" y="65" width="40" height="15" rx="3" fill="#2d0b14" />
          <text x="78" y="76" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="700">
            prune
          </text>
        </g>
        <rect x="124" y="10" width="58" height="20" rx="4" fill="#0c2d48" stroke="#0284c7" strokeWidth="0.8" />
        <text x="153" y="24" textAnchor="middle" fill="#38bdf8" fontSize="11.5" fontWeight="800" fontFamily="monospace">
          low
        </text>
        <rect x="188" y="10" width="86" height="20" rx="4" fill="#071a2e" stroke="#0284c7" strokeWidth="0.8" />
        <text x="231" y="24" textAnchor="middle" fill="#7dd3fc" fontSize="10.5" fontWeight="700">
          ~1k tokens
        </text>
        <text x="380" y="24" textAnchor="end" fill="#38bdf8" fontSize="10" fontWeight="600">
          1-2 Checks
        </text>
        <text x="124" y="49" fill="#f8fafc" fontSize="13" fontWeight="800">
          Local Fork
        </text>
        <text x="124" y="68" fill="#cbd5e1" fontSize="10.5">
          1–2 shallow branch checks · Quick sanity filter
        </text>
        <text x="124" y="86" fill="#94a3b8" fontSize="10">
          Validates ambiguities on prompt alternatives
        </text>
      </g>

      {/* Tier 3: medium */}
      <g id="m-eff-card-medium" transform="translate(14, 382)">
        <rect width="392" height="106" rx="8" fill="#071626" stroke="#0ea5e9" strokeWidth="1.2" />
        <g transform="translate(10, 10)">
          <rect width="104" height="86" rx="6" fill="#040711" stroke="#082b45" strokeWidth="0.8" />
          <circle cx="52" cy="14" r="3.5" fill="#38bdf8" />
          <line x1="52" y1="17" x2="70" y2="34" stroke="#0ea5e9" strokeWidth="1.5" />
          <circle cx="70" cy="36" r="3" fill="#0ea5e9" />
          <line x1="70" y1="39" x2="56" y2="56" stroke="#34d399" strokeWidth="1.5" />
          <circle cx="56" cy="58" r="3.5" fill="#34d399" />
          <rect x="16" y="66" width="72" height="15" rx="3" fill="#062e1e" />
          <text x="52" y="77" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="800">
            backtrack ✓
          </text>
        </g>
        <rect x="124" y="10" width="64" height="20" rx="4" fill="#082b45" stroke="#0ea5e9" strokeWidth="0.8" />
        <text x="156" y="24" textAnchor="middle" fill="#38bdf8" fontSize="11.5" fontWeight="800" fontFamily="monospace">
          medium
        </text>
        <rect x="194" y="10" width="86" height="20" rx="4" fill="#082338" stroke="#0ea5e9" strokeWidth="0.8" />
        <text x="237" y="24" textAnchor="middle" fill="#7dd3fc" fontSize="10.5" fontWeight="700">
          ~4k tokens
        </text>
        <text x="380" y="24" textAnchor="end" fill="#34d399" fontSize="10" fontWeight="700">
          Optimal ROI
        </text>
        <text x="124" y="49" fill="#f8fafc" fontSize="13" fontWeight="800">
          Backtrack &amp; Fix
        </text>
        <text x="124" y="68" fill="#cbd5e1" fontSize="10.5">
          Multi-step verification · Branch self-correction
        </text>
        <text x="124" y="86" fill="#94a3b8" fontSize="10">
          Rolls back failed paths to locate viable fixes
        </text>
      </g>

      {/* Tier 4: high */}
      <g id="m-eff-card-high" transform="translate(14, 494)">
        <rect width="392" height="106" rx="8" fill="#190f2b" stroke="#818cf8" strokeWidth="1.2" />
        <g transform="translate(10, 10)">
          <rect width="104" height="86" rx="6" fill="#040711" stroke="#2e1045" strokeWidth="0.8" />
          <circle cx="52" cy="12" r="3" fill="#818cf8" />
          <line x1="52" y1="15" x2="28" y2="30" stroke="#818cf8" strokeWidth="1" />
          <line x1="52" y1="15" x2="76" y2="30" stroke="#818cf8" strokeWidth="1.2" />
          <circle cx="28" cy="32" r="2.5" fill="#818cf8" />
          <circle cx="76" cy="32" r="2.5" fill="#818cf8" />
          <line x1="76" y1="34" x2="88" y2="52" stroke="#818cf8" strokeWidth="1.5" />
          <circle cx="88" cy="54" r="3.5" fill="#34d399" />
          <rect x="16" y="66" width="72" height="15" rx="3" fill="#1e1438" />
          <text x="52" y="77" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontWeight="800">
            deep branch
          </text>
        </g>
        <rect x="124" y="10" width="58" height="20" rx="4" fill="#22163d" stroke="#818cf8" strokeWidth="0.8" />
        <text x="153" y="24" textAnchor="middle" fill="#a5b4fc" fontSize="11.5" fontWeight="800" fontFamily="monospace">
          high
        </text>
        <rect x="188" y="10" width="92" height="20" rx="4" fill="#1a1030" stroke="#818cf8" strokeWidth="0.8" />
        <text x="234" y="24" textAnchor="middle" fill="#c7d2fe" fontSize="10.5" fontWeight="700">
          ~16k tokens
        </text>
        <text x="380" y="24" textAnchor="end" fill="#a5b4fc" fontSize="10" fontWeight="600">
          Parallel Tree
        </text>
        <text x="124" y="49" fill="#f8fafc" fontSize="13" fontWeight="800">
          Deep Multi-Path
        </text>
        <text x="124" y="68" fill="#cbd5e1" fontSize="10.5">
          Parallel path exploration · Hypothesis refutation
        </text>
        <text x="124" y="86" fill="#94a3b8" fontSize="10">
          Prunes flawed hypotheses across competing branches
        </text>
      </g>

      {/* Tier 5: xhigh */}
      <g id="m-eff-card-xhigh" transform="translate(14, 606)">
        <rect width="392" height="106" rx="8" fill="#190a18" stroke="#f472b6" strokeWidth="1.2" />
        <g transform="translate(10, 10)">
          <rect width="104" height="86" rx="6" fill="#040711" stroke="#380d28" strokeWidth="0.8" />
          <circle cx="52" cy="10" r="3" fill="#f472b6" />
          <line x1="52" y1="13" x2="26" y2="26" stroke="#f472b6" strokeWidth="0.8" />
          <line x1="52" y1="13" x2="78" y2="26" stroke="#f472b6" strokeWidth="1" />
          <circle cx="78" cy="27" r="2.5" fill="#f472b6" />
          <line x1="78" y1="29" x2="88" y2="42" stroke="#f472b6" strokeWidth="1.2" />
          <circle cx="88" cy="43" r="2.5" fill="#34d399" />
          <line x1="88" y1="45" x2="88" y2="57" stroke="#34d399" strokeWidth="1.5" />
          <circle cx="88" cy="58" r="3.5" fill="#34d399" />
          <rect x="14" y="66" width="76" height="15" rx="3" fill="#300a22" />
          <text x="52" y="77" textAnchor="middle" fill="#f472b6" fontSize="8.5" fontWeight="800">
            extended search
          </text>
        </g>
        <rect x="124" y="10" width="64" height="20" rx="4" fill="#380d28" stroke="#f472b6" strokeWidth="0.8" />
        <text x="156" y="24" textAnchor="middle" fill="#f472b6" fontSize="11.5" fontWeight="800" fontFamily="monospace">
          xhigh
        </text>
        <rect x="194" y="10" width="92" height="20" rx="4" fill="#2d0a22" stroke="#f472b6" strokeWidth="0.8" />
        <text x="240" y="24" textAnchor="middle" fill="#fbcfe8" fontSize="10.5" fontWeight="700">
          ~32k tokens
        </text>
        <text x="380" y="24" textAnchor="end" fill="#f472b6" fontSize="10" fontWeight="600">
          Deep CoT
        </text>
        <text x="124" y="49" fill="#f8fafc" fontSize="13" fontWeight="800">
          Deep Exploration
        </text>
        <text x="124" y="68" fill="#cbd5e1" fontSize="10.5">
          Extended CoT budget · Complex multi-file logic
        </text>
        <text x="124" y="86" fill="#94a3b8" fontSize="10">
          Exhaustive branch validation across interrelated modules
        </text>
      </g>

      {/* Tier 6: max */}
      <g id="m-eff-card-max" transform="translate(14, 718)">
        <rect width="392" height="106" rx="8" fill="#1f0a1c" stroke="#ec4899" strokeWidth="1.5" />
        <g transform="translate(10, 10)">
          <rect width="104" height="86" rx="6" fill="#040711" stroke="#3b0a27" strokeWidth="0.8" />
          <circle cx="52" cy="10" r="3" fill="#ec4899" />
          <line x1="52" y1="12" x2="22" y2="24" stroke="#ec4899" strokeWidth="0.8" />
          <line x1="52" y1="12" x2="82" y2="24" stroke="#ec4899" strokeWidth="1.2" />
          <circle cx="82" cy="25" r="2.5" fill="#ec4899" />
          <line x1="82" y1="27" x2="90" y2="40" stroke="#ec4899" strokeWidth="1.5" />
          <circle cx="90" cy="42" r="2.5" fill="#34d399" />
          <line x1="90" y1="44" x2="90" y2="56" stroke="#34d399" strokeWidth="2" />
          <circle cx="90" cy="58" r="4" fill="#34d399" stroke="#fbbf24" strokeWidth="1.5" />
          <rect x="14" y="66" width="76" height="15" rx="3" fill="#2d051d" />
          <text x="52" y="77" textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontWeight="800">
            frontier search
          </text>
        </g>
        <rect x="124" y="10" width="58" height="20" rx="4" fill="#3b0a27" stroke="#ec4899" strokeWidth="0.8" />
        <text x="153" y="24" textAnchor="middle" fill="#ec4899" fontSize="11.5" fontWeight="800" fontFamily="monospace">
          max
        </text>
        <rect x="188" y="10" width="98" height="20" rx="4" fill="#330822" stroke="#ec4899" strokeWidth="0.8" />
        <text x="237" y="24" textAnchor="middle" fill="#f472b6" fontSize="10.5" fontWeight="700">
          ~64k+ tokens
        </text>
        <text x="380" y="24" textAnchor="end" fill="#fbbf24" fontSize="10" fontWeight="800">
          Frontier
        </text>
        <text x="124" y="49" fill="#f8fafc" fontSize="13" fontWeight="800">
          Frontier Search
        </text>
        <text x="124" y="68" fill="#cbd5e1" fontSize="10.5">
          Exhaustive deliberation budget · Deepest search
        </text>
        <text x="124" y="86" fill="#94a3b8" fontSize="10">
          Full tree expansion across frozen model weights
        </text>
      </g>

      {/* Bottom Summary Bar */}
      <rect x="14" y="832" width="392" height="36" rx="6" fill="#070e1a" stroke="#1e3a5f" strokeWidth="1" />
      <text x="210" y="848" textAnchor="middle" fill="#38bdf8" fontSize="10.5" fontWeight="800">
        PRINCIPLE: DELIBERATION SCALES DEPTH, NOT IQ
      </text>
      <text x="210" y="861" textAnchor="middle" fill="#94a3b8" fontSize="9.5">
        Weights are frozen · Search tokens purchase branch verification
      </text>

      {/* Provenance */}
      <text x="210" y="885" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Conceptual search depth analogues · Gaia Research
      </text>
    </svg>
  );
}

// ============================================================================
// 2. MobileFigureWhatsMissing (viewBox="0 0 420 860")
// ============================================================================
export function MobileFigureWhatsMissing() {
  return (
    <svg
      viewBox="0 0 420 860"
      role="img"
      aria-labelledby="m-wm-title m-wm-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="m-wm-title">Triage the Bottleneck: What Is Actually Missing?</title>
      <desc id="m-wm-desc">
        Mobile vertical triage flow mapping facts, inference, and confidence to their root bottlenecks,
        anti-pattern traps, and proper engineering actions.
      </desc>
      <defs>
        <marker id="m-wm-arr-cyan" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#38bdf8" />
        </marker>
        <marker id="m-wm-arr-pink" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#ec4899" />
        </marker>
        <marker id="m-wm-arr-green" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#34d399" />
        </marker>
      </defs>

      <rect width="420" height="860" rx="14" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header */}
      <text x="210" y="28" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="800" letterSpacing="0.4">
        WHAT&apos;S MISSING? TRIAGE THE GAP
      </text>
      <text x="210" y="46" textAnchor="middle" fill="#94a3b8" fontSize="11">
        Isolate evidence, deduction, or proof before allocating compute
      </text>

      {/* Root Node */}
      <g id="m-wm-root">
        <rect x="14" y="58" width="392" height="44" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
        <circle cx="28" cy="80" r="4" fill="#38bdf8" />
        <circle cx="40" cy="80" r="4" fill="#ec4899" />
        <circle cx="52" cy="80" r="4" fill="#34d399" />
        <text x="220" y="75" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="800" letterSpacing="0.3">
          IDENTIFY THE LIMITING FACTOR FIRST
        </text>
        <text x="220" y="91" textAnchor="middle" fill="#94a3b8" fontSize="10">
          Match the bottleneck to the exact execution tool
        </text>
      </g>

      {/* Downward Connector to Card 1 */}
      <line x1="210" y1="102" x2="210" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#m-wm-arr-cyan)" />

      {/* Card 1: FACTS */}
      <g id="m-wm-card-facts" transform="translate(14, 122)">
        <rect width="392" height="190" rx="10" fill="#061220" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M 0 10 Q 0 0 10 0 L 382 0 Q 392 0 392 10 L 392 34 L 0 34 Z" fill="#0c2338" />
        <rect x="10" y="7" width="80" height="20" rx="4" fill="#073a5a" stroke="#0284c7" strokeWidth="0.8" />
        <text x="50" y="21" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="800">
          1. FACTS
        </text>
        <text x="98" y="21" fill="#cbd5e1" fontSize="11" fontWeight="600">
          Missing Evidence
        </text>
        <rect x="296" y="7" width="86" height="20" rx="4" fill="#081a2e" stroke="#1e3a5f" strokeWidth="0.8" />
        <text x="339" y="21" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="800">
          RETRIEVE
        </text>

        {/* Root Bottleneck Box */}
        <rect x="10" y="42" width="372" height="42" rx="6" fill="#081a2e" stroke="#1e3a5f" strokeWidth="1" />
        <text x="18" y="56" fill="#38bdf8" fontSize="10" fontWeight="700">
          ROOT BOTTLENECK:
        </text>
        <text x="18" y="72" fill="#e2e8f0" fontSize="10.5">
          Model lacks current repo files, schemas, or docs.
        </text>

        <text x="12" y="99" fill="#f87171" fontSize="10" fontWeight="600">
          ⚠️ Trap: Thinking harder cannot invent unobserved files
        </text>

        {/* Action Box */}
        <rect x="10" y="106" width="372" height="74" rx="8" fill="#0a2a44" stroke="#38bdf8" strokeWidth="1.2" />
        <text x="20" y="125" fill="#38bdf8" fontSize="12" fontWeight="800">
          ACTION: RETRIEVE VIA TOOLS
        </text>
        <rect x="268" y="112" width="104" height="18" rx="4" fill="#073a5a" />
        <text x="320" y="125" textAnchor="middle" fill="#7dd3fc" fontSize="9.5" fontWeight="700">
          0 Tokens · Fast
        </text>
        <text x="20" y="145" fill="#cbd5e1" fontSize="10.5">
          Tools: grep, read, bash, git, file inspection
        </text>
        <text x="20" y="163" fill="#7dd3fc" fontSize="10">
          Acquires ground truth before any CoT reasoning begins
        </text>
      </g>

      {/* Downward Connector to Card 2 */}
      <line x1="210" y1="312" x2="210" y2="340" stroke="#ec4899" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#m-wm-arr-pink)" />
      <rect x="146" y="318" width="128" height="18" rx="9" fill="#180716" stroke="#ec4899" strokeWidth="0.8" />
      <text x="210" y="330" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="800">
        EVIDENCE IN HAND ▼
      </text>

      {/* Card 2: INFERENCE */}
      <g id="m-wm-card-inference" transform="translate(14, 344)">
        <rect width="392" height="190" rx="10" fill="#180716" stroke="#ec4899" strokeWidth="1.5" />
        <path d="M 0 10 Q 0 0 10 0 L 382 0 Q 392 0 392 10 L 392 34 L 0 34 Z" fill="#320d2c" />
        <rect x="10" y="7" width="96" height="20" rx="4" fill="#240c20" stroke="#ec4899" strokeWidth="0.8" />
        <text x="58" y="21" textAnchor="middle" fill="#f472b6" fontSize="11" fontWeight="800">
          2. INFERENCE
        </text>
        <text x="114" y="21" fill="#cbd5e1" fontSize="11" fontWeight="600">
          Multi-Step Logic
        </text>
        <rect x="296" y="7" width="86" height="20" rx="4" fill="#240c20" stroke="#4c183e" strokeWidth="0.8" />
        <text x="339" y="21" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="800">
          REASON
        </text>

        {/* Root Bottleneck Box */}
        <rect x="10" y="42" width="372" height="42" rx="6" fill="#240c20" stroke="#4c183e" strokeWidth="1" />
        <text x="18" y="56" fill="#ec4899" fontSize="10" fontWeight="700">
          ROOT BOTTLENECK:
        </text>
        <text x="18" y="72" fill="#e2e8f0" fontSize="10.5">
          Evidence present, but multi-step deduction required.
        </text>

        <text x="12" y="99" fill="#f87171" fontSize="10" fontWeight="600">
          ⚠️ Trap: Dumping more raw context won&apos;t solve logic
        </text>

        {/* Action Box */}
        <rect x="10" y="106" width="372" height="74" rx="8" fill="#3b0f34" stroke="#ec4899" strokeWidth="1.2" />
        <text x="20" y="125" fill="#ec4899" fontSize="12" fontWeight="800">
          ACTION: REASON VIA TOKENS
        </text>
        <rect x="264" y="112" width="108" height="18" rx="4" fill="#521345" />
        <text x="318" y="125" textAnchor="middle" fill="#fbcfe8" fontSize="9.5" fontWeight="700">
          Compute-Bound
        </text>
        <text x="20" y="145" fill="#cbd5e1" fontSize="10.5">
          Tools: Reasoning tokens, Chain-of-Thought, search
        </text>
        <text x="20" y="163" fill="#f472b6" fontSize="10">
          Spends search budget to solve constraints and edge cases
        </text>
      </g>

      {/* Downward Connector to Card 3 */}
      <line x1="210" y1="534" x2="210" y2="562" stroke="#34d399" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#m-wm-arr-green)" />
      <rect x="150" y="540" width="120" height="18" rx="9" fill="#04160f" stroke="#34d399" strokeWidth="0.8" />
      <text x="210" y="552" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="800">
        PLAN DRAFTED ▼
      </text>

      {/* Card 3: CONFIDENCE */}
      <g id="m-wm-card-confidence" transform="translate(14, 566)">
        <rect width="392" height="190" rx="10" fill="#04160f" stroke="#34d399" strokeWidth="1.5" />
        <path d="M 0 10 Q 0 0 10 0 L 382 0 Q 392 0 392 10 L 392 34 L 0 34 Z" fill="#072d1f" />
        <rect x="10" y="7" width="110" height="20" rx="4" fill="#0c4a32" stroke="#34d399" strokeWidth="0.8" />
        <text x="65" y="21" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="800">
          3. CONFIDENCE
        </text>
        <text x="128" y="21" fill="#cbd5e1" fontSize="11" fontWeight="600">
          Empirical Proof
        </text>
        <rect x="296" y="7" width="86" height="20" rx="4" fill="#082318" stroke="#145237" strokeWidth="0.8" />
        <text x="339" y="21" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="800">
          VERIFY
        </text>

        {/* Root Bottleneck Box */}
        <rect x="10" y="42" width="372" height="42" rx="6" fill="#082318" stroke="#145237" strokeWidth="1" />
        <text x="18" y="56" fill="#34d399" fontSize="10" fontWeight="700">
          ROOT BOTTLENECK:
        </text>
        <text x="18" y="72" fill="#e2e8f0" fontSize="10.5">
          Candidate solution exists, but validity is unverified.
        </text>

        <text x="12" y="99" fill="#f87171" fontSize="10" fontWeight="600">
          ⚠️ Trap: Self-rumination ≠ deterministic ground truth
        </text>

        {/* Action Box */}
        <rect x="10" y="106" width="372" height="74" rx="8" fill="#083824" stroke="#34d399" strokeWidth="1.2" />
        <text x="20" y="125" fill="#34d399" fontSize="12" fontWeight="800">
          ACTION: VERIFY IN RUNTIME
        </text>
        <rect x="264" y="112" width="108" height="18" rx="4" fill="#0c4a32" />
        <text x="318" y="125" textAnchor="middle" fill="#a7f3d0" fontSize="9.5" fontWeight="700">
          Deterministic
        </text>
        <text x="20" y="145" fill="#cbd5e1" fontSize="10.5">
          Tools: Compiler (tsc), test runner (vitest), linter
        </text>
        <text x="20" y="163" fill="#6ee7b7" fontSize="10">
          Executes real assertions to prove code before shipping
        </text>
      </g>

      {/* Bottom Banner */}
      <g id="m-wm-bottom-banner">
        <rect x="14" y="768" width="392" height="52" rx="8" fill="#091424" stroke="#1e3a5f" strokeWidth="1.2" />
        <text x="210" y="788" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="800">
          Retrieve Facts ➔ Reason Constraints ➔ Verify in Runtime
        </text>
        <text x="210" y="806" textAnchor="middle" fill="#94a3b8" fontSize="10">
          Never deliberate on what can be cheaply read or tested
        </text>
      </g>

      {/* Provenance */}
      <text x="210" y="842" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Conceptual triage framework · Gaia Research
      </text>
    </svg>
  );
}

// ============================================================================
// 3. MobileFigureTwoEngines (viewBox="0 0 420 860")
// ============================================================================
export function MobileFigureTwoEngines() {
  return (
    <svg
      viewBox="0 0 420 860"
      role="img"
      aria-labelledby="m-te-title m-te-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="m-te-title">The Dual-Engine Architecture (Mobile)</title>
      <desc id="m-te-desc">
        Vertical architecture stack showing Engine 1 (Learning / Priors) and Engine 2 (Search / Test-time compute)
        converging into Minimum Sufficient Deliberation.
      </desc>
      <defs>
        <marker id="m-te-arr-cyan" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#38bdf8" />
        </marker>
        <marker id="m-te-arr-pink" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#ec4899" />
        </marker>
        <marker id="m-te-arr-emerald" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#34d399" />
        </marker>
      </defs>

      <rect width="420" height="860" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header Block */}
      <text x="210" y="28" textAnchor="middle" fill="#f8fafc" fontSize="13.5" fontWeight="800" letterSpacing="0.3">
        THE DUAL-ENGINE ARCHITECTURE
      </text>
      <text x="210" y="46" textAnchor="middle" fill="#94a3b8" fontSize="11">
        Sutton&apos;s Bitter Lesson: Learning Priors vs. Test-Time Search
      </text>

      {/* Top node: PROBLEM INPUT */}
      <g id="m-te-problem" transform="translate(16, 62)">
        <rect width="388" height="50" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        <circle cx="20" cy="25" r="4.5" fill="#fbbf24" />
        <text x="34" y="21" fill="#f8fafc" fontSize="12" fontWeight="800">
          PROBLEM INPUT
        </text>
        <rect x="274" y="10" width="102" height="20" rx="4" fill="#1e293b" />
        <text x="325" y="24" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="700">
          TASK CONTRACT
        </text>
        <text x="34" y="38" fill="#94a3b8" fontSize="10">
          Task prompt, codebase constraints &amp; specifications
        </text>
      </g>

      {/* Downward Connector to Engine 1 */}
      <line x1="210" y1="112" x2="210" y2="148" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 3" markerEnd="url(#m-te-arr-cyan)" />
      <rect x="135" y="122" width="150" height="20" rx="5" fill="#06182c" stroke="#0284c7" strokeWidth="1" />
      <text x="210" y="136" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="800">
        1. PARAMETRIC RECALL ↓
      </text>

      {/* Card 1: ENGINE 1: LEARNING */}
      <g id="m-te-card-engine1" transform="translate(16, 152)">
        <rect width="388" height="200" rx="12" fill="#051324" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M 0 12 Q 0 0 12 0 L 376 0 Q 388 0 388 12 L 388 38 L 0 38 Z" fill="#0c233a" />
        <rect x="10" y="8" width="140" height="22" rx="4" fill="#0369a1" />
        <text x="80" y="23" textAnchor="middle" fill="#f0f9ff" fontSize="9.5" fontWeight="800">
          ENGINE 1: LEARNING
        </text>
        <text x="160" y="23" fill="#f8fafc" fontSize="11" fontWeight="800">
          WHAT I KNOW ALREADY
        </text>

        <rect x="10" y="46" width="368" height="22" rx="4" fill="#08233d" stroke="#0369a1" strokeWidth="0.8" />
        <text x="194" y="61" textAnchor="middle" fill="#7dd3fc" fontSize="9.5" fontWeight="700">
          Parametric Priors · System 1 Recall · $0 Search Cost
        </text>

        <g transform="translate(14, 80)">
          <circle cx="4" cy="6" r="3" fill="#38bdf8" />
          <text x="14" y="10" fill="#e2e8f0" fontSize="10.5" fontWeight="600">
            Priors &amp; training weights
          </text>
          <text x="14" y="25" fill="#94a3b8" fontSize="9.5">
            Language syntax, standard idioms &amp; memorized patterns
          </text>

          <circle cx="4" cy="44" r="3" fill="#38bdf8" />
          <text x="14" y="48" fill="#e2e8f0" fontSize="10.5" fontWeight="600">
            Fast associative recall
          </text>
          <text x="14" y="63" fill="#94a3b8" fontSize="9.5">
            Instant recognition across standard architectural shapes
          </text>

          <circle cx="4" cy="82" r="3" fill="#64748b" />
          <text x="14" y="86" fill="#cbd5e1" fontSize="10.5" fontWeight="600">
            Fixed boundary: 0 test-time search compute
          </text>
          <text x="14" y="101" fill="#94a3b8" fontSize="9.5">
            Cannot invent missing repo facts or verify edge cases
          </text>
        </g>
      </g>

      {/* Downward Connector to Engine 2 */}
      <line x1="210" y1="352" x2="210" y2="394" stroke="#ec4899" strokeWidth="1.8" strokeDasharray="4 3" markerEnd="url(#m-te-arr-pink)" />
      <rect x="110" y="362" width="200" height="22" rx="6" fill="#2d0a27" stroke="#db2777" strokeWidth="1.2" />
      <text x="210" y="377" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="800">
        IF UNRESOLVED UNCERTAINTY ↓
      </text>

      {/* Card 2: ENGINE 2: SEARCH */}
      <g id="m-te-card-engine2" transform="translate(16, 398)">
        <rect width="388" height="200" rx="12" fill="#180716" stroke="#ec4899" strokeWidth="1.5" />
        <path d="M 0 12 Q 0 0 12 0 L 376 0 Q 388 0 388 12 L 388 38 L 0 38 Z" fill="#320d2c" />
        <rect x="10" y="8" width="130" height="22" rx="4" fill="#be185d" />
        <text x="75" y="23" textAnchor="middle" fill="#fdf2f8" fontSize="9.5" fontWeight="800">
          ENGINE 2: SEARCH
        </text>
        <text x="150" y="23" fill="#f8fafc" fontSize="11" fontWeight="800">
          WHAT I MUST WORK OUT NOW
        </text>

        <rect x="10" y="46" width="368" height="22" rx="4" fill="#360a2c" stroke="#db2777" strokeWidth="0.8" />
        <text x="194" y="61" textAnchor="middle" fill="#f472b6" fontSize="9.5" fontWeight="700">
          Test-Time Search Budget · CoT Tokens · Tool Verification
        </text>

        <g transform="translate(14, 80)">
          <circle cx="4" cy="6" r="3" fill="#ec4899" />
          <text x="14" y="10" fill="#e2e8f0" fontSize="10.5" fontWeight="600">
            Search budget &amp; CoT tokens
          </text>
          <text x="14" y="25" fill="#f9a8d4" fontSize="9.5">
            Dynamic deliberation compute to explore alternatives
          </text>

          <circle cx="4" cy="44" r="3" fill="#ec4899" />
          <text x="14" y="48" fill="#e2e8f0" fontSize="10.5" fontWeight="600">
            Active tool inspection &amp; environment retrieval
          </text>
          <text x="14" y="63" fill="#f9a8d4" fontSize="9.5">
            Grep, file reads &amp; runtime checks replace speculation
          </text>

          <circle cx="4" cy="82" r="3" fill="#ec4899" />
          <text x="14" y="86" fill="#e2e8f0" fontSize="10.5" fontWeight="600">
            Deterministic runtime verification
          </text>
          <text x="14" y="101" fill="#f9a8d4" fontSize="9.5">
            Test suites and compiler checks validate solutions
          </text>
        </g>
      </g>

      {/* Downward Connector to Convergence */}
      <line x1="210" y1="598" x2="210" y2="636" stroke="#34d399" strokeWidth="1.8" markerEnd="url(#m-te-arr-emerald)" />

      {/* Convergence Box */}
      <g id="m-te-convergence" transform="translate(16, 640)">
        <rect width="388" height="96" rx="10" fill="#042016" stroke="#34d399" strokeWidth="1.8" />
        <text x="194" y="26" textAnchor="middle" fill="#34d399" fontSize="11.5" fontWeight="900" letterSpacing="0.3">
          MINIMUM SUFFICIENT DELIBERATION
        </text>
        <text x="194" y="48" textAnchor="middle" fill="#a7f3d0" fontSize="10.5" fontWeight="600">
          Rely on priors · Search only where uncertain
        </text>
        <text x="194" y="68" textAnchor="middle" fill="#6ee7b7" fontSize="10">
          Halt the instant test runner confirms pass
        </text>
        <rect x="84" y="75" width="220" height="15" rx="3" fill="#064e3b" />
        <text x="194" y="86" textAnchor="middle" fill="#a7f3d0" fontSize="8.5" fontWeight="800">
          MAX EFFICIENCY · ZERO DECISION CHURN
        </text>
      </g>

      {/* Footer Citation */}
      <text x="210" y="776" textAnchor="middle" fill="#cbd5e1" fontSize="10.5" fontStyle="italic">
        Richard Sutton (2019) · The Bitter Lesson
      </text>
      <text x="210" y="794" textAnchor="middle" fill="#94a3b8" fontSize="9.5">
        Methods that scale with search and learning consistently dominate hand-crafted heuristics.
      </text>

      {/* Provenance */}
      <text x="210" y="830" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Dual-engine deliberation architecture · Gaia Research
      </text>
    </svg>
  );
}

// ============================================================================
// 4. MobileFigureToolsVsThinking (viewBox="0 0 420 920")
// ============================================================================
export function MobileFigureToolsVsThinking() {
  return (
    <svg
      viewBox="0 0 420 920"
      role="img"
      aria-labelledby="m-tvt-title m-tvt-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="m-tvt-title">Debugging Cycles: Speculation vs. Ground Truth (Mobile)</title>
      <desc id="m-tvt-desc">
        Mobile vertical comparison of debugging without tools (5,000 wasted tokens on ungrounded speculation)
        versus debugging with tools (300 tokens on closed-loop deterministic verification).
      </desc>
      <defs>
        <marker id="m-tvt-arr-red" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#f87171" />
        </marker>
        <marker id="m-tvt-arr-green" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4.5" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#34d399" />
        </marker>
      </defs>

      <rect width="420" height="920" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header */}
      <text x="210" y="28" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="800" letterSpacing="0.2">
        DEBUGGING: SPECULATION VS. GROUND TRUTH
      </text>
      <text x="210" y="46" textAnchor="middle" fill="#94a3b8" fontSize="10.5">
        Internal Simulation (No Tools) vs. Closed-Loop Reality (With Tools)
      </text>

      {/* TOP BLOCK: OPEN-LOOP SPECULATION */}
      <g id="m-tvt-block-speculation" transform="translate(16, 60)">
        <rect width="388" height="340" rx="12" fill="#13080b" stroke="#f87171" strokeWidth="1.5" />
        <path d="M 0 12 Q 0 0 12 0 L 376 0 Q 388 0 388 12 L 388 36 L 0 36 Z" fill="#320f16" />
        <rect x="10" y="7" width="160" height="22" rx="4" fill="#4c141e" />
        <text x="90" y="22" textAnchor="middle" fill="#f87171" fontSize="9.5" fontWeight="800">
          OPEN-LOOP SPECULATION
        </text>
        <text x="180" y="22" fill="#f8fafc" fontSize="11" fontWeight="800">
          WITHOUT TOOLS
        </text>
        <text x="12" y="50" fill="#fca5a5" fontSize="9.5" fontWeight="600">
          Model simulates runtime inside reasoning tokens (unguided drift)
        </text>

        {/* 4 Steps */}
        <rect x="12" y="60" width="364" height="26" rx="5" fill="#200d14" stroke="#4c141e" strokeWidth="1" />
        <text x="20" y="77" fill="#f87171" fontSize="9.5" fontWeight="800">1. Hypothesis:</text>
        <text x="106" y="77" fill="#e2e8f0" fontSize="9.5">&quot;Maybe auth token expired in middleware?&quot;</text>

        <line x1="194" y1="86" x2="194" y2="94" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#m-tvt-arr-red)" />

        <rect x="12" y="94" width="364" height="26" rx="5" fill="#200d14" stroke="#4c141e" strokeWidth="1" />
        <text x="20" y="111" fill="#f87171" fontSize="9.5" fontWeight="800">2. Imagine Path:</text>
        <text x="116" y="111" fill="#e2e8f0" fontSize="9.5">Mentally simulates clock skew without reading code</text>

        <line x1="194" y1="120" x2="194" y2="128" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#m-tvt-arr-red)" />

        <rect x="12" y="128" width="364" height="28" rx="5" fill="#290e18" stroke="#f87171" strokeWidth="1.2" />
        <text x="20" y="146" fill="#f87171" fontSize="9.5" fontWeight="900">3. &quot;Think Harder&quot;:</text>
        <text x="126" y="146" fill="#fecaca" fontSize="9.5" fontWeight="700">Burns 5,000 tokens inventing race conditions</text>

        <line x1="194" y1="156" x2="194" y2="164" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#m-tvt-arr-red)" />

        <rect x="12" y="164" width="364" height="26" rx="5" fill="#200d14" stroke="#4c141e" strokeWidth="1" />
        <text x="20" y="181" fill="#f87171" fontSize="9.5" fontWeight="800">4. Speculate:</text>
        <text x="98" y="181" fill="#e2e8f0" fontSize="9.5">Proposes rewrite of network stack for phantom bug</text>

        <line x1="194" y1="190" x2="194" y2="198" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#m-tvt-arr-red)" />

        {/* Result Card */}
        <g transform="translate(12, 198)">
          <rect width="364" height="130" rx="8" fill="#360e17" stroke="#ef4444" strokeWidth="1.5" />
          <text x="16" y="24" fill="#f87171" fontSize="11" fontWeight="900">
            ✕ RESULT: HALLUCINATED ROOT CAUSE
          </text>
          <text x="16" y="48" fill="#fca5a5" fontSize="10">
            • 5,000 reasoning tokens wasted on unverified guesswork
          </text>
          <text x="16" y="68" fill="#fca5a5" fontSize="10">
            • Real bug in code remains untouched and unfixed
          </text>
          <text x="16" y="88" fill="#f87171" fontSize="10.5" fontWeight="700">
            • Status: FAILED — Open-loop speculation churn
          </text>
          <rect x="10" y="100" width="344" height="20" rx="4" fill="#200d14" />
          <text x="182" y="114" textAnchor="middle" fill="#ef4444" fontSize="8.5" fontWeight="800">
            COST: 5,000 TOKENS WASTED · VERIFICATION: 0% · UNRESOLVED
          </text>
        </g>
      </g>

      {/* Divider */}
      <rect x="185" y="408" width="50" height="24" rx="12" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      <text x="210" y="424" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="900">
        VS
      </text>

      {/* BOTTOM BLOCK: CLOSED-LOOP REALITY */}
      <g id="m-tvt-block-reality" transform="translate(16, 440)">
        <rect width="388" height="340" rx="12" fill="#04160f" stroke="#34d399" strokeWidth="1.5" />
        <path d="M 0 12 Q 0 0 12 0 L 376 0 Q 388 0 388 12 L 388 36 L 0 36 Z" fill="#072d1f" />
        <rect x="10" y="7" width="156" height="22" rx="4" fill="#0c4a32" />
        <text x="88" y="22" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="800">
          CLOSED-LOOP REALITY
        </text>
        <text x="176" y="22" fill="#f8fafc" fontSize="11" fontWeight="800">
          WITH TOOLS
        </text>
        <text x="12" y="50" fill="#86efac" fontSize="9.5" fontWeight="600">
          Model queries ground truth with cheap deterministic tool calls
        </text>

        {/* 4 Steps */}
        <rect x="12" y="60" width="364" height="26" rx="5" fill="#072016" stroke="#124732" strokeWidth="1" />
        <text x="20" y="77" fill="#34d399" fontSize="9.5" fontWeight="800">1. Hypothesis:</text>
        <text x="106" y="77" fill="#e2e8f0" fontSize="9.5">&quot;Check why auth test is failing in CI&quot;</text>

        <line x1="194" y1="86" x2="194" y2="94" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#m-tvt-arr-green)" />

        <rect x="12" y="94" width="364" height="26" rx="5" fill="#072016" stroke="#124732" strokeWidth="1" />
        <text x="20" y="111" fill="#34d399" fontSize="9.5" fontWeight="800">2. Inspect Code:</text>
        <text x="116" y="111" fill="#e2e8f0" fontSize="9.5">grep auth.ts → locates missing return on line 42</text>

        <line x1="194" y1="120" x2="194" y2="128" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#m-tvt-arr-green)" />

        <rect x="12" y="128" width="364" height="26" rx="5" fill="#072016" stroke="#124732" strokeWidth="1" />
        <text x="20" y="145" fill="#34d399" fontSize="9.5" fontWeight="800">3. Run Test:</text>
        <text x="96" y="145" fill="#e2e8f0" fontSize="9.5">vitest stderr confirms assertion failure</text>

        <line x1="194" y1="154" x2="194" y2="162" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#m-tvt-arr-green)" />

        <rect x="12" y="162" width="364" height="28" rx="5" fill="#0a3321" stroke="#34d399" strokeWidth="1.2" />
        <text x="20" y="180" fill="#34d399" fontSize="9.5" fontWeight="900">4. Patch &amp; Run:</text>
        <text x="116" y="180" fill="#a7f3d0" fontSize="9.5" fontWeight="700">Applies 1-line return fix → vitest passes in 110ms</text>

        <line x1="194" y1="190" x2="194" y2="198" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#m-tvt-arr-green)" />

        {/* Result Card */}
        <g transform="translate(12, 198)">
          <rect width="364" height="130" rx="8" fill="#083824" stroke="#10b981" strokeWidth="1.5" />
          <text x="16" y="24" fill="#34d399" fontSize="11" fontWeight="900">
            ✓ PASS [STOP] — VERIFIED GROUND TRUTH
          </text>
          <text x="16" y="48" fill="#a7f3d0" fontSize="10">
            • 300 tokens used (94% compute discount vs simulation)
          </text>
          <text x="16" y="68" fill="#a7f3d0" fontSize="10">
            • Zero guesswork: backed by deterministic test runner receipt
          </text>
          <text x="16" y="88" fill="#34d399" fontSize="10.5" fontWeight="700">
            • Status: RESOLVED — Deliberation halts immediately on green
          </text>
          <rect x="10" y="100" width="344" height="20" rx="4" fill="#042016" />
          <text x="182" y="114" textAnchor="middle" fill="#34d399" fontSize="8.5" fontWeight="800">
            COST: 300 TOKENS · 94% COMPUTE DISCOUNT · GREEN VERIFIED
          </text>
        </g>
      </g>

      {/* Principle Banner */}
      <g id="m-tvt-banner" transform="translate(16, 792)">
        <rect width="388" height="48" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="194" y="21" textAnchor="middle" fill="#f8fafc" fontSize="10.5" fontWeight="800">
          &quot;When reality can cheaply answer the question, ask reality.&quot;
        </text>
        <text x="194" y="37" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="700" letterSpacing="0.4">
          THE GROUNDING INVARIANT · OBSERVATION BEATS SPECULATION
        </text>
      </g>

      {/* Provenance */}
      <text x="210" y="865" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Speculation vs. tool-augmented debugging · Gaia Research
      </text>
    </svg>
  );
}

// ============================================================================
// 5. MobileFigureSweetSpotCurve (viewBox="0 0 420 960")
// ============================================================================
export function MobileFigureSweetSpotCurve() {
  return (
    <svg
      viewBox="0 0 420 960"
      role="img"
      aria-labelledby="m-ssc-title m-ssc-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="m-ssc-title">The Inverted-U Curve of Reasoning Effort</title>
      <desc id="m-ssc-desc">
        Solution quality versus reasoning effort inverted-U curve with under-thinking on the left,
        the sweet spot of minimum sufficient deliberation at the peak, and the overthinking cascade on the right.
      </desc>
      <defs>
        <linearGradient id="m-ssc-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#05060a" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="m-ssc-stroke-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="25%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="75%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <marker id="m-ssc-axis-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 7 4 L 1 7 Z" fill="#64748b" />
        </marker>
        <marker id="m-ssc-cascade-arrow" viewBox="0 0 8 8" refX="4" refY="7" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 4 7 L 7 1 Z" fill="#64748b" />
        </marker>
      </defs>

      <rect width="420" height="960" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header */}
      <text x="210" y="30" textAnchor="middle" fill="#f8fafc" fontSize="13.5" fontWeight="800" letterSpacing="0.3">
        THE INVERTED-U OF REASONING EFFORT
      </text>
      <text x="210" y="48" textAnchor="middle" fill="#94a3b8" fontSize="10.5">
        Why test-time compute follows diminishing &amp; negative returns
      </text>

      {/* Upper Chart Container */}
      <rect x="16" y="62" width="388" height="260" rx="10" fill="#090d16" stroke="#1e293b" strokeWidth="1" />

      {/* Zone 1 */}
      <rect x="46" y="80" width="102" height="198" rx="6" fill="#f87171" fillOpacity="0.04" stroke="#f87171" strokeOpacity="0.16" strokeDasharray="3 3" />
      <rect x="52" y="86" width="90" height="18" rx="3" fill="#450a0a" />
      <text x="97" y="99" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="800">
        UNDER-THINK
      </text>
      <text x="54" y="118" fill="#fca5a5" fontSize="10" fontWeight="600">
        Premature Exit
      </text>
      <text x="54" y="132" fill="#94a3b8" fontSize="9">
        • Shallow pass
      </text>
      <text x="54" y="145" fill="#94a3b8" fontSize="9">
        • Missed races
      </text>

      {/* Zone 2 */}
      <rect x="154" y="80" width="112" height="198" rx="6" fill="#34d399" fillOpacity="0.06" stroke="#34d399" strokeOpacity="0.25" strokeDasharray="3 3" />
      <rect x="160" y="86" width="100" height="18" rx="3" fill="#064e3b" />
      <text x="210" y="99" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="800">
        SWEET SPOT
      </text>
      <text x="162" y="136" fill="#a7f3d0" fontSize="10" fontWeight="700">
        Sufficient Delib.
      </text>
      <text x="162" y="150" fill="#94a3b8" fontSize="9">
        • Tests verified
      </text>
      <text x="162" y="163" fill="#94a3b8" fontSize="9">
        • Max compute ROI
      </text>

      {/* Zone 3 */}
      <rect x="272" y="80" width="122" height="198" rx="6" fill="#ec4899" fillOpacity="0.04" stroke="#ec4899" strokeOpacity="0.16" strokeDasharray="3 3" />
      <rect x="278" y="86" width="110" height="18" rx="3" fill="#4a0429" />
      <text x="333" y="99" textAnchor="middle" fill="#ec4899" fontSize="9" fontWeight="800">
        OVERTHINKING
      </text>
      <text x="278" y="118" fill="#f472b6" fontSize="10" fontWeight="600">
        Negative Returns
      </text>
      <text x="278" y="132" fill="#94a3b8" fontSize="9">
        • Phantom bugs
      </text>
      <text x="278" y="145" fill="#94a3b8" fontSize="9">
        • Decision churn
      </text>

      {/* Axes */}
      <line x1="44" y1="280" x2="44" y2="76" stroke="#475569" strokeWidth="1.5" markerEnd="url(#m-ssc-axis-arrow)" />
      <text x="48" y="74" fill="#cbd5e1" fontSize="9.5" fontWeight="700">
        ▲ Quality
      </text>

      <line x1="44" y1="280" x2="394" y2="280" stroke="#475569" strokeWidth="1.5" markerEnd="url(#m-ssc-axis-arrow)" />
      <text x="394" y="274" textAnchor="end" fill="#cbd5e1" fontSize="9.5" fontWeight="700">
        Reasoning Effort ►
      </text>

      {/* X Ticks */}
      <text x="64" y="295" textAnchor="middle" fill="#94a3b8" fontSize="9">None</text>
      <text x="110" y="295" textAnchor="middle" fill="#94a3b8" fontSize="9">Low</text>
      <text x="210" y="295" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="800">Optimal (~2k)</text>
      <text x="300" y="295" textAnchor="middle" fill="#fca5a5" fontSize="9">High</text>
      <text x="370" y="295" textAnchor="middle" fill="#f43f5e" fontSize="9" fontWeight="700">Max</text>

      {/* Curve Shading & Stroke */}
      <path d="M 58 266 C 104 238, 145 158, 196 122 C 205 118, 215 118, 224 122 C 274 152, 325 235, 380 266 L 380 280 L 58 280 Z" fill="url(#m-ssc-area-grad)" />
      <path d="M 58 266 C 104 238, 145 158, 196 122 C 205 118, 215 118, 224 122 C 274 152, 325 235, 380 266" fill="none" stroke="url(#m-ssc-stroke-grad)" strokeWidth="3" />

      {/* Peak Sweet Spot Marker */}
      <circle cx="210" cy="119" r="14" fill="#34d399" fillOpacity="0.16" />
      <circle cx="210" cy="119" r="8" fill="#34d399" fillOpacity="0.38" />
      <circle cx="210" cy="119" r="4" fill="#f8fafc" stroke="#34d399" strokeWidth="2" />

      {/* Middle Callout */}
      <rect x="16" y="332" width="388" height="34" rx="8" fill="#064e3b" fillOpacity="0.5" stroke="#34d399" strokeWidth="1.2" />
      <circle cx="32" cy="349" r="4" fill="#34d399" />
      <text x="210" y="354" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="800" letterSpacing="0.4">
        ★ SWEET SPOT: Minimum Sufficient Deliberation
      </text>

      {/* Lower Section: Cascade */}
      <rect x="16" y="374" width="388" height="526" rx="10" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
      <text x="30" y="394" fill="#ec4899" fontSize="11" fontWeight="800" letterSpacing="0.8">
        THE OVERTHINKING CASCADE
      </text>
      <text x="30" y="408" fill="#94a3b8" fontSize="10">
        7 stages of reasoning saturation without external test verification
      </text>

      {/* Steps 1-7 */}
      {/* 1 */}
      <rect x="28" y="418" width="364" height="48" rx="6" fill="#064e3b" fillOpacity="0.45" stroke="#34d399" strokeWidth="1.2" />
      <text x="46" y="445" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="800">1</text>
      <text x="66" y="438" fill="#34d399" fontSize="11" fontWeight="700">Correct Idea</text>
      <text x="66" y="454" fill="#a7f3d0" fontSize="9.5">Discovers sound logic &amp; core invariant</text>
      <text x="376" y="446" textAnchor="end" fill="#34d399" fontSize="10" fontWeight="700">~500 tokens</text>

      <line x1="46" y1="466" x2="46" y2="476" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#m-ssc-cascade-arrow)" />

      {/* 2 */}
      <rect x="28" y="476" width="364" height="48" rx="6" fill="#082f49" fillOpacity="0.45" stroke="#38bdf8" strokeWidth="1.2" />
      <text x="46" y="503" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="800">2</text>
      <text x="66" y="496" fill="#38bdf8" fontSize="11" fontWeight="700">Double-Check</text>
      <text x="66" y="512" fill="#bae6fd" fontSize="9.5">Audits code and spec constraints</text>
      <text x="376" y="504" textAnchor="end" fill="#38bdf8" fontSize="10" fontWeight="700">~1.2k tokens</text>

      <line x1="46" y1="524" x2="46" y2="534" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#m-ssc-cascade-arrow)" />

      {/* 3 */}
      <rect x="28" y="534" width="364" height="48" rx="6" fill="#064e3b" fillOpacity="0.75" stroke="#34d399" strokeWidth="1.6" />
      <text x="46" y="561" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="800">3</text>
      <text x="66" y="554" fill="#34d399" fontSize="11" fontWeight="800">Still Correct</text>
      <text x="66" y="570" fill="#a7f3d0" fontSize="9.5">Solution holds cleanly; optimal stopping point</text>
      <text x="376" y="562" textAnchor="end" fill="#34d399" fontSize="10" fontWeight="900">★ OPTIMAL EXIT</text>

      <line x1="46" y1="582" x2="46" y2="592" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#m-ssc-cascade-arrow)" />

      {/* 4 */}
      <rect x="28" y="592" width="364" height="48" rx="6" fill="#451a03" fillOpacity="0.45" stroke="#fbbf24" strokeWidth="1.2" />
      <text x="46" y="619" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="800">4</text>
      <text x="66" y="612" fill="#fbbf24" fontSize="11" fontWeight="700">&quot;But What If...&quot;</text>
      <text x="66" y="628" fill="#fde68a" fontSize="9.5">Unprompted self-doubt begins</text>
      <text x="376" y="620" textAnchor="end" fill="#fbbf24" fontSize="10" fontWeight="700">~4k tokens</text>

      <line x1="46" y1="640" x2="46" y2="650" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#m-ssc-cascade-arrow)" />

      {/* 5 */}
      <rect x="28" y="650" width="364" height="48" rx="6" fill="#3a1c04" fillOpacity="0.45" stroke="#fbbf24" strokeWidth="1.2" />
      <text x="46" y="677" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="800">5</text>
      <text x="66" y="670" fill="#fbbf24" fontSize="11" fontWeight="700">Phantom Edge</text>
      <text x="66" y="686" fill="#fde68a" fontSize="9.5">Invents impossible phantom failure modes</text>
      <text x="376" y="678" textAnchor="end" fill="#fbbf24" fontSize="10" fontWeight="700">~8k tokens</text>

      <line x1="46" y1="698" x2="46" y2="708" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#m-ssc-cascade-arrow)" />

      {/* 6 */}
      <rect x="28" y="708" width="364" height="48" rx="6" fill="#450a0a" fillOpacity="0.45" stroke="#f87171" strokeWidth="1.2" />
      <text x="46" y="735" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="800">6</text>
      <text x="66" y="728" fill="#f87171" fontSize="11" fontWeight="700">Reopen Choice</text>
      <text x="66" y="744" fill="#fca5a5" fontSize="9.5">Scraps settled architecture &amp; code</text>
      <text x="376" y="736" textAnchor="end" fill="#f87171" fontSize="10" fontWeight="700">Decision Churn</text>

      <line x1="46" y1="756" x2="46" y2="766" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#m-ssc-cascade-arrow)" />

      {/* 7 */}
      <rect x="28" y="766" width="364" height="48" rx="6" fill="#4c0519" fillOpacity="0.6" stroke="#f43f5e" strokeWidth="1.4" />
      <text x="46" y="793" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="800">7</text>
      <text x="66" y="786" fill="#f43f5e" fontSize="11" fontWeight="700">Wrong Answer</text>
      <text x="66" y="802" fill="#fda4af" fontSize="9.5">Submits fragile, regressed patch</text>
      <text x="376" y="794" textAnchor="end" fill="#f43f5e" fontSize="10" fontWeight="700">~16k tokens</text>

      <text x="210" y="842" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Each ungrounded step increases token spend and latency while degrading accuracy
      </text>

      {/* Provenance */}
      <text x="210" y="920" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Test-time compute scaling &amp; reasoning saturation
      </text>
      <text x="210" y="936" textAnchor="middle" fill="#94a3b8" fontSize="9.5">
        Gaia Research · Minimum Sufficient Deliberation
      </text>
    </svg>
  );
}

// ============================================================================
// 6. MobileFigureEscalationLadder (viewBox="0 0 420 980")
// ============================================================================
export function MobileFigureEscalationLadder() {
  return (
    <svg
      viewBox="0 0 420 980"
      role="img"
      aria-labelledby="m-esc-title m-esc-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="m-esc-title">The Reasoning Escalation Ladder: Empirical Decision Flow</title>
      <desc id="m-esc-desc">
        Flowchart showing how agents allocate reasoning effort: retrieve external facts first,
        select a search budget rung based on uncertainty, and only escalate to high or max with empirical compiler evidence.
      </desc>
      <defs>
        <marker id="m-esc-arrow-cyan" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 7 4 L 1 7 Z" fill="#38bdf8" />
        </marker>
        <marker id="m-esc-arrow-slate" viewBox="0 0 8 8" refX="4" refY="7" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 4 7 L 7 1 Z" fill="#64748b" />
        </marker>
        <marker id="m-esc-arrow-emerald" viewBox="0 0 8 8" refX="4" refY="7" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 4 7 L 7 1 Z" fill="#34d399" />
        </marker>
        <marker id="m-esc-arrow-rose" viewBox="0 0 8 8" refX="4" refY="7" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 4 7 L 7 1 Z" fill="#ec4899" />
        </marker>
      </defs>

      <rect width="420" height="980" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header */}
      <text x="210" y="30" textAnchor="middle" fill="#f8fafc" fontSize="13.5" fontWeight="800" letterSpacing="0.5">
        THE REASONING ESCALATION LADDER
      </text>
      <text x="210" y="48" textAnchor="middle" fill="#94a3b8" fontSize="10.5">
        Empirical decision flow for autonomous agent reasoning budgets
      </text>

      {/* Phase 1 */}
      <rect x="16" y="58" width="388" height="268" rx="10" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
      <text x="30" y="80" fill="#38bdf8" fontSize="11" fontWeight="800" letterSpacing="0.6">
        PHASE 1: GROUNDING GATE
      </text>
      <text x="30" y="94" fill="#94a3b8" fontSize="10">
        Verify external facts before spending inferential reasoning tokens
      </text>

      <rect x="94" y="104" width="232" height="32" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />
      <text x="210" y="124" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="800">
        NEW TASK / SPECIFICATION
      </text>

      <line x1="210" y1="136" x2="210" y2="152" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#m-esc-arrow-cyan)" />

      {/* Decision Diamond */}
      <polygon points="140,158 215,185 140,212 65,185" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="140" y="181" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">Need external</text>
      <text x="140" y="194" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">information?</text>

      {/* YES */}
      <line x1="215" y1="185" x2="248" y2="185" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x="220" y="177" width="26" height="16" rx="3" fill="#0369a1" />
      <text x="233" y="189" textAnchor="middle" fill="#f8fafc" fontSize="8.5" fontWeight="800">YES</text>

      <rect x="248" y="156" width="144" height="58" rx="6" fill="#082f49" stroke="#38bdf8" strokeWidth="1.4" />
      <text x="320" y="174" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="800">RETRIEVE (Tools)</text>
      <text x="320" y="188" textAnchor="middle" fill="#cbd5e1" fontSize="9.5">read · grep · bash</text>
      <text x="320" y="202" textAnchor="middle" fill="#7dd3fc" fontSize="9">Acquire ground truth</text>

      {/* Loop back */}
      <path d="M 350 156 C 350 125, 340 120, 326 120" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="3 3" markerEnd="url(#m-esc-arrow-cyan)" />

      {/* NO */}
      <line x1="140" y1="212" x2="140" y2="244" stroke="#34d399" strokeWidth="1.5" />
      <rect x="128" y="218" width="24" height="16" rx="3" fill="#065f46" />
      <text x="140" y="230" textAnchor="middle" fill="#a7f3d0" fontSize="8.5" fontWeight="800">NO</text>

      <rect x="28" y="244" width="364" height="56" rx="6" fill="#064e3b" fillOpacity="0.4" stroke="#34d399" strokeWidth="1.2" />
      <text x="44" y="263" fill="#34d399" fontSize="11" fontWeight="800">
        ✓ ALL FACTS GROUNDED IN WORKSPACE
      </text>
      <text x="44" y="278" fill="#cbd5e1" fontSize="10">
        State and constraints verified · Proceed to inference sizing
      </text>
      <text x="44" y="291" fill="#6ee7b7" fontSize="9">
        Deterministic foundation ready (0 reasoning tokens spent)
      </text>

      <line x1="210" y1="300" x2="210" y2="332" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#m-esc-arrow-emerald)" />

      {/* Phase 2 */}
      <rect x="16" y="336" width="388" height="292" rx="10" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
      <text x="30" y="358" fill="#fbbf24" fontSize="11" fontWeight="800" letterSpacing="0.6">
        PHASE 2: CALIBRATE SEARCH BUDGET
      </text>
      <text x="30" y="372" fill="#94a3b8" fontSize="10">
        How much inferential uncertainty is unresolved?
      </text>

      {/* LOW */}
      <rect x="28" y="382" width="364" height="62" rx="6" fill="#030712" stroke="#38bdf8" strokeWidth="1.2" />
      <rect x="38" y="390" width="46" height="18" rx="3" fill="#082f49" stroke="#38bdf8" strokeWidth="0.8" />
      <text x="61" y="403" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="800">LOW</text>
      <text x="92" y="404" fill="#f8fafc" fontSize="11" fontWeight="700">Shallow Uncertainty</text>
      <text x="382" y="403" textAnchor="end" fill="#38bdf8" fontSize="10.5" fontWeight="700">0 – 1k tokens</text>
      <text x="38" y="424" fill="#94a3b8" fontSize="10">Tiny edits, typo &amp; syntax fixes, routine boilerplate</text>
      <text x="38" y="437" fill="#94a3b8" fontSize="9">Single-turn deterministic resolution</text>

      {/* MEDIUM */}
      <rect x="28" y="452" width="364" height="62" rx="6" fill="#030712" stroke="#34d399" strokeWidth="1.4" />
      <rect x="38" y="460" width="60" height="18" rx="3" fill="#064e3b" stroke="#34d399" strokeWidth="0.8" />
      <text x="68" y="473" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="800">MEDIUM</text>
      <text x="106" y="474" fill="#f8fafc" fontSize="11" fontWeight="700">Moderate Uncertainty</text>
      <text x="382" y="473" textAnchor="end" fill="#34d399" fontSize="10.5" fontWeight="700">1k – 4k tokens</text>
      <text x="38" y="494" fill="#94a3b8" fontSize="10">Multi-file features, standard debugging, unit test suites</text>
      <text x="38" y="507" fill="#34d399" fontSize="9.5" fontWeight="700">★ Sweet spot default for 80% of agent tasks</text>

      {/* HIGH */}
      <rect x="28" y="522" width="364" height="62" rx="6" fill="#030712" stroke="#fbbf24" strokeWidth="1.2" />
      <rect x="38" y="530" width="50" height="18" rx="3" fill="#451a03" stroke="#fbbf24" strokeWidth="0.8" />
      <text x="63" y="543" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="800">HIGH</text>
      <text x="96" y="544" fill="#f8fafc" fontSize="11" fontWeight="700">Deep Uncertainty</text>
      <text x="382" y="543" textAnchor="end" fill="#fbbf24" fontSize="10.5" fontWeight="700">4k – 16k tokens</text>
      <text x="38" y="564" fill="#94a3b8" fontSize="10">Root-cause isolation, concurrency bugs, architectural shifts</text>
      <text x="38" y="577" fill="#fde68a" fontSize="9">Requires hard hypothesis branch pruning</text>

      <text x="210" y="612" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Rule: Default to lowest sufficient rung · escalate only with cause
      </text>

      <line x1="210" y1="620" x2="210" y2="640" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#m-esc-arrow-slate)" />

      {/* Phase 3 */}
      <rect x="16" y="644" width="388" height="224" rx="10" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
      <text x="30" y="666" fill="#ec4899" fontSize="11" fontWeight="800" letterSpacing="0.6">
        PHASE 3: EMPIRICAL GATE
      </text>
      <text x="30" y="680" fill="#94a3b8" fontSize="10">
        Validate with real runtime output before ending or escalating
      </text>

      <rect x="84" y="692" width="252" height="30" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
      <text x="210" y="711" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="800">
        RUN TESTS &amp; COMPILER
      </text>

      <line x1="210" y1="722" x2="210" y2="734" stroke="#ec4899" strokeWidth="1.5" markerEnd="url(#m-esc-arrow-rose)" />

      {/* Stuck Diamond */}
      <polygon points="210,736 295,756 210,776 125,756" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
      <text x="210" y="753" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">Still stuck after</text>
      <text x="210" y="764" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">empirical run?</text>

      {/* NO: STOP & SHIP */}
      <path d="M 125 756 L 114 756 L 114 782" fill="none" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#m-esc-arrow-emerald)" />
      <rect x="68" y="748" width="32" height="16" rx="3" fill="#065f46" />
      <text x="84" y="760" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="800">NO</text>

      <rect x="28" y="786" width="174" height="70" rx="6" fill="#064e3b" stroke="#34d399" strokeWidth="1.4" />
      <rect x="36" y="794" width="36" height="16" rx="3" fill="#022c22" stroke="#34d399" strokeWidth="0.8" />
      <text x="54" y="806" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="800">[NO]</text>
      <text x="120" y="818" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="900">STOP &amp; SHIP</text>
      <text x="120" y="834" textAnchor="middle" fill="#cbd5e1" fontSize="10">Verified Clean</text>
      <text x="120" y="848" textAnchor="middle" fill="#a7f3d0" fontSize="9">Do not overthink</text>

      {/* YES: ESCALATE */}
      <path d="M 295 756 L 306 756 L 306 782" fill="none" stroke="#ec4899" strokeWidth="1.5" markerEnd="url(#m-esc-arrow-rose)" />
      <rect x="320" y="748" width="32" height="16" rx="3" fill="#831843" />
      <text x="336" y="760" textAnchor="middle" fill="#fbcfe8" fontSize="9" fontWeight="800">YES</text>

      <rect x="218" y="786" width="174" height="70" rx="6" fill="#4c0519" stroke="#ec4899" strokeWidth="1.4" />
      <rect x="226" y="794" width="38" height="16" rx="3" fill="#2d0612" stroke="#ec4899" strokeWidth="0.8" />
      <text x="245" y="806" textAnchor="middle" fill="#ec4899" fontSize="9" fontWeight="800">[YES]</text>
      <text x="308" y="818" textAnchor="middle" fill="#ec4899" fontSize="12" fontWeight="900">XHIGH / MAX</text>
      <text x="308" y="834" textAnchor="middle" fill="#cbd5e1" fontSize="10">Armed Escalation</text>
      <text x="308" y="848" textAnchor="middle" fill="#fda4af" fontSize="9">Feed error trace</text>

      {/* Bottom Banner */}
      <rect x="16" y="878" width="388" height="58" rx="8" fill="#090d16" stroke="#fbbf24" strokeWidth="1.2" />
      <text x="210" y="902" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="800" letterSpacing="0.8">
        EVIDENCE FIRST. ESCALATION SECOND.
      </text>
      <text x="210" y="920" textAnchor="middle" fill="#cbd5e1" fontSize="10">
        Never escalate to high/max effort on intuition. Ground the model
      </text>
      <text x="210" y="932" textAnchor="middle" fill="#94a3b8" fontSize="9.5">
        with compiler diagnostics, failing tests, or API traces first.
      </text>

      {/* Provenance */}
      <text x="210" y="960" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Autonomous agent search escalation policy · Gaia Research
      </text>
    </svg>
  );
}

// ============================================================================
// 7. MobileFigureThreeAgents (viewBox="0 0 420 1060")
// ============================================================================
export function MobileFigureThreeAgents() {
  return (
    <svg
      viewBox="0 0 420 1060"
      role="img"
      aria-labelledby="m-ta-title m-ta-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="m-ta-title">Three Agents Encounter an Unfamiliar API (Mobile)</title>
      <desc id="m-ta-desc">
        Comparison of three agent strategies: Agent A with unchecked confidence produces a broken build;
        Agent B with 12,000 blind reasoning tokens creates an expensive failure; and Agent C with grounded deliberation passes on the first try.
      </desc>

      <rect width="420" height="1060" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header */}
      <text x="210" y="32" textAnchor="middle" fill="#f8fafc" fontSize="13.5" fontWeight="800" letterSpacing="0.3">
        THREE AGENTS ENCOUNTER AN API
      </text>
      <text x="210" y="50" textAnchor="middle" fill="#94a3b8" fontSize="10.5">
        Why blind reasoning cannot substitute for missing context
      </text>

      {/* CARD A: AGENT A */}
      <g transform="translate(16, 68)">
        <rect width="388" height="280" rx="12" fill="#090d16" stroke="#f87171" strokeWidth="1.2" />
        <rect width="388" height="34" rx="12" fill="#2d0a0a" />
        <rect y="22" width="388" height="12" fill="#2d0a0a" />
        <text x="194" y="22" textAnchor="middle" fill="#f87171" fontSize="11.5" fontWeight="800" letterSpacing="0.4">
          AGENT A · UNCHECKED CONFIDENCE
        </text>

        <rect x="12" y="42" width="168" height="20" rx="4" fill="#450a0a" />
        <text x="96" y="56" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="700">
          Low Effort · Zero Retrieval
        </text>
        <rect x="274" y="42" width="102" height="20" rx="4" fill="#1f1113" stroke="#f87171" strokeWidth="0.8" />
        <text x="325" y="56" textAnchor="middle" fill="#fca5a5" fontSize="9.5" fontWeight="700">
          350 tokens · 1.2s
        </text>

        <rect x="12" y="68" width="364" height="40" rx="6" fill="#150a0a" stroke="#f87171" strokeOpacity="0.3" />
        <text x="22" y="84" fill="#fca5a5" fontSize="10.5" fontStyle="italic">
          &quot;I probably know this API. Let me just
        </text>
        <text x="22" y="98" fill="#fca5a5" fontSize="10.5" fontStyle="italic">
          write the code directly.&quot;
        </text>

        <g transform="translate(12, 114)">
          <rect y="0" width="364" height="20" rx="4" fill="#0f172a" />
          <text x="10" y="14" fill="#cbd5e1" fontSize="10.5">
            1. Skip docs, grep, and tools
          </text>
          <rect y="24" width="364" height="20" rx="4" fill="#0f172a" />
          <text x="10" y="38" fill="#cbd5e1" fontSize="10.5">
            2. Single-pass generation (0 reasoning)
          </text>
          <rect y="48" width="364" height="20" rx="4" fill="#0f172a" />
          <text x="10" y="62" fill="#f87171" fontSize="10.5" fontWeight="700">
            3. Hallucinate fictitious API method
          </text>
        </g>

        <rect x="12" y="184" width="364" height="84" rx="8" fill="#1a0808" stroke="#f87171" strokeWidth="1" />
        <rect x="20" y="192" width="100" height="18" rx="4" fill="#7f1d1d" />
        <text x="70" y="205" textAnchor="middle" fill="#fee2e2" fontSize="9.5" fontWeight="800">
          BROKEN BUILD
        </text>
        <text x="128" y="206" fill="#f87171" fontSize="11" fontWeight="800">
          Instant Runtime Crash
        </text>
        <text x="20" y="226" fill="#cbd5e1" fontSize="10">
          Latency: 1.2s · Tokens: 350 · Cost: $0.001
        </text>
        <text x="20" y="242" fill="#fca5a5" fontSize="10" fontFamily="monospace">
          TypeError: client.fetchTree is not a function
        </text>
        <text x="20" y="258" fill="#94a3b8" fontSize="9.5">
          Confidence without facts guarantees failure.
        </text>
      </g>

      {/* CARD B: AGENT B */}
      <g transform="translate(16, 360)">
        <rect width="388" height="280" rx="12" fill="#090d16" stroke="#fbbf24" strokeWidth="1.2" />
        <rect width="388" height="34" rx="12" fill="#2d1a03" />
        <rect y="22" width="388" height="12" fill="#2d1a03" />
        <text x="194" y="22" textAnchor="middle" fill="#fbbf24" fontSize="11.5" fontWeight="800" letterSpacing="0.4">
          AGENT B · BLIND COMPUTE WASTE
        </text>

        <rect x="12" y="42" width="168" height="20" rx="4" fill="#451a03" />
        <text x="96" y="56" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="700">
          Max Effort · Zero Retrieval
        </text>
        <rect x="268" y="42" width="108" height="20" rx="4" fill="#211707" stroke="#fbbf24" strokeWidth="0.8" />
        <text x="322" y="56" textAnchor="middle" fill="#fde68a" fontSize="9.5" fontWeight="700">
          12.4k tokens · 32.5s
        </text>

        <rect x="12" y="68" width="364" height="40" rx="6" fill="#181205" stroke="#fbbf24" strokeOpacity="0.3" />
        <text x="22" y="84" fill="#fde68a" fontSize="10.5" fontStyle="italic">
          &quot;I should think harder! Let me deduce
        </text>
        <text x="22" y="98" fill="#fde68a" fontSize="10.5" fontStyle="italic">
          the API shape from first principles.&quot;
        </text>

        <g transform="translate(12, 114)">
          <rect y="0" width="364" height="20" rx="4" fill="#0f172a" />
          <text x="10" y="14" fill="#cbd5e1" fontSize="10.5">
            1. Spend 12,000 reasoning tokens
          </text>
          <rect y="24" width="364" height="20" rx="4" fill="#0f172a" />
          <text x="10" y="38" fill="#cbd5e1" fontSize="10.5">
            2. Deduce complex phantom interfaces
          </text>
          <rect y="48" width="364" height="20" rx="4" fill="#0f172a" />
          <text x="10" y="62" fill="#fbbf24" fontSize="10.5" fontWeight="700">
            3. Hallucinate API, but thoughtfully
          </text>
        </g>

        <rect x="12" y="184" width="364" height="84" rx="8" fill="#1c1304" stroke="#fbbf24" strokeWidth="1" />
        <rect x="20" y="192" width="130" height="18" rx="4" fill="#78350f" />
        <text x="85" y="205" textAnchor="middle" fill="#fef3c7" fontSize="9.5" fontWeight="800">
          EXPENSIVE FAILURE
        </text>
        <text x="158" y="206" fill="#fbbf24" fontSize="11" fontWeight="800">
          Thoughtful Hallucination
        </text>
        <text x="20" y="226" fill="#cbd5e1" fontSize="10">
          Latency: 32.5s · Tokens: 12,400 · Cost: $0.18
        </text>
        <text x="20" y="242" fill="#fde68a" fontSize="10" fontFamily="monospace">
          Error: Module has no exported member &apos;v2&apos;
        </text>
        <text x="20" y="258" fill="#94a3b8" fontSize="9.5">
          Reasoning cannot fabricate absent facts.
        </text>
      </g>

      {/* CARD C: AGENT C */}
      <g transform="translate(16, 652)">
        <rect width="388" height="280" rx="12" fill="#090d16" stroke="#34d399" strokeWidth="1.2" />
        <rect width="388" height="34" rx="12" fill="#063520" />
        <rect y="22" width="388" height="12" fill="#063520" />
        <text x="194" y="22" textAnchor="middle" fill="#34d399" fontSize="11.5" fontWeight="800" letterSpacing="0.4">
          AGENT C · GROUNDED DELIBERATION
        </text>

        <rect x="12" y="42" width="194" height="20" rx="4" fill="#064e3b" />
        <text x="109" y="56" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="700">
          Calibrated Effort + Retrieval
        </text>
        <rect x="270" y="42" width="106" height="20" rx="4" fill="#0a2a1d" stroke="#34d399" strokeWidth="0.8" />
        <text x="323" y="56" textAnchor="middle" fill="#a7f3d0" fontSize="9.5" fontWeight="700">
          1.6k tokens · 4.2s
        </text>

        <rect x="12" y="68" width="364" height="40" rx="6" fill="#062217" stroke="#34d399" strokeOpacity="0.3" />
        <text x="22" y="84" fill="#a7f3d0" fontSize="10.5" fontStyle="italic">
          &quot;Do I know the API? Nope. Let me
        </text>
        <text x="22" y="98" fill="#a7f3d0" fontSize="10.5" fontStyle="italic">
          fetch docs &amp; verify the version first.&quot;
        </text>

        <g transform="translate(12, 114)">
          <rect y="0" width="364" height="20" rx="4" fill="#0f172a" />
          <text x="10" y="14" fill="#38bdf8" fontSize="10.5" fontWeight="700">
            1. Tool: read_file &amp; docs (250ms)
          </text>
          <rect y="24" width="364" height="20" rx="4" fill="#0f172a" />
          <text x="10" y="38" fill="#34d399" fontSize="10.5" fontWeight="700">
            2. Calibrated reasoning (1.2k tokens)
          </text>
          <rect y="48" width="364" height="20" rx="4" fill="#0f172a" />
          <text x="10" y="62" fill="#34d399" fontSize="10.5" fontWeight="700">
            3. Implement &amp; run compiler check
          </text>
        </g>

        <rect x="12" y="184" width="364" height="84" rx="8" fill="#05281b" stroke="#34d399" strokeWidth="1" />
        <rect x="20" y="192" width="120" height="18" rx="4" fill="#065f46" />
        <text x="80" y="205" textAnchor="middle" fill="#d1fae5" fontSize="9.5" fontWeight="800">
          PASSES FIRST TRY
        </text>
        <text x="148" y="206" fill="#34d399" fontSize="11" fontWeight="800">
          Clean Verified Execution
        </text>
        <text x="20" y="226" fill="#cbd5e1" fontSize="10">
          Latency: 4.2s · Tokens: 1,600 · Cost: $0.015
        </text>
        <text x="20" y="242" fill="#a7f3d0" fontSize="10">
          Status: 14/14 tests pass · 0 regressions
        </text>
        <text x="20" y="258" fill="#94a3b8" fontSize="9.5">
          Empirical facts + calibrated reasoning wins.
        </text>
      </g>

      {/* Bottom Banner */}
      <rect x="16" y="948" width="388" height="64" rx="10" fill="#0b1329" stroke="#38bdf8" strokeWidth="1.2" />
      <text x="210" y="974" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">
        Agent C didn&apos;t have more intelligence.
      </text>
      <text x="210" y="996" textAnchor="middle" fill="#34d399" fontSize="13.5" fontWeight="900">
        It allocated intelligence better.
      </text>

      {/* Provenance */}
      <text x="210" y="1036" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Grounded retrieval vs. blind deliberation · Gaia Research
      </text>
    </svg>
  );
}

// ============================================================================
// 8. MobileFigureSummaryLoop (viewBox="0 0 420 1100")
// ============================================================================
export function MobileFigureSummaryLoop() {
  return (
    <svg
      viewBox="0 0 420 1100"
      role="img"
      aria-labelledby="m-sl-title m-sl-desc"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="m-sl-title">The Deliberation Lifecycle (Mobile)</title>
      <desc id="m-sl-desc">
        Five-step sequential operational policy: Step 01 Missing Fact triggers Retrieve; Step 02 Hard Inference triggers Reason;
        Step 03 Not Sure triggers Verify; Step 04 Still Stuck triggers Escalate; Step 05 Resolved triggers Stop and Ship.
      </desc>
      <defs>
        <marker id="m-sl-arrow-cyan" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 7 4 L 1 7 Z" fill="#38bdf8" />
        </marker>
        <marker id="m-sl-arrow-pink" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 7 4 L 1 7 Z" fill="#ec4899" />
        </marker>
        <marker id="m-sl-arrow-emerald" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 7 4 L 1 7 Z" fill="#34d399" />
        </marker>
        <marker id="m-sl-arrow-amber" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 7 4 L 1 7 Z" fill="#fbbf24" />
        </marker>
        <marker id="m-sl-arrow-green" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 7 4 L 1 7 Z" fill="#34d399" />
        </marker>
        <marker id="m-sl-feedback-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 1 L 7 4 L 1 7 Z" fill="#fbbf24" />
        </marker>
      </defs>

      <rect width="420" height="1100" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Header */}
      <text x="210" y="30" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="800" letterSpacing="0.4">
        THE DELIBERATION LIFECYCLE
      </text>
      <text x="210" y="48" textAnchor="middle" fill="#94a3b8" fontSize="10.5">
        Five-step operational policy for test-time compute
      </text>

      {/* Feedback Loop Path */}
      <path d="M 40 588 H 22 C 16 588 14 582 14 574 V 292 C 14 284 16 280 22 280 H 36" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="4 3" markerEnd="url(#m-sl-feedback-arrow)" />

      {/* Horizontal badge on feedback path */}
      <rect x="16" y="440" width="136" height="20" rx="4" fill="#1c1304" stroke="#fbbf24" strokeWidth="1" />
      <text x="84" y="454" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="800">
        ⮡ RETRY W/ TRACE
      </text>

      {/* STEP 01 */}
      <g transform="translate(40, 68)">
        <rect width="364" height="120" rx="10" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="10" y="10" width="58" height="20" rx="4" fill="#082f49" />
        <text x="39" y="24" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="800">STEP 01</text>
        <text x="76" y="24" fill="#f8fafc" fontSize="11" fontWeight="800">MISSING FACT?</text>
        <text x="180" y="25" fill="#38bdf8" fontSize="13" fontWeight="900">→ RETRIEVE</text>
        <line x1="10" y1="36" x2="354" y2="36" stroke="#1e293b" strokeWidth="1" />
        <rect x="10" y="44" width="124" height="20" rx="4" fill="#0c1e33" stroke="#38bdf8" strokeOpacity="0.4" />
        <text x="72" y="58" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="700">Tools &amp; Grep</text>
        <rect x="194" y="44" width="160" height="20" rx="4" fill="#082f49" fillOpacity="0.5" />
        <text x="274" y="58" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700">Zero deliberation cost</text>
        <text x="10" y="82" fill="#cbd5e1" fontSize="10.5">Never deliberate on what can be read from disk.</text>
        <text x="10" y="98" fill="#94a3b8" fontSize="10">Empirical grounding before thinking · Ground truth first</text>
      </g>

      <line x1="222" y1="188" x2="222" y2="208" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#m-sl-arrow-cyan)" />
      <rect x="168" y="193" width="108" height="16" rx="3" fill="#082f49" stroke="#38bdf8" strokeWidth="0.8" />
      <text x="222" y="205" textAnchor="middle" fill="#7dd3fc" fontSize="8.5" fontWeight="800">FACTS RETRIEVED</text>

      {/* STEP 02 */}
      <g transform="translate(40, 212)">
        <rect width="364" height="120" rx="10" fill="#090d16" stroke="#ec4899" strokeWidth="1.5" />
        <rect x="10" y="10" width="58" height="20" rx="4" fill="#4a0429" />
        <text x="39" y="24" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="800">STEP 02</text>
        <text x="76" y="24" fill="#f8fafc" fontSize="11" fontWeight="800">HARD INFERENCE?</text>
        <text x="196" y="25" fill="#ec4899" fontSize="13" fontWeight="900">→ REASON</text>
        <line x1="10" y1="36" x2="354" y2="36" stroke="#1e293b" strokeWidth="1" />
        <rect x="10" y="44" width="134" height="20" rx="4" fill="#2d081b" stroke="#ec4899" strokeOpacity="0.4" />
        <text x="77" y="58" textAnchor="middle" fill="#f472b6" fontSize="10" fontWeight="700">Reasoning Tokens</text>
        <rect x="194" y="44" width="160" height="20" rx="4" fill="#4a0429" fillOpacity="0.5" />
        <text x="274" y="58" textAnchor="middle" fill="#ec4899" fontSize="9.5" fontWeight="700">Targeted search budget</text>
        <text x="10" y="82" fill="#cbd5e1" fontSize="10.5">Spend search budget on logic branches &amp; invariants.</text>
        <text x="10" y="98" fill="#94a3b8" fontSize="10">Deliberate only when problem requires logical deduction</text>
      </g>

      <line x1="222" y1="332" x2="222" y2="352" stroke="#ec4899" strokeWidth="2" markerEnd="url(#m-sl-arrow-pink)" />
      <rect x="168" y="337" width="108" height="16" rx="3" fill="#4a0429" stroke="#ec4899" strokeWidth="0.8" />
      <text x="222" y="349" textAnchor="middle" fill="#f472b6" fontSize="8.5" fontWeight="800">CODE GENERATED</text>

      {/* STEP 03 */}
      <g transform="translate(40, 356)">
        <rect width="364" height="120" rx="10" fill="#090d16" stroke="#34d399" strokeWidth="1.5" />
        <rect x="10" y="10" width="58" height="20" rx="4" fill="#064e3b" />
        <text x="39" y="24" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="800">STEP 03</text>
        <text x="76" y="24" fill="#f8fafc" fontSize="11" fontWeight="800">NOT SURE?</text>
        <text x="160" y="25" fill="#34d399" fontSize="13" fontWeight="900">→ VERIFY</text>
        <line x1="10" y1="36" x2="354" y2="36" stroke="#1e293b" strokeWidth="1" />
        <rect x="10" y="44" width="134" height="20" rx="4" fill="#062e22" stroke="#34d399" strokeOpacity="0.4" />
        <text x="77" y="58" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="700">Compiler &amp; Tests</text>
        <rect x="194" y="44" width="160" height="20" rx="4" fill="#064e3b" fillOpacity="0.5" />
        <text x="274" y="58" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="700">Deterministic check</text>
        <text x="10" y="82" fill="#cbd5e1" fontSize="10.5">Let deterministic tooling confirm or refute code.</text>
        <text x="10" y="98" fill="#94a3b8" fontSize="10">Never trust unverified internal model confidence over tests</text>
      </g>

      <line x1="222" y1="476" x2="222" y2="496" stroke="#34d399" strokeWidth="2" markerEnd="url(#m-sl-arrow-emerald)" />
      <rect x="168" y="481" width="108" height="16" rx="3" fill="#1c1304" stroke="#fbbf24" strokeWidth="0.8" />
      <text x="222" y="493" textAnchor="middle" fill="#fde68a" fontSize="8.5" fontWeight="800">IF NOT VERIFIED</text>

      {/* STEP 04 */}
      <g transform="translate(40, 500)">
        <rect width="364" height="130" rx="10" fill="#090d16" stroke="#fbbf24" strokeWidth="1.5" />
        <rect x="10" y="10" width="58" height="20" rx="4" fill="#451a03" />
        <text x="39" y="24" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="800">STEP 04</text>
        <text x="76" y="24" fill="#f8fafc" fontSize="11" fontWeight="800">STILL STUCK?</text>
        <text x="176" y="25" fill="#fbbf24" fontSize="13" fontWeight="900">→ ESCALATE</text>
        <line x1="10" y1="36" x2="354" y2="36" stroke="#1e293b" strokeWidth="1" />
        <rect x="10" y="44" width="146" height="20" rx="4" fill="#291c06" stroke="#fbbf24" strokeOpacity="0.4" />
        <text x="83" y="58" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="700">Armed w/ Error Trace</text>
        <rect x="194" y="44" width="160" height="20" rx="4" fill="#451a03" fillOpacity="0.5" />
        <text x="274" y="58" textAnchor="middle" fill="#fbbf24" fontSize="9.5" fontWeight="700">Bump effort + evidence</text>
        <text x="10" y="82" fill="#cbd5e1" fontSize="10.5">Only bump effort when armed with error diagnostics.</text>
        <text x="10" y="98" fill="#fde68a" fontSize="10" fontWeight="700">⮡ Feeds back up to Step 02 Reason with new trace</text>
        <text x="10" y="114" fill="#94a3b8" fontSize="9.5">Blind retries without new empirical facts will fail again</text>
      </g>

      <line x1="222" y1="630" x2="222" y2="650" stroke="#34d399" strokeWidth="2" markerEnd="url(#m-sl-arrow-green)" />
      <rect x="168" y="635" width="108" height="16" rx="3" fill="#064e3b" stroke="#34d399" strokeWidth="0.8" />
      <text x="222" y="647" textAnchor="middle" fill="#a7f3d0" fontSize="8.5" fontWeight="800">WHEN TESTS PASS</text>

      {/* STEP 05 */}
      <g transform="translate(40, 654)">
        <rect width="364" height="120" rx="10" fill="#090d16" stroke="#34d399" strokeWidth="1.5" />
        <rect x="10" y="10" width="58" height="20" rx="4" fill="#064e3b" />
        <text x="39" y="24" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="800">STEP 05</text>
        <text x="76" y="24" fill="#f8fafc" fontSize="11" fontWeight="800">RESOLVED?</text>
        <text x="166" y="25" fill="#34d399" fontSize="13" fontWeight="900">→ STOP &amp; SHIP</text>
        <line x1="10" y1="36" x2="354" y2="36" stroke="#1e293b" strokeWidth="1" />
        <rect x="10" y="44" width="134" height="20" rx="4" fill="#063324" stroke="#34d399" strokeOpacity="0.4" />
        <text x="77" y="58" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="700">Immediate Halt</text>
        <rect x="194" y="44" width="160" height="20" rx="4" fill="#064e3b" fillOpacity="0.5" />
        <text x="274" y="58" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="700">Zero token rumination</text>
        <text x="10" y="82" fill="#cbd5e1" fontSize="10.5">Tests pass green. Deliberation halts immediately.</text>
        <text x="10" y="98" fill="#a7f3d0" fontSize="10">Never buy another unit of thinking once verified green</text>
      </g>

      {/* BOTTOM BANNER */}
      <rect x="16" y="796" width="388" height="230" rx="14" fill="#0b1329" stroke="#38bdf8" strokeWidth="1.2" />
      <rect x="74" y="786" width="272" height="22" rx="11" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
      <text x="210" y="801" textAnchor="middle" fill="#f8fafc" fontSize="9.5" fontWeight="800" letterSpacing="0.7">
        MINIMUM SUFFICIENT DELIBERATION
      </text>

      <text x="210" y="830" textAnchor="middle" fill="#f8fafc" fontSize="13.5" fontWeight="800">
        The best agent isn&apos;t the one that thinks the most.
      </text>
      <text x="210" y="852" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="700">
        It is the one that knows when another unit of thinking
      </text>
      <text x="210" y="868" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="700">
        is still worth buying.
      </text>

      {/* 3 Core Rules */}
      <g transform="translate(28, 884)">
        <rect y="0" width="364" height="30" rx="5" fill="#0f172a" stroke="#1e293b" />
        <rect x="6" y="5" width="80" height="20" rx="3" fill="#082f49" />
        <text x="46" y="19" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="800">RETRIEVAL</text>
        <text x="96" y="20" fill="#cbd5e1" fontSize="10">Absent facts → grep/tools (100x cheaper)</text>

        <rect y="36" width="364" height="30" rx="5" fill="#0f172a" stroke="#1e293b" />
        <rect x="6" y="41" width="80" height="20" rx="3" fill="#4a0429" />
        <text x="46" y="55" textAnchor="middle" fill="#ec4899" fontSize="8.5" fontWeight="800">REASONING</text>
        <text x="96" y="56" fill="#cbd5e1" fontSize="10">Hard inference → search budget on logic</text>

        <rect y="72" width="364" height="30" rx="5" fill="#0f172a" stroke="#1e293b" />
        <rect x="6" y="77" width="80" height="20" rx="3" fill="#064e3b" />
        <text x="46" y="91" textAnchor="middle" fill="#34d399" fontSize="8.5" fontWeight="800">HALT RULE</text>
        <text x="96" y="92" fill="#cbd5e1" fontSize="10">Tests green → stop &amp; ship immediately</text>
      </g>

      {/* Provenance */}
      <text x="210" y="1058" textAnchor="middle" fill="#94a3b8" fontSize="10">
        Illustrative · Test-time compute allocation policy · Gaia Research
      </text>
    </svg>
  );
}
