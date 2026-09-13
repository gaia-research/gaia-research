"use client";

import { useState, useEffect, type ReactNode, type AnchorHTMLAttributes, type HTMLAttributes } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface ContextCompactionBenchClientProps {
  methodology: string;
  receipts: string;
}

type ActiveTab = "methodology" | "receipts" | "both";
type ViewMode = "pdf-embed" | "web-view";

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function getHeadingId(text: string): string {
  const clean = text.toLowerCase();
  if (clean.includes("abstract")) return "sec-abstract";
  if (clean.includes("introduction")) return "sec-intro";
  if (clean.includes("methodology") || clean.includes("infrastructure") || clean.includes("architecture")) {
    return "sec-methodology";
  }
  if (clean.includes("scenario") || clean.includes("results") || clean.includes("empirical results")) {
    return "sec-results";
  }
  if (clean.includes("discussion") || clean.includes("conclusions")) return "sec-discussion";
  if (clean.includes("recommendations")) return "sec-recommendations";
  if (clean.includes("appendix") || clean.includes("receipts")) return "sec-appendix";
  if (clean.includes("references")) return "sec-references";
  return slugify(text);
}

/* ── High-Contrast Academic Figures ── */

function AcademicFigure1() {
  return (
    <figure className="academic-visual-figure" style={{ margin: "24px 0", breakInside: "avoid" }}>
      <div style={{ maxWidth: "100%", margin: "0 auto", background: "#0b0f19", padding: "16px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)" }}>
        <svg
          viewBox="0 0 720 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Background */}
          <rect width="720" height="360" fill="#080c16" rx="4" />

          {/* Title */}
          <text x="360" y="28" fill="#f8fafc" fontSize="14" fontWeight="700" fontFamily="var(--mono), monospace" textAnchor="middle" letterSpacing="0.05em">
            FIG. 1. MEASURED TURN COST ($) VS. AUTOCOMPACTION THRESHOLD
          </text>
          <text x="360" y="46" fill="#94a3b8" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">
            Scenario 4 Pareto Sweep (8 autocompaction arms, 37 total suite runs on Gemini 3.8 Flash)
          </text>

          {/* Grid lines */}
          <line x1="80" y1="70" x2="660" y2="70" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="80" y1="125" x2="660" y2="125" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="80" y1="180" x2="660" y2="180" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="80" y1="235" x2="660" y2="235" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="80" y1="290" x2="660" y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

          {/* Y Axis Left */}
          <text x="28" y="180" fill="#cbd5e1" fontSize="10" fontFamily="var(--mono), monospace" fontWeight="600" transform="rotate(-90 28 180)" textAnchor="middle">
            Total Session Cost ($)
          </text>
          <text x="70" y="74" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="end">$7.00</text>
          <text x="70" y="129" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="end">$5.25</text>
          <text x="70" y="184" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="end">$3.50</text>
          <text x="70" y="239" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="end">$1.75</text>
          <text x="70" y="294" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="end">$0.00</text>

          {/* Sweet Spot Highlight Zone */}
          <rect x="270" y="65" width="180" height="225" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.4)" strokeDasharray="4 4" rx="2" />
          <text x="360" y="84" fill="#38bdf8" fontSize="10" fontWeight="700" fontFamily="var(--mono), monospace" textAnchor="middle" letterSpacing="0.06em">
            PARETO SWEET SPOT (150k–272k)
          </text>

          {/* S4 Cost Curve (Pink Solid) */}
          <path
            d="M 120 212 L 195 217 L 270 209 L 345 176 L 420 224 L 495 237 L 570 73 L 640 240"
            fill="none"
            stroke="#ec4899"
            strokeWidth="3"
          />

          {/* S4 Points */}
          <circle cx="120" cy="212" r="4.5" fill="#ec4899" />
          <text x="120" y="202" fill="#f472b6" fontSize="9" fontFamily="var(--mono), monospace" textAnchor="middle">$2.48</text>

          <circle cx="195" cy="217" r="4.5" fill="#ec4899" />
          <text x="195" y="207" fill="#f472b6" fontSize="9" fontFamily="var(--mono), monospace" textAnchor="middle">$2.32</text>

          <circle cx="270" cy="209" r="4.5" fill="#ec4899" />
          <text x="270" y="199" fill="#f472b6" fontSize="9" fontFamily="var(--mono), monospace" textAnchor="middle">$2.56</text>

          <circle cx="345" cy="176" r="4.5" fill="#ec4899" />
          <text x="345" y="166" fill="#f472b6" fontSize="9" fontFamily="var(--mono), monospace" textAnchor="middle">$3.63</text>

          <circle cx="420" cy="224" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          <text x="420" y="214" fill="#38bdf8" fontSize="10" fontWeight="700" fontFamily="var(--mono), monospace" textAnchor="middle">★ $2.09</text>

          <circle cx="495" cy="237" r="4.5" fill="#ec4899" />
          <text x="495" y="227" fill="#f472b6" fontSize="9" fontFamily="var(--mono), monospace" textAnchor="middle">$1.70</text>

          <circle cx="570" cy="73" r="4.5" fill="#ec4899" />
          <text x="570" y="63" fill="#f472b6" fontSize="9" fontFamily="var(--mono), monospace" textAnchor="middle">$6.89</text>

          <circle cx="640" cy="240" r="4.5" fill="#ec4899" />
          <text x="640" y="230" fill="#f472b6" fontSize="9" fontFamily="var(--mono), monospace" textAnchor="middle">$1.60</text>

          {/* S2 Cost Curve (Blue Dashed) */}
          <path
            d="M 120 149 L 195 205 L 270 183 L 345 218 L 420 191 L 495 208 L 570 173 L 640 210"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="5 4"
          />

          {/* X Axis Labels */}
          <text x="120" y="308" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">50k</text>
          <text x="195" y="308" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">100k</text>
          <text x="270" y="308" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">150k</text>
          <text x="345" y="308" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">200k</text>
          <text x="420" y="308" fill="#38bdf8" fontSize="10" fontWeight="700" fontFamily="var(--mono), monospace" textAnchor="middle">272k</text>
          <text x="495" y="308" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">500k</text>
          <text x="570" y="308" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">1M</text>
          <text x="640" y="308" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">Disabled</text>

          <text x="360" y="332" fill="#cbd5e1" fontSize="11" fontWeight="700" fontFamily="var(--mono), monospace" textAnchor="middle">
            Autocompaction Context Threshold (L_thresh)
          </text>

          {/* Legend */}
          <g transform="translate(180, 344)">
            <line x1="0" y1="5" x2="24" y2="5" stroke="#ec4899" strokeWidth="3" />
            <circle cx="12" cy="5" r="3" fill="#ec4899" />
            <text x="30" y="8" fill="#e2e8f0" fontSize="9" fontFamily="var(--mono), monospace">Scenario 4 (Pareto Sweep, 25 Turns)</text>

            <line x1="240" y1="5" x2="264" y2="5" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 4" />
            <text x="270" y="8" fill="#e2e8f0" fontSize="9" fontFamily="var(--mono), monospace">Scenario 2 (Always-Warm, 30 Turns)</text>
          </g>
        </svg>
      </div>
      <figcaption style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "8px", fontFamily: "var(--mono), monospace" }}>
        Fig. 1. Measured turn cost ($) vs autocompaction threshold across Scenarios 2 and 4. Compacting below 100k triggers reacquisition thrashing, while 150k–272k minimizes total monetary spend.
      </figcaption>
    </figure>
  );
}

function AcademicFigure2() {
  return (
    <figure className="academic-visual-figure" style={{ margin: "24px 0", breakInside: "avoid" }}>
      <div style={{ maxWidth: "100%", margin: "0 auto", background: "#0b0f19", padding: "16px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)" }}>
        <svg
          viewBox="0 0 720 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Background */}
          <rect width="720" height="360" fill="#080c16" rx="4" />

          {/* Title */}
          <text x="360" y="28" fill="#f8fafc" fontSize="14" fontWeight="700" fontFamily="var(--mono), monospace" textAnchor="middle" letterSpacing="0.05em">
            FIG. 2. REASONING TOKEN SCALING VS. CONTEXT LENGTH (SCENARIO 3)
          </text>
          <text x="360" y="46" fill="#94a3b8" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">
            Empirical power law fit: T = 2.525 × 10⁻⁶ · L¹·⁴⁹ (R² = 0.988) across 12 controlled runs
          </text>

          {/* Grid lines */}
          <line x1="80" y1="70" x2="660" y2="70" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="80" y1="125" x2="660" y2="125" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="80" y1="180" x2="660" y2="180" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="80" y1="235" x2="660" y2="235" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="80" y1="290" x2="660" y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

          {/* Y Axis Left */}
          <text x="28" y="180" fill="#cbd5e1" fontSize="10" fontFamily="var(--mono), monospace" fontWeight="600" transform="rotate(-90 28 180)" textAnchor="middle">
            Deliberation Tokens (T)
          </text>
          <text x="70" y="74" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="end">3,000</text>
          <text x="70" y="129" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="end">2,250</text>
          <text x="70" y="184" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="end">1,500</text>
          <text x="70" y="239" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="end">750</text>
          <text x="70" y="294" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="end">0</text>

          {/* Linear Reference Line (Gray dashed) */}
          <line x1="90" y1="290" x2="650" y2="220" stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" strokeWidth="1.2" />
          <text x="610" y="212" fill="#94a3b8" fontSize="9" fontFamily="var(--mono), monospace">Linear baseline (β = 1.0)</text>

          {/* Fitted Power Curve: T = 2.525e-6 * L^1.4897 */}
          <path
            d="M 90 290 C 200 288, 300 278, 440 230 C 520 195, 590 145, 650 80"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
          />

          {/* Measured Points with Annotations */}
          <circle cx="160" cy="282" r="4.5" fill="#38bdf8" />
          <circle cx="180" cy="286" r="4.5" fill="#38bdf8" />
          <circle cx="200" cy="278" r="4.5" fill="#38bdf8" />
          <text x="180" y="268" fill="#e2e8f0" fontSize="9" fontFamily="var(--mono), monospace" textAnchor="middle">20k Tier</text>

          <circle cx="280" cy="284" r="4.5" fill="#38bdf8" />
          <circle cx="300" cy="288" r="4.5" fill="#38bdf8" />
          <circle cx="320" cy="276" r="4.5" fill="#38bdf8" />
          <text x="300" y="264" fill="#e2e8f0" fontSize="9" fontFamily="var(--mono), monospace" textAnchor="middle">80k Tier</text>

          <circle cx="430" cy="245" r="4.5" fill="#38bdf8" />
          <circle cx="445" cy="242" r="4.5" fill="#38bdf8" />
          <circle cx="460" cy="236" r="4.5" fill="#38bdf8" />
          <text x="445" y="226" fill="#e2e8f0" fontSize="9" fontFamily="var(--mono), monospace" textAnchor="middle">180k Tier</text>

          <circle cx="560" cy="115" r="6" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="575" cy="153" r="6" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="590" cy="122" r="6" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
          <text x="575" y="94" fill="#f472b6" fontSize="10" fontWeight="700" fontFamily="var(--mono), monospace" textAnchor="middle">272k Tier (22.4× Deliberation)</text>

          {/* X Axis */}
          <text x="180" y="308" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">20k</text>
          <text x="300" y="308" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">80k</text>
          <text x="445" y="308" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">180k</text>
          <text x="575" y="308" fill="#38bdf8" fontSize="10" fontWeight="700" fontFamily="var(--mono), monospace" textAnchor="middle">272k</text>

          <text x="360" y="332" fill="#cbd5e1" fontSize="11" fontWeight="700" fontFamily="var(--mono), monospace" textAnchor="middle">
            Context Window Depth (L)
          </text>
        </svg>
      </div>
      <figcaption style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "8px", fontFamily: "var(--mono), monospace" }}>
        Fig. 2. Reasoning deliberation (T) vs context length (L). Expanding context from 50k to 400k tokens triggers a 22.4× increase in thinking tokens (β ≈ 1.49).
      </figcaption>
    </figure>
  );
}

function AcademicFigure3() {
  return (
    <figure className="academic-visual-figure" style={{ margin: "24px 0", breakInside: "avoid" }}>
      <div style={{ maxWidth: "100%", margin: "0 auto", background: "#0b0f19", padding: "16px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)" }}>
        <svg
          viewBox="0 0 720 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <rect width="720" height="360" fill="#080c16" rx="4" />

          {/* Title */}
          <text x="360" y="28" fill="#f8fafc" fontSize="14" fontWeight="700" fontFamily="var(--mono), monospace" textAnchor="middle" letterSpacing="0.05em">
            FIG. 3. IDENTICAL 25-TURN BUILD PRICED ACROSS FOUR FRONTIER MODELS
          </text>
          <text x="360" y="46" fill="#94a3b8" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">
            Compacting at 50k (pink) vs. Never Compacting (blue) across differential rate cards
          </text>

          {/* Grid lines */}
          <line x1="160" y1="70" x2="660" y2="70" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="260" y1="70" x2="260" y2="290" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <text x="260" y="308" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">$10</text>
          <line x1="360" y1="70" x2="360" y2="290" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <text x="360" y="308" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">$20</text>
          <line x1="460" y1="70" x2="460" y2="290" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <text x="460" y="308" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">$30</text>
          <line x1="560" y1="70" x2="560" y2="290" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <text x="560" y="308" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">$40</text>
          <line x1="160" y1="70" x2="160" y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x="160" y="308" fill="#64748b" fontSize="10" fontFamily="var(--mono), monospace" textAnchor="middle">$0</text>

          {/* Row 1: Gemini 3.8 Flash */}
          <text x="145" y="98" fill="#e2e8f0" fontSize="11" fontFamily="var(--mono), monospace" textAnchor="end">Gemini Flash</text>
          <rect x="160" y="82" width="25" height="13" fill="#ec4899" rx="2" />
          <rect x="160" y="98" width="16" height="13" fill="#38bdf8" rx="2" />
          <text x="560" y="92" fill="#38bdf8" fontSize="10" fontWeight="600" fontFamily="var(--mono), monospace">+$0.88 (+55%)</text>
          <text x="560" y="106" fill="#94a3b8" fontSize="9" fontFamily="var(--mono), monospace">10× cache read discount</text>

          {/* Row 2: GPT-5.6 Sol */}
          <text x="145" y="148" fill="#e2e8f0" fontSize="11" fontFamily="var(--mono), monospace" textAnchor="end">GPT-5.6 Sol</text>
          <rect x="160" y="132" width="132" height="13" fill="#ec4899" rx="2" />
          <rect x="160" y="148" width="85" height="13" fill="#38bdf8" rx="2" />
          <text x="560" y="142" fill="#38bdf8" fontSize="10" fontWeight="600" fontFamily="var(--mono), monospace">+$4.70 (+55%)</text>
          <text x="560" y="156" fill="#94a3b8" fontSize="9" fontFamily="var(--mono), monospace">50% cache read discount</text>

          {/* Row 3: Claude Opus 5 */}
          <text x="145" y="198" fill="#e2e8f0" fontSize="11" fontFamily="var(--mono), monospace" textAnchor="end">Opus 5</text>
          <rect x="160" y="182" width="165" height="13" fill="#ec4899" rx="2" />
          <rect x="160" y="198" width="106" height="13" fill="#38bdf8" rx="2" />
          <text x="560" y="192" fill="#38bdf8" fontSize="10" fontWeight="600" fontFamily="var(--mono), monospace">+$5.88 (+55%)</text>
          <text x="560" y="206" fill="#94a3b8" fontSize="9" fontFamily="var(--mono), monospace">90% cache read discount</text>

          {/* Row 4: Claude Sonnet 4.6 */}
          <text x="145" y="248" fill="#e2e8f0" fontSize="11" fontFamily="var(--mono), monospace" textAnchor="end">Sonnet 4.6</text>
          <rect x="160" y="232" width="55" height="13" fill="#ec4899" rx="2" />
          <rect x="160" y="248" width="35" height="13" fill="#38bdf8" rx="2" />
          <text x="560" y="242" fill="#38bdf8" fontSize="10" fontWeight="600" fontFamily="var(--mono), monospace">+$1.96 (+55%)</text>
          <text x="560" y="256" fill="#94a3b8" fontSize="9" fontFamily="var(--mono), monospace">90% cache read discount</text>

          {/* Legend */}
          <g transform="translate(190, 332)">
            <rect x="0" y="0" width="14" height="10" fill="#ec4899" rx="2" />
            <text x="20" y="9" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace">Compacting at 50k (Thrashing)</text>

            <rect x="240" y="0" width="14" height="10" fill="#38bdf8" rx="2" />
            <text x="260" y="9" fill="#e2e8f0" fontSize="10" fontFamily="var(--mono), monospace">Uncompacted (Cache Continuity)</text>
          </g>
        </svg>
      </div>
      <figcaption style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "8px", fontFamily: "var(--mono), monospace" }}>
        Fig. 3. Simulated session cost on identical 25-turn workload across four frontier models. Regardless of base rate card, premature compaction incurs a constant ~55% thrashing surcharge.
      </figcaption>
    </figure>
  );
}

export default function ContextCompactionBenchClient({
  methodology,
  receipts,
}: ContextCompactionBenchClientProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("methodology");
  const [viewMode, setViewMode] = useState<ViewMode>("pdf-embed");

  const sanitizedMethodology = methodology.replace(/(?<![\$\\])\$(?=\d)/g, "\\$");
  const sanitizedReceipts = receipts.replace(/(?<![\$\\])\$(?=\d)/g, "\\$");

  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === "#receipts" || hash.startsWith("#rec-")) {
      setActiveTab("receipts");
      setViewMode("web-view");
    } else if (hash === "#both" || hash === "#all" || hash === "#web") {
      setActiveTab("both");
      setViewMode("web-view");
    } else if (hash === "#pdf" || hash === "#dossier") {
      setViewMode("pdf-embed");
    }
  }, []);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const newHash = tab === "methodology" ? "#methodology" : tab === "receipts" ? "#receipts" : "#all";
      window.history.replaceState(null, "", newHash);
    }
  };

  const handleJump = (tab: "methodology" | "receipts", sectionId: string) => {
    if (tab !== activeTab && activeTab !== "both") {
      setActiveTab(tab);
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `#${sectionId}`);
        }
      }
    }, 50);
  };

  const markdownComponents = {
    p: ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
      const childArray = Array.isArray(children) ? children : [children];
      const text = childArray.length === 1 && typeof childArray[0] === "string" ? childArray[0].trim() : null;

      if (text === "[[COMPACTION_CURVE_FIGURE]]" || text === "[[COMPACTION_CURVE]]") {
        return <AcademicFigure1 />;
      }
      if (text === "[[REASONING_SCALING_FIGURE]]" || text === "[[REASONING_SCALING]]") {
        return <AcademicFigure2 />;
      }
      if (text === "[[MODEL_PRICING_FIGURE]]" || text === "[[MODEL_PRICING]]") {
        return <AcademicFigure3 />;
      }
      return <p {...props}>{children}</p>;
    },
    table: ({ children }: { children?: ReactNode }) => (
      <div className="academic-table-container" style={{ overflowX: "auto", maxWidth: "100%" }}>
        <table className="academic-paper-table">{children}</table>
      </div>
    ),
    code: ({ children, className, style, ...props }: HTMLAttributes<HTMLElement>) => (
      <code
        className={className}
        style={{
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          whiteSpace: "pre-wrap",
          ...style,
        }}
        {...props}
      >
        {children}
      </code>
    ),
    pre: ({ children, style, ...props }: HTMLAttributes<HTMLPreElement>) => {
      const text = extractText(children);
      if (text.includes("THE COMPACTION CURVE (SCENARIO 4")) {
        return <AcademicFigure1 />;
      }
      if (text.includes("REASONING TOKEN INFLATION (SCENARIO 3)")) {
        return <AcademicFigure2 />;
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
        <a href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined} {...props}>
          {children}
        </a>
      );
    },
  };

  return (
    <div className="compaction-client-container">
      {/* ── Format & Layout Toolbar (PDF Embed, Web View, Download PDF) ── */}
      <div className="paper-format-toolbar">
        <div className="paper-format-info">
          <span className="paper-format-badge">TECHNICAL REPORT</span>
          <span className="paper-format-desc">Preprint Dossier (GAIA-TR-2026-09-02)</span>
        </div>

        <div className="paper-format-toggles" role="group" aria-label="Report View Mode">
          <button
            type="button"
            className={`paper-format-btn ${viewMode === "pdf-embed" ? "active" : ""}`}
            onClick={() => setViewMode("pdf-embed")}
          >
            <span>PDF Document</span>
          </button>
          <button
            type="button"
            className={`paper-format-btn ${viewMode === "web-view" ? "active" : ""}`}
            onClick={() => setViewMode("web-view")}
          >
            <span>Web View</span>
          </button>
          <a
            href="/reports/context-compaction-phase-2/gaia-tr-2026-09-02.pdf"
            download="GAIA-TR-2026-09-02-Context-Compaction.pdf"
            className="paper-format-download-link"
            target="_blank"
            rel="noreferrer"
          >
            <span>Download PDF ↓</span>
          </a>
        </div>
      </div>

      {/* ── Mode 1: PDF Document Embed (Default) ── */}
      {viewMode === "pdf-embed" && (
        <section className="pdf-embed-wrapper" aria-label="Technical Report PDF Viewer">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", padding: "0 4px" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.82rem", color: "var(--muted)", letterSpacing: "0.04em" }}>
              37 LIVE DEVELOPER SESSIONS · GEMINI 3.8 FLASH · LITELLM RECORDED
            </span>
            <a
              href="/reports/context-compaction-phase-2/gaia-tr-2026-09-02.pdf"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--blue)", fontFamily: "var(--mono)", fontSize: "0.82rem", textDecoration: "none" }}
            >
              Open Fullscreen Tab ↗
            </a>
          </div>
          <iframe
            src="/reports/context-compaction-phase-2/gaia-tr-2026-09-02.pdf"
            className="latex-pdf-frame"
            title="Context Compaction Technical Report (GAIA-TR-2026-09-02)"
            style={{
              width: "100%",
              height: "1050px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
              display: "block",
            }}
          />
        </section>
      )}

      {/* ── Mode 2: Web View ── */}
      {viewMode === "web-view" && (
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
              RECEIPTS_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className="report-jump-pill"
                  onClick={() => handleJump("receipts", sec.id)}
                >
                  {sec.label}
                </button>
              ))}
          </nav>

          {/* Content Rendering */}
          {(activeTab === "methodology" || activeTab === "both") && (
            <article className="report-body">
              <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
                {sanitizedMethodology}
              </Markdown>
            </article>
          )}

          {activeTab === "both" && (
            <div className="report-divider">
              <hr />
              <span>END METHODOLOGY · BEGIN RECEIPTS LEDGER</span>
            </div>
          )}

          {(activeTab === "receipts" || activeTab === "both") && (
            <article className="report-body">
              <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
                {sanitizedReceipts}
              </Markdown>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
