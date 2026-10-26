import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyPage, { DEFAULT_CLAUDE_PROMPT, DEFAULT_PI_PROMPT } from "@/components/CopyPage";
import GuideQuickNav from "@/components/GuideQuickNav";
import OrchestrationMotionHook from "@/components/OrchestrationMotionHook";
import OrchestrationFieldCards from "@/components/OrchestrationFieldCards";
// loaded as raw text by webpack asset/source
import guideMd from "@/content/reports/orchestration-guide/guide.md";

// This page must be rendered while the Markdown source is available at build
// time. Cloudflare Workers cannot read the deployed filesystem at request time.
export const dynamic = "force-static";
export const revalidate = false;

export const metadata = {
  title: "The Orchestration Guide",
  description:
    "What is the least expensive coordination architecture that reliably completes the work? A practical guide to the A–E coordination ladder, deterministic vs. LLM coordination, provider cache horizons, pointer manifests, and consent-first agent adoption.",
};

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

function CoordinationLadderSvg() {
  return (
    <figure className="report-figure cache-horizons-figure">
      <div className="cache-horizons-chart">
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <svg
            viewBox="0 0 720 430"
            role="img"
            aria-labelledby="cl-title cl-desc"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <title id="cl-title">The Five-Level Coordination Decision Ladder (A through E)</title>
            <desc id="cl-desc">
              Progression from Level A (Single Agent, default) to Level B (Lightweight Harness Subagents),
              Level C (Existing Workflow Runtime), Level D (Optional Thin Economic Scheduler), and Level E
              (Human-Controlled Execution), choosing the lowest level that reliably passes verification.
            </desc>

            <rect width="720" height="430" rx="10" fill="#0c1222" stroke="#1e293b" strokeWidth="1.5" />

            <text x="360" y="36" fill="#f8fafc" fontSize="18" fontWeight="700" textAnchor="middle" letterSpacing="0.04em">
              THE COORDINATION DECISION LADDER (A → E)
            </text>
            <text x="360" y="56" fill="#94a3b8" fontSize="12.5" textAnchor="middle">
              Choose the lowest-cost coordination architecture that reliably passes verification
            </text>

            {/* Level A */}
            <rect x="28" y="76" width="664" height="52" rx="6" fill="#10b981" fillOpacity="0.12" stroke="#10b981" strokeWidth="1.25" />
            <text x="46" y="99" fill="#34d399" fontSize="13" fontWeight="800">LEVEL A · NO ORCHESTRATION (DEFAULT)</text>
            <text x="46" y="117" fill="#cbd5e1" fontSize="11.5">
              One agent loop + domain skills (SKILL.md) + deterministic test/compiler verifiers. Zero subagent overhead.
            </text>

            {/* Level B */}
            <rect x="28" y="138" width="664" height="52" rx="6" fill="#38bdf8" fillOpacity="0.1" stroke="#38bdf8" strokeWidth="1.25" />
            <text x="46" y="161" fill="#38bdf8" fontSize="13" fontWeight="800">LEVEL B · LIGHTWEIGHT HARNESS ORCHESTRATION</text>
            <text x="46" y="179" fill="#cbd5e1" fontSize="11.5">
              2–4 disjoint lanes using native subagents, task envelopes, cache-horizon matching &amp; &lt;200-token pointer manifests.
            </text>

            {/* Level C */}
            <rect x="28" y="200" width="664" height="52" rx="6" fill="#fbbf24" fillOpacity="0.1" stroke="#fbbf24" strokeWidth="1.25" />
            <text x="46" y="223" fill="#fbbf24" fontSize="13" fontWeight="800">LEVEL C · EXISTING WORKFLOW INFRASTRUCTURE</text>
            <text x="46" y="241" fill="#cbd5e1" fontSize="11.5">
              Reuse CI, Claude Dynamic Workflows, LangGraph, Temporal, Ray, or Auto Office for durable state &amp; retries.
            </text>

            {/* Level D */}
            <rect x="28" y="262" width="664" height="52" rx="6" fill="#ec4899" fillOpacity="0.1" stroke="#ec4899" strokeWidth="1.25" strokeDasharray="4 4" />
            <text x="46" y="285" fill="#f472b6" fontSize="13" fontWeight="800">LEVEL D · THIN ECONOMIC SCHEDULER (OPTIONAL ADAPTER)</text>
            <text x="46" y="303" fill="#cbd5e1" fontSize="11.5">
              Deterministic cost/verifier routing over existing tools only when recurring overhead &amp; owner consent justify it.
            </text>

            {/* Level E */}
            <rect x="28" y="324" width="664" height="52" rx="6" fill="#f43f5e" fillOpacity="0.1" stroke="#f43f5e" strokeWidth="1.25" />
            <text x="46" y="347" fill="#fb7185" fontSize="13" fontWeight="800">LEVEL E · HUMAN-CONTROLLED EXECUTION (ABSTAIN)</text>
            <text x="46" y="365" fill="#cbd5e1" fontSize="11.5">
              Irreversible deploys, production migrations, permissions, or missing verifiers. Agent advises; human executes.
            </text>

            {/* Footer banner */}
            <rect x="28" y="386" width="664" height="30" rx="5" fill="#080c18" stroke="#242a40" strokeWidth="1" />
            <text x="360" y="405" fill="#e2e8f0" fontSize="11.5" fontWeight="600" textAnchor="middle">
              Consent-First Rule: Reading or copying this guide never authorizes installing tooling without explicit owner approval.
            </text>
          </svg>
        </div>
      </div>
      <ul className="cache-horizons-mobile" aria-label="Five-level coordination decision ladder">
        <li><strong>Level A · No orchestration (Default)</strong><span>One capable agent loop + domain skills and deterministic verifiers for coherent or coupled tasks.</span></li>
        <li><strong>Level B · Lightweight orchestration</strong><span>2–4 disjoint lanes using existing harness subagents, task envelopes, and &lt;200-token disk pointer manifests.</span></li>
        <li><strong>Level C · Existing workflow runtime</strong><span>Reuse CI, Claude Dynamic Workflows, LangGraph, Temporal, Ray, or Auto Office for durable state and retries.</span></li>
        <li><strong>Level D · Thin economic scheduler</strong><span>Optional deterministic cost/verifier router over existing tools only when recurring overhead and owner approval justify it.</span></li>
        <li><strong>Level E · Human-controlled execution</strong><span>Keep a human in control when permissions, safety, irreversible actions, or missing verifiers require judgment.</span></li>
      </ul>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "12px", textAlign: "center", lineHeight: "1.5" }}>
        Figure: The A–E Coordination Decision Ladder. Start at Level A and climb only when task independence, durable state, or recurring multi-model overhead justifies the next rung.
      </figcaption>
    </figure>
  );
}

function CacheHorizonsSvg() {
  return (
    <figure className="report-figure cache-horizons-figure">
      <div className="cache-horizons-chart">
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 720 480"
          role="img"
          aria-labelledby="ch-title ch-desc"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="ch-title">The Three Cache Horizons: Worker Duration Matching</title>
          <desc id="ch-desc">
            Visual diagram comparing 5-minute sliding window, GPT 6 30-minute floor,
            and Claude 1-hour extended cache horizons against worker wall-clock execution times.
          </desc>

          {/* Card background */}
          <rect width="720" height="480" rx="10" fill="#0c1222" stroke="#1e293b" strokeWidth="1.5" />

          {/* Header */}
          <text x="360" y="38" fill="#f8fafc" fontSize="19" fontWeight="700" textAnchor="middle" letterSpacing="0.04em">
            THE THREE CACHE HORIZONS
          </text>
          <text x="360" y="60" fill="#94a3b8" fontSize="13" textAnchor="middle">
            Match root orchestrator retention to worker wall-clock duration
          </text>

          {/* Horizon Bands Span (0 to 60 min, x: 140 to 680, 540px span = 9px/min) */}
          {/* Claude 1h Extended span (0 to 60m) */}
          <rect x="140" y="80" width="540" height="46" rx="6" fill="#ec4899" fillOpacity="0.08" stroke="#ec4899" strokeOpacity="0.35" strokeDasharray="4 4" />
          <text x="545" y="100" fill="#f472b6" fontSize="12" fontWeight="700" textAnchor="middle">
            Claude 1h Extended Lease (ttl: &apos;1h&apos;)
          </text>
          <text x="545" y="116" fill="#94a3b8" fontSize="11" textAnchor="middle">
            Anthropic promptCacheTtl · Google Gemini 1h
          </text>

          {/* GPT 6 30m Floor span (0 to 30m, width 270px) */}
          <rect x="140" y="80" width="270" height="46" rx="6" fill="#fbbf24" fillOpacity="0.12" stroke="#fbbf24" strokeOpacity="0.5" />
          <text x="275" y="100" fill="#fbbf24" fontSize="12" fontWeight="700" textAnchor="middle">
            GPT 6 30m Floor
          </text>
          <text x="275" y="116" fill="#fde68a" fontSize="11" textAnchor="middle">
            Sol · Luna (1.25× write, 0.1× read)
          </text>

          {/* 5m Sliding Window (0 to 5m, width 45px) */}
          <rect x="140" y="80" width="45" height="46" rx="6" fill="#38bdf8" fillOpacity="0.22" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="162" y="107" fill="#38bdf8" fontSize="11" fontWeight="800" textAnchor="middle">
            5m
          </text>

          {/* Horizon thresholds */}
          <line x1="185" y1="126" x2="185" y2="400" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="410" y1="126" x2="410" y2="400" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="680" y1="126" x2="680" y2="400" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Shared time axis; threshold bands above explain the cache regimes */}
          <text x="140" y="148" fill="#94a3b8" fontSize="10" textAnchor="middle">0m</text>
          <text x="185" y="148" fill="#38bdf8" fontSize="10" fontWeight="700" textAnchor="middle">5m</text>
          <text x="275" y="148" fill="#94a3b8" fontSize="10" textAnchor="middle">15m</text>
          <text x="410" y="148" fill="#fbbf24" fontSize="10" fontWeight="700" textAnchor="middle">30m</text>
          <text x="545" y="148" fill="#94a3b8" fontSize="10" textAnchor="middle">45m</text>
          <text x="680" y="148" fill="#ec4899" fontSize="10" fontWeight="700" textAnchor="end">60m</text>

          {/* --- Row 1: Fast Leaf Worker (3.5m) --- */}
          <text x="25" y="180" fill="#f8fafc" fontSize="13" fontWeight="600">Fast Lane Worker</text>
          <text x="25" y="196" fill="#94a3b8" fontSize="11">Unit tests · lint · 3.5m</text>

          <rect x="140" y="166" width="31.5" height="34" rx="4" fill="#38bdf8" fillOpacity="0.85" />
          <text x="156" y="187" fill="#0c1222" fontSize="11" fontWeight="800" textAnchor="middle">3.5m</text>

          <rect x="200" y="170" width="235" height="26" rx="4" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1" />
          <text x="210" y="187" fill="#34d399" fontSize="11" fontWeight="700">✓ WARM HIT (All Horizons)</text>
          <text x="445" y="187" fill="#94a3b8" fontSize="11">Returns inside the configured short window</text>

          {/* --- Row 2: Mid-Length Worker (16m) --- */}
          <text x="25" y="258" fill="#f8fafc" fontSize="13" fontWeight="600">Feature Migration</text>
          <text x="25" y="274" fill="#94a3b8" fontSize="11">Prisma schema · 16m</text>

          <rect x="140" y="244" width="144" height="34" rx="4" fill="#fbbf24" fillOpacity="0.85" />
          <text x="212" y="265" fill="#0c1222" fontSize="11" fontWeight="800" textAnchor="middle">16 min</text>

          <rect x="300" y="248" width="220" height="26" rx="4" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1" />
          <text x="310" y="265" fill="#34d399" fontSize="11" fontWeight="700">✓ WARM on GPT 6 30m Floor</text>
          <text x="530" y="265" fill="#f43f5e" fontSize="11">✗ 5m cache can expire first</text>

          {/* --- Row 3: Deep Autonomous Worker (42m) --- */}
          <text x="25" y="336" fill="#f8fafc" fontSize="13" fontWeight="600">Deep Audit / Suite</text>
          <text x="25" y="352" fill="#94a3b8" fontSize="11">Full battery · 42m</text>

          <rect x="140" y="322" width="378" height="34" rx="4" fill="#ec4899" fillOpacity="0.85" />
          <text x="329" y="343" fill="#0c1222" fontSize="11" fontWeight="800" textAnchor="middle">42 min execution</text>

          <rect x="535" y="326" width="165" height="26" rx="4" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1" />
          <text x="545" y="343" fill="#34d399" fontSize="11" fontWeight="700">✓ WARM on Claude 1h</text>
          <text x="535" y="370" fill="#f43f5e" fontSize="11">✗ 5m and 30m evict</text>

          {/* --- Bottom North-Star Rule Banner --- */}
          <rect x="25" y="414" width="670" height="46" rx="6" fill="#080c18" stroke="#242a40" strokeWidth="1" />
          <rect x="37" y="426" width="138" height="22" rx="3" fill="#fbbf24" fillOpacity="0.18" stroke="#fbbf24" strokeWidth="1" />
          <text x="106" y="441" fill="#fbbf24" fontSize="10" fontWeight="800" textAnchor="middle" letterSpacing="0.05em">
            NORTH-STAR RULE
          </text>
          <text x="190" y="442" fill="#e2e8f0" fontSize="12" fontWeight="500">
            Match root cache horizon to worker duration. Compare write premium with expected reuse.
          </text>
        </svg>
        </div>
      </div>
      <ul className="cache-horizons-mobile" aria-label="Worker-duration comparison across cache horizons">
        <li><strong>5m sliding</strong><span>A 3.5m fast lane is likely to stay warm; 16m migrations and 42m audits can outlast this window.</span></li>
        <li><strong>GPT 6 · 30m floor</strong><span>3.5m and 16m jobs fit inside the floor; a 42m audit can outlast it. Sol coordinates; Luna runs workers.</span></li>
        <li><strong>Claude · 1h option</strong><span>3.5m, 16m, and 42m gaps fit within the hour, provided each next turn arrives before the sliding lease expires.</span></li>
      </ul>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "12px", textAlign: "center", lineHeight: "1.5" }}>
        Figure: Worker wall-clock duration compared with three cache horizons. A short lane may fit a 5m window; 8–25m gaps can fit GPT 6&apos;s 30m minimum; longer gaps can fit Claude&apos;s 1h setting if each next turn arrives before expiry and the cached prefix remains unchanged.
      </figcaption>
    </figure>
  );
}

// The guide is authored markdown committed alongside the site. Drop the first
// two lines — the H1 title and the H2 subtitle are rendered by the page header
// below, so we don't want react-markdown to repeat them.
function loadGuide() {
  return guideMd.split("\n").slice(2).join("\n").trim();
}

export default function OrchestrationGuidePage() {
  const body = loadGuide();
  const markdownComponents: Components = {
    h2: ({ children, node: _node, ...props }) => {
      const headingText = Array.isArray(children)
        ? children.map((child) => (typeof child === "string" ? child : "")).join("")
        : String(children ?? "");
      const headingId = slugifyHeading(headingText);
      const heading = <h2 {...props} id={headingId} tabIndex={-1}>{children}</h2>;
      if (headingText.includes("Coordination Decision Framework")) {
        return (
          <>
            <CoordinationLadderSvg />
            {heading}
          </>
        );
      }
      if (headingText.includes("Cache-Horizon Matrix")) {
        return (
          <>
            <CacheHorizonsSvg />
            {heading}
          </>
        );
      }
      return heading;
    },
    h3: ({ children, node: _node, ...props }) => {
      const headingText = Array.isArray(children)
        ? children.map((child) => (typeof child === "string" ? child : "")).join("")
        : String(children ?? "");
      const headingId = slugifyHeading(headingText);
      return <h3 {...props} id={headingId} tabIndex={-1}>{children}</h3>;
    },
    table: ({ children, node: _node, ...props }) => (
      <div className="report-table-wrap" role="region" aria-label="Scrollable data table" tabIndex={0}>
        <span className="sr-only">Scroll horizontally to compare all columns.</span>
        <table {...props}>{children}</table>
      </div>
    ),
  };
  return (
    <>
      <SiteHeader />
      <aside className="wip-banner" aria-label="Orchestration Guide status">
        <div>
          <span className="wip-tag">WIP · Unverified</span>
          <p>
            Provider cache mechanics and published research are sourced; architectural recommendations and economic models are practitioner judgment, not controlled trial results.
          </p>
          <Link href="/blog/orchestrator-tax-cold-cache">Read the cost field note ↗</Link>
        </div>
      </aside>
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · FIELD GUIDE</p>
          <h1>The Orchestration<br />Guide</h1>
          <p className="report-sub">
            What is the least expensive coordination architecture that reliably completes the work?
          </p>
          <div className="report-links">
            <Link href="#interactive-motion-hook">Visual simulator ↓</Link>
            <Link href="#executive-field-guide">60-second summary ↓</Link>
            <Link href="#copy-harness-prompts">Copy agent prompt ↓</Link>
            <Link href="#full-technical-spec">Full technical report ↓</Link>
          </div>
        </header>

        {/* 1. FRONTLOADED CLAUDE-MOTION-INSPIRED INTERACTIVE SIMULATOR */}
        <section id="interactive-motion-hook" className="guide-motion-section" aria-label="Interactive architecture motion simulation">
          <OrchestrationMotionHook />
        </section>

        {/* 2. FRONTLOADED 60-SECOND FIELD GUIDE & LADDER STEPPER */}
        <section id="executive-field-guide" className="guide-field-section" aria-label="Executive field guide and decision ladder">
          <OrchestrationFieldCards />
        </section>

        {/* 3. CONSENT-FIRST PROMPT COPY BAR */}
        <section id="copy-harness-prompts" className="guide-launchpad" aria-label="Starting prompt and source copy">
          <CopyPage
            markdown={guideMd}
            claudePrompt={DEFAULT_CLAUDE_PROMPT}
            piPrompt={DEFAULT_PI_PROMPT}
            hint="Want your agent to evaluate this repository? Preview and copy a consent-first Claude Code or Pi assessment prompt—or copy the full Markdown source. Reading or copying never authorizes repo edits without your approval."
          />
        </section>

        {/* 4. FULL TECHNICAL SPEC & HARNESS INTEGRATION (FOR AGENTS & ADVANCED READERS) */}
        <div id="full-technical-spec" className="guide-layout">
          <article className="report-body">
            <div className="tech-spec-banner" style={{ marginBottom: "2.25rem", padding: "1.1rem 1.35rem", background: "rgba(14, 20, 36, 0.65)", border: "1px solid #1e293b", borderRadius: "8px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--pink)" }} />
                Comprehensive Technical Specification · Harness Wiring &amp; Math Models
              </span>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.55 }}>
                The complete technical report for systems engineers and autonomous agents: mathematical objective formulation, Amdahl/Ord scaling limits, provider cache TTL matrices, worked swarm calculations, and Claude Code/Pi harness configurations.
              </p>
            </div>
            <Markdown
              remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {body}
            </Markdown>
          </article>

          <aside className="guide-sidebar" aria-label="Table of contents">
            <GuideQuickNav />
          </aside>
        </div>

        <footer className="report-foot">
          <p>
            The cold-cache arithmetic behind this guide — current rate cards, Opus 5.5&apos;s 25× 5m write/read ratio, and the
            worked eight-dispatch table — is in the field note{" "}
            <Link href="/blog/orchestrator-tax-cold-cache">
              Why Your Multi-Agent Setup Can Cost More Than a Single Heavy Agent
            </Link>
            .
          </p>
          <Link className="button secondary" href="/research">Back to the ledger <span>→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
