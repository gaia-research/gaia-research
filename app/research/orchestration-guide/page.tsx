import type { ReactNode } from "react";
import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeTableLabels from "@/lib/rehype-table-labels";
import rehypeGuideFigures from "@/lib/rehype-guide-figures";
import { CostEquation, TtlCases, TtlCompare } from "@/components/GuideMathFigures";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyPage, { DEFAULT_CLAUDE_PROMPT, DEFAULT_PI_PROMPT } from "@/components/CopyPage";
import GuideQuickNav from "@/components/GuideQuickNav";
import GuideHeroLadder from "@/components/GuideHeroLadder";
import StackRow from "@/components/StackRow";
import OrchestrationMotionHook from "@/components/OrchestrationMotionHook";
import OrchestrationFieldCards from "@/components/OrchestrationFieldCards";
import {
  InteractiveCacheHorizons,
  InteractiveDecisionFlow,
  InteractiveDelegationLoop,
} from "@/components/OrchestrationInteractiveDiagrams";
// loaded as raw text by webpack asset/source
import guideMd from "@/content/reports/orchestration-guide/guide.md";
import "./guide.css";

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
// rehype-guide-figures marks passages with data-figure; read it off the hast node.
function figureOf(node: unknown): string | undefined {
  const props = (node as { properties?: Record<string, unknown> } | undefined)?.properties;
  const v = props?.["data-figure"] ?? props?.dataFigure;
  return typeof v === "string" ? v : undefined;
}

function loadGuide() {
  return guideMd.split("\n").slice(2).join("\n").trim();
}

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
  tr: ({ node: _node, ...props }) => <StackRow {...props} />,
  table: ({ children, node, ...props }) => {
    const table = (
      <div className="report-table-wrap" role="region" aria-label="Data table" tabIndex={0}>
        <table {...props}>{children}</table>
      </div>
    );
    return figureOf(node) === "ttl-compare" ? <TtlCompare>{table}</TtlCompare> : table;
  },
  div: ({ children, node, ...props }) =>
    figureOf(node) === "cost-equation" ? <CostEquation /> : <div {...props}>{children}</div>,
  ul: ({ children, node, ...props }) =>
    figureOf(node) === "ttl-cases" ? (
      <TtlCases>
        <ul {...props}>{children}</ul>
      </TtlCases>
    ) : (
      <ul {...props}>{children}</ul>
    ),
};

// Module-level memoization of the compiled Markdown content tree.
// Prevents per-request KaTeX compilation and AST re-parsing during concurrent
// browser RSC prefetches in resource-constrained Cloudflare Worker isolates.
let cachedGuideContent: ReactNode = null;

function getOrchestrationGuideContent(): ReactNode {
  if (!cachedGuideContent) {
    const body = loadGuide();
    cachedGuideContent = Markdown({
      remarkPlugins: [remarkGfm, [remarkMath, { singleDollarTextMath: false }]],
      rehypePlugins: [rehypeGuideFigures, rehypeKatex, rehypeTableLabels],
      components: markdownComponents,
      children: body,
    });
  }
  return cachedGuideContent;
}

export default function OrchestrationGuidePage() {
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
        <header className="report-head og-hero">
          <div className="og-hero-copy">
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
          </div>
          <GuideHeroLadder />
          <ul className="og-jump" aria-label="Jump to">
            <li>
              <Link href="#executive-field-guide">Four economic rules ↓</Link>
            </li>
            <li>
              <Link href="#interactive-motion-hook">Architecture simulator ↓</Link>
            </li>
            <li>
              <Link className="og-jump-copy" href="#copy-harness-prompts">Copy assessment prompt ↓</Link>
            </li>
            <li>
              <Link href="#full-technical-spec">Full specification ↓</Link>
            </li>
            <li>
              <Link href="/research/agent-playbook">Companion: Agent Playbook →</Link>
            </li>
          </ul>
        </header>

        {/* 1. THE FOUR RULES: the insight before the proof */}
        <section
          id="executive-field-guide"
          className="guide-field-section"
          aria-label="Executive field guide"
        >
          <OrchestrationFieldCards />
        </section>

        {/* 2. INTERACTIVE ARCHITECTURE SIMULATOR */}
        <section
          id="interactive-motion-hook"
          className="guide-motion-section"
          aria-label="Interactive architecture motion simulation"
        >
          <OrchestrationMotionHook />
        </section>

        {/* 3. HAND IT TO YOUR AGENT: consent-first prompts and raw source */}
        <section id="copy-harness-prompts" className="guide-launchpad" aria-label="Starting prompt and source copy">
          <CopyPage
            markdown={guideMd}
            claudePrompt={DEFAULT_CLAUDE_PROMPT}
            piPrompt={DEFAULT_PI_PROMPT}
            hint="Want an agent to evaluate this repository? Copy a consent-first Claude Code or Pi assessment prompt—or the raw Markdown source. Reading or copying never authorizes edits without your approval."
          />
        </section>

        {/* 4. FULL TECHNICAL SPEC & HARNESS INTEGRATION */}
        <div id="full-technical-spec" className="guide-layout">
          <article className="report-body">
            <div className="tech-spec-banner og-spec-banner">
              <span>Technical Specification · Economics, Cache Horizons &amp; Harness Contracts</span>
              <p>
                Mathematical objective formulation, Amdahl/Ord scaling bounds, provider cache TTL matrices, worked
                rate-card arithmetic, and consent-first assessment rules.
              </p>
            </div>
            {getOrchestrationGuideContent()}
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
