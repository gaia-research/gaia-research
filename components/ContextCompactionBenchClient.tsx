"use client";

import { useState, useEffect, useRef, type ReactNode, type AnchorHTMLAttributes, type HTMLAttributes } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface ContextCompactionBenchClientProps {
  methodology: string;
  receipts: string;
}

type ActiveTab = "methodology" | "receipts" | "both";
type ViewLayout = "two-col" | "single-col";

const METHODOLOGY_SECTIONS = [
  { id: "sec-abstract", label: "Abstract" },
  { id: "sec-intro", label: "1. Introduction" },
  { id: "sec-methodology", label: "2. Methodology & Architecture" },
  { id: "sec-results", label: "3. Empirical Results" },
  { id: "sec-discussion", label: "4. Discussion & Conclusions" },
  { id: "sec-recommendations", label: "5. Recommendations" },
  { id: "sec-appendix", label: "6. Appendix & Receipts" },
  { id: "sec-references", label: "References" },
];

const RECEIPTS_SECTIONS = [
  { id: "rec-matrix", label: "1. Executive Matrix" },
  { id: "rec-s1", label: "2. S1: Cold Return" },
  { id: "rec-s2", label: "3. S2: Warm Cache" },
  { id: "rec-s3", label: "4. S3: Reasoning Inflation" },
  { id: "rec-s4", label: "5. S4: Compaction Curve" },
  { id: "rec-s5", label: "6. S5: Quality & Retention" },
  { id: "rec-s6", label: "7. S6: 1M Endurance" },
  { id: "rec-provenance", label: "8. Session Manifest" },
];

const PAPER_PAGES = [
  { num: 1, label: "Title & Architecture", headerRight: "PREPRINT · SEPTEMBER 2026" },
  { num: 2, label: "Results & Scaling", headerRight: "III. EMPIRICAL RESULTS" },
  { num: 3, label: "Pareto Frontier", headerRight: "III. EMPIRICAL RESULTS (CONT.)" },
  { num: 4, label: "Discussion & References", headerRight: "IV. DISCUSSION & REFERENCES" },
];

function extractText(node: unknown): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    return extractText((node as { props?: { children?: unknown } }).props?.children);
  }
  return "";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getHeadingId(text: string): string {
  const t = text.toLowerCase().trim();
  if (t.includes("abstract")) return "sec-abstract";
  if (t.includes("introduction") || (t.includes("1.") && t.includes("intro"))) return "sec-intro";
  if (
    t.includes("experimental methodology") ||
    t.includes("methodology & architecture") ||
    (t.includes("2.") && t.includes("methodology"))
  )
    return "sec-methodology";
  if (
    t.includes("empirical results") ||
    t.includes("scenario breakdown") ||
    (t.includes("3.") && t.includes("results"))
  )
    return "sec-results";
  if (
    t.includes("discussion & conclusions") ||
    t.includes("discussion & pricing") ||
    (t.includes("4.") && t.includes("discussion"))
  )
    return "sec-discussion";
  if (
    t.includes("architectural recommendations") ||
    t.includes("recommendations") ||
    (t.includes("5.") && t.includes("recommendations"))
  )
    return "sec-recommendations";
  if (t.includes("appendix") || (t.includes("6.") && t.includes("appendix"))) return "sec-appendix";
  if (t.includes("formal references") || t.includes("references")) return "sec-references";

  if (t.includes("cross-scenario") || t.includes("comparison matrix")) return "rec-matrix";
  if (t.includes("scenario 1") && t.includes("cold")) return "rec-s1";
  if (t.includes("scenario 2") && t.includes("warm")) return "rec-s2";
  if (t.includes("scenario 3") && t.includes("reasoning")) return "rec-s3";
  if (t.includes("scenario 4") && (t.includes("compaction curve") || t.includes("pareto")))
    return "rec-s4";
  if (t.includes("scenario 5") && (t.includes("quality") || t.includes("thrashing")))
    return "rec-s5";
  if (t.includes("scenario 6") && (t.includes("1m window") || t.includes("endurance")))
    return "rec-s6";
  if (t.includes("provenance") || t.includes("manifest") || t.includes("session uuid"))
    return "rec-provenance";

  return slugify(text);
}

function getTableCaption(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("arm / run") || t.includes("representative session") || (t.includes("scenario") && t.includes("session uuid"))) {
    return "TABLE V: REPRESENTATIVE EMPIRICAL SESSION LEDGER";
  }
  if (t.includes("arm label") || t.includes("operating regime")) {
    return "TABLE I: EXPERIMENTAL AUTOCOMPACTION ARMS & PARAMETERIZATION";
  }
  if (t.includes("01a094cb") || t.includes("1.2536")) {
    return "TABLE I: SCENARIO 1 CACHE-COLD RETURN TELEMETRY";
  }
  if (t.includes("01a095a8") || t.includes("4.4863")) {
    return "TABLE II: SCENARIO 2 ALWAYS-WARM CACHE TELEMETRY";
  }
  if (t.includes("reasoning tokens") || t.includes("20k-rep1") || t.includes("run label")) {
    return "TABLE III: REASONING TOKEN SCALING TELEMETRY (SCENARIO 3)";
  }
  if (t.includes("01a0937a") || t.includes("2.4788") || t.includes("reacq multiplier")) {
    return "TABLE IV: SCENARIO 4 COMPACTION CURVE & PARETO SWEEP METRICS";
  }
  return "TABLE: EMPIRICAL TELEMETRY";
}

function formatPaperHeading(text: string): string {
  const trimmed = text.trim();
  if (/^1\.\s+/i.test(trimmed)) return trimmed.replace(/^1\.\s+/i, "I. ").toUpperCase();
  if (/^2\.\s+/i.test(trimmed)) return trimmed.replace(/^2\.\s+/i, "II. ").toUpperCase();
  if (/^3\.\s+/i.test(trimmed)) return trimmed.replace(/^3\.\s+/i, "III. ").toUpperCase();
  if (/^4\.\s+/i.test(trimmed)) return trimmed.replace(/^4\.\s+/i, "IV. ").toUpperCase();
  if (/^5\.\s+/i.test(trimmed)) return trimmed.replace(/^5\.\s+/i, "V. ").toUpperCase();
  if (/^6\.\s+/i.test(trimmed)) return trimmed.replace(/^6\.\s+/i, "VI. ").toUpperCase();
  if (/^references/i.test(trimmed)) return "REFERENCES";
  return trimmed.toUpperCase();
}

function cleanAbstractText(raw: string): string {
  return raw
    .split("\n")
    .filter((line) => !line.includes("### Abstract") && !line.trim().startsWith("---"))
    .map((line) => line.replace(/^>\s?/, ""))
    .join("\n")
    .trim();
}

interface AcademicPages {
  abstractRaw: string;
  page1: string;
  page2: string;
  page3: string;
  page4: string;
}

function partitionMethodology(raw: string): AcademicPages {
  const sec1Idx = raw.indexOf("## 1. Introduction");
  const sec3Idx = raw.indexOf("## 3. Empirical Results");
  const sec34Idx = raw.indexOf("### 3.4 Scenario 4:");
  const sec4Idx = raw.indexOf("## 4. Discussion & Conclusions");

  const absStart = raw.indexOf("> ### Abstract");
  const abstractRaw = absStart !== -1 && sec1Idx !== -1 ? raw.slice(absStart, sec1Idx).trim() : "";

  const page1 = sec1Idx !== -1 && sec3Idx !== -1 ? raw.slice(sec1Idx, sec3Idx).trim() : raw;
  const page2 = sec3Idx !== -1 && sec34Idx !== -1 ? raw.slice(sec3Idx, sec34Idx).trim() : "";
  const page3 = sec34Idx !== -1 && sec4Idx !== -1 ? raw.slice(sec34Idx, sec4Idx).trim() : "";
  const page4 = sec4Idx !== -1 ? raw.slice(sec4Idx).trim() : "";

  return { abstractRaw, page1, page2, page3, page4 };
}

/* ─── High-Resolution Empirical SVG Diagrams ─── */

export function CompactionCurveFigureSvg({ theme = "paper" }: { theme?: "paper" | "dark" }) {
  const isPaper = theme === "paper";

  return (
    <figure className={isPaper ? "latex-paper-figure" : "blog-post-figure"} style={{ margin: "24px 0" }}>
      <div className={isPaper ? "latex-paper-figure-inner" : undefined} style={{ maxWidth: "780px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 740 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <rect
            width="740"
            height="460"
            rx={isPaper ? "2" : "8"}
            fill={isPaper ? "#ffffff" : "#0c1222"}
            stroke={isPaper ? "#cbd5e1" : "#1e293b"}
            strokeWidth={isPaper ? 1 : 1}
          />
          <text
            x="370"
            y="30"
            fill={isPaper ? "#0f172a" : "#f8fafc"}
            fontSize="14"
            fontWeight="700"
            textAnchor="middle"
            fontFamily={isPaper ? '"Times New Roman", Times, serif' : undefined}
          >
            Figure 1: Context Compaction Cost vs Thrashing Pareto Frontier
          </text>
          <text
            x="370"
            y="48"
            fill={isPaper ? "#475569" : "#94a3b8"}
            fontSize="11"
            textAnchor="middle"
            fontFamily={isPaper ? '"Times New Roman", Times, serif' : undefined}
          >
            Scenario 4 Pareto Sweep (8 autocompaction arms, 37 total suite runs)
          </text>

          <line x1="80" y1="80" x2="680" y2="80" stroke={isPaper ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
          <line x1="80" y1="150" x2="680" y2="150" stroke={isPaper ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
          <line x1="80" y1="220" x2="680" y2="220" stroke={isPaper ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
          <line x1="80" y1="290" x2="680" y2="290" stroke={isPaper ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
          <line x1="80" y1="360" x2="680" y2="360" stroke={isPaper ? "#475569" : "#334155"} strokeWidth="1.2" />

          <text
            x="25"
            y="220"
            fill={isPaper ? "#1d4ed8" : "#38bdf8"}
            fontSize="11"
            fontWeight="600"
            transform="rotate(-90 25 220)"
            textAnchor="middle"
          >
            Cost per Turn ($)
          </text>
          <text x="72" y="85" fill={isPaper ? "#475569" : "#64748b"} fontSize="10" textAnchor="end">
            $0.10
          </text>
          <text x="72" y="155" fill={isPaper ? "#475569" : "#64748b"} fontSize="10" textAnchor="end">
            $0.075
          </text>
          <text x="72" y="225" fill={isPaper ? "#475569" : "#64748b"} fontSize="10" textAnchor="end">
            $0.05
          </text>
          <text x="72" y="295" fill={isPaper ? "#475569" : "#64748b"} fontSize="10" textAnchor="end">
            $0.025
          </text>
          <text x="72" y="365" fill={isPaper ? "#475569" : "#64748b"} fontSize="10" textAnchor="end">
            $0.00
          </text>

          <text
            x="715"
            y="220"
            fill={isPaper ? "#b91c1c" : "#ec4899"}
            fontSize="11"
            fontWeight="600"
            transform="rotate(90 715 220)"
            textAnchor="middle"
          >
            Reacquisition Thrashing
          </text>
          <text x="688" y="85" fill={isPaper ? "#475569" : "#64748b"} fontSize="10">
            6.0×
          </text>
          <text x="688" y="155" fill={isPaper ? "#475569" : "#64748b"} fontSize="10">
            4.5×
          </text>
          <text x="688" y="225" fill={isPaper ? "#475569" : "#64748b"} fontSize="10">
            3.0×
          </text>
          <text x="688" y="295" fill={isPaper ? "#475569" : "#64748b"} fontSize="10">
            1.5×
          </text>
          <text x="688" y="365" fill={isPaper ? "#475569" : "#64748b"} fontSize="10">
            1.0×
          </text>

          <rect
            x="290"
            y="70"
            width="180"
            height="290"
            fill="#10b981"
            fillOpacity={isPaper ? "0.08" : "0.08"}
            stroke={isPaper ? "#10b981" : "none"}
            strokeDasharray={isPaper ? "3 3" : undefined}
            rx="4"
          />
          <text
            x="380"
            y="90"
            fill={isPaper ? "#065f46" : "#34d399"}
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
          >
            ★ EMPIRICAL SWEET SPOT (150k–272k)
          </text>

          <path
            d="M 120 187 C 160 215, 200 230, 320 248 C 380 255, 420 252, 480 250 C 530 245, 580 220, 640 93"
            fill="none"
            stroke={isPaper ? "#2563eb" : "#38bdf8"}
            strokeWidth={isPaper ? "2.5" : "3"}
          />

          <path
            d="M 120 103 C 170 190, 220 240, 320 291 C 380 302, 480 307, 640 314"
            fill="none"
            stroke={isPaper ? "#dc2626" : "#ec4899"}
            strokeWidth={isPaper ? "2.5" : "3"}
            strokeDasharray="5 3"
          />

          <circle cx="120" cy="187" r="4.5" fill={isPaper ? "#ffffff" : "#38bdf8"} stroke="#2563eb" strokeWidth="2" />
          <circle cx="220" cy="229" r="4.5" fill={isPaper ? "#ffffff" : "#38bdf8"} stroke="#2563eb" strokeWidth="2" />
          <circle cx="320" cy="248" r="5" fill="#059669" stroke="#10b981" strokeWidth="2" />
          <circle cx="400" cy="252" r="5" fill="#059669" stroke="#10b981" strokeWidth="2" />
          <circle cx="480" cy="250" r="5" fill="#059669" stroke="#10b981" strokeWidth="2" />
          <circle cx="640" cy="93" r="4.5" fill={isPaper ? "#ffffff" : "#ef4444"} stroke="#dc2626" strokeWidth="2" />

          <circle cx="120" cy="103" r="4.5" fill={isPaper ? "#ffffff" : "#ec4899"} stroke="#dc2626" strokeWidth="2" />
          <circle cx="220" cy="231" r="4.5" fill={isPaper ? "#ffffff" : "#ec4899"} stroke="#dc2626" strokeWidth="2" />
          <circle cx="320" cy="291" r="4.5" fill={isPaper ? "#ffffff" : "#ec4899"} stroke="#dc2626" strokeWidth="2" />
          <circle cx="400" cy="302" r="4.5" fill={isPaper ? "#ffffff" : "#ec4899"} stroke="#dc2626" strokeWidth="2" />
          <circle cx="480" cy="307" r="4.5" fill={isPaper ? "#ffffff" : "#ec4899"} stroke="#dc2626" strokeWidth="2" />
          <circle cx="640" cy="314" r="4.5" fill={isPaper ? "#ffffff" : "#ec4899"} stroke="#dc2626" strokeWidth="2" />

          <text x="120" y="380" fill={isPaper ? "#334155" : "#94a3b8"} fontSize="10" textAnchor="middle">
            50k
          </text>
          <text x="220" y="380" fill={isPaper ? "#334155" : "#94a3b8"} fontSize="10" textAnchor="middle">
            100k
          </text>
          <text x="320" y="380" fill={isPaper ? "#065f46" : "#34d399"} fontSize="10" fontWeight="700" textAnchor="middle">
            150k
          </text>
          <text x="400" y="380" fill={isPaper ? "#065f46" : "#34d399"} fontSize="10" fontWeight="700" textAnchor="middle">
            200k
          </text>
          <text x="480" y="380" fill={isPaper ? "#065f46" : "#34d399"} fontSize="10" fontWeight="700" textAnchor="middle">
            272k
          </text>
          <text x="560" y="380" fill={isPaper ? "#334155" : "#94a3b8"} fontSize="10" textAnchor="middle">
            500k
          </text>
          <text x="640" y="380" fill={isPaper ? "#334155" : "#94a3b8"} fontSize="10" textAnchor="middle">
            Disabled
          </text>

          <text x="380" y="405" fill={isPaper ? "#0f172a" : "#94a3b8"} fontSize="11" fontWeight="600" textAnchor="middle">
            Compaction Threshold Ceiling
          </text>

          <rect
            x="180"
            y="420"
            width="380"
            height="28"
            rx="4"
            fill={isPaper ? "#f8fafc" : "#05060a"}
            stroke={isPaper ? "#cbd5e1" : "#1e293b"}
          />
          <line x1="200" y1="434" x2="225" y2="434" stroke={isPaper ? "#2563eb" : "#38bdf8"} strokeWidth="2.5" />
          <text x="232" y="438" fill={isPaper ? "#1e293b" : "#cbd5e1"} fontSize="10">
            Cost/turn ($)
          </text>

          <line
            x1="330"
            y1="434"
            x2="355"
            y2="434"
            stroke={isPaper ? "#dc2626" : "#ec4899"}
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />
          <text x="362" y="438" fill={isPaper ? "#1e293b" : "#cbd5e1"} fontSize="10">
            Reacq. Thrashing (tool multiplier)
          </text>
        </svg>
      </div>
      <figcaption className={isPaper ? "latex-paper-fig-caption" : undefined} style={!isPaper ? { color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px", textAlign: "center" } : undefined}>
        <strong>Fig. 1.</strong> Context compaction cost vs. reacquisition thrashing Pareto frontier across 37 instrumented suite runs (25 across S1/S2/S4/S6 + 12 across S3). The true cost-optimal operating valley shifts rightward to 150k–272k tokens under flat cache pricing.
      </figcaption>
    </figure>
  );
}

export function ReasoningScalingFigureSvg({ theme = "paper" }: { theme?: "paper" | "dark" }) {
  const isPaper = theme === "paper";

  return (
    <figure className={isPaper ? "latex-paper-figure" : "blog-post-figure"} style={{ margin: "24px 0" }}>
      <div className={isPaper ? "latex-paper-figure-inner" : undefined} style={{ maxWidth: "780px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 740 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <rect
            width="740"
            height="460"
            rx={isPaper ? "2" : "8"}
            fill={isPaper ? "#ffffff" : "#0c1222"}
            stroke={isPaper ? "#cbd5e1" : "#1e293b"}
            strokeWidth={isPaper ? 1 : 1}
          />
          <text
            x="370"
            y="30"
            fill={isPaper ? "#0f172a" : "#f8fafc"}
            fontSize="14"
            fontWeight="700"
            textAnchor="middle"
            fontFamily={isPaper ? '"Times New Roman", Times, serif' : undefined}
          >
            Figure 2: Reasoning Token Inflation vs Context Window Depth
          </text>
          <text
            x="370"
            y="48"
            fill={isPaper ? "#475569" : "#94a3b8"}
            fontSize="11"
            textAnchor="middle"
            fontFamily={isPaper ? '"Times New Roman", Times, serif' : undefined}
          >
            12 controlled refactoring runs at varying context depths on Gemini 3.8 Flash (Scenario 3)
          </text>

          <line x1="90" y1="80" x2="680" y2="80" stroke={isPaper ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
          <line x1="90" y1="150" x2="680" y2="150" stroke={isPaper ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
          <line x1="90" y1="220" x2="680" y2="220" stroke={isPaper ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
          <line x1="90" y1="290" x2="680" y2="290" stroke={isPaper ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
          <line x1="90" y1="360" x2="680" y2="360" stroke={isPaper ? "#475569" : "#334155"} strokeWidth="1.2" />

          <text
            x="30"
            y="220"
            fill={isPaper ? "#b45309" : "#f59e0b"}
            fontSize="11"
            fontWeight="600"
            transform="rotate(-90 30 220)"
            textAnchor="middle"
          >
            Reasoning / Thinking Tokens
          </text>
          <text x="82" y="85" fill={isPaper ? "#475569" : "#64748b"} fontSize="10" textAnchor="end">
            6,000
          </text>
          <text x="82" y="155" fill={isPaper ? "#475569" : "#64748b"} fontSize="10" textAnchor="end">
            4,500
          </text>
          <text x="82" y="225" fill={isPaper ? "#475569" : "#64748b"} fontSize="10" textAnchor="end">
            3,000
          </text>
          <text x="82" y="295" fill={isPaper ? "#475569" : "#64748b"} fontSize="10" textAnchor="end">
            1,500
          </text>
          <text x="82" y="365" fill={isPaper ? "#475569" : "#64748b"} fontSize="10" textAnchor="end">
            0
          </text>

          <line
            x1="90"
            y1="360"
            x2="680"
            y2="225"
            stroke={isPaper ? "#64748b" : "#475569"}
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text x="640" y="215" fill={isPaper ? "#64748b" : "#64748b"} fontSize="10">
            Linear baseline (β = 1.0)
          </text>

          <path
            d="M 90 360 C 180 355, 270 335, 450 274 C 540 220, 620 160, 670 117"
            fill="none"
            stroke={isPaper ? "#d97706" : "#f59e0b"}
            strokeWidth={isPaper ? "3" : "3.5"}
          />

          <circle cx="160" cy="349" r="5" fill={isPaper ? "#ffffff" : "#f59e0b"} stroke="#d97706" strokeWidth="2" />
          <text x="160" y="335" fill={isPaper ? "#92400e" : "#fde68a"} fontSize="10" fontWeight="700" textAnchor="middle">
            233 tok
          </text>

          <circle cx="270" cy="329" r="5" fill={isPaper ? "#ffffff" : "#f59e0b"} stroke="#d97706" strokeWidth="2" />
          <text x="270" y="315" fill={isPaper ? "#92400e" : "#fde68a"} fontSize="10" fontWeight="700" textAnchor="middle">
            654 tok
          </text>

          <circle cx="450" cy="274" r="5" fill={isPaper ? "#ffffff" : "#f59e0b"} stroke="#d97706" strokeWidth="2" />
          <text x="450" y="258" fill={isPaper ? "#92400e" : "#fde68a"} fontSize="10" fontWeight="700" textAnchor="middle">
            1,842 tok
          </text>

          <circle cx="670" cy="117" r="6" fill={isPaper ? "#ffffff" : "#f59e0b"} stroke="#d97706" strokeWidth="2.5" />
          <text
            x="670"
            y="100"
            fill={isPaper ? "#92400e" : "#fde68a"}
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
          >
            5,210 tok (22.4×)
          </text>

          <text x="160" y="380" fill={isPaper ? "#334155" : "#94a3b8"} fontSize="10" textAnchor="middle">
            50k
          </text>
          <text x="270" y="380" fill={isPaper ? "#334155" : "#94a3b8"} fontSize="10" textAnchor="middle">
            100k
          </text>
          <text x="450" y="380" fill={isPaper ? "#334155" : "#94a3b8"} fontSize="10" textAnchor="middle">
            200k
          </text>
          <text x="670" y="380" fill={isPaper ? "#334155" : "#94a3b8"} fontSize="10" textAnchor="middle">
            400k
          </text>

          <text x="380" y="405" fill={isPaper ? "#0f172a" : "#94a3b8"} fontSize="11" fontWeight="600" textAnchor="middle">
            Context Window Depth (L)
          </text>

          <rect
            x="220"
            y="140"
            width="230"
            height="60"
            rx="4"
            fill={isPaper ? "#fffbeb" : "#1e293b"}
            fillOpacity={isPaper ? "1" : "0.9"}
            stroke={isPaper ? "#fcd34d" : "#f59e0b"}
            strokeWidth="1"
          />
          <text
            x="335"
            y="162"
            fill={isPaper ? "#78350f" : "#fbbf24"}
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
          >
            Super-Linear Exponent: β = 1.49
          </text>
          <text x="335" y="182" fill={isPaper ? "#451a03" : "#cbd5e1"} fontSize="10" textAnchor="middle">
            8× context increase → 22.4× thinking tokens
          </text>
        </svg>
      </div>
      <figcaption className={isPaper ? "latex-paper-fig-caption" : undefined} style={!isPaper ? { color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px", textAlign: "center" } : undefined}>
        <strong>Fig. 2.</strong> Reasoning token scaling vs context depth. Internal deliberation tokens expand super-linearly ($T = 2.525 \times 10^{-6} \cdot L^{1.49}$, $\beta \approx 1.49$).
      </figcaption>
    </figure>
  );
}

export default function ContextCompactionBenchClient({
  methodology,
  receipts,
}: ContextCompactionBenchClientProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("methodology");
  const [viewLayout, setViewLayout] = useState<ViewLayout>("two-col");
  const [activePage, setActivePage] = useState<number>(1);
  const [isContinuous, setIsContinuous] = useState<boolean>(false);
  const [showFigures, setShowFigures] = useState<boolean>(true);

  const deskRef = useRef<HTMLDivElement>(null);

  const sanitizedMethodology = methodology.replace(/(?<![\$\\])\$(?=\d)/g, "\\$");
  const sanitizedReceipts = receipts.replace(/(?<![\$\\])\$(?=\d)/g, "\\$");

  const pages = partitionMethodology(sanitizedMethodology);

  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === "#receipts" || hash.startsWith("#rec-")) {
      setActiveTab("receipts");
      setViewLayout("single-col");
    } else if (hash === "#both" || hash === "#all") {
      setActiveTab("both");
      setViewLayout("single-col");
    } else if (hash === "#page-1" || hash === "#p1") {
      setViewLayout("two-col");
      setActivePage(1);
    } else if (hash === "#page-2" || hash === "#p2") {
      setViewLayout("two-col");
      setActivePage(2);
    } else if (hash === "#page-3" || hash === "#p3") {
      setViewLayout("two-col");
      setActivePage(3);
    } else if (hash === "#page-4" || hash === "#p4") {
      setViewLayout("two-col");
      setActivePage(4);
    }
  }, []);

  const handlePageSelect = (num: number) => {
    setIsContinuous(false);
    setActivePage(num);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#page-${num}`);
      if (deskRef.current) {
        deskRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleContinuousToggle = () => {
    setIsContinuous((prev) => !prev);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const newHash =
        tab === "methodology" ? "#methodology" : tab === "receipts" ? "#receipts" : "#all";
      window.history.replaceState(null, "", newHash);
    }
  };

  const handleJump = (tab: "methodology" | "receipts", id: string) => {
    if (activeTab !== "both" && activeTab !== tab) {
      setActiveTab(tab);
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  // Markdown components for LaTeX Paper Mode (Academic Sheets)
  const paperMarkdownComponents = {
    h2: ({ children }: { children?: ReactNode }) => {
      const text = extractText(children);
      const id = getHeadingId(text);
      const formatted = formatPaperHeading(text);
      return (
        <h2 id={id} className="latex-sheet-h2">
          {formatted}
        </h2>
      );
    },
    h3: ({ children }: { children?: ReactNode }) => {
      const text = extractText(children);
      const id = slugify(text);
      return (
        <h3 id={id} className="latex-sheet-h3">
          {children}
        </h3>
      );
    },
    table: ({ children }: { children?: ReactNode }) => {
      const text = extractText(children);
      const caption = getTableCaption(text);
      return (
        <div className="latex-booktabs-container">
          <div className="latex-booktabs-caption">{caption}</div>
          <div className="latex-booktabs-scroll">
            <table className="latex-booktabs-table">{children}</table>
          </div>
        </div>
      );
    },
    pre: ({ children, style, ...props }: HTMLAttributes<HTMLPreElement>) => {
      const text = extractText(children);
      if (text.includes("THE COMPACTION CURVE")) {
        return <CompactionCurveFigureSvg theme="paper" />;
      }
      if (text.includes("REASONING TOKEN INFLATION")) {
        return <ReasoningScalingFigureSvg theme="paper" />;
      }
      return (
        <div className="pre-scroll-container">
          <pre
            style={{
              overflowX: "auto",
              maxWidth: "100%",
              WebkitOverflowScrolling: "touch",
              ...style,
            }}
            {...props}
          >
            {children}
          </pre>
        </div>
      );
    },
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote>{children}</blockquote>
    ),
    a: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  // Markdown components for Web View (Single Column)
  const webMarkdownComponents = {
    blockquote: ({ children }: { children?: ReactNode }) => {
      const text = extractText(children);
      if (text.includes("Abstract") || text.includes("Index Terms")) {
        return (
          <div className="latex-abstract-wrapper" id="sec-abstract">
            <div className="latex-abstract-rule" />
            <div className="latex-abstract-inner">{children}</div>
            <div className="latex-abstract-rule" />
          </div>
        );
      }
      return <blockquote className="academic-callout">{children}</blockquote>;
    },
    table: ({ children }: { children?: ReactNode }) => (
      <div className="table-scroll-container academic-table-container">
        <table className="report-table academic-paper-table">{children}</table>
      </div>
    ),
    pre: ({ children, style, ...props }: HTMLAttributes<HTMLPreElement>) => {
      const text = extractText(children);
      if (text.includes("THE COMPACTION CURVE")) {
        return <CompactionCurveFigureSvg theme="dark" />;
      }
      if (text.includes("REASONING TOKEN INFLATION")) {
        return <ReasoningScalingFigureSvg theme="dark" />;
      }
      return (
        <div
          className="pre-scroll-container academic-code-block"
          style={{
            overflowX: "auto",
            maxWidth: "100%",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <pre
            style={{
              overflowX: "auto",
              maxWidth: "100%",
              WebkitOverflowScrolling: "touch",
              ...style,
            }}
            {...props}
          >
            {children}
          </pre>
        </div>
      );
    },
    h2: ({ children }: { children?: ReactNode }) => {
      const text = extractText(children);
      const id = getHeadingId(text);
      return (
        <h2 id={id} className="report-h2-anchor">
          {children}
        </h2>
      );
    },
    h3: ({ children }: { children?: ReactNode }) => {
      const text = extractText(children);
      const id = slugify(text);
      return (
        <h3 id={id} className="report-h3-anchor">
          {children}
        </h3>
      );
    },
    a: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  const renderPaperPage = (pageNum: number) => {
    const pageMeta = PAPER_PAGES[pageNum - 1];

    return (
      <article
        key={pageNum}
        id={`paper-page-${pageNum}`}
        className="latex-paper-sheet"
        aria-label={`Academic Paper Page ${pageNum} of 4`}
      >
        {/* Running Header */}
        <header className="latex-sheet-running-header">
          <span className="latex-sheet-running-title">
            GAIA RESEARCH TECHNICAL REPORT GAIA-TR-2026-09-02
          </span>
          <span className="latex-sheet-running-meta">{pageMeta.headerRight}</span>
        </header>

        {/* Sheet 1 Title & Masthead */}
        {pageNum === 1 && (
          <>
            <div className="latex-sheet-masthead">
              <h1 className="latex-sheet-paper-title">
                Empirical Context Compaction in Autonomous Coding Agents:
                <br />
                Architectural Dynamics, Cache Economics, and the Pareto Frontier
              </h1>
              <div className="latex-sheet-authors">
                <div className="latex-sheet-author">
                  <span className="latex-sheet-author-name">Nova</span>
                  <span className="latex-sheet-author-role">Head Researcher, Gaia Research</span>
                </div>
                <div className="latex-sheet-author">
                  <span className="latex-sheet-author-name">Marcus Rafael B. Tiongson</span>
                  <span className="latex-sheet-author-role">Founder, Gaia Research</span>
                </div>
              </div>
              <div className="latex-sheet-affiliation">
                Gaia Research Laboratory · Technical Report GAIA-TR-2026-09-02
              </div>
            </div>

            {/* Abstract Block on Sheet 1 */}
            {pages.abstractRaw && (
              <div className="latex-sheet-abstract-block">
                <div className="latex-sheet-abstract-rule" />
                <div className="latex-sheet-abstract-text">
                  <Markdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {cleanAbstractText(pages.abstractRaw)}
                  </Markdown>
                </div>
                <div className="latex-sheet-abstract-rule" />
              </div>
            )}
          </>
        )}

        {/* 2-Column Content Body */}
        <div className="latex-sheet-columns">
          {pageNum === 1 && (
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={paperMarkdownComponents}
            >
              {pages.page1}
            </Markdown>
          )}

          {pageNum === 2 && (
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={paperMarkdownComponents}
            >
              {pages.page2}
            </Markdown>
          )}

          {pageNum === 3 && (
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={paperMarkdownComponents}
            >
              {pages.page3}
            </Markdown>
          )}

          {pageNum === 4 && (
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={paperMarkdownComponents}
            >
              {pages.page4}
            </Markdown>
          )}
        </div>

        {/* Running Footer */}
        <footer className="latex-sheet-running-footer">
          <span className="latex-sheet-footer-inst">Gaia Research Laboratory · Gemini 3.8 Flash</span>
          <span className="latex-sheet-page-num">Page {pageNum} of 4</span>
          <span className="latex-sheet-footer-inst">GAIA-TR-2026-09-02</span>
        </footer>
      </article>
    );
  };

  return (
    <div className={`compaction-client-container ${viewLayout === "two-col" ? "latex-paper-mode" : "web-single-column"}`}>
      {/* ── Format Toggle Toolbar ── */}
      <div className="paper-format-bar">
        <div className="paper-format-info">
          <span className="paper-format-badge">PREPRINT FORMAT</span>
          <span className="paper-format-desc">
            Classic Overleaf Conference Paper · 2-Column Physical Sheets · Gemini 3.8 Flash
          </span>
        </div>
        <div className="paper-format-toggles" role="group" aria-label="Paper layout mode">
          <button
            type="button"
            className={`paper-format-btn ${viewLayout === "two-col" ? "active" : ""}`}
            onClick={() => setViewLayout("two-col")}
            aria-pressed={viewLayout === "two-col"}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect x="1" y="2" width="6" height="12" rx="1" />
              <rect x="9" y="2" width="6" height="12" rx="1" />
            </svg>
            <span>LaTeX Paper (2-Column Paged)</span>
            <span className="paper-format-pill">DEFAULT</span>
          </button>
          <button
            type="button"
            className={`paper-format-btn ${viewLayout === "single-col" ? "active" : ""}`}
            onClick={() => setViewLayout("single-col")}
            aria-pressed={viewLayout === "single-col"}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect x="2" y="2" width="12" height="12" rx="1" />
            </svg>
            <span>Web View (Single Column)</span>
          </button>
        </div>
      </div>

      {/* ── LaTeX Academic Paper Desk View (Default) ── */}
      {viewLayout === "two-col" && (
        <section className="latex-paper-desk" ref={deskRef} aria-label="Academic Paper Sheets Desk">
          {/* ── Interactive Academic Pagination Bar ── */}
          <nav className="latex-pagination-bar" aria-label="Academic Paper Pagination Controls">
            <div className="latex-pagination-nav">
              <button
                type="button"
                className="latex-page-arrow"
                onClick={() => handlePageSelect(Math.max(1, activePage - 1))}
                disabled={isContinuous || activePage === 1}
                aria-label="Previous Page"
              >
                ← Previous Page
              </button>

              <div className="latex-page-pills" role="tablist" aria-label="Page selection">
                {PAPER_PAGES.map((page) => (
                  <button
                    key={page.num}
                    type="button"
                    role="tab"
                    aria-selected={!isContinuous && activePage === page.num}
                    className={`latex-page-pill ${!isContinuous && activePage === page.num ? "active" : ""}`}
                    onClick={() => handlePageSelect(page.num)}
                  >
                    <span className="latex-page-pill-num">{page.num}</span>
                    <span className="latex-page-pill-label">{page.label}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="latex-page-arrow"
                onClick={() => handlePageSelect(Math.min(4, activePage + 1))}
                disabled={isContinuous || activePage === 4}
                aria-label="Next Page"
              >
                Next Page →
              </button>
            </div>

            <div className="latex-pagination-tools">
              <button
                type="button"
                className={`latex-continuous-btn ${isContinuous ? "active" : ""}`}
                onClick={handleContinuousToggle}
                aria-pressed={isContinuous}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <rect x="2" y="1" width="12" height="3" rx="0.5" />
                  <rect x="2" y="6" width="12" height="3" rx="0.5" />
                  <rect x="2" y="11" width="12" height="3" rx="0.5" />
                </svg>
                <span>{isContinuous ? "Viewing Continuous Desk (All Pages)" : "Continuous Print View (All Pages)"}</span>
              </button>
              <span className="latex-page-counter">
                {isContinuous ? "Cascading Pages 1–4 of 4" : `Page ${activePage} of 4`}
              </span>
            </div>
          </nav>

          {/* Render Either Single Sheet or All Cascading Sheets */}
          {isContinuous ? (
            <div className="latex-continuous-stack">
              {[1, 2, 3, 4].map((num) => renderPaperPage(num))}
            </div>
          ) : (
            renderPaperPage(activePage)
          )}
        </section>
      )}

      {/* ── Web View (Single Column Fallback Mode) ── */}
      {viewLayout === "single-col" && (
        <div className="web-single-column-container">
          {/* Key Metrics Snapshot Grid */}
          <div className="fig-stats" style={{ margin: "1.5rem 0 2rem" }}>
            <div className="fig-stat">
              <span className="fig-stat-val">37 RUNS</span>
              <span className="fig-stat-label">Live Agent Sessions</span>
              <span className="fig-stat-sub">25 across S1/S2/S4/S6 + 12 across S3</span>
            </div>
            <div className="fig-stat emph">
              <span className="fig-stat-val">150k–272k</span>
              <span className="fig-stat-label">Empirical Sweet Spot</span>
              <span className="fig-stat-sub">Shifted right by $0.075 cache read</span>
            </div>
            <div className="fig-stat">
              <span className="fig-stat-val">β = 1.49</span>
              <span className="fig-stat-label">Super-Linear Scaling</span>
              <span className="fig-stat-sub">Deliberation tokens expand with depth</span>
            </div>
            <div className="fig-stat emph">
              <span className="fig-stat-val">100.0%</span>
              <span className="fig-stat-label">Constraint Retention</span>
              <span className="fig-stat-sub">Zero negative constraint drop</span>
            </div>
          </div>

          {/* Primary Tab Switcher */}
          <div className="report-tabs" role="tablist" aria-label="Research documentation views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "methodology"}
              className={`report-tab-btn ${activeTab === "methodology" ? "active" : ""}`}
              onClick={() => handleTabChange("methodology")}
            >
              <span>Methodology &amp; Architecture</span>
              <span className="report-tab-badge">6 SECTIONS</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "receipts"}
              className={`report-tab-btn ${activeTab === "receipts" ? "active" : ""}`}
              onClick={() => handleTabChange("receipts")}
            >
              <span>Authoritative Ledger &amp; Receipts</span>
              <span className="report-tab-badge">37 SESSIONS · LITELLM</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "both"}
              className={`report-tab-btn ${activeTab === "both" ? "active" : ""}`}
              onClick={() => handleTabChange("both")}
            >
              <span>Complete Dossier</span>
              <span className="report-tab-badge">BOTH</span>
            </button>
          </div>

          {/* Section Jump Navigation Bar */}
          <nav className="report-jump-nav" aria-label="Quick section navigation">
            <span className="report-jump-label">Jump to:</span>
            {(activeTab === "methodology" || activeTab === "both") &&
              METHODOLOGY_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className="report-jump-pill"
                  onClick={() => handleJump("methodology", sec.id)}
                >
                  {sec.label}
                </button>
              ))}
            {(activeTab === "receipts" || activeTab === "both") &&
              RECEIPTS_SECTIONS.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  className="report-jump-pill"
                  style={{ borderColor: "rgba(236,72,153,.3)", color: "var(--pink)" }}
                  onClick={() => handleJump("receipts", rec.id)}
                >
                  {rec.label}
                </button>
              ))}
          </nav>

          {/* Optional Vector Figures Accordion */}
          <details
            className="claim-accordion"
            open={showFigures}
            onToggle={(e) => setShowFigures((e.target as HTMLDetailsElement).open)}
            style={{ margin: "0 0 2.5rem" }}
          >
            <summary className="claim-accordion-summary">
              <div className="claim-accordion-title">
                <span className="claim-accordion-icon">{showFigures ? "▼" : "▶"}</span>
                <span>Empirical Vector Figures (Pareto Sweep &amp; Scaling Fit)</span>
              </div>
              <div className="claim-accordion-badges">
                <span className="claim-pill bound">FIGURES 1 &amp; 2</span>
                <span className="claim-pill">INTERACTIVE SVGS</span>
              </div>
            </summary>
            <div className="claim-accordion-body" style={{ background: "#080a11", padding: "1.5rem" }}>
              <CompactionCurveFigureSvg theme="dark" />
              <ReasoningScalingFigureSvg theme="dark" />
            </div>
          </details>

          {/* Content Render Area */}
          {(activeTab === "methodology" || activeTab === "both") && (
            <article className="report-body" id="tab-methodology">
              {activeTab === "both" && (
                <div className="report-section-divider">
                  <span>Part I: Methodology &amp; Analytical Findings</span>
                </div>
              )}
              <Markdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={webMarkdownComponents}
              >
                {sanitizedMethodology}
              </Markdown>
            </article>
          )}

          {activeTab === "both" && (
            <div className="report-section-divider" style={{ margin: "4rem 0 3rem" }}>
              <span>Part II: Authoritative Ledger &amp; Primary Evidence</span>
            </div>
          )}

          {(activeTab === "receipts" || activeTab === "both") && (
            <article className="report-body" id="tab-receipts">
              <Markdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={webMarkdownComponents}
              >
                {sanitizedReceipts}
              </Markdown>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
