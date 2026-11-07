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
import {
  InteractiveCacheHorizons,
  InteractiveDecisionFlow,
  InteractiveDelegationLoop,
} from "@/components/OrchestrationInteractiveDiagrams";
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
      const heading = (
        <h2 {...props} id={headingId} tabIndex={-1}>
          {children}
        </h2>
      );
      if (headingText.includes("Coordination Decision Framework")) {
        return (
          <>
            {heading}
            <InteractiveDecisionFlow />
          </>
        );
      }
      if (headingText.includes("Separate Reasoning from Deterministic Coordination")) {
        return (
          <>
            {heading}
            <InteractiveDelegationLoop />
          </>
        );
      }
      if (headingText.includes("Cache-Horizon Matrix")) {
        return (
          <>
            {heading}
            <InteractiveCacheHorizons />
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
      return (
        <h3 {...props} id={headingId} tabIndex={-1}>
          {children}
        </h3>
      );
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
          <span className="wip-tag">WIP · Practitioner Guide</span>
          <p>
            Provider cache mechanics and published research are sourced; architectural recommendations and rate-card
            models reflect practitioner judgment, not controlled trials.
          </p>
          <Link href="/blog/orchestrator-tax-cold-cache">Read the cold-cache field note ↗</Link>
        </div>
      </aside>
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal">
            <span /> RESEARCH · FIELD MANUAL 01
          </p>
          <h1>
            The Orchestration
            <br />
            Guide
          </h1>
          <p className="report-sub">
            What is the least expensive coordination architecture that reliably completes the work?
          </p>
          <div className="report-links">
            <Link href="#copy-harness-prompts">Copy assessment prompt ↓</Link>
            <Link href="#interactive-motion-hook">Architecture simulator ↓</Link>
            <Link href="#executive-field-guide">Four economic rules ↓</Link>
            <Link href="#full-technical-spec">Full specification ↓</Link>
            <Link href="/research/agent-playbook">Companion: Agent Playbook →</Link>
          </div>
        </header>

        {/* 1. COPY AGENT PROMPT AT THE START */}
        <section id="copy-harness-prompts" className="guide-launchpad" aria-label="Starting prompt and source copy">
          <CopyPage
            markdown={guideMd}
            claudePrompt={DEFAULT_CLAUDE_PROMPT}
            piPrompt={DEFAULT_PI_PROMPT}
            hint="Want an agent to evaluate this repository? Copy a consent-first Claude Code or Pi assessment prompt—or the raw Markdown source. Reading or copying never authorizes edits without your approval."
          />
        </section>

        {/* 2. FRONTLOADED INTERACTIVE ARCHITECTURE SIMULATOR */}
        <section
          id="interactive-motion-hook"
          className="guide-motion-section"
          aria-label="Interactive architecture motion simulation"
        >
          <OrchestrationMotionHook />
        </section>

        {/* 3. FRONTLOADED 60-SECOND FIELD GUIDE */}
        <section
          id="executive-field-guide"
          className="guide-field-section"
          aria-label="Executive field guide"
        >
          <OrchestrationFieldCards />
        </section>

        {/* 4. FULL TECHNICAL SPEC & HARNESS INTEGRATION */}
        <div id="full-technical-spec" className="guide-layout">
          <article className="report-body">
            <div
              className="tech-spec-banner"
              style={{
                marginBottom: "2rem",
                padding: "0.95rem 1.2rem",
                background: "rgba(14, 20, 36, 0.65)",
                border: "1px solid #1e293b",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.7rem",
                  color: "var(--blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.3rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--pink)",
                  }}
                />
                Technical Specification · Economics, Cache Horizons &amp; Harness Contracts
              </span>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.52 }}>
                Mathematical objective formulation, Amdahl/Ord scaling bounds, provider cache TTL matrices, worked
                rate-card arithmetic, and consent-first assessment rules.
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
            The cold-cache arithmetic behind this guide—rate cards, Opus 5.5&apos;s 25× 5m write/read ratio, and the
            eight-dispatch table—is developed in{" "}
            <Link href="/blog/orchestrator-tax-cold-cache">
              Why Your Multi-Agent Setup Can Cost More Than a Single Heavy Agent
            </Link>
            . To preserve your personal operating rules across sessions, pair this guide with{" "}
            <Link href="/research/agent-playbook">The Agent Playbook</Link>.
          </p>
          <Link className="button secondary" href="/research">
            Back to the ledger <span>→</span>
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
