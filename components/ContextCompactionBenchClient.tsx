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
type ViewMode = "all-pages" | "single-page" | "pdf-embed" | "web-view";

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
  { num: 1, label: "1. Title, Abstract & Methodology", headerRight: "PREPRINT · SEPTEMBER 2026" },
  { num: 2, label: "2. Results: S1–S3 & Reasoning", headerRight: "PREPRINT · SEPTEMBER 2026" },
  { num: 3, label: "3. Results: S4–S6 & Endurance", headerRight: "PREPRINT · SEPTEMBER 2026" },
  { num: 4, label: "4. Conclusions & References", headerRight: "PREPRINT · SEPTEMBER 2026" },
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

function partitionMethodology(text: string) {
  const lines = text.split("\n");
  let abstractRaw = "";
  let sec1Idx = -1;
  let sec3_1Idx = -1;
  let sec3_4Idx = -1;
  let sec4Idx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## 1. Introduction") || line.startsWith("## Section 1") || line.startsWith("## 1.")) {
      sec1Idx = i;
    }
    if (line.includes("3.1 Scenario 1") || line.includes("Scenario 1:")) {
      sec3_1Idx = i;
    }
    if (line.includes("3.4 Scenario 4") || line.includes("Scenario 4:")) {
      sec3_4Idx = i;
    }
    if (line.startsWith("## 4. Discussion") || line.startsWith("## Section 4") || line.startsWith("## 4.")) {
      sec4Idx = i;
    }
  }

  const absStart = lines.findIndex((l) => l.includes("> ### Abstract") || l.includes("### Abstract"));
  if (absStart !== -1) {
    const absEnd = lines.findIndex((l, idx) => idx > absStart && (l.startsWith("---") || l.startsWith("## ")));
    if (absEnd !== -1) {
      abstractRaw = lines.slice(absStart, absEnd).join("\n");
    }
  }

  const p1End = sec3_1Idx !== -1 ? sec3_1Idx : lines.length;
  const p2Start = sec3_1Idx !== -1 ? sec3_1Idx : 0;
  const p2End = sec3_4Idx !== -1 ? sec3_4Idx : lines.length;
  const p3Start = sec3_4Idx !== -1 ? sec3_4Idx : 0;
  const p3End = sec4Idx !== -1 ? sec4Idx : lines.length;
  const p4Start = sec4Idx !== -1 ? sec4Idx : 0;

  let page1 = lines.slice(sec1Idx !== -1 ? sec1Idx : 0, p1End).join("\n");
  if (!page1.trim()) page1 = text;

  const page2 = lines.slice(p2Start, p2End).join("\n");
  const page3 = lines.slice(p3Start, p3End).join("\n");
  const page4 = lines.slice(p4Start).join("\n");

  return {
    abstractRaw,
    page1,
    page2,
    page3,
    page4,
  };
}

/* ── Academic Vector Figures (LaTeX Paper Styled) ── */

function AcademicFigure1() {
  return (
    <figure className="latex-paper-figure" style={{ margin: "16px 0", breakInside: "avoid" }}>
      <div style={{ maxWidth: "100%", margin: "0 auto", background: "#ffffff", padding: "8px" }}>
        <svg
          viewBox="0 0 680 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <rect width="680" height="340" fill="#ffffff" stroke="#111827" strokeWidth="1.2" />

          {/* Title */}
          <text x="340" y="24" fill="#111827" fontSize="13" fontWeight="700" fontFamily="Times New Roman, serif" textAnchor="middle">
            FIG. 1. TURN COST (\$) VS. AUTOCOMPACTION THRESHOLD ACROSS SCENARIOS
          </text>
          <text x="340" y="40" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">
            Scenario 4 Pareto Sweep (8 autocompaction arms, 37 total suite runs on Gemini 3.8 Flash)
          </text>

          {/* Grid lines */}
          <line x1="70" y1="60" x2="620" y2="60" stroke="#e5e7eb" strokeDasharray="2 2" />
          <line x1="70" y1="115" x2="620" y2="115" stroke="#e5e7eb" strokeDasharray="2 2" />
          <line x1="70" y1="170" x2="620" y2="170" stroke="#e5e7eb" strokeDasharray="2 2" />
          <line x1="70" y1="225" x2="620" y2="225" stroke="#e5e7eb" strokeDasharray="2 2" />
          <line x1="70" y1="280" x2="620" y2="280" stroke="#111827" strokeWidth="1" />

          {/* Y Axis Left: Cost per turn ($) */}
          <text x="25" y="170" fill="#111827" fontSize="10" fontFamily="Times New Roman, serif" fontWeight="700" transform="rotate(-90 25 170)" textAnchor="middle">
            Total Session Cost (\$)
          </text>
          <text x="62" y="64" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="end">\$7.00</text>
          <text x="62" y="119" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="end">\$5.25</text>
          <text x="62" y="174" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="end">\$3.50</text>
          <text x="62" y="229" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="end">\$1.75</text>
          <text x="62" y="284" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="end">\$0.00</text>

          {/* Sweet Spot Highlight Zone */}
          <rect x="250" y="55" width="165" height="225" fill="#f3f4f6" stroke="#d1d5db" strokeDasharray="2 2" />
          <text x="332" y="72" fill="#111827" fontSize="9" fontWeight="700" fontFamily="Times New Roman, serif" textAnchor="middle">
            OPTIMAL REGION (150k–272k)
          </text>

          {/* S4 Cost Curve (Black Solid) */}
          <path
            d="M 110 202 L 180 207 L 250 200 L 320 166 L 390 214 L 460 227 L 530 63 L 600 230"
            fill="none"
            stroke="#111827"
            strokeWidth="2.2"
          />

          {/* S4 Points */}
          <circle cx="110" cy="202" r="4" fill="#111827" />
          <text x="110" y="194" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif" textAnchor="middle">\$2.48</text>

          <circle cx="180" cy="207" r="4" fill="#111827" />
          <text x="180" y="199" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif" textAnchor="middle">\$2.32</text>

          <circle cx="250" cy="200" r="4" fill="#111827" />
          <text x="250" y="192" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif" textAnchor="middle">\$2.56</text>

          <circle cx="320" cy="166" r="4" fill="#111827" />
          <text x="320" y="158" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif" textAnchor="middle">\$3.63</text>

          <circle cx="390" cy="214" r="5" fill="#ffffff" stroke="#111827" strokeWidth="2" />
          <text x="390" y="206" fill="#111827" fontSize="9" fontWeight="700" fontFamily="Times New Roman, serif" textAnchor="middle">★ \$2.09</text>

          <circle cx="460" cy="227" r="4" fill="#111827" />
          <text x="460" y="219" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif" textAnchor="middle">\$1.70</text>

          <circle cx="530" cy="63" r="4" fill="#111827" />
          <text x="530" y="55" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif" textAnchor="middle">\$6.89</text>

          <circle cx="600" cy="230" r="4" fill="#111827" />
          <text x="600" y="222" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif" textAnchor="middle">\$1.60</text>

          {/* S2 Cost Curve (Dashed line) */}
          <path
            d="M 110 139 L 180 195 L 250 173 L 320 208 L 390 181 L 460 198 L 530 163 L 600 200"
            fill="none"
            stroke="#6b7280"
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />

          {/* X Axis Labels */}
          <text x="110" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">50k</text>
          <text x="180" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">100k</text>
          <text x="250" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">150k</text>
          <text x="320" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">200k</text>
          <text x="390" y="296" fill="#111827" fontSize="9" fontWeight="700" fontFamily="Times New Roman, serif" textAnchor="middle">272k</text>
          <text x="460" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">500k</text>
          <text x="530" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">1M</text>
          <text x="600" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">Disabled</text>

          <text x="350" y="318" fill="#111827" fontSize="10" fontWeight="700" fontFamily="Times New Roman, serif" textAnchor="middle">
            Autocompaction Context Threshold (L_thresh)
          </text>

          {/* Legend */}
          <g transform="translate(190, 328)">
            <line x1="0" y1="5" x2="24" y2="5" stroke="#111827" strokeWidth="2.2" />
            <circle cx="12" cy="5" r="3" fill="#111827" />
            <text x="30" y="8" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif">Scenario 4 (Pareto Sweep, 25 Turns)</text>

            <line x1="200" y1="5" x2="224" y2="5" stroke="#6b7280" strokeWidth="1.8" strokeDasharray="4 3" />
            <text x="230" y="8" fill="#4b5563" fontSize="8" fontFamily="Times New Roman, serif">Scenario 2 (Always-Warm, 30 Turns)</text>
          </g>
        </svg>
      </div>
      <figcaption style={{ color: "#374151", fontSize: "0.78rem", fontStyle: "italic", textAlign: "center", marginTop: "6px" }}>
        Fig. 1. Measured turn cost ($) vs autocompaction threshold across Scenarios 2 and 4. Compacting below 100k triggers reacquisition thrashing, while 150k–272k minimizes total monetary spend.
      </figcaption>
    </figure>
  );
}

function AcademicFigure2() {
  return (
    <figure className="latex-paper-figure" style={{ margin: "16px 0", breakInside: "avoid" }}>
      <div style={{ maxWidth: "100%", margin: "0 auto", background: "#ffffff", padding: "8px" }}>
        <svg
          viewBox="0 0 680 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <rect width="680" height="340" fill="#ffffff" stroke="#111827" strokeWidth="1.2" />

          {/* Title */}
          <text x="340" y="24" fill="#111827" fontSize="13" fontWeight="700" fontFamily="Times New Roman, serif" textAnchor="middle">
            FIG. 2. REASONING TOKEN SCALING VS. CONTEXT LENGTH (SCENARIO 3)
          </text>
          <text x="340" y="40" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">
            Empirical power law fit: T = 2.525 × 10⁻⁶ · L¹·⁴⁹ (R² = 0.988) across 12 controlled runs
          </text>

          {/* Grid lines */}
          <line x1="80" y1="60" x2="620" y2="60" stroke="#e5e7eb" strokeDasharray="2 2" />
          <line x1="80" y1="115" x2="620" y2="115" stroke="#e5e7eb" strokeDasharray="2 2" />
          <line x1="80" y1="170" x2="620" y2="170" stroke="#e5e7eb" strokeDasharray="2 2" />
          <line x1="80" y1="225" x2="620" y2="225" stroke="#e5e7eb" strokeDasharray="2 2" />
          <line x1="80" y1="280" x2="620" y2="280" stroke="#111827" strokeWidth="1" />

          {/* Y Axis: Reasoning Tokens T */}
          <text x="25" y="170" fill="#111827" fontSize="10" fontFamily="Times New Roman, serif" fontWeight="700" transform="rotate(-90 25 170)" textAnchor="middle">
            Thinking Tokens ($T$)
          </text>
          <text x="72" y="64" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="end">3,000</text>
          <text x="72" y="119" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="end">2,250</text>
          <text x="72" y="174" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="end">1,500</text>
          <text x="72" y="229" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="end">750</text>
          <text x="72" y="284" fill="#374151" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="end">0</text>

          {/* Linear Reference Line (Gray dashed) */}
          <line x1="80" y1="280" x2="620" y2="215" stroke="#9ca3af" strokeDasharray="4 4" strokeWidth="1.2" />
          <text x="590" y="208" fill="#6b7280" fontSize="8" fontFamily="Times New Roman, serif">Linear baseline (β = 1.0)</text>

          {/* Fitted Power Curve: T = 2.525e-6 * L^1.4897 */}
          <path
            d="M 80 280 C 180 278, 280 268, 420 225 C 500 190, 560 145, 610 85"
            fill="none"
            stroke="#111827"
            strokeWidth="2.5"
          />

          {/* Measured Points with Error Bars / Annotations */}
          <circle cx="150" cy="272" r="4" fill="#111827" />
          <circle cx="170" cy="276" r="4" fill="#111827" />
          <circle cx="190" cy="268" r="4" fill="#111827" />
          <text x="170" y="258" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif" textAnchor="middle">20k Tier</text>

          <circle cx="270" cy="274" r="4" fill="#111827" />
          <circle cx="290" cy="278" r="4" fill="#111827" />
          <circle cx="310" cy="266" r="4" fill="#111827" />
          <text x="290" y="254" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif" textAnchor="middle">80k Tier</text>

          <circle cx="410" cy="235" r="4" fill="#111827" />
          <circle cx="425" cy="232" r="4" fill="#111827" />
          <circle cx="440" cy="226" r="4" fill="#111827" />
          <text x="425" y="216" fill="#111827" fontSize="8" fontFamily="Times New Roman, serif" textAnchor="middle">180k Tier</text>

          <circle cx="530" cy="115" r="5" fill="#111827" />
          <circle cx="545" cy="153" r="5" fill="#111827" />
          <circle cx="560" cy="122" r="5" fill="#111827" />
          <text x="545" y="98" fill="#111827" fontSize="9" fontWeight="700" fontFamily="Times New Roman, serif" textAnchor="middle">272k Tier (22.4× Deliberation)</text>

          {/* X Axis */}
          <text x="170" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">20k</text>
          <text x="290" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">80k</text>
          <text x="425" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">180k</text>
          <text x="545" y="296" fill="#111827" fontSize="9" fontFamily="Times New Roman, serif" textAnchor="middle">272k</text>

          <text x="350" y="318" fill="#111827" fontSize="10" fontWeight="700" fontFamily="Times New Roman, serif" textAnchor="middle">
            Context Window Depth ($L$)
          </text>
        </svg>
      </div>
      <figcaption style={{ color: "#374151", fontSize: "0.78rem", fontStyle: "italic", textAlign: "center", marginTop: "6px" }}>
        Fig. 2. Reasoning deliberation ($T$) vs context length ($L$). Expanding context from 50k to 400k tokens triggers a 22.4$\times$ increase in thinking tokens ($\beta \approx 1.49$).
      </figcaption>
    </figure>
  );
}

export default function ContextCompactionBenchClient({
  methodology,
  receipts,
}: ContextCompactionBenchClientProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("methodology");
  const [viewMode, setViewMode] = useState<ViewMode>("all-pages");
  const [activeSinglePage, setActiveSinglePage] = useState<number>(1);
  const deskRef = useRef<HTMLElement>(null);

  const sanitizedMethodology = methodology.replace(/(?<![\$\\])\$(?=\d)/g, "\\$");
  const sanitizedReceipts = receipts.replace(/(?<![\$\\])\$(?=\d)/g, "\\$");

  const pages = partitionMethodology(sanitizedMethodology);

  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === "#receipts" || hash.startsWith("#rec-")) {
      setActiveTab("receipts");
      setViewMode("web-view");
    } else if (hash === "#both" || hash === "#all") {
      setActiveTab("both");
      setViewMode("web-view");
    } else if (hash === "#pdf" || hash === "#pdf-embed") {
      setViewMode("pdf-embed");
    } else if (hash.startsWith("#page-")) {
      const p = parseInt(hash.replace("#page-", ""), 10);
      if (p >= 1 && p <= 4) {
        scrollToPage(p);
      }
    }
  }, []);

  const scrollToPage = (pageNum: number) => {
    if (typeof window !== "undefined") {
      const el = document.getElementById(`paper-page-${pageNum}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#page-${pageNum}`);
      }
    }
  };

  const handlePageSelect = (num: number) => {
    setActiveSinglePage(num);
    if (viewMode === "all-pages") {
      scrollToPage(num);
    } else {
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#page-${num}`);
        if (deskRef.current) {
          deskRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };

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
    pre: ({ children, style, ...props }: HTMLAttributes<HTMLPreElement>) => (
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
    ),
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
          <span className="latex-sheet-running-title">GAIA RESEARCH TECHNICAL REPORT GAIA-TR-2026-09-02</span>
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
                  <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
                    {pages.abstractRaw}
                  </Markdown>
                </div>
                <div className="latex-sheet-abstract-rule" />
              </div>
            )}
          </>
        )}

        {/* 2-Column Content Body */}
        <div className="latex-sheet-columns">
          <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
            {pageNum === 1 ? pages.page1 : pageNum === 2 ? pages.page2 : pageNum === 3 ? pages.page3 : pages.page4}
          </Markdown>
        </div>

        {/* Running Footer */}
        <footer className="latex-sheet-running-footer">
          <span className="latex-sheet-running-footer-left">CONFERENCE PREPRINT · GAIA RESEARCH</span>
          <span className="latex-sheet-page-counter">Page {pageNum} of 4</span>
        </footer>
      </article>
    );
  };

  return (
    <div className="compaction-client-container">
      {/* ── Format & Layout Toolbar ── */}
      <div className="paper-format-toolbar">
        <div className="paper-format-info">
          <span className="paper-format-badge">A4 PREPRINT</span>
          <span className="paper-format-desc">Official 2-Column Conference Paper (GAIA-TR-2026-09-02)</span>
        </div>

        <div className="paper-format-toggles" role="group" aria-label="Paper Layout Mode">
          <button
            type="button"
            className={`paper-format-btn ${viewMode === "all-pages" ? "active" : ""}`}
            onClick={() => setViewMode("all-pages")}
          >
            <span>All 4 A4 Pages (Scrollable)</span>
            <span className="paper-format-pill">DEFAULT</span>
          </button>
          <button
            type="button"
            className={`paper-format-btn ${viewMode === "single-page" ? "active" : ""}`}
            onClick={() => setViewMode("single-page")}
          >
            <span>Single Page</span>
          </button>
          <button
            type="button"
            className={`paper-format-btn ${viewMode === "pdf-embed" ? "active" : ""}`}
            onClick={() => setViewMode("pdf-embed")}
          >
            <span>PDF Document Embed</span>
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
            <span>Download PDF (A4) ↓</span>
          </a>
        </div>
      </div>

      {/* ── View Mode 1: All 4 Pages Scrollable on Desk (Default) ── */}
      {viewMode === "all-pages" && (
        <section className="latex-paper-desk" ref={deskRef} aria-label="Academic Paper Sheets Desk">
          {/* Quick Page Jump Pill Bar */}
          <nav className="latex-pagination-bar" aria-label="Page Quick Navigation">
            <div className="latex-pagination-nav">
              <span className="latex-page-jump-title">JUMP TO SHEET:</span>
              <div className="latex-page-pills" role="tablist">
                {PAPER_PAGES.map((page) => (
                  <button
                    key={page.num}
                    type="button"
                    className="latex-page-pill"
                    onClick={() => scrollToPage(page.num)}
                  >
                    <span className="latex-page-pill-num">{page.num}</span>
                    <span className="latex-page-pill-label">{page.label}</span>
                  </button>
                ))}
              </div>
              <span className="latex-page-counter">All 4 Pages Scrollable to Bottom (A4)</span>
            </div>
          </nav>

          {/* All 4 A4 Sheets Cascading Vertically with Real Margins */}
          <div className="latex-continuous-stack">
            {[1, 2, 3, 4].map((num) => renderPaperPage(num))}
          </div>
        </section>
      )}

      {/* ── View Mode 2: Single Page View ── */}
      {viewMode === "single-page" && (
        <section className="latex-paper-desk" ref={deskRef} aria-label="Academic Paper Sheets Desk">
          <nav className="latex-pagination-bar" aria-label="Academic Paper Pagination Controls">
            <div className="latex-pagination-nav">
              <button
                type="button"
                className="latex-page-arrow"
                onClick={() => handlePageSelect(Math.max(1, activeSinglePage - 1))}
                disabled={activeSinglePage === 1}
              >
                ← Previous Page
              </button>

              <div className="latex-page-pills" role="tablist">
                {PAPER_PAGES.map((page) => (
                  <button
                    key={page.num}
                    type="button"
                    className={`latex-page-pill ${activeSinglePage === page.num ? "active" : ""}`}
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
                onClick={() => handlePageSelect(Math.min(4, activeSinglePage + 1))}
                disabled={activeSinglePage === 4}
              >
                Next Page →
              </button>
            </div>
          </nav>

          {renderPaperPage(activeSinglePage)}
        </section>
      )}

      {/* ── View Mode 3: Native PDF Document Embed ── */}
      {viewMode === "pdf-embed" && (
        <section className="latex-paper-desk" aria-label="Native PDF Document Viewer">
          <div className="latex-pdf-container" style={{ margin: "0 auto", maxWidth: "210mm" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.85rem", color: "var(--blue)" }}>
                COMPILED VIA TECTONIC (A4 · 4 PAGES · EXACT LATEX ENGINE OUTPUT)
              </span>
              <a
                href="/reports/context-compaction-phase-2/gaia-tr-2026-09-02.pdf"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--pink)", fontFamily: "var(--mono)", fontSize: "0.85rem" }}
              >
                Open in Fullscreen Tab ↗
              </a>
            </div>
            <iframe
              src="/reports/context-compaction-phase-2/gaia-tr-2026-09-02.pdf"
              className="latex-pdf-frame"
              title="Official GAIA-TR-2026-09-02 PDF"
            />
          </div>
        </section>
      )}

      {/* ── View Mode 4: Web View (Single Column Fallback Mode) ── */}
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
