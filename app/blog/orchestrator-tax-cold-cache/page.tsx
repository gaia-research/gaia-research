import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { orchestratorTaxColdCacheThumbnail } from "@/data/blog";
import orchestrationRunEvidenceSrc from "@/assets/generated/orchestrator-tax-cold-cache-actual-run.webp";
import fastWorkersDiagramSrc from "@/assets/generated/fast-workers-diagram.png";
import postMd from "@/content/blog/orchestrator-tax-cold-cache/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/orchestrator-tax-cold-cache";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${orchestratorTaxColdCacheThumbnail.src.src}`;
const humanAuthorName = novaAuthor.editorial.human_editorial_reviewer.name;
const articleTitle =
  "Why Your Multi-Agent Setup Costs More Than a Single Heavy Agent";
const articleDescription =
  "Cache goes cold every time a subagent takes over 5 minutes. Your orchestrator re-reads its own 100k context at 12.5x warm rates, and you never see it on the invoice. Here is the hidden tax, the math, and four patterns that actually work.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "orchestrator tax",
    "cold-cache reentry",
    "multi-agent cost",
    "prompt caching TTL",
    "KV cache",
    "single agent vs multi-agent",
    "token economics",
    "fast subagents",
    "Gaia Research",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-09-14T00:00:00+08:00",
    authors: [novaAuthor.display_name, humanAuthorName],
    images: [
      {
        url: orchestratorTaxColdCacheThumbnail.src.src,
        width: 1600,
        height: 900,
        alt: orchestratorTaxColdCacheThumbnail.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [orchestratorTaxColdCacheThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-09-14T00:00:00+08:00",
  author: [
    {
      "@type": "Person",
      name: novaAuthor.display_name,
      url: novaAuthor.links.github,
    },
    {
      "@type": "Person",
      name: humanAuthorName,
      jobTitle: novaAuthor.editorial.human_editorial_reviewer.role,
    },
  ],
  publisher: {
    "@type": "Organization",
    name: "Gaia Research",
    url: siteUrl,
  },
};

/* ─── SVG Figures: 3:4 Mobile-First ─── */

function InvoiceBreakdownSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 450 600"
          role="img"
          aria-labelledby="fig1-t fig1-d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="fig1-t">Where Your Invoice Actually Goes</title>
          <desc id="fig1-d">
            Stacked horizontal bar chart showing orchestrator prefill cost
            versus worker execution cost across an 8-dispatch session.
          </desc>
          <rect width="450" height="600" rx="8" fill="#0c1222" stroke="#1e293b" />
          <text x="225" y="38" fill="#f8fafc" fontSize="21" fontWeight="600" textAnchor="middle">
            Where Your Invoice Goes
          </text>
          <text x="225" y="60" fill="#94a3b8" fontSize="14" textAnchor="middle">
            8-dispatch session · Opus 5 · 100k context
          </text>

          {/* Orchestrator cold prefill */}
          <text x="30" y="110" fill="#f43f5e" fontSize="16" fontWeight="600">Orchestrator prefill (cold)</text>
          <text x="30" y="130" fill="#64748b" fontSize="14">8 wakeups x $0.625 each</text>
          <rect x="30" y="145" width="355" height="36" rx="5" fill="#f43f5e" fillOpacity="0.85" />
          <text x="395" y="169" fill="#f43f5e" fontSize="18" fontWeight="700">$5.00</text>

          {/* Worker execution */}
          <text x="30" y="215" fill="#38bdf8" fontSize="16" fontWeight="600">Worker execution (all 8)</text>
          <text x="30" y="235" fill="#64748b" fontSize="14">Actual code generation</text>
          <rect x="30" y="250" width="106" height="36" rx="5" fill="#38bdf8" fillOpacity="0.85" />
          <text x="146" y="274" fill="#38bdf8" fontSize="18" fontWeight="700">$1.50</text>

          {/* Divider */}
          <line x1="30" y1="315" x2="420" y2="315" stroke="#334155" />

          {/* Warm hypothetical */}
          <text x="30" y="350" fill="#10b981" fontSize="16" fontWeight="600">If cache stayed warm</text>
          <text x="30" y="370" fill="#64748b" fontSize="14">1 write + 7 reads</text>
          <rect x="30" y="385" width="69" height="36" rx="5" fill="#10b981" fillOpacity="0.85" />
          <text x="109" y="409" fill="#10b981" fontSize="18" fontWeight="700">$0.975</text>

          {/* Pointer manifest */}
          <text x="30" y="455" fill="#c084fc" fontSize="16" fontWeight="600">Pointer manifest (15k)</text>
          <text x="30" y="475" fill="#64748b" fontSize="14">Decoupled receipts</text>
          <rect x="30" y="490" width="53" height="36" rx="5" fill="#a855f7" fillOpacity="0.85" />
          <text x="93" y="514" fill="#c084fc" fontSize="18" fontWeight="700">$0.75</text>

          <text x="225" y="570" fill="#64748b" fontSize="13" textAnchor="middle">
            Opus 5: $5.00/M base · $6.25/M write · $0.50/M read
          </text>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px", textAlign: "center" }}>
        Figure 1: The dead wait time costs more than 3x the actual code generation. Opus 5 cold prefill on 8 wakeups: $5.00. All 8 workers combined: $1.50.
      </figcaption>
    </figure>
  );
}

function CostComparisonSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 450 600"
          role="img"
          aria-labelledby="fig2-t fig2-d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="fig2-t">100k Uncached Input Cost by Model</title>
          <desc id="fig2-d">
            Horizontal bar chart comparing the base or cache-miss input cost
            for 100k tokens across Opus 5, Grok 4.6, Sonnet 4.6, GPT-5.6
            Luna, and DeepSeek V4.1 Flash.
          </desc>
          <rect width="450" height="600" rx="8" fill="#0c1222" stroke="#1e293b" />
          <text x="225" y="38" fill="#f8fafc" fontSize="21" fontWeight="600" textAnchor="middle">
            100k Uncached Input by Model
          </text>
          <text x="225" y="60" fill="#94a3b8" fontSize="14" textAnchor="middle">
            Base or cache-miss input price · provider rate cards
          </text>

          {/* Grid */}
          <line x1="140" y1="85" x2="140" y2="480" stroke="#334155" />
          <text x="140" y="498" fill="#64748b" fontSize="14" textAnchor="middle">$0</text>
          <line x1="240" y1="85" x2="240" y2="480" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="240" y="498" fill="#64748b" fontSize="14" textAnchor="middle">$0.20</text>
          <line x1="340" y1="85" x2="340" y2="480" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="340" y="498" fill="#64748b" fontSize="14" textAnchor="middle">$0.40</text>

          {/* Opus 5 */}
          <text x="130" y="115" fill="#f43f5e" fontSize="16" fontWeight="600" textAnchor="end">Opus 5</text>
          <text x="130" y="133" fill="#64748b" fontSize="13" textAnchor="end">$5/M input</text>
          <rect x="140" y="101" width="250" height="34" rx="4" fill="#f43f5e" fillOpacity="0.8" />
          <text x="140" y="155" fill="#fda4af" fontSize="14" fontWeight="600">$0.50 per 100k · $4.00 for 8</text>

          {/* Grok 4.6 */}
          <text x="130" y="195" fill="#fb923c" fontSize="16" fontWeight="600" textAnchor="end">Grok 4.6</text>
          <text x="130" y="213" fill="#64748b" fontSize="13" textAnchor="end">$2/M input</text>
          <rect x="140" y="181" width="100" height="34" rx="4" fill="#fb923c" fillOpacity="0.8" />
          <text x="140" y="235" fill="#fdba74" fontSize="14" fontWeight="600">$0.20 per 100k · $1.60 for 8</text>

          {/* Sonnet 4.6 */}
          <text x="130" y="275" fill="#38bdf8" fontSize="16" fontWeight="600" textAnchor="end">Sonnet 4.6</text>
          <text x="130" y="293" fill="#64748b" fontSize="13" textAnchor="end">$3/M input</text>
          <rect x="140" y="261" width="150" height="34" rx="4" fill="#38bdf8" fillOpacity="0.8" />
          <text x="140" y="315" fill="#7dd3fc" fontSize="14" fontWeight="600">$0.30 per 100k · $2.40 for 8</text>

          {/* GPT-5.6 Luna */}
          <text x="130" y="355" fill="#c084fc" fontSize="16" fontWeight="600" textAnchor="end">GPT-5.6 Luna</text>
          <text x="130" y="373" fill="#64748b" fontSize="13" textAnchor="end">$0.20/M input</text>
          <rect x="140" y="341" width="10" height="34" rx="4" fill="#a855f7" fillOpacity="0.9" />
          <text x="140" y="395" fill="#d8b4fe" fontSize="14" fontWeight="600">$0.020 per 100k · $0.16 for 8</text>

          {/* DeepSeek V4.1 Flash */}
          <text x="130" y="435" fill="#10b981" fontSize="16" fontWeight="600" textAnchor="end">DeepSeek Flash</text>
          <text x="130" y="453" fill="#64748b" fontSize="13" textAnchor="end">$0.30/M peak</text>
          <rect x="140" y="421" width="15" height="34" rx="3" fill="#10b981" fillOpacity="0.9" />
          <text x="140" y="475" fill="#6ee7b7" fontSize="14" fontWeight="600">$0.030 per 100k · $0.24 for 8</text>

          {/* Provenance */}
          <text x="225" y="540" fill="#64748b" fontSize="13" textAnchor="middle">
            Base or cache-miss input price · 100k context
          </text>
          <text x="225" y="558" fill="#64748b" fontSize="13" textAnchor="middle">
            Provider rate cards · DeepSeek peak rate shown
          </text>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px", textAlign: "center" }}>
        Figure 2: Input rates span 25x before output tokens or cache behavior enter the picture. Opus 5 is $0.50 per 100k base input; GPT-5.6 Luna is $0.020.
      </figcaption>
    </figure>
  );
}

function SingleVsMultiSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 450 600"
          role="img"
          aria-labelledby="fig3-t fig3-d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="fig3-t">Single Agent + Reviewer vs. Orchestrator Fleet</title>
          <desc id="fig3-d">
            Side-by-side cost and quality comparison between a single heavy
            agent with one code review pass versus a heavy orchestrator with
            four cheap subagents.
          </desc>
          <rect width="450" height="600" rx="8" fill="#0c1222" stroke="#1e293b" />
          <text x="225" y="38" fill="#f8fafc" fontSize="21" fontWeight="600" textAnchor="middle">
            Single Agent vs. Orchestrator Fleet
          </text>
          <text x="225" y="60" fill="#94a3b8" fontSize="14" textAnchor="middle">
            Same task: auth module refactor + tests
          </text>

          {/* Single Agent card */}
          <rect x="25" y="85" width="400" height="210" rx="8" fill="#10b981" fillOpacity="0.08" stroke="#10b981" strokeOpacity="0.3" />
          <text x="45" y="115" fill="#10b981" fontSize="18" fontWeight="700">Single Agent + Reviewer</text>
          <text x="45" y="142" fill="#94a3b8" fontSize="15">Sonnet 4.6 (one session, no idle gaps)</text>
          <text x="45" y="170" fill="#e2e8f0" fontSize="16">Execution: $1.80 (continuous warm cache)</text>
          <text x="45" y="194" fill="#e2e8f0" fontSize="16">Review pass: $0.40 (fresh 20k context)</text>
          <line x1="45" y1="210" x2="400" y2="210" stroke="#334155" />
          <text x="45" y="235" fill="#10b981" fontSize="19" fontWeight="700">Total: $2.20</text>
          <text x="45" y="260" fill="#6ee7b7" fontSize="15">Full context coherence, zero cold wakeups</text>

          {/* Orchestrator Fleet card */}
          <rect x="25" y="315" width="400" height="210" rx="8" fill="#f43f5e" fillOpacity="0.08" stroke="#f43f5e" strokeOpacity="0.3" />
          <text x="45" y="345" fill="#f43f5e" fontSize="18" fontWeight="700">Opus 5 + 4 Cheap Workers</text>
          <text x="45" y="372" fill="#94a3b8" fontSize="15">Heavy planner, light subagents</text>
          <text x="45" y="400" fill="#e2e8f0" fontSize="16">Worker execution: $1.40 (4 subagents)</text>
          <text x="45" y="424" fill="#e2e8f0" fontSize="16">Orchestrator prefill: $2.50 (4 cold wakeups)</text>
          <line x1="45" y1="440" x2="400" y2="440" stroke="#334155" />
          <text x="45" y="465" fill="#f43f5e" fontSize="19" fontWeight="700">Total: $3.90</text>
          <text x="45" y="490" fill="#fda4af" fontSize="15">Fragmented context, 4 cold wakeups</text>

          {/* Verdict */}
          <text x="225" y="560" fill="#fbbf24" fontSize="17" fontWeight="600" textAnchor="middle">
            1.8x more expensive, lower coherence
          </text>
          <text x="225" y="582" fill="#64748b" fontSize="13" textAnchor="middle">
            Illustrative comparison for a typical single-feature task
          </text>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px", textAlign: "center" }}>
        Figure 3: For most coding tasks, one heavy agent with a review pass costs less and produces more coherent output than a multi-agent fleet paying cold-cache penalties.
      </figcaption>
    </figure>
  );
}

function ActualOrchestrationScreenshot() {
  return (
    <figure className="blog-post-illustration" style={{ margin: "32px 0" }}>
      <img
        src={orchestrationRunEvidenceSrc.src}
        width={orchestrationRunEvidenceSrc.width}
        height={orchestrationRunEvidenceSrc.height}
        alt="Actual orchestration session showing multiple agent panes, model usage, token counts, and subagent cost telemetry."
        loading="lazy"
      />
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px" }}>
        Actual orchestration session screenshot supplied for this field note. The highlighted telemetry shows the cost and token accounting that ordinary invoices hide.
      </figcaption>
    </figure>
  );
}

function FastWorkersDiagram() {
  return (
    <figure className="blog-post-illustration" style={{ margin: "32px auto", maxWidth: "420px" }}>
      <img
        src={fastWorkersDiagramSrc.src}
        width={fastWorkersDiagramSrc.width}
        height={fastWorkersDiagramSrc.height}
        alt="Architecture diagram. Left column, Orchestrator: smart, multi-context, stays in session — heavy tier (Opus 5, Fable 5.1, Sol, Astra 6) above a sweet spot of Sonnet 5 and GPT-5.6 Terra, held to 15–20k context via pointer manifests. Right column, Fast Workers: under 4 minutes wall-clock — Gemini 3.8 Flash, DeepSeek V4.1 Flash, Opus 5 /fast, Sol /ultrafast — each returning a JSON receipt at a cache-hit cost of $0.050 per turn. Luna is marked as the wrong pick for this fast lane: cheap but slow. Bottom band: cold wakeups over 5 minutes cost $0.625 per turn and $5.00 across eight, versus $0.050 and $0.40 warm — a 12.5× difference."
        loading="lazy"
        style={{ borderRadius: "8px", border: "1px solid #1e293b" }}
      />
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px", textAlign: "center" }}>
        The orchestrator is chosen for reasoning and cheap input tokens, not speed. This column is the <em>fast lane</em> — you need at least one, and Luna is the wrong pick for it. Slow lanes running Luna or a 20-minute refactor sit alongside it and cost the orchestrator nothing. The warm figure here is steady-state; the table above adds the one unavoidable first write.
      </figcaption>
    </figure>
  );
}

function loadPost() {
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function OrchestratorTaxColdCachePage() {
  const body = loadPost();
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-post-page">
        <PostShareBar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c"),
          }}
        />
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="2026-09-14">September 14, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>
            , {novaAuthor.role} · {humanAuthorName},{" "}
            {novaAuthor.editorial.human_editorial_reviewer.role}
          </p>
          <h1 className="blog-post-title">{articleTitle}</h1>
          <p className="blog-post-summary">
            Cache goes cold every time a subagent takes over 5 minutes. Your
            orchestrator re-reads its own 100k context at 12.5x warm rates, and
            you never see it on the invoice.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={orchestratorTaxColdCacheThumbnail.src.src}
            width={orchestratorTaxColdCacheThumbnail.src.width}
            height={orchestratorTaxColdCacheThumbnail.src.height}
            alt={orchestratorTaxColdCacheThumbnail.alt}
          />
        </figure>

        <aside
          className="blog-post-rule"
          aria-label="Companion how-to guide"
        >
          <span>Want the how-to?</span>
          <strong>
            <Link href="/research/orchestration-guide">
              Read The Orchestration Guide — step by step, in plain English →
            </Link>
          </strong>
        </aside>

        <article className="blog-post-body report-body">
          <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ children }) => {
                  if (
                    typeof children === "string" &&
                    children.trim() === "[[ORCHESTRATION_SCREENSHOT]]"
                  ) {
                    return <ActualOrchestrationScreenshot />;
                  }
                  if (
                    typeof children === "string" &&
                    children.trim() === "[[SVG_INVOICE_BREAKDOWN]]"
                  ) {
                    return <InvoiceBreakdownSvg />;
                  }
                  if (
                    typeof children === "string" &&
                    children.trim() === "[[SVG_COST_COMPARISON]]"
                  ) {
                    return <CostComparisonSvg />;
                  }
                  if (
                    typeof children === "string" &&
                    children.trim() === "[[SVG_SINGLE_VS_MULTI]]"
                  ) {
                    return <SingleVsMultiSvg />;
                  }
                  if (
                    typeof children === "string" &&
                    children.trim() === "[[FAST_WORKERS_DIAGRAM]]"
                  ) {
                    return <FastWorkersDiagram />;
                  }
                  return <p>{children}</p>;
                },
              }}
            >
              {body}
            </Markdown>
        </article>

        <section className="blog-post-next-read">
          <h2>More from Gaia Research</h2>
          <div className="blog-post-next-grid">
            <Link
              href="/blog/context-compaction-phase-2"
              className="blog-post-next-card"
            >
              <span className="blog-post-next-meta">
                Token Economics · September 13, 2026
              </span>
              <h3>
                We Ran 48 Coding Sessions to Find the Real Compaction Sweet Spot
              </h3>
              <p>
                Phase 1 modelled the compaction sweet spot at 40k–65k. Then we
                measured it: 37 agent runs across 8 autocompaction ceilings on
                Gemini 3.8 Flash. Compacting at 50k costs more than never
                compacting at all.
              </p>
            </Link>
            <Link
              href="/blog/context-compaction-curve"
              className="blog-post-next-card"
            >
              <span className="blog-post-next-meta">
                Token Economics · September 8, 2026
              </span>
              <h3>The Context Compaction Curve</h3>
              <p>
                You are at 100k tokens cold. Compact now or keep going? The
                cache-TTL economics, fresh-session alternatives, and the rule of
                thumb that should replace gut feel.
              </p>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
