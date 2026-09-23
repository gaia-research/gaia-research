import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyPage, { DEFAULT_CLAUDE_PROMPT, DEFAULT_PI_PROMPT } from "@/components/CopyPage";
import GuideQuickNav from "@/components/GuideQuickNav";
// loaded as raw text by webpack asset/source
import guideMd from "@/content/reports/orchestration-guide/guide.md";

// This page must be rendered while the Markdown source is available at build
// time. Cloudflare Workers cannot read the deployed filesystem at request time.
export const dynamic = "force-static";
export const revalidate = false;

export const metadata = {
  title: "The Orchestration Guide",
  description:
    "A step-by-step guide to matching multi-agent worker gaps with Anthropic 5m/1h and GPT 6 30m cache horizons, while accounting for model-specific cache-write costs.",
};

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
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
  const matrixHeadings = /^##\s+(.+?)\s*$/gm;
  const matrixMatch = Array.from(body.matchAll(matrixHeadings)).find(([, heading]) =>
    slugifyHeading(heading.replace(/[–—]/g, "-")) === "the-provider-cache-horizon-matrix",
  );
  // Keep the copy controls near the top if the matrix heading is renamed or removed.
  const matrixStart = matrixMatch?.index ?? 0;
  const opening = body.slice(0, matrixStart).trim();
  const remainder = body.slice(matrixStart).trim();
  const markdownComponents: Components = {
    h2: ({ children, node: _node, ...props }) => {
      const headingText = Array.isArray(children)
        ? children.map((child) => (typeof child === "string" ? child : "")).join("")
        : String(children ?? "");
      const headingId = slugifyHeading(headingText);
      const heading = <h2 {...props} id={headingId} tabIndex={-1}>{children}</h2>;
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
            Provider mechanics are sourced; recommendations are practitioner judgment, not a controlled study.
          </p>
          <Link href="/blog/orchestrator-tax-cold-cache">Read the cost field note ↗</Link>
        </div>
      </aside>
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · GUIDE</p>
          <h1>The Orchestration<br />Guide</h1>
          <p className="report-sub">
            How to run more than one agent without setting money on fire.
          </p>
          <div className="report-links">
            <Link href="#copy-harness-prompts">Copy a starting prompt ↓</Link>
          </div>
        </header>

        <GuideQuickNav />
        <article className="report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={markdownComponents}
          >
            {opening}
          </Markdown>

          <CopyPage
            markdown={guideMd}
            claudePrompt={DEFAULT_CLAUDE_PROMPT}
            piPrompt={DEFAULT_PI_PROMPT}
            hint="Ready to adapt the guide? Preview a Claude Code or Pi prompt, then copy it—or copy the full Markdown source."
          />

          {remainder ? (
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {remainder}
            </Markdown>
          ) : null}
        </article>

        <footer className="report-foot">
          <p>
            The cost arithmetic behind this guide — current rate cards, Opus 5.5&apos;s 25× 5m write/read ratio, and the
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
