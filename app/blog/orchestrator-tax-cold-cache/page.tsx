import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { orchestratorTaxColdCacheThumbnail } from "@/data/blog";
import postMd from "@/content/blog/orchestrator-tax-cold-cache/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/orchestrator-tax-cold-cache";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${orchestratorTaxColdCacheThumbnail.src.src}`;
const humanAuthorName = novaAuthor.editorial.human_editorial_reviewer.name;
const articleTitle =
  "The Orchestrator Tax: Cold-Cache Reentries and the 30-Minute KV Cache Solution";
const articleDescription =
  "Why multi-agent orchestration costs 5x to 10x more than single-agent runs: subagent execution times breach ephemeral cache TTLs, turning orchestrator wakeups into a 12.5x cache-write billing trap.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "orchestrator tax",
    "cold-cache reentry",
    "prompt caching TTL",
    "KV cache offload",
    "token economics",
    "multi-agent orchestration",
    "reasoning tokens",
    "Mooncake",
    "PagedAttention",
    "Claude 3.7 Sonnet",
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

/* ─── SVG Figure: 4:3 Mobile-First Rule ─── */

function OrchestratorTaxFigureSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 600 450"
          role="img"
          aria-labelledby="fig1-t fig1-d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="fig1-t">8-Turn Orchestrator Input Prefill Cost</title>
          <desc id="fig1-d">
            Horizontal bar chart comparing input prefill costs across four caching architectures for an 8-dispatch agent workflow: Cold Reentries ($3.00), Long Cache Lease ($0.69), Warm Baseline ($0.59), and Pointer Manifests ($0.45).
          </desc>
          <rect width="600" height="450" rx="8" fill="#0c1222" stroke="#1e293b" />
          <text x="300" y="34" fill="#f8fafc" fontSize="21" fontWeight="600" textAnchor="middle">
            8-Turn Orchestrator Input Prefill Cost
          </text>
          <text x="300" y="56" fill="#94a3b8" fontSize="13" textAnchor="middle">
            Claude Sonnet 4.6 rate card ($3.00/M base) · 100k context · 8 worker dispatches
          </text>

          {/* Grid lines & X-axis labels */}
          <line x1="165" y1="80" x2="165" y2="360" stroke="#334155" strokeDasharray="0" />
          <text x="165" y="378" fill="#64748b" fontSize="15" textAnchor="middle">$0</text>
          <line x1="265" y1="80" x2="265" y2="360" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="265" y="378" fill="#64748b" fontSize="15" textAnchor="middle">$1</text>
          <line x1="365" y1="80" x2="365" y2="360" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="365" y="378" fill="#64748b" fontSize="15" textAnchor="middle">$2</text>
          <line x1="465" y1="80" x2="465" y2="360" stroke="#1e293b" strokeDasharray="3 4" />
          <text x="465" y="378" fill="#64748b" fontSize="15" textAnchor="middle">$3</text>

          {/* Row 0: Cold Reentries (100k) */}
          <text x="155" y="118" fill="#f43f5e" fontSize="16" fontWeight="600" textAnchor="end">
            Cold Reentry
          </text>
          <text x="155" y="136" fill="#64748b" fontSize="13" textAnchor="end">
            Unmitigated 100k
          </text>
          <rect x="165" y="104" width="300" height="32" rx="4" fill="#f43f5e" fillOpacity="0.85" />
          <text x="475" y="125" fill="#f43f5e" fontSize="16" fontWeight="700">
            $3.00
          </text>
          <text x="475" y="142" fill="#fda4af" fontSize="13" fontWeight="500">
            +413% surcharge
          </text>

          {/* Row 1: Long Cache Lease (100k + rent) */}
          <text x="155" y="183" fill="#10b981" fontSize="16" fontWeight="600" textAnchor="end">
            Long Cache Lease
          </text>
          <text x="155" y="201" fill="#64748b" fontSize="13" textAnchor="end">
            30-60m TTL + rent
          </text>
          <rect x="165" y="169" width="69" height="32" rx="4" fill="#10b981" fillOpacity="0.85" />
          <text x="244" y="190" fill="#10b981" fontSize="16" fontWeight="700">
            $0.69
          </text>
          <text x="244" y="207" fill="#6ee7b7" fontSize="13" fontWeight="500">
            -77% vs. cold
          </text>

          {/* Row 2: Warm Baseline (<5m turns) */}
          <text x="155" y="248" fill="#38bdf8" fontSize="16" fontWeight="600" textAnchor="end">
            Warm Baseline
          </text>
          <text x="155" y="266" fill="#64748b" fontSize="13" textAnchor="end">
            Rapid &lt;5m turns
          </text>
          <rect x="165" y="234" width="59" height="32" rx="4" fill="#38bdf8" fillOpacity="0.85" />
          <text x="234" y="255" fill="#38bdf8" fontSize="16" fontWeight="700">
            $0.59
          </text>
          <text x="234" y="272" fill="#7dd3fc" fontSize="13" fontWeight="500">
            Theoretical ideal
          </text>

          {/* Row 3: Pointer Manifest (15k context) */}
          <text x="155" y="313" fill="#c084fc" fontSize="16" fontWeight="600" textAnchor="end">
            Pointer Manifest
          </text>
          <text x="155" y="331" fill="#64748b" fontSize="13" textAnchor="end">
            Decoupled 15k
          </text>
          <rect x="165" y="299" width="45" height="32" rx="4" fill="#a855f7" fillOpacity="0.85" />
          <text x="220" y="320" fill="#c084fc" fontSize="16" fontWeight="700">
            $0.45
          </text>
          <text x="220" y="337" fill="#d8b4fe" fontSize="13" fontWeight="500">
            -85% vs. cold
          </text>

          {/* Provenance note */}
          <text x="300" y="420" fill="#64748b" fontSize="13" textAnchor="middle">
            Calculated model: Claude Sonnet 4.6 ($3.00/M base, $3.75/M write, $0.30/M read)
          </text>
        </svg>
      </div>
      <figcaption
        style={{
          color: "#94a3b8",
          fontSize: "0.85rem",
          marginTop: "10px",
          textAlign: "center",
        }}
      >
        Figure 1: Input prefill cost across 8 worker completions. Cold reentries on a 100k context cost $3.00 purely in wakeups. A 30-to-60 minute KV cache lease reduces this to $0.69, while decoupling context to a 15k pointer manifest reduces it to $0.45.
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
          <p className="blog-post-lead">{articleDescription}</p>
        </header>

        <div className="blog-post-content prose prose-invert">
          <article>
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ children }) => {
                  if (
                    typeof children === "string" &&
                    children.trim() === "[[SVG_ORCHESTRATOR_TAX]]"
                  ) {
                    return <OrchestratorTaxFigureSvg />;
                  }
                  return <p>{children}</p>;
                },
              }}
            >
              {body}
            </Markdown>
          </article>
        </div>

        <section className="blog-post-next-read">
          <h2>More from Gaia Research</h2>
          <div className="blog-post-next-grid">
            <Link
              href="/blog/context-compaction-phase-2"
              className="blog-post-next-card"
            >
              <span className="blog-post-next-meta">
                Agent Architecture · September 13, 2026
              </span>
              <h3>
                We Ran 37 Agent Sessions to Find the Real Compaction Sweet Spot
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
