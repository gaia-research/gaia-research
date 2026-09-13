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

const METHODOLOGY_SECTIONS = [
  { id: "sec-abstract", label: "1. Abstract & Summary" },
  { id: "sec-infrastructure", label: "2. Infrastructure & Topology" },
  { id: "sec-scenarios", label: "3. Scenarios 1–6 Breakdown" },
  { id: "sec-pricing", label: "4. Discussion & Pricing" },
  { id: "sec-recommendations", label: "5. Recommendations" },
  { id: "sec-references", label: "6. References" },
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
  if (t.includes("abstract") && t.includes("summary")) return "sec-abstract";
  if (t.includes("experimental methodology") || (t.includes("methodology") && t.includes("infrastructure"))) return "sec-infrastructure";
  if (t.includes("scenario breakdown") || t.includes("breakdown & empirical results")) return "sec-scenarios";
  if (t.includes("discussion & pricing") || t.includes("discussion & pricing dynamics")) return "sec-pricing";
  if (t.includes("recommendations")) return "sec-recommendations";
  if (t.includes("formal references") || t.includes("references")) return "sec-references";

  if (t.includes("cross-scenario") || t.includes("comparison matrix")) return "rec-matrix";
  if (t.includes("scenario 1") && t.includes("cold")) return "rec-s1";
  if (t.includes("scenario 2") && t.includes("warm")) return "rec-s2";
  if (t.includes("scenario 3") && t.includes("reasoning")) return "rec-s3";
  if (t.includes("scenario 4") && (t.includes("compaction curve") || t.includes("pareto"))) return "rec-s4";
  if (t.includes("scenario 5") && (t.includes("quality") || t.includes("thrashing"))) return "rec-s5";
  if (t.includes("scenario 6") && (t.includes("1m window") || t.includes("endurance"))) return "rec-s6";
  if (t.includes("provenance") || t.includes("manifest") || t.includes("session uuid")) return "rec-provenance";

  return slugify(text);
}

/* ─── High-Resolution Empirical SVG Diagrams ─── */

function CompactionCurveFigureSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "24px 0" }}>
      <div style={{ maxWidth: "780px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 740 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <rect width="740" height="460" rx="8" fill="#0c1222" stroke="#1e293b" />
          <text x="370" y="32" fill="#f8fafc" fontSize="15" fontWeight="600" textAnchor="middle">
            Figure 1: Context Compaction Cost vs Thrashing Pareto Frontier
          </text>
          <text x="370" y="52" fill="#94a3b8" fontSize="11" textAnchor="middle">
            Scenario 4 Pareto Sweep (8 autocompaction arms, 37 total suite runs)
          </text>

          <line x1="80" y1="80" x2="680" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="80" y1="150" x2="680" y2="150" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="80" y1="220" x2="680" y2="220" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="80" y1="290" x2="680" y2="290" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="80" y1="360" x2="680" y2="360" stroke="#334155" />

          <text x="25" y="220" fill="#38bdf8" fontSize="11" fontWeight="600" transform="rotate(-90 25 220)" textAnchor="middle">
            Cost per Turn ($)
          </text>
          <text x="72" y="85" fill="#64748b" fontSize="10" textAnchor="end">$0.10</text>
          <text x="72" y="155" fill="#64748b" fontSize="10" textAnchor="end">$0.075</text>
          <text x="72" y="225" fill="#64748b" fontSize="10" textAnchor="end">$0.05</text>
          <text x="72" y="295" fill="#64748b" fontSize="10" textAnchor="end">$0.025</text>
          <text x="72" y="365" fill="#64748b" fontSize="10" textAnchor="end">$0.00</text>

          <text x="715" y="220" fill="#ec4899" fontSize="11" fontWeight="600" transform="rotate(90 715 220)" textAnchor="middle">
            Reacquisition Thrashing
          </text>
          <text x="688" y="85" fill="#64748b" fontSize="10">6.0×</text>
          <text x="688" y="155" fill="#64748b" fontSize="10">4.5×</text>
          <text x="688" y="225" fill="#64748b" fontSize="10">3.0×</text>
          <text x="688" y="295" fill="#64748b" fontSize="10">1.5×</text>
          <text x="688" y="365" fill="#64748b" fontSize="10">1.0×</text>

          <rect x="290" y="70" width="180" height="290" fill="#10b981" fillOpacity="0.08" rx="4" />
          <text x="380" y="90" fill="#34d399" fontSize="11" fontWeight="600" textAnchor="middle">
            ★ EMPIRICAL SWEET SPOT (150k–272k)
          </text>

          <path
            d="M 120 187 C 160 215, 200 230, 320 248 C 380 255, 420 252, 480 250 C 530 245, 580 220, 640 93"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
          />

          <path
            d="M 120 103 C 170 190, 220 240, 320 291 C 380 302, 480 307, 640 314"
            fill="none"
            stroke="#ec4899"
            strokeWidth="3"
            strokeDasharray="5 3"
          />

          <circle cx="120" cy="187" r="4" fill="#38bdf8" />
          <circle cx="220" cy="229" r="4" fill="#38bdf8" />
          <circle cx="320" cy="248" r="5" fill="#34d399" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="400" cy="252" r="5" fill="#34d399" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="480" cy="250" r="5" fill="#34d399" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="640" cy="93" r="4" fill="#ef4444" />

          <circle cx="120" cy="103" r="4" fill="#ec4899" />
          <circle cx="220" cy="231" r="4" fill="#ec4899" />
          <circle cx="320" cy="291" r="4" fill="#ec4899" />
          <circle cx="400" cy="302" r="4" fill="#ec4899" />
          <circle cx="480" cy="307" r="4" fill="#ec4899" />
          <circle cx="640" cy="314" r="4" fill="#ec4899" />

          <text x="120" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">50k</text>
          <text x="220" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">100k</text>
          <text x="320" y="380" fill="#34d399" fontSize="10" fontWeight="600" textAnchor="middle">150k</text>
          <text x="400" y="380" fill="#34d399" fontSize="10" fontWeight="600" textAnchor="middle">200k</text>
          <text x="480" y="380" fill="#34d399" fontSize="10" fontWeight="600" textAnchor="middle">272k</text>
          <text x="560" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">500k</text>
          <text x="640" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">Disabled</text>

          <text x="380" y="405" fill="#94a3b8" fontSize="11" textAnchor="middle">
            Compaction Threshold Ceiling
          </text>

          <rect x="180" y="420" width="380" height="28" rx="4" fill="#05060a" stroke="#1e293b" />
          <line x1="200" y1="434" x2="225" y2="434" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="232" y="438" fill="#cbd5e1" fontSize="10">Cost/turn ($)</text>

          <line x1="330" y1="434" x2="355" y2="434" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="4 2" />
          <text x="362" y="438" fill="#cbd5e1" fontSize="10">Reacq. Thrashing (tool call multiplier)</text>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px", textAlign: "center" }}>
        Figure 1: Context compaction cost vs. reacquisition thrashing Pareto frontier across 37 instrumented suite runs (25 across S1/S2/S4/S6 + 12 across S3). The true cost-optimal operating valley shifts rightward to 150k–272k tokens under flat cache pricing.
      </figcaption>
    </figure>
  );
}

function ReasoningScalingFigureSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "24px 0" }}>
      <div style={{ maxWidth: "780px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 740 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <rect width="740" height="460" rx="8" fill="#0c1222" stroke="#1e293b" />
          <text x="370" y="32" fill="#f8fafc" fontSize="15" fontWeight="600" textAnchor="middle">
            Figure 2: Reasoning Token Inflation vs Context Window Depth
          </text>
          <text x="370" y="52" fill="#94a3b8" fontSize="11" textAnchor="middle">
            12 controlled refactoring runs at varying context depths on Gemini 3.8 Flash (Scenario 3)
          </text>

          <line x1="90" y1="80" x2="680" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="90" y1="150" x2="680" y2="150" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="90" y1="220" x2="680" y2="220" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="90" y1="290" x2="680" y2="290" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="90" y1="360" x2="680" y2="360" stroke="#334155" />

          <text x="30" y="220" fill="#f59e0b" fontSize="11" fontWeight="600" transform="rotate(-90 30 220)" textAnchor="middle">
            Reasoning / Thinking Tokens
          </text>
          <text x="82" y="85" fill="#64748b" fontSize="10" textAnchor="end">6,000</text>
          <text x="82" y="155" fill="#64748b" fontSize="10" textAnchor="end">4,500</text>
          <text x="82" y="225" fill="#64748b" fontSize="10" textAnchor="end">3,000</text>
          <text x="82" y="295" fill="#64748b" fontSize="10" textAnchor="end">1,500</text>
          <text x="82" y="365" fill="#64748b" fontSize="10" textAnchor="end">0</text>

          <line x1="90" y1="360" x2="680" y2="225" stroke="#475569" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x="640" y="215" fill="#64748b" fontSize="10">Linear baseline (β = 1.0)</text>

          <path
            d="M 90 360 C 180 355, 270 335, 450 274 C 540 220, 620 160, 670 117"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3.5"
          />

          <circle cx="160" cy="349" r="5" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />
          <text x="160" y="335" fill="#fde68a" fontSize="10" textAnchor="middle">233 tok</text>

          <circle cx="270" cy="329" r="5" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />
          <text x="270" y="315" fill="#fde68a" fontSize="10" textAnchor="middle">654 tok</text>

          <circle cx="450" cy="274" r="5" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />
          <text x="450" y="258" fill="#fde68a" fontSize="10" textAnchor="middle">1,842 tok</text>

          <circle cx="670" cy="117" r="6" fill="#f59e0b" stroke="#fef3c7" strokeWidth="2" />
          <text x="670" y="100" fill="#fde68a" fontSize="11" fontWeight="600" textAnchor="middle">5,210 tok (22.4×)</text>

          <text x="160" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">50k</text>
          <text x="270" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">100k</text>
          <text x="450" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">200k</text>
          <text x="670" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">400k</text>

          <text x="380" y="405" fill="#94a3b8" fontSize="11" textAnchor="middle">
            Context Window Depth (L)
          </text>

          <rect x="220" y="140" width="230" height="60" rx="6" fill="#1e293b" fillOpacity="0.9" stroke="#f59e0b" strokeWidth="1" />
          <text x="335" y="162" fill="#fbbf24" fontSize="11" fontWeight="600" textAnchor="middle">
            Super-Linear Exponent: β = 1.49
          </text>
          <text x="335" y="182" fill="#cbd5e1" fontSize="10" textAnchor="middle">
            8× context increase → 22.4× thinking tokens
          </text>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px", textAlign: "center" }}>
        Figure 2: Reasoning token scaling vs context depth. As context expands from 50k to 400k tokens (8×), internal thinking tokens expand from 233 to 5,210 (22.4×), matching power law exponent β = 1.4897.
      </figcaption>
    </figure>
  );
}

export default function ContextCompactionBenchClient({
  methodology,
  receipts,
}: ContextCompactionBenchClientProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("methodology");
  const [showFigures, setShowFigures] = useState<boolean>(true);

  const sanitizedMethodology = methodology.replace(/(?<![\$\\])\$(?=\d)/g, "\\$");
  const sanitizedReceipts = receipts.replace(/(?<![\$\\])\$(?=\d)/g, "\\$");

  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === "#receipts" || hash.startsWith("#rec-")) {
      setActiveTab("receipts");
    } else if (hash === "#both" || hash === "#all") {
      setActiveTab("both");
    } else if (hash === "#methodology" || hash.startsWith("#sec-")) {
      setActiveTab("methodology");
    }
  }, []);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const newHash = tab === "methodology" ? "#methodology" : tab === "receipts" ? "#receipts" : "#all";
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

  const markdownComponents = {
    table: ({ children }: { children?: ReactNode }) => (
      <div className="table-scroll-container">
        <table className="report-table">{children}</table>
      </div>
    ),
    pre: ({ children, style, ...props }: HTMLAttributes<HTMLPreElement>) => (
      <div
        className="pre-scroll-container"
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

  return (
    <div className="compaction-client-container">
      {/* ── Key Metrics Snapshot Grid ── */}
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

      {/* ── Primary Tab Switcher ── */}
      <div className="report-tabs" role="tablist" aria-label="Research documentation views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "methodology"}
          className={`report-tab-btn ${activeTab === "methodology" ? "active" : ""}`}
          onClick={() => handleTabChange("methodology")}
        >
          <span>Methodology &amp; Architecture</span>
          <span className="report-tab-badge">6 SCENARIOS</span>
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

      {/* ── Section Jump Navigation Bar ── */}
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

      {/* ── Optional Vector Figures Accordion ── */}
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
          <CompactionCurveFigureSvg />
          <ReasoningScalingFigureSvg />
        </div>
      </details>

      {/* ── Content Render Area ── */}
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
            components={markdownComponents}
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
            components={markdownComponents}
          >
            {sanitizedReceipts}
          </Markdown>
        </article>
      )}
    </div>
  );
}
